const Character = {
    current: null,

    init() {
        if (!this.current) {
            var saved = Utils.loadFromStorage('scribe_character');
            if (saved) {
                this.current = saved;
                if (typeof Main !== 'undefined' && !Main.gameState.character) {
                    Main.gameState.character = saved;
                }
            }
        }
        this.initPersistentState();
    },

    save() {
        if (this.current) {
            Utils.saveToStorage('scribe_character', this.current);
        }
    },

    updateField(field, value) {
        if (!this.current) return;
        this.current[field] = value;
        this.save();
        Main.updateSidebar();
    },

    modifyHP(delta) {
        if (!this.current) return;
        this.current.hp = Utils.clamp(this.current.hp + delta, -2, this.current.hpMax);
        this.save();
        Main.updateSidebar();
        return this.current.hp;
    },

    modifySAN(delta) {
        if (!this.current) return;
        this.current.san = Utils.clamp(this.current.san + delta, 0, this.current.sanMax);
        this.save();
        Main.updateSidebar();
        return this.current.san;
    },

    modifyMP(delta) {
        if (!this.current) return;
        this.current.mp = Utils.clamp(this.current.mp + delta, 0, this.current.mpMax);
        this.save();
        Main.updateSidebar();
        return this.current.mp;
    },

    persistentState: null,

    PERSISTENT_KEY: 'scribe_persistent_state',

    initPersistentState() {
        var saved = Utils.loadFromStorage(this.PERSISTENT_KEY);
        if (saved) {
            this.persistentState = saved;
            if (!this.persistentState.appearanceState) this.persistentState.appearanceState = {};
        } else {
            this.persistentState = {
                inventory: [],
                keyEvents: [],
                acquiredClues: [],
                npcEncounters: [],
                locationHistory: [],
                conditions: [],
                spells: [],
                appearanceState: {},
                lastUpdated: null
            };
        }
    },

    savePersistentState() {
        if (this.persistentState) {
            this.persistentState.lastUpdated = new Date().toISOString();
            Utils.saveToStorage(this.PERSISTENT_KEY, this.persistentState);
        }
    },

    addInventoryItem(item) {
        if (!this.persistentState) this.initPersistentState();
        if (this.persistentState.inventory.indexOf(item) === -1) {
            this.persistentState.inventory.push(item);
            this.savePersistentState();
        }
    },

    removeInventoryItem(item) {
        if (!this.persistentState) return;
        var idx = this.persistentState.inventory.indexOf(item);
        if (idx !== -1) {
            this.persistentState.inventory.splice(idx, 1);
            this.savePersistentState();
        }
    },

    addKeyEvent(event) {
        if (!this.persistentState) this.initPersistentState();
        if (this.persistentState.keyEvents.indexOf(event) === -1) {
            this.persistentState.keyEvents.push(event);
            if (this.persistentState.keyEvents.length > 30) {
                this.persistentState.keyEvents = this.persistentState.keyEvents.slice(-30);
            }
            this.savePersistentState();
        }
    },

    addClue(clue) {
        if (!this.persistentState) this.initPersistentState();
        if (this.persistentState.acquiredClues.indexOf(clue) === -1) {
            this.persistentState.acquiredClues.push(clue);
            this.savePersistentState();
        }
    },

    addNPCEncounter(npcName, context) {
        if (!this.persistentState) this.initPersistentState();
        var existing = this.persistentState.npcEncounters.find(function (e) { return e.name === npcName; });
        if (!existing) {
            this.persistentState.npcEncounters.push({
                name: npcName,
                firstMet: new Date().toISOString(),
                context: context || '',
                encounters: 1
            });
        } else {
            existing.encounters++;
        }
        this.savePersistentState();
    },

    addCondition(condition) {
        if (!this.persistentState) this.initPersistentState();
        if (this.persistentState.conditions.indexOf(condition) === -1) {
            this.persistentState.conditions.push(condition);
            this.savePersistentState();
        }
    },

    removeCondition(condition) {
        if (!this.persistentState) return;
        var idx = this.persistentState.conditions.indexOf(condition);
        if (idx !== -1) {
            this.persistentState.conditions.splice(idx, 1);
            this.savePersistentState();
        }
    },

    addSpell(spell) {
        if (!this.persistentState) this.initPersistentState();
        if (this.persistentState.spells.indexOf(spell) === -1) {
            this.persistentState.spells.push(spell);
            this.savePersistentState();
        }
    },

    extractStateFromAIResponse(text) {
        if (!text) return;
        if (!this.persistentState) this.initPersistentState();

        var self = this;

        var itemPatterns = [
            /获得[了]?「?([^」，。\n]{2,25})」?/g,
            /得到[了]?「?([^」，。\n]{2,25})」?/g,
            /拿到[了]?「?([^」，。\n]{2,25})」?/g,
            /捡起[了]?「?([^」，。\n]{2,25})」?/g,
            /取走[了]?「?([^」，。\n]{2,25})」?/g
        ];
        itemPatterns.forEach(function (pattern) {
            var m;
            while ((m = pattern.exec(text)) !== null) {
                self.addInventoryItem(m[1].trim());
            }
        });

        var losePatterns = [
            /失去[了]?「?([^」，。\n]{2,25})」?/g,
            /丢失[了]?「?([^」，。\n]{2,25})」?/g,
            /用掉[了]?「?([^」，。\n]{2,25})」?/g,
            /消耗[了]?「?([^」，。\n]{2,25})」?/g
        ];
        losePatterns.forEach(function (pattern) {
            var m;
            while ((m = pattern.exec(text)) !== null) {
                self.removeInventoryItem(m[1].trim());
            }
        });

        var cluePatterns = [
            /发现[了]?「?([^」，。\n]{3,40})」?(?:的?线索)/g,
            /找到[了]?「?([^」，。\n]{3,40})」?(?:的?证据)/g,
            /线索[：:]「?([^」，。\n]{3,40})」?/g
        ];
        cluePatterns.forEach(function (pattern) {
            var m;
            while ((m = pattern.exec(text)) !== null) {
                self.addClue(m[1].trim());
            }
        });

        var npcPattern = /「([^」]{2,15})」[：:]/g;
        var nm;
        while ((nm = npcPattern.exec(text)) !== null) {
            self.addNPCEncounter(nm[1].trim(), '');
        }

        var conditionPatterns = [
            /陷入[了]?「?([^」，。\n]{2,15})」?(?:状态)?/g,
            /获得[了]?「?([^」，。\n]{2,15})」?(?:状态|效果)/g,
            /被「?([^」，。\n]{2,15})」?(?:影响|诅咒|附身)/g
        ];
        conditionPatterns.forEach(function (pattern) {
            var m;
            while ((m = pattern.exec(text)) !== null) {
                self.addCondition(m[1].trim());
            }
        });

        var healPatterns = [
            /「?([^」，。\n]{2,15})」?(?:状态)?已(?:解除|消失|恢复)/g,
            /从「?([^」，。\n]{2,15})」?(?:中)?恢复/g
        ];
        healPatterns.forEach(function (pattern) {
            var m;
            while ((m = pattern.exec(text)) !== null) {
                self.removeCondition(m[1].trim());
            }
        });

        var spellPatterns = [
            /习得[了]?「?([^」，。\n]{2,20})」?(?:咒文|法术|仪式)/g,
            /学会[了]?「?([^」，。\n]{2,20})」?(?:咒文|法术|仪式)/g
        ];
        spellPatterns.forEach(function (pattern) {
            var m;
            while ((m = pattern.exec(text)) !== null) {
                self.addSpell(m[1].trim());
            }
        });

        var appearancePatterns = [
            /换[了上穿]?「?([^」，。\n]{2,20})」?(?:衣服|装束|服装|外套|制服|装扮)/g,
            /穿上[了]?「?([^」，。\n]{2,20})」?/g,
            /换上[了]?「?([^」，。\n]{2,20})」?/g,
            /脱下[了]?「?([^」，。\n]{2,20})」?/g,
            /乔装成[了]?「?([^」，。\n]{2,20})」?/g,
            /伪装成[了]?「?([^」，。\n]{2,20})」?/g,
            /化装成[了]?「?([^」，。\n]{2,20})」?/g,
            /装扮成[了]?「?([^」，。\n]{2,20})」?/g
        ];
        appearancePatterns.forEach(function (pattern) {
            var m;
            while ((m = pattern.exec(text)) !== null) {
                self.updateAppearanceState('着装', m[1].trim());
            }
        });

        var appearanceContextPatterns = [
            /你(?:现在|目前|此刻)?(?:穿|着|披)着「?([^」，。\n]{2,25})」?/g,
            /你(?:的)?(?:身上|穿着|着装)(?:是|为)「?([^」，。\n]{2,25})」?/g
        ];
        appearanceContextPatterns.forEach(function (pattern) {
            var m;
            while ((m = pattern.exec(text)) !== null) {
                self.updateAppearanceState('着装', m[1].trim());
            }
        });

        var eventKeywords = ['死亡', '失踪', '背叛', '觉醒', '疯狂', '封印', '召唤', '逃脱', '牺牲', '发现真相'];
        eventKeywords.forEach(function (keyword) {
            if (text.indexOf(keyword) !== -1) {
                var eventText = text.substring(Math.max(0, text.indexOf(keyword) - 20), text.indexOf(keyword) + keyword.length + 10).replace(/\n/g, ' ').trim();
                if (eventText.length > 5) {
                    self.addKeyEvent(eventText);
                }
            }
        });
    },

    formatPersistentStateForPrompt() {
        if (!this.persistentState) return '';
        var ps = this.persistentState;
        var lines = [];

        if (ps.inventory.length > 0) {
            lines.push('【随身物品】' + ps.inventory.join('、'));
        }
        if (ps.conditions.length > 0) {
            lines.push('【当前状态】' + ps.conditions.join('、'));
        }
        if (ps.appearanceState && Object.keys(ps.appearanceState).length > 0) {
            var appParts = [];
            for (var cat in ps.appearanceState) {
                appParts.push(cat + '：' + ps.appearanceState[cat].value + (ps.appearanceState[cat].note ? '（' + ps.appearanceState[cat].note + '）' : ''));
            }
            lines.push('【外貌/着装——此信息每轮必须遵守，不可遗忘】' + appParts.join('；'));
        }
        if (ps.acquiredClues.length > 0) {
            lines.push('【已获线索】' + ps.acquiredClues.join('；'));
        }
        if (ps.spells.length > 0) {
            lines.push('【已知咒文】' + ps.spells.join('、'));
        }
        if (ps.npcEncounters.length > 0) {
            var npcList = ps.npcEncounters.map(function (e) { return e.name + (e.encounters > 1 ? '(' + e.encounters + '次)' : ''); });
            lines.push('【遭遇人物】' + npcList.join('、'));
        }
        if (ps.keyEvents.length > 0) {
            lines.push('【关键经历】' + ps.keyEvents.slice(-5).join('；'));
        }

        return lines.length > 0 ? '【角色持久状态——此信息永不压缩】\n' + lines.join('\n') : '';
    },

    updateAppearanceState(category, value, note) {
        if (!this.persistentState) this.initPersistentState();
        this.persistentState.appearanceState[category] = {
            value: value,
            note: note || '',
            updatedAt: new Date().toISOString()
        };
        this.savePersistentState();
    },

    getAppearanceState(category) {
        if (!this.persistentState || !this.persistentState.appearanceState) return null;
        return this.persistentState.appearanceState[category] || null;
    },

    resetPersistentState() {
        this.persistentState = {
            inventory: [],
            keyEvents: [],
            acquiredClues: [],
            npcEncounters: [],
            locationHistory: [],
            conditions: [],
            spells: [],
            appearanceState: {},
            lastUpdated: null
        };
        this.savePersistentState();
    }
};
