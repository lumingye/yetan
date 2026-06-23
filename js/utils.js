const Utils = {
    rollDice(sides) {
        return Math.floor(Math.random() * sides) + 1;
    },

    rollD100() {
        const tens = Math.floor(Math.random() * 10);
        const ones = Math.floor(Math.random() * 10);
        if (tens === 0 && ones === 0) return 100;
        return tens * 10 + ones;
    },

    rollNDice(n, sides) {
        let total = 0;
        const rolls = [];
        for (let i = 0; i < n; i++) {
            const r = this.rollDice(sides);
            rolls.push(r);
            total += r;
        }
        return { total, rolls };
    },

    rollFormula(formula) {
        const f = String(formula).trim();
        if (/^\d+$/.test(f)) return { total: parseInt(f, 10), rolls: [] };
        const match = f.match(/(\d+)D(\d+)([+-]\d+)?/i);
        if (!match) return { total: 0, rolls: [] };
        const count = parseInt(match[1]);
        const sides = parseInt(match[2]);
        const modifier = match[3] ? parseInt(match[3]) : 0;
        const result = this.rollNDice(count, sides);
        result.total += modifier;
        return result;
    },

    rollWithBonusPenalty(bonusDice = 0, penaltyDice = 0) {
        const netDice = bonusDice - penaltyDice;
        const ones = Math.floor(Math.random() * 10);
        if (netDice === 0) {
            const tens = Math.floor(Math.random() * 10);
            const result = tens * 10 + ones;
            return result === 0 ? 100 : result;
        }
        const tensRolls = [];
        const totalDice = Math.abs(netDice) + 1;
        for (let i = 0; i < totalDice; i++) {
            tensRolls.push(Math.floor(Math.random() * 10));
        }

        var results = tensRolls.map(function(t) {
            var val = t * 10 + ones;
            return val === 0 ? 100 : val;
        });

        if (netDice > 0) {
            return Math.min(...results);
        } else {
            return Math.max(...results);
        }
    },

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    },

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    },

    removeFromStorage(key) {
        localStorage.removeItem(key);
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    deepClone(obj) {
        if (obj === undefined || obj === null) return obj;
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return obj;
        }
    },

    formatTime(gameTime) {
        if (!gameTime) return '';
        const periods = {
            dawn: '黎明',
            morning: '上午',
            noon: '正午',
            afternoon: '下午',
            dusk: '黄昏',
            evening: '夜晚',
            midnight: '深夜',
            late_night: '凌晨'
        };
        const period = periods[gameTime.period] || gameTime.period || '';
        const year = gameTime.year || 1928;
        const month = gameTime.month || 1;
        const day = gameTime.day || 1;
        const hour = gameTime.hour != null ? gameTime.hour : 0;
        const minute = gameTime.minute != null ? gameTime.minute : 0;
        return `${year}年${month}月${day}日 ${period} ${hour}:${String(minute).padStart(2, '0')}`;
    },

    compressConversation(messages, maxTokens = 4000) {
        if (messages.length <= 6) return messages;

        var recentMessages = messages.slice(-6);
        var oldMessages = messages.slice(0, -6);

        var playerActions = [];
        var kpNarratives = [];
        var keyInfo = [];

        var itemPatterns = [
            /获得[了]?(.{2,30}?)(?:。|，|！|、)/g,
            /得到[了]?(.{2,30}?)(?:。|，|！|、)/g,
            /拿到[了]?(.{2,30}?)(?:。|，|！|、)/g,
            /捡起[了]?(.{2,30}?)(?:。|，|！|、)/g,
            /取走[了]?(.{2,30}?)(?:。|，|！|、)/g,
            /购买[了]?(.{2,30}?)(?:。|，|！|、)/g
        ];

        var cluePatterns = [
            /发现[了]?(.{5,50}?)(?:线索|证据|痕迹|秘密)/g,
            /线索[：:]?(.{5,50}?)(?:。|，|！)/g,
            /找到[了]?(.{5,50}?)(?:线索|证据|日记|信件|文件)/g
        ];

        var npcPatterns = [
            /「([^」]{2,15})」[：:]/g,
            /(\S{2,8})(先生|女士|教授|博士|神父|警长|探员|医生)/g
        ];

        var eventPatterns = [
            /(\S{2,10})(死亡|受伤|失踪|被捕|逃脱|背叛)/g,
            /(\S{2,20})(崩塌|爆炸|起火|沉没|打开|关闭)/g
        ];

        var locationPatterns = [
            /来到[了]?(.{2,20}?)(?:的|里|中|前|后|旁)/g,
            /进入[了]?(.{2,20}?)(?:的|里|中)/g,
            /抵达[了]?(.{2,20}?)(?:的|里|中|前)/g
        ];

        var items = [];
        var clues = [];
        var npcs = [];
        var events = [];
        var locations = [];

        oldMessages.forEach(function (msg) {
            var text = msg.content || '';
            if (!text) return;

            if (msg.role === 'user') {
                var action = text.trim().substring(0, 60);
                if (action.length > 2 && playerActions.length < 8) {
                    playerActions.push(action);
                }
            } else if (msg.role === 'assistant') {
                var narrative = text.trim().substring(0, 80);
                if (narrative.length > 5 && kpNarratives.length < 4) {
                    kpNarratives.push(narrative);
                }
            }

            itemPatterns.forEach(function (pattern) {
                var m;
                while ((m = pattern.exec(text)) !== null) {
                    var item = m[1].trim();
                    if (item.length > 1 && item.length < 30 && items.indexOf(item) === -1) {
                        items.push(item);
                    }
                }
            });

            cluePatterns.forEach(function (pattern) {
                var m;
                while ((m = pattern.exec(text)) !== null) {
                    var clue = m[0].trim();
                    if (clue.length > 3 && clues.indexOf(clue) === -1) {
                        clues.push(clue);
                    }
                }
            });

            npcPatterns.forEach(function (pattern) {
                var m;
                while ((m = pattern.exec(text)) !== null) {
                    var npc = m[1].trim() + (m[2] || '');
                    if (npc.length > 1 && npcs.indexOf(npc) === -1) {
                        npcs.push(npc);
                    }
                }
            });

            eventPatterns.forEach(function (pattern) {
                var m;
                while ((m = pattern.exec(text)) !== null) {
                    var evt = m[0].trim();
                    if (evt.length > 2 && events.indexOf(evt) === -1) {
                        events.push(evt);
                    }
                }
            });

            locationPatterns.forEach(function (pattern) {
                var m;
                while ((m = pattern.exec(text)) !== null) {
                    var loc = m[1].trim();
                    if (loc.length > 1 && locations.indexOf(loc) === -1) {
                        locations.push(loc);
                    }
                }
            });
        });

        if (locations.length > 0) {
            keyInfo.push('到访地点：' + locations.slice(0, 5).join('、'));
        }
        if (items.length > 0) {
            keyInfo.push('已获得物品：' + items.slice(0, 10).join('、'));
        }
        if (clues.length > 0) {
            keyInfo.push('已发现线索：' + clues.slice(0, 5).join('；'));
        }
        if (npcs.length > 0) {
            keyInfo.push('已遇到人物：' + npcs.slice(0, 8).join('、'));
        }
        if (events.length > 0) {
            keyInfo.push('关键事件：' + events.slice(0, 5).join('；'));
        }

        var summaryContent = '[场景摘要]';
        if (playerActions.length > 0) {
            summaryContent += '\n玩家近期行动：' + playerActions.join(' → ');
        }
        if (kpNarratives.length > 0) {
            summaryContent += '\n叙事要点：' + kpNarratives.join('；');
        }
        if (keyInfo.length > 0) {
            summaryContent += '\n' + keyInfo.join('\n');
        }

        var summary = {
            role: 'system',
            content: summaryContent
        };

        return [summary, ...recentMessages];
    },

    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
