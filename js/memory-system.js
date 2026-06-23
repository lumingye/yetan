const MemorySystem = {
    VERSION: '2.0',

    BUDGET_PRESETS: {
        '8K':  { total: 8000,  system: 1200, static: 1500, state: 500,  episodic: 1500, compressed: 1500, output: 1800 },
        '16K': { total: 16000, system: 2500, static: 3000, state: 1000, episodic: 3000, compressed: 3000, output: 3500 },
        '32K': { total: 32000, system: 4000, static: 5000, state: 1500, episodic: 6000, compressed: 6500, output: 9000 }
    },

    EPISODIC_WINDOW: {
        '8K':  3,
        '16K': 5,
        '32K': 8
    },

    COMPRESSION_THRESHOLD: 0.75,

    DECAY: {
        supplementary: { halfLife: 10, minRetention: 0.2 },
        important:     { halfLife: 30, minRetention: 0.5 },
        core:          { halfLife: Infinity, minRetention: 1.0 }
    },

    PRIORITY: { CORE: 'core', IMPORTANT: 'important', SUPPLEMENTARY: 'supplementary' },

    layers: {
        static: null,
        state: null,
        episodic: [],
        compressed: []
    },

    _budgetPreset: '16K',
    _budget: null,
    _interactionCount: 0,
    _lastCompressionTime: 0,
    _associationIndex: null,
    _npcAnchorCache: null,

    init() {
        this._budget = Object.assign({}, this.BUDGET_PRESETS[this._budgetPreset]);
        this._associationIndex = {
            clueToNpc: {},
            clueToLocation: {},
            npcToScene: {},
            chekhovToScene: {},
            locationToScene: {},
            eventChain: []
        };
        this._npcAnchorCache = {};
        this.loadFromStorage();
    },

    setBudgetPreset(preset) {
        if (this.BUDGET_PRESETS[preset]) {
            this._budgetPreset = preset;
            this._budget = Object.assign({}, this.BUDGET_PRESETS[preset]);
        }
    },

    initScenario(caseData) {
        this.layers.static = this._buildStaticMemory(caseData);
        this.layers.state = this._buildInitialState(caseData);
        this.layers.episodic = [];
        this.layers.compressed = [];
        this._interactionCount = 0;
        this._lastCompressionTime = 0;
        this._associationIndex = {
            clueToNpc: {},
            clueToLocation: {},
            npcToScene: {},
            chekhovToScene: {},
            locationToScene: {},
            eventChain: []
        };
        this._npcAnchorCache = {};
        this._buildAssociationIndex(caseData);
        this.saveToStorage();
    },

    _buildStaticMemory(caseData) {
        if (!caseData) return null;

        var scenario = {
            title: caseData.meta?.title || caseData.title || '',
            premise: '',
            actStructure: [],
            endings: []
        };

        if (caseData.layers && caseData.layers.length > 0) {
            scenario.actStructure = caseData.layers.map(function(layer, i) {
                return {
                    act: i + 1,
                    goal: layer.focus || '',
                    duration: layer.duration || ''
                };
            });
        }

        if (caseData.opening && caseData.opening.hook) {
            scenario.premise = caseData.opening.hook;
        } else if (caseData.hook) {
            scenario.premise = caseData.hook;
        }

        if (caseData.endings && caseData.endings.length > 0) {
            scenario.endings = caseData.endings.map(function(e) {
                return {
                    condition: e.condition || '',
                    result: e.result || e.consequences?.world_change || ''
                };
            });
        }

        var chekhovGuns = [];
        if (caseData.chekhovGuns && caseData.chekhovGuns.length > 0) {
            chekhovGuns = caseData.chekhovGuns.map(function(gun, i) {
                return {
                    id: i + 1,
                    planted: gun.plant || gun.planted || '',
                    payoff: gun.payoff || '',
                    status: 'planted'
                };
            });
        }

        var npcAnchors = [];
        if (caseData.npcs && caseData.npcs.length > 0) {
            npcAnchors = caseData.npcs.map(function(npc) {
                return MemorySystem._buildNPCAnchor(npc);
            });
        }

        var monsters = [];
        if (caseData.monsters && caseData.monsters.length > 0) {
            monsters = caseData.monsters.map(function(m) {
                return {
                    id: m.id || '',
                    name: m.name || m.id || '',
                    behavior: m.behavior || '',
                    appearanceTrigger: m.appearance_trigger || m.appearanceTrigger || ''
                };
            });
        }

        return {
            scenario: scenario,
            chekhovGuns: chekhovGuns,
            npcAnchors: npcAnchors,
            monsters: monsters
        };
    },

    _buildNPCAnchor(npcData) {
        var anchor = {
            id: npcData.id || npcData.name || '',
            name: npcData.name || '',

            identity: {
                role: npcData.role || '',
                coreTrait: npcData.coreTrait || npcData.secret || '',
                secret: npcData.secret || '',
                motivation: npcData.motivation || '',
                fear: npcData.fear || ''
            },

            relationship: {
                initial: npcData.relationship || npcData.relationshipToInvestigator || '',
                evolution: [],
                current: npcData.relationship || npcData.relationshipToInvestigator || ''
            },

            speech: {
                style: npcData.speechStyle || npcData.dialogueStyle || '',
                vocabulary: npcData.vocabulary || [],
                avoid: npcData.speechAvoid || [],
                sampleLines: npcData.sampleLines || npcData.dialogueAnchors || [],
                stressResponse: npcData.stressResponse || '',
                liePattern: npcData.liePattern || ''
            },

            behavior: {
                defaultAction: npcData.defaultAction || '',
                whenConfronted: npcData.whenConfronted || '',
                whenTrusted: npcData.whenTrusted || '',
                whenThreatened: npcData.whenThreatened || '',
                willNever: npcData.willNever || [],
                keyDecision: npcData.keyDecision || ''
            }
        };

        if (npcData.trust !== undefined) {
            anchor.trustThresholds = {
                base: typeof npcData.trust === 'object' ? (npcData.trust.base || 4) : npcData.trust,
                modifiers: typeof npcData.trust === 'object' ? (npcData.trust.modifiers || {}) : {}
            };
        }

        return anchor;
    },

    _buildInitialState(caseData) {
        if (!caseData) return null;

        var investigator = {
            name: '',
            hp: 0, hpMax: 0,
            san: 0, sanMax: 0,
            mp: 0, mpMax: 0,
            currentLocation: '',
            inventory: [],
            conditions: [],
            mythos: 0
        };

        var npcs = {};
        if (caseData.npcs && caseData.npcs.length > 0) {
            caseData.npcs.forEach(function(npc) {
                var npcId = npc.id || npc.name || '';
                var baseTrust = typeof npc.trust === 'object' ? (npc.trust.base || 4) : (npc.trust || 4);
                npcs[npcId] = {
                    name: npc.name || npcId,
                    location: npc.location || '',
                    trust: baseTrust,
                    mood: npc.mood || 'neutral',
                    knownByInvestigator: [],
                    hasRevealed: [],
                    currentGoal: npc.motivation || ''
                };
            });
        }

        var timeline = {
            current_time: '',
            tide_status: '',
            next_tide_event: '',
            events_completed: []
        };

        if (caseData.timeline && caseData.timeline.length > 0) {
            timeline.events_completed = caseData.timeline.map(function(t) {
                return (t.time || '') + ' ' + (t.event || '');
            });
        }

        return {
            investigator: investigator,
            npcs: npcs,
            timeline: timeline,
            cluesFound: [],
            world: {
                sealIntegrity: 5,
                entityActivity: 'none',
                spatialDistortion: ''
            }
        };
    },

    _buildAssociationIndex(caseData) {
        if (!caseData) return;

        var idx = this._associationIndex;

        if (caseData.clues && caseData.clues.length > 0) {
            caseData.clues.forEach(function(clue) {
                var clueId = clue.id || clue.description || '';
                if (clue.npcLinks) {
                    idx.clueToNpc[clueId] = clue.npcLinks;
                }
                if (clue.locationLinks || clue.discovery) {
                    idx.clueToLocation[clueId] = clue.locationLinks || (clue.discovery ? clue.discovery.location : '');
                }
            });
        }

        if (caseData.npcs && caseData.npcs.length > 0) {
            caseData.npcs.forEach(function(npc) {
                var npcId = npc.id || npc.name || '';
                if (npc.relationship_web || npc.relationships) {
                    idx.npcToScene[npcId] = {
                        relationships: npc.relationship_web || npc.relationships || {},
                        scenes: []
                    };
                }
            });
        }

        if (caseData.chekhovGuns && caseData.chekhovGuns.length > 0) {
            caseData.chekhovGuns.forEach(function(gun, i) {
                var gunId = 'gun_' + (i + 1);
                idx.chekhovToScene[gunId] = {
                    plant: gun.plant || gun.planted || '',
                    payoff: gun.payoff || '',
                    status: 'planted',
                    revealedInScene: null,
                    resolvedInScene: null
                };
            });
        }
    },

    updateInvestigatorState(charData) {
        if (!this.layers.state || !charData) return;

        this.layers.state.investigator = {
            name: charData.name || '',
            hp: charData.hp || 0,
            hpMax: charData.hpMax || 0,
            san: charData.san || 0,
            sanMax: charData.sanMax || 0,
            mp: charData.mp || 0,
            mpMax: charData.mpMax || 0,
            currentLocation: this.layers.state.investigator.currentLocation || '',
            inventory: charData.inventory || this.layers.state.investigator.inventory || [],
            conditions: charData.conditions || this.layers.state.investigator.conditions || [],
            mythos: charData.mythos || charData.mythosKnowledge || this.layers.state.investigator.mythos || 0
        };

        this.saveToStorage();
    },

    updateNPCState(npcId, updates) {
        if (!this.layers.state || !this.layers.state.npcs) return;

        if (this.layers.state.npcs[npcId]) {
            var npc = this.layers.state.npcs[npcId];
            if (updates.trust !== undefined) npc.trust = updates.trust;
            if (updates.mood) npc.mood = updates.mood;
            if (updates.location) npc.location = updates.location;
            if (updates.currentGoal) npc.currentGoal = updates.currentGoal;
            if (updates.revealedInfo) {
                if (npc.hasRevealed.indexOf(updates.revealedInfo) === -1) {
                    npc.hasRevealed.push(updates.revealedInfo);
                }
            }
            if (updates.knownInfo) {
                if (npc.knownByInvestigator.indexOf(updates.knownInfo) === -1) {
                    npc.knownByInvestigator.push(updates.knownInfo);
                }
            }
        }

        this.saveToStorage();
    },

    updateNPCRelationship(npcId, newRelationship, reason) {
        if (!this.layers.static || !this.layers.static.npcAnchors) return false;

        var anchor = null;
        for (var i = 0; i < this.layers.static.npcAnchors.length; i++) {
            if (this.layers.static.npcAnchors[i].id === npcId || this.layers.static.npcAnchors[i].name === npcId) {
                anchor = this.layers.static.npcAnchors[i];
                break;
            }
        }

        if (!anchor || !anchor.relationship) return false;

        var oldRel = anchor.relationship.current;
        if (oldRel === newRelationship) return false;

        var CONSISTENCY_RULES = {
            '挚友': ['好友', '信赖之人', '同伴'],
            '好友': ['挚友', '信赖之人', '熟人'],
            '信赖之人': ['挚友', '好友', '同伴'],
            '同伴': ['信赖之人', '好友', '熟人'],
            '熟人': ['好友', '同伴', '一面之缘'],
            '一面之缘': ['熟人'],
            '敌人': ['对手', '威胁'],
            '对手': ['敌人', '竞争者']
        };

        var allowed = CONSISTENCY_RULES[oldRel];
        if (allowed && allowed.indexOf(newRelationship) === -1) {
            var isDowngrade = this._isRelationshipDowngrade(oldRel, newRelationship);
            if (isDowngrade) {
                anchor.relationship.evolution.push(oldRel + '→' + newRelationship + '(' + (reason || '剧情发展') + ')');
                anchor.relationship.current = newRelationship;
                this.saveToStorage();
                return true;
            }
            return false;
        }

        anchor.relationship.evolution.push(oldRel + '→' + newRelationship + '(' + (reason || '剧情发展') + ')');
        anchor.relationship.current = newRelationship;
        this.saveToStorage();
        return true;
    },

    _isRelationshipDowngrade(oldRel, newRel) {
        var hierarchy = ['挚友', '好友', '信赖之人', '同伴', '熟人', '一面之缘'];
        var oldIdx = hierarchy.indexOf(oldRel);
        var newIdx = hierarchy.indexOf(newRel);
        if (oldIdx === -1 || newIdx === -1) return true;
        return newIdx > oldIdx;
    },

    getNPCRelationship(npcId) {
        if (!this.layers.static || !this.layers.static.npcAnchors) return null;
        for (var i = 0; i < this.layers.static.npcAnchors.length; i++) {
            var anchor = this.layers.static.npcAnchors[i];
            if (anchor.id === npcId || anchor.name === npcId) {
                return anchor.relationship ? anchor.relationship.current : null;
            }
        }
        return null;
    },

    addClueFound(clueText, source) {
        if (!this.layers.state) return;

        var existing = this.layers.state.cluesFound.some(function(c) { return c.text === clueText; });
        if (!existing) {
            this.layers.state.cluesFound.push({
                text: clueText,
                source: source || '',
                timestamp: this._interactionCount,
                discoveredAt: new Date().toISOString()
            });
        }

        this.saveToStorage();
    },

    updateTimeline(time, event) {
        if (!this.layers.state) return;

        if (time) this.layers.state.timeline.current_time = time;
        if (event) this.layers.state.timeline.events_completed.push(time + ' ' + event);

        this.saveToStorage();
    },

    updateWorldState(updates) {
        if (!this.layers.state || !this.layers.state.world) return;

        var world = this.layers.state.world;
        if (updates.sealIntegrity !== undefined) world.sealIntegrity = updates.sealIntegrity;
        if (updates.entityActivity) world.entityActivity = updates.entityActivity;
        if (updates.spatialDistortion) world.spatialDistortion = updates.spatialDistortion;

        this.saveToStorage();
    },

    updateChekhovStatus(gunId, status) {
        if (!this.layers.static || !this.layers.static.chekhovGuns) return;

        var gun = this.layers.static.chekhovGuns.find(function(g) { return g.id === gunId; });
        if (gun) {
            gun.status = status;
            if (this._associationIndex && this._associationIndex.chekhovToScene['gun_' + gunId]) {
                this._associationIndex.chekhovToScene['gun_' + gunId].status = status;
            }
        }

        this.saveToStorage();
    },

    addEpisodicRound(userMessage, assistantMessage, metadata) {
        var round = {
            id: this._interactionCount,
            timestamp: new Date().toISOString(),
            user: userMessage,
            assistant: assistantMessage,
            meta: metadata || {},
            scene: metadata?.scene || '',
            npcsPresent: metadata?.npcsPresent || [],
            location: metadata?.location || ''
        };

        this.layers.episodic.push(round);
        this._interactionCount++;

        var maxWindow = this.EPISODIC_WINDOW[this._budgetPreset] || 5;
        while (this.layers.episodic.length > maxWindow) {
            var oldest = this.layers.episodic.shift();
            this._compressRound(oldest);
        }

        if (this._shouldTriggerCompression()) {
            this._executeCompression();
        }

        this.saveToStorage();
    },

    _compressRound(round) {
        var entry = {
            id: 'compressed_' + round.id,
            scene: round.scene || '未标记场景',
            event: this._extractEvent(round),
            clue: this._extractClue(round),
            npcChange: this._extractNPCChange(round),
            relationshipChange: this._extractRelationshipChange(round),
            chekhov: this._extractChekhovChange(round),
            decision: this._extractDecision(round),
            emotionalBeat: this._extractEmotionalBeat(round),
            priority: this._classifyPriority(round),
            createdAt: this._interactionCount,
            decayFactor: 1.0
        };

        this.layers.compressed.push(entry);
        this._updateAssociationIndex(round, entry);
    },

    _extractEvent(round) {
        var text = round.assistant || '';
        if (text.length > 200) text = text.substring(0, 200);
        return text.replace(/\n/g, ' ').trim();
    },

    _extractClue(round) {
        var clues = [];
        var cluePatterns = [
            /发现[了]?(.{5,50}?)(?:。|，|！)/g,
            /注意到[了]?(.{5,50}?)(?:。|，|！)/g,
            /找到[了]?(.{5,50}?)(?:。|，|！)/g,
            /检定成功[：:]?(.{5,50}?)(?:。|，|！)/g
        ];

        var text = round.assistant || '';
        for (var i = 0; i < cluePatterns.length; i++) {
            var match;
            while ((match = cluePatterns[i].exec(text)) !== null) {
                if (clues.indexOf(match[1]) === -1) {
                    clues.push(match[1]);
                }
            }
        }

        return clues.length > 0 ? clues.join('；') : null;
    },

    _extractNPCChange(round) {
        var changes = [];
        var text = round.assistant || '';
        var npcNames = [];

        if (this.layers.state && this.layers.state.npcs) {
            var npcs = this.layers.state.npcs;
            for (var key in npcs) {
                if (npcs.hasOwnProperty(key) && npcs[key].name) {
                    npcNames.push(npcs[key].name);
                }
            }
        }

        for (var i = 0; i < npcNames.length; i++) {
            var name = npcNames[i];
            if (text.indexOf(name) !== -1) {
                var trustChange = this._detectTrustChange(text, name);
                if (trustChange) {
                    changes.push({ npc: name, change: trustChange });
                }
            }
        }

        return changes.length > 0 ? changes : null;
    },

    _detectTrustChange(text, npcName) {
        var trustUp = ['信任', '坦诚', '承认', '透露', '打开心扉', '配合', '帮助'];
        var trustDown = ['警惕', '拒绝', '否认', '愤怒', '敌意', '不信任', '回避'];

        for (var i = 0; i < trustUp.length; i++) {
            if (text.indexOf(npcName + trustUp[i]) !== -1 || text.indexOf(trustUp[i]) !== -1 && text.indexOf(npcName) !== -1) {
                return 'trust_up';
            }
        }
        for (var j = 0; j < trustDown.length; j++) {
            if (text.indexOf(npcName + trustDown[j]) !== -1 || text.indexOf(trustDown[j]) !== -1 && text.indexOf(npcName) !== -1) {
                return 'trust_down';
            }
        }

        return null;
    },

    _extractRelationshipChange(round) {
        var text = round.assistant || '';
        var relPatterns = [
            /(\S+?)从[「"]?(\S+?)[」"]?变成[了为][「"]?(\S+?)[」"]?/g,
            /(\S+?)与.*关系.*(?:变为|变成|转为|升级为|降级为)[「"]?(\S+?)[」"]?/g,
            /(\S+?)不再.*(?:而是|变成)[「"]?(\S+?)[」"]?/g
        ];

        var changes = [];
        for (var i = 0; i < relPatterns.length; i++) {
            var match;
            while ((match = relPatterns[i].exec(text)) !== null) {
                changes.push(match[0].substring(0, 80));
            }
        }

        return changes.length > 0 ? changes.join('；') : null;
    },

    _extractChekhovChange(round) {
        if (!this.layers.static || !this.layers.static.chekhovGuns) return null;

        var text = (round.user || '') + ' ' + (round.assistant || '');
        var changes = [];

        for (var i = 0; i < this.layers.static.chekhovGuns.length; i++) {
            var gun = this.layers.static.chekhovGuns[i];
            if (gun.status === 'planted' && text.indexOf(gun.planted) !== -1) {
                changes.push({ gunId: gun.id, newStatus: 'revealed' });
            }
            if (gun.payoff && text.indexOf(gun.payoff) !== -1) {
                changes.push({ gunId: gun.id, newStatus: 'resolved' });
            }
        }

        return changes.length > 0 ? changes : null;
    },

    _extractDecision(round) {
        var text = round.user || '';
        var decisionKeywords = ['决定', '选择', '打算', '要去', '尝试', '拒绝', '同意'];
        for (var i = 0; i < decisionKeywords.length; i++) {
            if (text.indexOf(decisionKeywords[i]) !== -1) {
                return text.substring(0, 100);
            }
        }
        return null;
    },

    _extractEmotionalBeat(round) {
        var text = round.assistant || '';
        var fearWords = ['恐惧', '不安', '颤抖', '后退', '寒意', '战栗'];
        var hopeWords = ['希望', '勇气', '坚定', '决心', '线索'];
        var despairWords = ['绝望', '崩溃', '疯狂', '虚无', '深渊'];

        for (var i = 0; i < fearWords.length; i++) {
            if (text.indexOf(fearWords[i]) !== -1) return '恐惧加深';
        }
        for (var j = 0; j < hopeWords.length; j++) {
            if (text.indexOf(hopeWords[j]) !== -1) return '希望浮现';
        }
        for (var k = 0; k < despairWords.length; k++) {
            if (text.indexOf(despairWords[k]) !== -1) return '绝望蔓延';
        }

        return '调查推进';
    },

    _classifyPriority(round) {
        var text = (round.user || '') + ' ' + (round.assistant || '');

        var coreIndicators = ['真相', '封印', '守望者', '结局', '死亡', '疯狂', '克苏鲁', 'Z\'hal'];
        for (var i = 0; i < coreIndicators.length; i++) {
            if (text.indexOf(coreIndicators[i]) !== -1) return this.PRIORITY.CORE;
        }

        var importantIndicators = ['线索', '发现', '秘密', '信任', '检定成功', '检定失败', 'NPC', '对话'];
        for (var j = 0; j < importantIndicators.length; j++) {
            if (text.indexOf(importantIndicators[j]) !== -1) return this.PRIORITY.IMPORTANT;
        }

        return this.PRIORITY.SUPPLEMENTARY;
    },

    _updateAssociationIndex(round, compressedEntry) {
        if (!this._associationIndex) return;

        var scene = round.scene || compressedEntry.scene;
        if (scene && round.npcsPresent) {
            for (var i = 0; i < round.npcsPresent.length; i++) {
                var npcId = round.npcsPresent[i];
                if (!this._associationIndex.npcToScene[npcId]) {
                    this._associationIndex.npcToScene[npcId] = { relationships: {}, scenes: [] };
                }
                this._associationIndex.npcToScene[npcId].scenes.push({
                    scene: scene,
                    roundId: round.id,
                    compressedId: compressedEntry.id
                });
            }
        }

        if (scene && round.location) {
            if (!this._associationIndex.locationToScene[round.location]) {
                this._associationIndex.locationToScene[round.location] = [];
            }
            this._associationIndex.locationToScene[round.location].push({
                scene: scene,
                roundId: round.id
            });
        }

        if (compressedEntry.chekhov) {
            for (var j = 0; j < compressedEntry.chekhov.length; j++) {
                var change = compressedEntry.chekhov[j];
                var gunKey = 'gun_' + change.gunId;
                if (this._associationIndex.chekhovToScene[gunKey]) {
                    if (change.newStatus === 'revealed') {
                        this._associationIndex.chekhovToScene[gunKey].revealedInScene = scene;
                    } else if (change.newStatus === 'resolved') {
                        this._associationIndex.chekhovToScene[gunKey].resolvedInScene = scene;
                    }
                }
            }
        }
    },

    _shouldTriggerCompression() {
        var currentTokens = this.estimateTotalTokens();
        var budget = this._budget.total;
        return currentTokens > budget * this.COMPRESSION_THRESHOLD;
    },

    _executeCompression() {
        this._applyDecay();
        this._mergeSupplementary();
        this._trimCompressed();
        this._lastCompressionTime = this._interactionCount;
    },

    _applyDecay() {
        var self = this;
        this.layers.compressed.forEach(function(entry) {
            var decayConfig = self.DECAY[entry.priority] || self.DECAY.supplementary;
            if (decayConfig.halfLife === Infinity) return;

            var age = self._interactionCount - entry.createdAt;
            var decayFactor = Math.pow(0.5, age / decayConfig.halfLife);
            entry.decayFactor = Math.max(decayFactor, decayConfig.minRetention);
        });
    },

    _mergeSupplementary() {
        var supplementary = this.layers.compressed.filter(function(e) {
            return e.priority === MemorySystem.PRIORITY.SUPPLEMENTARY && e.decayFactor < 0.5;
        });

        var important = this.layers.compressed.filter(function(e) {
            return e.priority !== MemorySystem.PRIORITY.SUPPLEMENTARY || e.decayFactor >= 0.5;
        });

        if (supplementary.length >= 3) {
            var merged = {
                id: 'merged_' + Date.now(),
                scene: '多个场景合并',
                event: supplementary.map(function(e) { return e.event; }).filter(Boolean).join('；'),
                clue: supplementary.map(function(e) { return e.clue; }).filter(Boolean).join('；') || null,
                npcChange: null,
                chekhov: null,
                decision: null,
                emotionalBeat: supplementary.map(function(e) { return e.emotionalBeat; }).filter(Boolean).join('→'),
                priority: MemorySystem.PRIORITY.SUPPLEMENTARY,
                createdAt: supplementary[0].createdAt,
                decayFactor: 0.3,
                mergedFrom: supplementary.map(function(e) { return e.id; })
            };
            important.push(merged);
        } else {
            important = important.concat(supplementary);
        }

        this.layers.compressed = important;
    },

    _trimCompressed() {
        var budget = this._budget.compressed;
        var sorted = this.layers.compressed.slice().sort(function(a, b) {
            var pa = a.priority === MemorySystem.PRIORITY.CORE ? 3 : a.priority === MemorySystem.PRIORITY.IMPORTANT ? 2 : 1;
            var pb = b.priority === MemorySystem.PRIORITY.CORE ? 3 : b.priority === MemorySystem.PRIORITY.IMPORTANT ? 2 : 1;
            if (pa !== pb) return pb - pa;
            return (b.decayFactor || 1) - (a.decayFactor || 1);
        });

        var totalTokens = 0;
        var kept = [];
        for (var i = 0; i < sorted.length; i++) {
            var entryTokens = this._estimateEntryTokens(sorted[i]);
            if (totalTokens + entryTokens <= budget || sorted[i].priority === MemorySystem.PRIORITY.CORE) {
                kept.push(sorted[i]);
                totalTokens += entryTokens;
            }
        }

        this.layers.compressed = kept;
    },

    estimateTotalTokens() {
        var total = 0;
        total += this._estimateStaticTokens();
        total += this._estimateStateTokens();
        total += this._estimateEpisodicTokens();
        total += this._estimateCompressedTokens();
        return total;
    },

    _estimateStaticTokens() {
        if (!this.layers.static) return 0;
        return Math.ceil(JSON.stringify(this.layers.static).length * 1.5);
    },

    _estimateStateTokens() {
        if (!this.layers.state) return 0;
        return Math.ceil(JSON.stringify(this.layers.state).length * 1.5);
    },

    _estimateEpisodicTokens() {
        var total = 0;
        this.layers.episodic.forEach(function(round) {
            total += ((round.user || '').length + (round.assistant || '').length) * 1.5;
        });
        return Math.ceil(total);
    },

    _estimateCompressedTokens() {
        var total = 0;
        this.layers.compressed.forEach(function(entry) {
            total += MemorySystem._estimateEntryTokens(entry);
        });
        return total;
    },

    _estimateEntryTokens(entry) {
        if (!entry) return 0;
        return Math.ceil(JSON.stringify(entry).length * 1.5);
    },

    retrieveByContext(context) {
        var results = {
            static: null,
            state: null,
            episodic: [],
            compressed: []
        };

        results.static = this.layers.static;
        results.state = this.layers.state;
        results.episodic = this.layers.episodic.slice();

        if (context) {
            results.compressed = this._retrieveRelevantCompressed(context);
        } else {
            results.compressed = this.layers.compressed.slice();
        }

        return results;
    },

    _retrieveRelevantCompressed(context) {
        var self = this;
        var scored = this.layers.compressed.map(function(entry) {
            var score = self._calculateRelevance(entry, context);
            return { entry: entry, score: score };
        });

        scored.sort(function(a, b) { return b.score - a.score; });

        var budget = self._budget.compressed;
        var totalTokens = 0;
        var result = [];

        for (var i = 0; i < scored.length; i++) {
            var entryTokens = self._estimateEntryTokens(scored[i].entry);
            if (totalTokens + entryTokens <= budget) {
                result.push(scored[i].entry);
                totalTokens += entryTokens;
            }
        }

        return result;
    },

    _calculateRelevance(entry, context) {
        var score = 0;

        var priorityWeight = {
            core: 10,
            important: 5,
            supplementary: 1
        };
        score += (priorityWeight[entry.priority] || 1);

        score += (entry.decayFactor || 1) * 3;

        if (context.currentNPC && entry.npcChange) {
            var npcChanges = entry.npcChange;
            if (Array.isArray(npcChanges)) {
                for (var i = 0; i < npcChanges.length; i++) {
                    if (npcChanges[i].npc === context.currentNPC) {
                        score += 8;
                    }
                }
            }
        }

        if (context.currentLocation && entry.scene) {
            if (entry.scene.indexOf(context.currentLocation) !== -1) {
                score += 5;
            }
        }

        if (context.keywords && context.keywords.length > 0) {
            var entryText = (entry.event || '') + ' ' + (entry.clue || '') + ' ' + (entry.decision || '');
            for (var j = 0; j < context.keywords.length; j++) {
                if (entryText.indexOf(context.keywords[j]) !== -1) {
                    score += 3;
                }
            }
        }

        if (context.recentClueIds && entry.clue) {
            score += 2;
        }

        return score;
    },

    getNPCAnchor(npcId) {
        if (!this.layers.static || !this.layers.static.npcAnchors) return null;

        if (this._npcAnchorCache[npcId]) {
            return this._npcAnchorCache[npcId];
        }

        var anchor = this.layers.static.npcAnchors.find(function(a) {
            return a.id === npcId || a.name === npcId;
        });

        if (anchor) {
            this._npcAnchorCache[npcId] = anchor;
        }

        return anchor;
    },

    validateNPCConsistency(npcId, proposedAction, proposedDialogue) {
        var anchor = this.getNPCAnchor(npcId);
        if (!anchor) return { consistent: true, warnings: [] };

        var warnings = [];

        if (anchor.behavior.willNever && anchor.behavior.willNever.length > 0) {
            for (var i = 0; i < anchor.behavior.willNever.length; i++) {
                var never = anchor.behavior.willNever[i];
                if (proposedAction && proposedAction.indexOf(never) !== -1) {
                    warnings.push('行为锚违规：' + anchor.name + '绝不会' + never);
                }
            }
        }

        if (anchor.speech.avoid && anchor.speech.avoid.length > 0 && proposedDialogue) {
            for (var j = 0; j < anchor.speech.avoid.length; j++) {
                var avoid = anchor.speech.avoid[j];
                if (proposedDialogue.indexOf(avoid) !== -1) {
                    warnings.push('语言锚违规：' + anchor.name + '不会使用"' + avoid + '"的表达方式');
                }
            }
        }

        if (this.layers.state && this.layers.state.npcs && this.layers.state.npcs[npcId]) {
            var npcState = this.layers.state.npcs[npcId];
            var trustLevel = npcState.trust;

            if (proposedDialogue) {
                var secretRevealPatterns = ['秘密', '真相', '其实', '坦白说', '告诉你'];
                for (var k = 0; k < secretRevealPatterns.length; k++) {
                    if (proposedDialogue.indexOf(secretRevealPatterns[k]) !== -1 && trustLevel < 7) {
                        warnings.push('信任度不足：' + anchor.name + '当前信任度' + trustLevel + '，不足以透露秘密（需≥7）');
                        break;
                    }
                }
            }
        }

        return {
            consistent: warnings.length === 0,
            warnings: warnings
        };
    },

    detectDrift(npcId, currentDialogue) {
        var anchor = this.getNPCAnchor(npcId);
        if (!anchor || !anchor.speech.sampleLines || anchor.speech.sampleLines.length === 0) {
            return { driftDetected: false, score: 0 };
        }

        var driftScore = 0;
        var maxScore = 0;

        if (anchor.speech.style) {
            maxScore += 3;
            var styleKeywords = anchor.speech.style.split(/[，、,]/);
            var matchedStyle = 0;
            for (var i = 0; i < styleKeywords.length; i++) {
                if (currentDialogue.indexOf(styleKeywords[i].trim()) !== -1) {
                    matchedStyle++;
                }
            }
            if (matchedStyle === 0 && styleKeywords.length > 0) driftScore += 3;
        }

        if (anchor.speech.vocabulary && anchor.speech.vocabulary.length > 0) {
            maxScore += 2;
            var vocabFound = false;
            for (var j = 0; j < anchor.speech.vocabulary.length; j++) {
                if (currentDialogue.indexOf(anchor.speech.vocabulary[j]) !== -1) {
                    vocabFound = true;
                    break;
                }
            }
            if (!vocabFound) driftScore += 2;
        }

        var sampleLineLengths = anchor.speech.sampleLines.map(function(l) {
            return l.length;
        });
        var avgLength = sampleLineLengths.reduce(function(a, b) { return a + b; }, 0) / sampleLineLengths.length;
        var currentLength = currentDialogue.length;
        maxScore += 2;
        if (avgLength < 20 && currentLength > 50) driftScore += 2;
        if (avgLength > 50 && currentLength < 20) driftScore += 2;

        var normalizedScore = maxScore > 0 ? driftScore / maxScore : 0;

        return {
            driftDetected: normalizedScore > 0.5,
            score: normalizedScore,
            details: {
                styleDrift: driftScore > 0,
                vocabularyDrift: driftScore > 2,
                lengthDrift: driftScore > 4
            }
        };
    },

    buildContextForAPI(gameState) {
        var context = {};

        if (gameState && gameState.story) {
            context.currentNPC = '';
            context.currentLocation = gameState.story.currentLocation || '';
            context.keywords = [];

            // 线索从 Story.state.clues 取（权威数据源）
            var storyClues = (typeof Story !== 'undefined' && Story.state.clues) ? Story.state.clues : (gameState.story.clues || []);
            if (storyClues.length > 0) {
                context.keywords = storyClues.slice(-3);
            }
        }

        var retrieved = this.retrieveByContext(context);

        var parts = [];

        if (retrieved.static) {
            parts.push(this._formatStaticMemory(retrieved.static));
        }

        if (retrieved.state) {
            parts.push(this._formatStateMemory(retrieved.state));
        }

        if (retrieved.compressed && retrieved.compressed.length > 0) {
            parts.push(this._formatCompressedMemory(retrieved.compressed));
        }

        // 情景记忆（episodic）不再注入 system prompt：最近对话已通过
        // API.conversationHistory 以标准 messages 格式注入，重复注入浪费 token。
        // episodic 数据仍保留在内存中用于 retrieveByContext 语义检索。

        return parts.join('\n\n');
    },

    _formatStaticMemory(staticMem) {
        var lines = ['【静态记忆——永不压缩】'];

        if (staticMem.scenario) {
            lines.push('\n## 剧本骨架');
            lines.push('标题：' + (staticMem.scenario.title || ''));
            lines.push('前提：' + (staticMem.scenario.premise || ''));

            if (staticMem.scenario.actStructure && staticMem.scenario.actStructure.length > 0) {
                lines.push('\n幕结构：');
                staticMem.scenario.actStructure.forEach(function(act) {
                    lines.push('  第' + act.act + '幕目标：' + act.goal);
                });
            }

            if (staticMem.scenario.endings && staticMem.scenario.endings.length > 0) {
                lines.push('\n结局条件：');
                staticMem.scenario.endings.forEach(function(e) {
                    lines.push('  若' + e.condition + ' → ' + e.result);
                });
            }
        }

        if (staticMem.chekhovGuns && staticMem.chekhovGuns.length > 0) {
            lines.push('\n## 契诃夫之枪清单');
            staticMem.chekhovGuns.forEach(function(gun) {
                lines.push('  #' + gun.id + ' [' + gun.status + '] 埋设：' + gun.planted + ' → 回收：' + gun.payoff);
            });
        }

        if (staticMem.npcAnchors && staticMem.npcAnchors.length > 0) {
            lines.push('\n## NPC锚点卡');
            staticMem.npcAnchors.forEach(function(anchor) {
                lines.push('\n### ' + anchor.name + '（' + anchor.identity.role + '）');
                lines.push('核心特质：' + anchor.identity.coreTrait);
                if (anchor.identity.secret) lines.push('秘密：' + anchor.identity.secret);
                if (anchor.identity.motivation) lines.push('动机：' + anchor.identity.motivation);
                if (anchor.identity.fear) lines.push('恐惧：' + anchor.identity.fear);

                if (anchor.relationship) {
                    if (anchor.relationship.initial) {
                        lines.push('初始关系：' + anchor.relationship.initial);
                    }
                    if (anchor.relationship.current && anchor.relationship.current !== anchor.relationship.initial) {
                        lines.push('当前关系：' + anchor.relationship.current);
                    }
                    if (anchor.relationship.evolution && anchor.relationship.evolution.length > 0) {
                        lines.push('关系演变：' + anchor.relationship.evolution.join(' → '));
                    }
                }

                if (anchor.speech.style) {
                    lines.push('语言风格：' + anchor.speech.style);
                }
                if (anchor.speech.sampleLines && anchor.speech.sampleLines.length > 0) {
                    lines.push('样本对话：');
                    anchor.speech.sampleLines.forEach(function(line) {
                        lines.push('  "' + line + '"');
                    });
                }
                if (anchor.speech.stressResponse) {
                    lines.push('压力反应：' + anchor.speech.stressResponse);
                }
                if (anchor.speech.liePattern) {
                    lines.push('撒谎模式：' + anchor.speech.liePattern);
                }

                if (anchor.behavior.willNever && anchor.behavior.willNever.length > 0) {
                    lines.push('绝不：' + anchor.behavior.willNever.join('、'));
                }
                if (anchor.behavior.keyDecision) {
                    lines.push('关键抉择：' + anchor.behavior.keyDecision);
                }
            });
        }

        if (staticMem.monsters && staticMem.monsters.length > 0) {
            lines.push('\n## 怪物数据');
            staticMem.monsters.forEach(function(m) {
                lines.push('  ' + m.name + '：' + m.behavior + '（触发：' + m.appearanceTrigger + '）');
            });
        }

        return lines.join('\n');
    },

    _formatStateMemory(stateMem) {
        var lines = ['【状态记忆——每次交互后更新】'];

        if (stateMem.investigator) {
            var inv = stateMem.investigator;
            lines.push('\n## 调查者状态');
            lines.push('姓名：' + inv.name);
            lines.push('HP：' + inv.hp + '/' + inv.hpMax + '  SAN：' + inv.san + '/' + inv.sanMax + '  MP：' + inv.mp + '/' + inv.mpMax);
            // 位置、时间、线索由 system prompt【当前游戏状态】和 KPNotebook 统一注入，此处不再重复
            if (inv.inventory && inv.inventory.length > 0) {
                lines.push('物品：' + inv.inventory.join('、'));
            }
            if (inv.conditions && inv.conditions.length > 0) {
                lines.push('状态：' + inv.conditions.join('、'));
            }
            if (inv.mythos > 0) {
                lines.push('神话知识：' + inv.mythos);
            }
        }

        // NPC 即时状态（位置/当前动作/状态等）统一由 KPNotebook 的「在场NPC当前状态」负责，
        // 此处不再注入 state.npcs：其更新链 updateNPCState 未接入主流程（为死数据），
        // 与 KPNotebook 并存会产生两份互相矛盾的 NPC 状态、污染 KP 判断。
        // NPC 的关系/人设由静态记忆的「NPC锚点卡」注入，不在此重复。

        // 时间线由 system prompt【当前游戏状态】+ KPNotebook「关键时间线」统一注入，此处不再重复。
        // 已发现线索由 system prompt【当前游戏状态】+ KPNotebook「线索分区」统一注入，此处不再重复。

        if (stateMem.world) {
            lines.push('\n## 世界状态');
            lines.push('封印完整度：' + stateMem.world.sealIntegrity + '/5');
            lines.push('实体活跃度：' + stateMem.world.entityActivity);
            if (stateMem.world.spatialDistortion) {
                lines.push('空间扭曲：' + stateMem.world.spatialDistortion);
            }
        }

        return lines.join('\n');
    },

    _formatCompressedMemory(compressedEntries) {
        var lines = ['【压缩记忆——过往场景摘要】'];

        compressedEntries.forEach(function(entry) {
            var priorityMark = entry.priority === 'core' ? '★' : entry.priority === 'important' ? '◆' : '○';
            lines.push('\n' + priorityMark + ' [' + entry.scene + ']');
            if (entry.event) lines.push('  事件：' + entry.event);
            if (entry.clue) lines.push('  线索：' + entry.clue);
            if (entry.npcChange) {
                var changes = entry.npcChange;
                if (Array.isArray(changes)) {
                    changes.forEach(function(c) {
                        lines.push('  NPC变化：' + c.npc + ' → ' + c.change);
                    });
                }
            }
            if (entry.relationshipChange) {
                lines.push('  关系变化：' + entry.relationshipChange);
            }
            if (entry.decision) lines.push('  决策：' + entry.decision);
            if (entry.emotionalBeat) lines.push('  情感节拍：' + entry.emotionalBeat);
        });

        return lines.join('\n');
    },

    _formatEpisodicMemory(episodicRounds) {
        var lines = ['【情景记忆——最近对话】'];

        episodicRounds.forEach(function(round) {
            lines.push('\n--- 第' + round.id + '轮 ---');
            if (round.scene) lines.push('场景：' + round.scene);
            lines.push('调查者：' + (round.user || ''));
            var assistantText = round.assistant || '';
            if (assistantText.length > 500) {
                assistantText = assistantText.substring(0, 500) + '...';
            }
            lines.push('AI KP：' + assistantText);
        });

        return lines.join('\n');
    },

    generateRecap() {
        if (!this.layers.state) return '';

        var parts = [];

        var recentCompressed = this.layers.compressed.slice(-3);
        if (recentCompressed.length > 0) {
            var recapEvents = recentCompressed.map(function(e) {
                return e.event || e.scene;
            }).filter(Boolean);
            if (recapEvents.length > 0) {
                parts.push('上次你离开时：' + recapEvents.join('。'));
            }
        }

        var state = this.layers.state;
        if (state.investigator) {
            parts.push('当前：HP ' + state.investigator.hp + '/' + state.investigator.hpMax +
                '，SAN ' + state.investigator.san + '/' + state.investigator.sanMax);
            // 位置由 system prompt + KPNotebook 统一注入，此处不再重复
        }

        // 线索和时间由 system prompt + KPNotebook 统一注入，此处不再重复

        return parts.join('\n');
    },

    getMemoryStats() {
        return {
            version: this.VERSION,
            budgetPreset: this._budgetPreset,
            budget: this._budget,
            interactionCount: this._interactionCount,
            staticTokens: this._estimateStaticTokens(),
            stateTokens: this._estimateStateTokens(),
            episodicCount: this.layers.episodic.length,
            episodicTokens: this._estimateEpisodicTokens(),
            compressedCount: this.layers.compressed.length,
            compressedTokens: this._estimateCompressedTokens(),
            totalTokens: this.estimateTotalTokens(),
            compressionThreshold: this.COMPRESSION_THRESHOLD,
            lastCompressionAt: this._lastCompressionTime,
            chekhovStatus: this._getChekhovStats(),
            npcTrustLevels: this._getNPCTrustStats()
        };
    },

    _getChekhovStats() {
        if (!this.layers.static || !this.layers.static.chekhovGuns) return {};
        var stats = { planted: 0, revealed: 0, resolved: 0 };
        this.layers.static.chekhovGuns.forEach(function(g) {
            if (stats[g.status] !== undefined) stats[g.status]++;
        });
        return stats;
    },

    _getNPCTrustStats() {
        if (!this.layers.state || !this.layers.state.npcs) return {};
        var stats = {};
        for (var npcId in this.layers.state.npcs) {
            if (this.layers.state.npcs.hasOwnProperty(npcId)) {
                stats[this.layers.state.npcs[npcId].name || npcId] = this.layers.state.npcs[npcId].trust;
            }
        }
        return stats;
    },

    saveToStorage() {
        var data = {
            version: this.VERSION,
            layers: this.layers,
            budgetPreset: this._budgetPreset,
            interactionCount: this._interactionCount,
            lastCompressionTime: this._lastCompressionTime,
            associationIndex: this._associationIndex
        };
        Utils.saveToStorage('scribe_memory_system', data);
    },

    loadFromStorage() {
        var data = Utils.loadFromStorage('scribe_memory_system');
        if (data && data.version === this.VERSION) {
            this.layers = data.layers || this.layers;
            this._budgetPreset = data.budgetPreset || '16K';
            this._budget = Object.assign({}, this.BUDGET_PRESETS[this._budgetPreset]);
            this._interactionCount = data.interactionCount || 0;
            this._lastCompressionTime = data.lastCompressionTime || 0;
            this._associationIndex = data.associationIndex || this._associationIndex;
        }
    },

    clearMemory() {
        this.layers = {
            static: null,
            state: null,
            episodic: [],
            compressed: []
        };
        this._interactionCount = 0;
        this._lastCompressionTime = 0;
        this._associationIndex = {
            clueToNpc: {},
            clueToLocation: {},
            npcToScene: {},
            chekhovToScene: {},
            locationToScene: {},
            eventChain: []
        };
        this._npcAnchorCache = {};
        Utils.removeFromStorage('scribe_memory_system');
    },

    exportMemory() {
        return JSON.stringify({
            version: this.VERSION,
            layers: this.layers,
            budgetPreset: this._budgetPreset,
            interactionCount: this._interactionCount,
            associationIndex: this._associationIndex,
            stats: this.getMemoryStats(),
            exportedAt: new Date().toISOString()
        }, null, 2);
    },

    importMemory(jsonString) {
        try {
            var data = JSON.parse(jsonString);
            if (!data.version || !data.layers) {
                return { success: false, error: '无效的记忆数据格式' };
            }
            this.layers = data.layers;
            this._budgetPreset = data.budgetPreset || '16K';
            this._budget = Object.assign({}, this.BUDGET_PRESETS[this._budgetPreset]);
            this._interactionCount = data.interactionCount || 0;
            this._associationIndex = data.associationIndex || this._associationIndex;
            this._npcAnchorCache = {};
            this.saveToStorage();
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
};
