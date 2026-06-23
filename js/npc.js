const NPCManager = {
    companions: [],
    contacts: [],
    allNPCs: {},
    FEAR_BEHAVIORS: {
        flee: {
            name: '逃跑',
            description: 'NPC惊恐地逃离现场',
            sanThreshold: 30,
            weight: 40
        },
        freeze: {
            name: '冻结',
            description: 'NPC被恐惧钉在原地，无法行动',
            sanThreshold: 20,
            weight: 25
        },
        scream: {
            name: '尖叫',
            description: 'NPC发出恐惧的尖叫，可能引来注意',
            sanThreshold: 40,
            weight: 20
        },
        breakdown: {
            name: '崩溃',
            description: 'NPC精神崩溃，蹲在地上哭泣或喃喃自语',
            sanThreshold: 15,
            weight: 10
        },
        attack: {
            name: '狂乱攻击',
            description: 'NPC在恐惧中盲目攻击周围一切',
            sanThreshold: 10,
            weight: 5
        }
    },

    portraitCache: {},

    init() {
        const saved = Utils.loadFromStorage('scribe_npcs');
        if (saved) {
            this.companions = saved.companions || [];
            this.contacts = saved.contacts || [];
            this.allNPCs = saved.allNPCs || {};
            this.portraitCache = saved.portraitCache || {};
        }
        this._rebuildPortraitCache();
    },

    _rebuildPortraitCache() {
        for (var id in this.allNPCs) {
            if (this.allNPCs[id].portraitSrc && !this.portraitCache[id]) {
                this.portraitCache[id] = {
                    url: this.allNPCs[id].portraitSrc,
                    imageId: this.allNPCs[id].portraitImageId || null,
                    generatedAt: this.allNPCs[id].portraitGeneratedAt || null
                };
            }
        }
    },

    hasPortrait(npcName) {
        for (var id in this.allNPCs) {
            var npc = this.allNPCs[id];
            if (npc.name === npcName || npc.name.includes(npcName) || npcName.includes(npc.name)) {
                if (npc.portraitSrc) return true;
            }
        }
        for (var i = 0; i < this.companions.length; i++) {
            if (this.companions[i].name === npcName || this.companions[i].name.includes(npcName) || npcName.includes(this.companions[i].name)) {
                if (this.companions[i].portraitSrc) return true;
            }
        }
        return false;
    },

    bindPortrait(npcName, imageUrl, imageId) {
        var targetNPC = null;
        for (var id in this.allNPCs) {
            if (this.allNPCs[id].name === npcName || this.allNPCs[id].name.includes(npcName) || npcName.includes(this.allNPCs[id].name)) {
                targetNPC = this.allNPCs[id];
                break;
            }
        }
        if (!targetNPC) {
            for (var i = 0; i < this.companions.length; i++) {
                if (this.companions[i].name === npcName || this.companions[i].name.includes(npcName) || npcName.includes(this.companions[i].name)) {
                    targetNPC = this.companions[i];
                    break;
                }
            }
        }
        if (targetNPC) {
            targetNPC.portraitSrc = imageUrl;
            targetNPC.portraitImageId = imageId || ('img_' + Date.now());
            targetNPC.portraitGeneratedAt = new Date().toISOString();
            this.portraitCache[targetNPC.id || targetNPC.name] = {
                url: imageUrl,
                imageId: targetNPC.portraitImageId,
                generatedAt: targetNPC.portraitGeneratedAt
            };
            this.save();
        }
        return targetNPC;
    },

    save() {
        Utils.saveToStorage('scribe_npcs', {
            companions: this.companions,
            contacts: this.contacts,
            allNPCs: this.allNPCs,
            portraitCache: this.portraitCache
        });
    },

    addNPC(npcData) {
        const npc = {
            id: Utils.generateId(),
            name: npcData.name,
            type: npcData.type || 'bystander',
            role: npcData.role || '',
            description: npcData.description || '',
            hp: npcData.hp || 10,
            hpMax: npcData.hpMax || 10,
            san: npcData.san || 50,
            sanMax: npcData.sanMax || 99,
            dex: npcData.dex || 50,
            str: npcData.str || 50,
            app: npcData.app || 50,
            status: npcData.status || '正常',
            attitude: npcData.attitude || '中立',
            location: npcData.location || '',
            skills: npcData.skills || {},
            mood: {
                affinity: npcData.mood?.affinity ?? npcData.mood?.trust ?? (npcData.type === 'client' ? 1 : npcData.type === 'enemy' ? -2 : 0),
                fear: npcData.mood?.fear || 0,
                agitation: npcData.mood?.agitation || 0
            },
            // 性格维度（0-10）：开放性、外向性、神经质
            personality: {
                openness: npcData.personality?.openness ?? 5,
                extraversion: npcData.personality?.extraversion ?? 5,
                neuroticism: npcData.personality?.neuroticism ?? 5,
                // Want/Wound/Voice 三要素
                want: npcData.personality?.want || '',
                wound: npcData.personality?.wound || '',
                voice: npcData.personality?.voice || ''
            },
            isCompanion: false,
            isContact: false,
            savedByPlayer: false,
            deceivedByPlayer: false,
            witnessedPlayerCruelty: false,
            lovedOneKilled: false,
            followWillingness: 0,
            ...npcData
        };

        this.allNPCs[npc.id] = npc;
        this.save();
        return npc;
    },

    addCompanion(npcId, force) {
        const npc = this.allNPCs[npcId];
        if (!npc) return false;

        if (this.companions.length >= 3) return false;

        if (!force) {
            const willingness = this.calculateFollowWillingness(npc);
            if (willingness < 30) return false;
            npc.followWillingness = willingness;
        }

        npc.isCompanion = true;

        if (!this.companions.find(c => c.id === npcId)) {
            this.companions.push(npc);
        }

        this.removeFromContacts(npcId);
        this.save();
        this.updateSidebar();
        return true;
    },

    addContact(npcId) {
        const npc = this.allNPCs[npcId];
        if (!npc) return false;

        npc.isContact = true;

        if (!this.contacts.find(c => c.id === npcId)) {
            this.contacts.push({
                id: npc.id,
                name: npc.name,
                relation: npc.role || npc.type,
                location: npc.location
            });
        }

        this.save();
        this.updateSidebar();
        return true;
    },

    removeFromCompanions(npcId) {
        this.companions = this.companions.filter(c => c.id !== npcId);
        if (this.allNPCs[npcId]) {
            this.allNPCs[npcId].isCompanion = false;
        }
        this.save();
        this.updateSidebar();
    },

    removeFromContacts(npcId) {
        this.contacts = this.contacts.filter(c => c.id !== npcId);
        if (this.allNPCs[npcId]) {
            this.allNPCs[npcId].isContact = false;
        }
        this.save();
        this.updateSidebar();
    },

    calculateFollowWillingness(npc) {
        const player = Main.gameState.character;
        if (!player) return 0;

        const baseMap = {
            'key_connection': 100,
            'client': 60,
            'professional': 30,
            'bystander': 5,
            'enemy': 0
        };

        let willingness = baseMap[npc.type] || 0;

        if (player.app >= 80) willingness += 15;
        else if (player.app >= 60) willingness += 5;
        else if (player.app < 40) willingness -= 10;

        if (npc.savedByPlayer) willingness += 30;
        if (npc.lovedOneKilled) willingness += 20;
        if (npc.deceivedByPlayer) willingness -= 30;
        if (npc.witnessedPlayerCruelty) willingness = -999;

        return Utils.clamp(willingness, -100, 100);
    },

    getFollowResult(willingness) {
        if (willingness >= 60) return { canFollow: true, needPersuasion: false };
        if (willingness >= 30) return { canFollow: false, needPersuasion: true };
        if (willingness > 0) return { canFollow: false, needPersuasion: false, refused: true };
        return { canFollow: false, needPersuasion: false, refused: true, negativeReaction: true };
    },

    performNPCSANCheck(npcId, sanLossFormula, horrorType) {
        const npc = this.allNPCs[npcId];
        if (!npc) return null;

        const roll = Utils.rollD100();
        const passed = roll <= npc.san;

        let loss;
        if (typeof sanLossFormula === 'string' && sanLossFormula.includes('/')) {
            const parts = sanLossFormula.split('/');
            loss = passed ? Utils.rollFormula(parts[0]).total : Utils.rollFormula(parts[1]).total;
        } else {
            loss = passed ? 1 : Utils.rollFormula(sanLossFormula).total;
        }

        const difficulty = this.getDifficultyMultiplier();
        loss = Math.round(loss * difficulty.sanMultiplier);
        npc.san = Math.max(0, npc.san - loss);

        let fearBehavior = null;
        let fled = false;

        if (npc.san <= 0) {
            npc.status = '崩溃';
            fearBehavior = { type: 'breakdown', name: '精神崩溃', description: `${npc.name}的精神彻底崩溃了` };
            if (npc.isCompanion) {
                this.removeFromCompanions(npcId);
                fled = true;
            }
        } else if (loss >= 5) {
            const intRoll = Utils.rollD100();
            const intTarget = Math.floor((npc.skills?.['心理学'] || 10) * 2);
            if (intRoll > intTarget) {
                fearBehavior = this.determineFearBehavior(npc, loss, horrorType);
                npc.status = '恐惧';
                if (fearBehavior.type === 'flee' && npc.isCompanion) {
                    this.removeFromCompanions(npcId);
                    fled = true;
                }
            }
        } else if (npc.san < 20) {
            npc.status = '恐惧';
            if (npc.isCompanion && Math.random() < 0.4) {
                fearBehavior = { type: 'flee', name: '逃跑', description: `${npc.name}再也承受不了了，转身逃跑` };
                this.removeFromCompanions(npcId);
                fled = true;
            }
        } else if (npc.san < 40) {
            npc.status = '不安';
        }

        this.save();
        return { roll, passed, loss, newSAN: npc.san, fled, fearBehavior, npcName: npc.name };
    },

    determineFearBehavior(npc, sanLoss, horrorType) {
        const available = [];
        for (const [key, behavior] of Object.entries(this.FEAR_BEHAVIORS)) {
            if (npc.san <= behavior.sanThreshold) {
                available.push({ type: key, ...behavior });
            }
        }

        if (available.length === 0) {
            return { type: 'scream', name: '尖叫', description: `${npc.name}发出一声恐惧的尖叫` };
        }

        const typeAffinities = {
            'mythos_creature': { flee: 2, freeze: 1.5, scream: 1, breakdown: 1, attack: 0.5 },
            'supernatural_event': { freeze: 2, flee: 1, scream: 1.5, breakdown: 1, attack: 0.3 },
            'gore': { scream: 2, flee: 1.5, freeze: 1, breakdown: 0.8, attack: 0.5 },
            'psychological': { breakdown: 2, freeze: 1.5, scream: 0.5, flee: 1, attack: 0.3 }
        };

        const affinity = typeAffinities[horrorType] || {};

        let totalWeight = 0;
        const weighted = available.map(b => {
            const w = b.weight * (affinity[b.type] || 1);
            totalWeight += w;
            return { ...b, adjustedWeight: w };
        });

        let roll = Math.random() * totalWeight;
        for (const b of weighted) {
            roll -= b.adjustedWeight;
            if (roll <= 0) {
                return { type: b.type, name: b.name, description: `${npc.name}${b.description}` };
            }
        }

        return weighted[weighted.length - 1];
    },

    getDifficultyMultiplier() {
        const difficulty = typeof Main !== 'undefined' && Main.gameState.difficulty;
        switch (difficulty) {
            case 'survivor': return { sanMultiplier: 0.7, checkBonus: 10 };
            case 'nightmare': return { sanMultiplier: 1.3, checkBonus: -10 };
            default: return { sanMultiplier: 1, checkBonus: 0 };
        }
    },

    processCompanionHorror(sanLossFormula, horrorType) {
        const results = [];
        for (const companion of [...this.companions]) {
            const result = this.performNPCSANCheck(companion.id, sanLossFormula, horrorType);
            if (result) {
                results.push(result);
            }
        }
        this.updateSidebar();

        if (results.length > 0 && typeof API !== 'undefined') {
            var narrativeParts = results.map(function (r) {
                var text = r.npcName + '：';
                if (r.fled) {
                    text += r.fearBehavior ? r.fearBehavior.description : '因恐惧逃离了';
                } else if (r.fearBehavior) {
                    text += r.fearBehavior.description;
                } else {
                    text += r.passed ? '勉强维持镇定' : '受到惊吓但未崩溃';
                }
                return text;
            });
            API.conversationHistory.push({
                role: 'system',
                content: '队友恐惧反应：' + narrativeParts.join('；') + '。请在下一段叙事中自然体现这些反应。'
            });
        }

        return results;
    },

    damageNPC(npcId, damage) {
        const npc = this.allNPCs[npcId];
        if (!npc) return;

        var rawHp = npc.hp - damage;
        npc.hp = Math.max(-2, rawHp);

        if (npc.hp <= 0) {
            npc.status = (damage >= (npc.hpMax || 1)) ? '死亡' : '昏迷';
            if (npc.isCompanion) {
                this.removeFromCompanions(npcId);
            }
        }

        this.save();
    },

    getCombatPower() {
        if (this.companions.length === 0) return '无';

        let power = 0;
        for (const c of this.companions) {
            if (c.str >= 70 || c.skills?.['斗殴'] >= 60 || c.skills?.['火器（手枪）'] >= 60) {
                power += 2;
            } else if (c.str >= 50 || c.skills?.['斗殴'] >= 40) {
                power += 1;
            }
        }

        if (power >= 4) return '高';
        if (power >= 2) return '中';
        return '低';
    },

    getAll() {
        return {
            companions: this.companions,
            contacts: this.contacts,
            allNPCs: this.allNPCs,
            combatPower: this.getCombatPower()
        };
    },

    updateSidebar() {
        const companionsEl = document.getElementById('sidebar-companions');
        if (companionsEl) {
            if (this.companions.length === 0) {
                companionsEl.innerHTML = '<p class="sidebar-empty">无同行队友</p>';
            } else {
                companionsEl.innerHTML = this.companions.map(c => {
                    const name = Utils.escapeHtml(c.name);
                    const portraitHtml = c.portraitSrc
                        ? `<img class="companion-avatar" src="${Utils.escapeHtml(c.portraitSrc)}" alt="${name}">`
                        : `<div class="companion-avatar companion-avatar-empty">NPC</div>`;
                    var moodHtml = this._renderMoodBar(c);
                    return `<div class="companion-card companion-card-row">
                        ${portraitHtml}
                        <div class="companion-card-main">
                            <div class="companion-name">${name}</div>
                            <div class="companion-status">HP:${c.hp}/${c.hpMax} SAN:${c.san}/${c.sanMax} ${Utils.escapeHtml(c.status)}</div>
                            ${moodHtml}
                        </div>
                    </div>`;
                }).join('');
            }
        }

        const contactsEl = document.getElementById('sidebar-contacts');
        if (contactsEl) {
            if (this.contacts.length === 0) {
                contactsEl.innerHTML = '<p class="sidebar-empty">无可联络助力</p>';
            } else {
                contactsEl.innerHTML = this.contacts.map(c => {
                    const name = Utils.escapeHtml(c.name);
                    const portraitHtml = c.portraitSrc
                        ? `<img class="companion-avatar" src="${Utils.escapeHtml(c.portraitSrc)}" alt="${name}">`
                        : `<div class="companion-avatar companion-avatar-empty">NPC</div>`;
                    return `<div class="companion-card companion-card-row">
                        ${portraitHtml}
                        <div class="companion-card-main">
                            <div class="companion-name">${name}</div>
                            <div class="companion-status">${Utils.escapeHtml(c.relation)} · ${Utils.escapeHtml(c.location || '未知')}</div>
                        </div>
                    </div>`;
                }).join('');
            }
        }
    },

    // === 情绪系统（好感度+恐惧+烦躁） ===
    MOOD_LIMITS: { affinity: 3, fear: 3, agitation: 3 },

    adjustMood(npcId, axis, delta) {
        var npc = this.allNPCs[npcId];
        if (!npc) return null;
        if (!npc.mood) npc.mood = { affinity: 0, fear: 0, agitation: 0 };

        // 性格影响好感度变化率：高神经质的人好感度变化更剧烈
        var actualDelta = delta;
        if (axis === 'affinity' && npc.personality) {
            var neuro = npc.personality.neuroticism || 5;
            // 神经质≥7：负面事件好感度降幅×1.5，正面事件增幅×1.3
            // 神经质≤3：变化幅度×0.7（迟钝）
            if (neuro >= 7) {
                actualDelta = delta > 0 ? delta * 1.3 : delta * 1.5;
            } else if (neuro <= 3) {
                actualDelta = delta * 0.7;
            }
            actualDelta = Math.round(actualDelta);
        }

        var old = npc.mood[axis] || 0;
        var limit = this.MOOD_LIMITS[axis] || 3;
        var newVal = Utils.clamp(old + actualDelta, -limit, limit);
        npc.mood[axis] = newVal;

        // 情绪触发行为
        var triggered = null;
        if (axis === 'agitation' && newVal >= 3) {
            triggered = { type: 'refuse', message: npc.name + '情绪激动，拒绝继续合作' };
            if (npc.isCompanion) {
                this.removeFromCompanions(npcId);
                triggered.type = 'leave';
                triggered.message = npc.name + '忍无可忍，转身离去';
            }
        }
        if (axis === 'fear' && newVal >= 3) {
            triggered = { type: 'flee', message: npc.name + '被恐惧压倒，只想逃离' };
            if (npc.isCompanion && Math.random() < 0.5) {
                this.removeFromCompanions(npcId);
                triggered.message = npc.name + '在恐惧中逃离了';
            }
        }
        if (axis === 'affinity' && newVal >= 3) {
            triggered = { type: 'ally', message: npc.name + '对你产生深厚好感，愿意全力配合' };
        }

        this.save();
        return { npcId: npcId, axis: axis, oldVal: old, newVal: newVal, triggered: triggered };
    },

    getMoodDescription(npc) {
        if (!npc || !npc.mood) return '平静';
        var m = npc.mood;
        var parts = [];
        // 好感度行为映射
        if (m.affinity >= 2) parts.push('信赖');
        else if (m.affinity <= -2) parts.push('敌视');
        else if (m.affinity >= 1) parts.push('友善');
        else if (m.affinity <= -1) parts.push('戒备');

        if (m.fear >= 2) parts.push('恐惧');
        else if (m.fear >= 1) parts.push('不安');

        if (m.agitation >= 2) parts.push('激动');
        else if (m.agitation >= 1) parts.push('烦躁');

        return parts.length > 0 ? parts.join('·') : '平静';
    },

    buildMoodContextForPrompt() {
        // 收集当前在场NPC的情绪状态，注入L2
        var npcs = this.allNPCs;
        var currentLocation = (typeof Story !== 'undefined' && Story.state) ? Story.state.currentLocation : '';
        var relevantNPCs = [];

        for (var id in npcs) {
            var npc = npcs[id];
            // 只包含当前地点的NPC或队友
            if (npc.location === currentLocation || npc.isCompanion) {
                relevantNPCs.push(npc);
            }
        }

        if (relevantNPCs.length === 0) return '';

        var ctx = '【NPC情绪与性格】\n';
        ctx += '情绪三轴：好感度(-3~+3)、恐惧(0~3)、烦躁(0~3)\n';
        ctx += '好感度行为映射：高好感度(≥2)→信赖，积极协助，提供额外信息；中好感度(0~1)→基本互动，标准响应；低好感度(≤-1)→戒备，低好感度(≤-2)→敌视，可能欺骗或利用玩家\n';
        ctx += '规则：NPC行为必须与其情绪状态一致——高恐惧的NPC会回避危险、高烦躁的NPC会打断对话、高好感度的NPC会主动提供信息\n\n';

        for (var i = 0; i < relevantNPCs.length; i++) {
            var n = relevantNPCs[i];
            if (!n.mood) continue;
            var desc = this.getMoodDescription(n);
            ctx += '- ' + n.name + '：好感度' + (n.mood.affinity >= 0 ? '+' : '') + n.mood.affinity + ' 恐惧' + n.mood.fear + ' 烦躁' + n.mood.agitation + '（' + desc + '）\n';

            // 注入性格信息
            if (n.personality) {
                var p = n.personality;
                var traits = [];
                if (p.openness >= 7) traits.push('思想开放');
                else if (p.openness <= 3) traits.push('保守固执');
                if (p.extraversion >= 7) traits.push('外向健谈');
                else if (p.extraversion <= 3) traits.push('内向沉默');
                if (p.neuroticism >= 7) traits.push('情绪敏感');
                else if (p.neuroticism <= 3) traits.push('情绪稳定');
                if (traits.length > 0) ctx += '  性格：' + traits.join('、') + '\n';
                if (p.want) ctx += '  渴望：' + p.want + '\n';
                if (p.wound) ctx += '  创伤：' + p.wound + '\n';
                if (p.voice) ctx += '  语风：' + p.voice + '\n';
            }
        }

        return ctx;
    },

    _renderMoodBar(npc) {
        if (!npc.mood) return '';
        var m = npc.mood;
        var desc = this.getMoodDescription(npc);
        var affColor = m.affinity >= 1 ? '#4ac464' : m.affinity <= -1 ? '#c44a4a' : '#888';
        var fearColor = m.fear >= 2 ? '#c44a4a' : m.fear >= 1 ? '#c4a44a' : '#888';
        var agitColor = m.agitation >= 2 ? '#c44a4a' : m.agitation >= 1 ? '#c4a44a' : '#888';
        return '<div class="npc-mood" title="' + Utils.escapeHtml(desc) + '">' +
            '<span class="mood-axis" style="color:' + affColor + '">A' + (m.affinity >= 0 ? '+' : '') + m.affinity + '</span>' +
            '<span class="mood-axis" style="color:' + fearColor + '">F' + m.fear + '</span>' +
            '<span class="mood-axis" style="color:' + agitColor + '">V' + m.agitation + '</span>' +
            '</div>';
    }
};
