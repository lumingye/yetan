const KPNotebook = {
    data: null,

    init() {
        var saved = Utils.loadFromStorage('scribe_kp_notebook');
        if (saved) {
            this.data = this._migrate(saved);
        } else {
            this.data = this._createEmpty();
        }
        this.save();
    },

    _createEmpty() {
        return {
            currentTime: '',
            currentLocation: '未知',
            atmosphere: '',
            npcs: [],
            itemsHeld: [],
            itemsFound: [],
            itemWarnings: [],
            exploredAreas: [],
            timeline: [],
            partitions: {
                items: [],
                locations: [],
                appearance: [],
                clues: []
            },
            progress: {
                completed: [],
                pendingClues: []
            },
            playerDecisions: [],
            worldStateChanges: [],
            lastUpdated: ''
        };
    },

    _migrate(data) {
        var empty = this._createEmpty();
        for (var key in empty) {
            if (data[key] === undefined) {
                data[key] = empty[key];
            }
        }
        if (!data.progress) data.progress = { completed: [], pendingClues: [] };
        if (!data.progress.completed) data.progress.completed = [];
        if (!data.progress.pendingClues) data.progress.pendingClues = [];
        if (!data.playerDecisions) data.playerDecisions = [];
        if (!data.worldStateChanges) data.worldStateChanges = [];
        if (!data.partitions) data.partitions = { items: [], locations: [], appearance: [], clues: [] };
        if (!data.partitions.items) data.partitions.items = [];
        if (!data.partitions.locations) data.partitions.locations = [];
        if (!data.partitions.appearance) data.partitions.appearance = [];
        if (!data.partitions.clues) data.partitions.clues = [];
        return data;
    },

    save() {
        this.data.lastUpdated = new Date().toISOString();
        Utils.saveToStorage('scribe_kp_notebook', this.data);
    },

    reset() {
        this.data = this._createEmpty();
        this.save();
    },

    updateFromGame(gameState) {
        if (!gameState) return;
        var story = gameState.story;
        var char = gameState.character;

        if (story && story.gameTime) {
            this.data.currentTime = Utils.formatTime(story.gameTime);
        }
        if (story && story.currentLocation) {
            this.data.currentLocation = story.currentLocation;
        }

        this.save();
    },

    parseUpdateBlock(text) {
        var regex = /<kp_note_update>([\s\S]*?)<\/kp_note_update>/;
        var match = text.match(regex);
        if (!match) return null;

        var block = match[1].trim();
        var update = {
            currentTime: '',
            currentLocation: '',
            atmosphere: '',
            npcChanges: [],
            newItemsHeld: [],
            newItemsFound: [],
            newItemWarnings: [],
            partitionUpdates: {
                items: [],
                locations: [],
                appearance: [],
                clues: []
            },
            newExploredAreas: [],
            newTimelineEvents: [],
            newClues: [],
            completedClues: [],
            playerDecisions: [],
            worldStateChanges: []
        };

        var lines = block.split('\n');
        var currentSection = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line) continue;

            if (line.startsWith('当前时间:') || line.startsWith('当前时间：')) {
                update.currentTime = line.replace(/^当前时间[：:]\s*/, '');
            } else if (line.startsWith('当前地点:') || line.startsWith('当前地点：')) {
                update.currentLocation = line.replace(/^当前地点[：:]\s*/, '');
            } else if (line.startsWith('天气/氛围:') || line.startsWith('天气/氛围：')) {
                update.atmosphere = line.replace(/^天气\/氛围[：:]\s*/, '');
            } else if (line.startsWith('NPC变动:') || line.startsWith('NPC变动：')) {
                currentSection = 'npc';
                var npcStr = line.replace(/^NPC变动[：:]\s*/, '');
                if (npcStr && npcStr !== '无') {
                    update.npcChanges.push(npcStr);
                }
            } else if (line.startsWith('新增物品:') || line.startsWith('新增物品：')) {
                currentSection = 'items';
                var itemStr = line.replace(/^新增物品[：:]\s*/, '');
                if (itemStr && itemStr !== '无') {
                    update.newItemsHeld.push(itemStr);
                }
            } else if (line.startsWith('新探索区域:') || line.startsWith('新探索区域：')) {
                currentSection = 'areas';
                var areaStr = line.replace(/^新探索区域[：:]\s*/, '');
                if (areaStr && areaStr !== '无') {
                    update.newExploredAreas.push(areaStr);
                }
            } else if (line.startsWith('新线索:') || line.startsWith('新线索：')) {
                currentSection = 'clues';
                var clueStr = line.replace(/^新线索[：:]\s*/, '');
                if (clueStr && clueStr !== '无') {
                    update.newClues.push(clueStr);
                }
            } else if (line.startsWith('已完成:') || line.startsWith('已完成：')) {
                currentSection = 'completed';
                var compStr = line.replace(/^已完成[：:]\s*/, '');
                if (compStr && compStr !== '无') {
                    update.completedClues.push(compStr);
                }
            } else if (line.startsWith('玩家决策:') || line.startsWith('玩家决策：')) {
                currentSection = 'decisions';
                var decStr = line.replace(/^玩家决策[：:]\s*/, '');
                if (decStr && decStr !== '无') {
                    update.playerDecisions.push(decStr);
                }
            } else if (line.startsWith('世界变化:') || line.startsWith('世界变化：')) {
                currentSection = 'world';
                var wsStr = line.replace(/^世界变化[：:]\s*/, '');
                if (wsStr && wsStr !== '无') {
                    update.worldStateChanges.push(wsStr);
                }
            } else if (line.startsWith('物品分区:') || line.startsWith('物品分区：')) {
                currentSection = 'p_items';
                var pItemStr = line.replace(/^物品分区[：:]\s*/, '');
                if (pItemStr && pItemStr !== '无') {
                    update.partitionUpdates.items.push(pItemStr);
                }
            } else if (line.startsWith('位置分区:') || line.startsWith('位置分区：')) {
                currentSection = 'p_locations';
                var pLocStr = line.replace(/^位置分区[：:]\s*/, '');
                if (pLocStr && pLocStr !== '无') {
                    update.partitionUpdates.locations.push(pLocStr);
                }
            } else if (line.startsWith('外貌分区:') || line.startsWith('外貌分区：')) {
                currentSection = 'p_appearance';
                var pAppStr = line.replace(/^外貌分区[：:]\s*/, '');
                if (pAppStr && pAppStr !== '无') {
                    update.partitionUpdates.appearance.push(pAppStr);
                }
            } else if (line.startsWith('线索分区:') || line.startsWith('线索分区：')) {
                currentSection = 'p_clues';
                var pClueStr = line.replace(/^线索分区[：:]\s*/, '');
                if (pClueStr && pClueStr !== '无') {
                    update.partitionUpdates.clues.push(pClueStr);
                }
            } else if (line.startsWith('-') || line.startsWith('•')) {
                var item = line.replace(/^[-•]\s*/, '');
                if (!item) continue;
                switch (currentSection) {
                    case 'npc': update.npcChanges.push(item); break;
                    case 'items': update.newItemsHeld.push(item); break;
                    case 'areas': update.newExploredAreas.push(item); break;
                    case 'clues': update.newClues.push(item); break;
                    case 'completed': update.completedClues.push(item); break;
                    case 'decisions': update.playerDecisions.push(item); break;
                    case 'world': update.worldStateChanges.push(item); break;
                    case 'p_items': update.partitionUpdates.items.push(item); break;
                    case 'p_locations': update.partitionUpdates.locations.push(item); break;
                    case 'p_appearance': update.partitionUpdates.appearance.push(item); break;
                    case 'p_clues': update.partitionUpdates.clues.push(item); break;
                }
            }
        }

        return update;
    },

    applyUpdate(update) {
        if (!update) return;

        if (update.currentTime) {
            this.data.currentTime = update.currentTime;
        }
        if (update.currentLocation) {
            this.data.currentLocation = update.currentLocation;
        }
        if (update.atmosphere) {
            this.data.atmosphere = update.atmosphere;
        }

        update.npcChanges.forEach(function(change) {
            var parts = change.split('|').map(function(p) { return p.trim(); });
            var npcName = parts[0];
            if (!npcName) return;

            var existingIdx = -1;
            for (var i = 0; i < this.data.npcs.length; i++) {
                if (this.data.npcs[i].name === npcName) {
                    existingIdx = i;
                    break;
                }
            }

            if (existingIdx >= 0) {
                if (parts[1]) this.data.npcs[existingIdx].identity = parts[1];
                if (parts[2]) this.data.npcs[existingIdx].location = parts[2];
                if (parts[3]) this.data.npcs[existingIdx].action = parts[3];
                if (parts[4]) this.data.npcs[existingIdx].status = parts[4];
                if (parts[5]) this.data.npcs[existingIdx].type = parts[5];
            } else {
                this.data.npcs.push({
                    name: npcName,
                    identity: parts[1] || '',
                    location: parts[2] || '',
                    action: parts[3] || '',
                    status: parts[4] || '',
                    type: parts[5] || '普通',
                    visitCount: 0
                });
                existingIdx = this.data.npcs.length - 1;
            }

            if (this.data.npcs[existingIdx].type === '队友') {
                this.data.npcs[existingIdx].visitCount = -1;
            } else {
                this.data.npcs[existingIdx].visitCount = (this.data.npcs[existingIdx].visitCount || 0) + 1;
            }
        }.bind(this));

        update.newItemsHeld.forEach(function(itemStr) {
            var parts = itemStr.split('|').map(function(p) { return p.trim(); });
            var existingName = this.data.itemsHeld.find(function(it) { return it.name === parts[0]; });
            if (!existingName) {
                this.data.itemsHeld.push({
                    name: parts[0] || itemStr,
                    source: parts[1] || '',
                    locked: true
                });
            }
        }.bind(this));

        update.newItemsFound.forEach(function(itemStr) {
            var parts = itemStr.split('|').map(function(p) { return p.trim(); });
            var existingName = this.data.itemsFound.find(function(it) { return it.name === parts[0]; });
            if (!existingName) {
                this.data.itemsFound.push({
                    name: parts[0] || itemStr,
                    location: parts[1] || '',
                    reason: parts[2] || ''
                });
            }
        }.bind(this));

        update.newItemWarnings.forEach(function(warnStr) {
            var parts = warnStr.split('|').map(function(p) { return p.trim(); });
            var existingWarn = this.data.itemWarnings.find(function(w) { return w.name === parts[0]; });
            if (!existingWarn) {
                this.data.itemWarnings.push({
                    name: parts[0] || warnStr,
                    location: parts[1] || '',
                    warning: parts[2] || ''
                });
            }
        }.bind(this));

        update.newExploredAreas.forEach(function(areaStr) {
            var parts = areaStr.split('|').map(function(p) { return p.trim(); });
            var existingArea = this.data.exploredAreas.find(function(a) { return a.name === parts[0]; });
            if (!existingArea) {
                this.data.exploredAreas.push({
                    name: parts[0] || areaStr,
                    status: parts[1] || '已探索',
                    discovery: parts[2] || ''
                });
            } else {
                if (parts[1]) existingArea.status = parts[1];
                if (parts[2]) existingArea.discovery = parts[2];
            }
        }.bind(this));

        update.newTimelineEvents.forEach(function(evtStr) {
            var parts = evtStr.split('|').map(function(p) { return p.trim(); });
            this.data.timeline.push({
                time: parts[0] || '',
                event: parts[1] || evtStr
            });
        }.bind(this));

        update.newClues.forEach(function(clueStr) {
            var parts = clueStr.split('|').map(function(p) { return p.trim(); });
            var existingClue = this.data.progress.pendingClues.find(function(c) { return c.description === parts[0]; });
            if (!existingClue) {
                this.data.progress.pendingClues.push({
                    description: parts[0] || clueStr,
                    source: parts[1] || ''
                });
            }
        }.bind(this));

        update.completedClues.forEach(function(compStr) {
            var idx = -1;
            for (var i = 0; i < this.data.progress.pendingClues.length; i++) {
                if (this.data.progress.pendingClues[i].description === compStr ||
                    this.data.progress.pendingClues[i].description.includes(compStr)) {
                    idx = i;
                    break;
                }
            }
            if (idx >= 0) {
                var removed = this.data.progress.pendingClues.splice(idx, 1)[0];
                this.data.progress.completed.push(removed.description || compStr);
            } else {
                this.data.progress.completed.push(compStr);
            }
        }.bind(this));

        update.playerDecisions.forEach(function(dec) {
            this.data.playerDecisions.push({
                time: this.data.currentTime || '',
                decision: dec
            });
            if (this.data.playerDecisions.length > 30) {
                this.data.playerDecisions = this.data.playerDecisions.slice(-30);
            }
        }.bind(this));

        update.worldStateChanges.forEach(function(change) {
            this.data.worldStateChanges.push({
                time: this.data.currentTime || '',
                change: change
            });
            if (this.data.worldStateChanges.length > 30) {
                this.data.worldStateChanges = this.data.worldStateChanges.slice(-30);
            }
        }.bind(this));

        if (update.partitionUpdates) {
            var partitionNames = ['items', 'locations', 'appearance', 'clues'];
            for (var pi = 0; pi < partitionNames.length; pi++) {
                var pName = partitionNames[pi];
                var pUpdates = update.partitionUpdates[pName];
                if (!pUpdates || pUpdates.length === 0) continue;

                for (var pj = 0; pj < pUpdates.length; pj++) {
                    var pParts = pUpdates[pj].split('|').map(function(s) { return s.trim(); });
                    var pKey = pParts[0];
                    if (!pKey) continue;

                    var existingP = this.data.partitions[pName].find(function(e) { return e.key === pKey; });
                    if (existingP) {
                        if (pParts[1]) existingP.value = pParts[1];
                        if (pParts[2]) existingP.note = pParts[2];
                        existingP.updatedAt = this.data.currentTime || '';
                    } else {
                        this.data.partitions[pName].push({
                            key: pKey,
                            value: pParts[1] || '',
                            note: pParts[2] || '',
                            updatedAt: this.data.currentTime || ''
                        });
                    }
                }

                if (this.data.partitions[pName].length > 50) {
                    this.data.partitions[pName] = this.data.partitions[pName].slice(-50);
                }
            }
        }

        this.save();
    },

    formatForPrompt() {
        if (!this.data) return '';

        var d = this.data;
        var lines = [];

        lines.push('═══════════════════════════════════════');
        lines.push('【KP笔记本系统】');
        lines.push('═══════════════════════════════════════');
        lines.push('');
        lines.push('本节是你（KP）的内部工作笔记。始终生效，不可压缩，不可转述，不可省略。');
        lines.push('每轮回复前必须读取本节，回复后必须更新本节。');
        lines.push('');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('一、笔记本内容');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('');

        lines.push('当前时间: ' + (d.currentTime || '未知'));
        lines.push('当前地点: ' + (d.currentLocation || '未知'));
        lines.push('天气/氛围: ' + (d.atmosphere || '未设定'));
        lines.push('');

        lines.push('### 在场NPC当前状态');
        lines.push('【叙事铁律】下列每个NPC的「位置」与「当前动作」是已确立的事实。叙事必须严格遵守：未经玩家行动或剧情明确驱动，NPC不得改变位置或动作，不得反复进出场景、不得重复同一动作（如反复上下楼）。');
        lines.push('格式: [名字] | [身份] | [位置] | [当前动作] | [状态] | [类型:普通/队友/助力] | [来访次数]');
        if (d.npcs.length > 0) {
            d.npcs.forEach(function(npc) {
                var visitStr = npc.type === '队友' ? '-' : (npc.visitCount || 0) + '次';
                lines.push(npc.name + ' | ' + npc.identity + ' | ' + (npc.location || '未知') + ' | ' + (npc.action || '—') + ' | ' + npc.status + ' | ' + npc.type + ' | ' + visitStr);
            });
        } else {
            lines.push('（暂无NPC记录）');
        }
        lines.push('');

        lines.push('### 物品清单');
        lines.push('已持有:');
        if (d.itemsHeld.length > 0) {
            d.itemsHeld.forEach(function(item) {
                lines.push('- ' + item.name + ' | 来源: ' + item.source + ' | ⛔锁定');
            });
        } else {
            lines.push('（无）');
        }
        lines.push('已发现但未持有:');
        if (d.itemsFound.length > 0) {
            d.itemsFound.forEach(function(item) {
                lines.push('- ' + item.name + ' | 位置: ' + item.location + ' | ' + item.reason);
            });
        } else {
            lines.push('（无）');
        }
        if (d.itemWarnings.length > 0) {
            lines.push('重要警告:');
            d.itemWarnings.forEach(function(w) {
                lines.push('- ' + w.name + ' | ' + w.location + ' | 警告: ' + w.warning);
            });
        }
        lines.push('');

        lines.push('### 已探索区域');
        lines.push('格式: [区域名] | [状态] | [简要发现]');
        if (d.exploredAreas.length > 0) {
            d.exploredAreas.forEach(function(area) {
                lines.push('- ' + area.name + ' | ' + area.status + ' | ' + area.discovery);
            });
        } else {
            lines.push('（暂无探索记录）');
        }
        lines.push('');

        lines.push('### 状态分区（精准状态管理）');
        lines.push('以下分区用于精确追踪特定类别状态。读取时仅读取对应分区，写入时仅更新对应分区。');

        lines.push('#### 物品分区');
        lines.push('格式: [物品名] | [状态/位置] | [备注]');
        if (d.partitions.items.length > 0) {
            d.partitions.items.forEach(function(e) {
                lines.push('- ' + e.key + ' | ' + e.value + ' | ' + e.note);
            });
        } else {
            lines.push('（无）');
        }
        lines.push('');

        lines.push('#### 位置分区');
        lines.push('格式: [位置名] | [状态] | [备注]');
        if (d.partitions.locations.length > 0) {
            d.partitions.locations.forEach(function(e) {
                lines.push('- ' + e.key + ' | ' + e.value + ' | ' + e.note);
            });
        } else {
            lines.push('（无）');
        }
        lines.push('');

        lines.push('#### 外貌分区');
        lines.push('格式: [角色/NPC名] | [当前外貌/着装] | [备注]');
        if (d.partitions.appearance.length > 0) {
            d.partitions.appearance.forEach(function(e) {
                lines.push('- ' + e.key + ' | ' + e.value + ' | ' + e.note);
            });
        } else {
            lines.push('（无）');
        }
        lines.push('');

        lines.push('#### 线索分区');
        lines.push('格式: [线索名] | [状态] | [来源/备注]');
        if (d.partitions.clues.length > 0) {
            d.partitions.clues.forEach(function(e) {
                lines.push('- ' + e.key + ' | ' + e.value + ' | ' + e.note);
            });
        } else {
            lines.push('（无）');
        }
        lines.push('');

        lines.push('### 关键时间线');
        lines.push('格式: [时间] | [事件]');
        if (d.timeline.length > 0) {
            d.timeline.forEach(function(evt) {
                lines.push(evt.time + ' | ' + evt.event);
            });
        } else {
            lines.push('（暂无时间线记录）');
        }
        lines.push('');

        lines.push('### 当前进度(仅KP可见)');
        lines.push('已完成:');
        if (d.progress.completed.length > 0) {
            d.progress.completed.forEach(function(c) {
                lines.push('  ☑ ' + c);
            });
        } else {
            lines.push('  （无）');
        }
        lines.push('待推进线索(标注来源NPC):');
        if (d.progress.pendingClues.length > 0) {
            d.progress.pendingClues.forEach(function(c) {
                lines.push('  ☐ ' + c.description + (c.source ? '（来源: ' + c.source + '）' : ''));
            });
        } else {
            lines.push('  （无）');
        }
        lines.push('');

        if (d.playerDecisions.length > 0) {
            lines.push('### 玩家决策记录');
            var recentDecisions = d.playerDecisions.slice(-10);
            recentDecisions.forEach(function(dec) {
                lines.push('- [' + dec.time + '] ' + dec.decision);
            });
            lines.push('');
        }

        if (d.worldStateChanges.length > 0) {
            lines.push('### 世界状态变化');
            var recentChanges = d.worldStateChanges.slice(-10);
            recentChanges.forEach(function(ch) {
                lines.push('- [' + ch.time + '] ' + ch.change);
            });
            lines.push('');
        }

        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('二、使用规则');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('');
        lines.push('【A. 写剧情前 — 必须先查询笔记本】');
        lines.push('');
        lines.push('1. 玩家要去某地 → 查「已探索区域」');
        lines.push('   - 已探索 → 告知"你已经来过这里"并简述之前发现了什么');
        lines.push('   - 未探索 → 正常推进，探索后新增记录');
        lines.push('');
        lines.push('2. 玩家提到某物品 → 查「物品清单」');
        lines.push('   - 已持有 → 说"你拿出之前找到的XX"，严禁创造新位置');
        lines.push('   - 已发现未持有 → 引导去原位置取');
        lines.push('   - 未见过 → 正常推进');
        lines.push('');
        lines.push('3. 某NPC要出现/来访 → 查该NPC的来访次数和类型');
        lines.push('   - 已来访且信息已给过 → 无新信息则不重复出现');
        lines.push('   - 有新信息 → 可以再来，来访次数+1');
        lines.push('   - 未出现 → 正常出现并记录');
        lines.push('');
        lines.push('4. 检查时间和地点一致性');
        lines.push('   - NPC不能同时出现在两个地方');
        lines.push('   - 时间不能倒流');
        lines.push('   - 同一事件不能发生两次');
        lines.push('');
        lines.push('【B. 写剧情后 — 必须更新笔记本】');
        lines.push('');
        lines.push('每轮回复结束时，附加隐藏更新块（格式见下方）:');
        lines.push('- 时间推进 → 更新当前时间');
        lines.push('- 地点变化 → 更新当前地点');
        lines.push('- 在场NPC → 每轮在「NPC变动」中重申其位置与当前动作（即使没变）；出现/离开/移动时相应更新，来访次数+1');
        lines.push('- 新物品获得 → 加入「已持有」并⛔锁定');
        lines.push('- 新物品发现 → 加入「已发现未持有」');
        lines.push('- 新区域探索 → 加入「已探索区域」');
        lines.push('- 重要事件 → 加入「关键时间线」');
        lines.push('- 新线索 → 加入「待推进线索」并标注来源NPC');
        lines.push('- NPC透露的关键信息 → 凡NPC在对话中提到的专有名词（人名/书名/地名/物品名/事件）或情报，即使只是闲聊带过，也必须记入「新线索」并标注来源NPC，防止后续遗忘或否认');
        lines.push('- 线索完成 → 从待推进移到已完成');
        lines.push('- 玩家做出重要决策 → 加入「玩家决策记录」');
        lines.push('- 世界发生重要变化 → 加入「世界状态变化」');
        lines.push('- 物品状态变化（获得/失去/使用/转移）→ 更新「物品分区」');
        lines.push('- 位置状态变化（进入/离开/封锁/解锁）→ 更新「位置分区」');
        lines.push('- 外貌/着装变化（换装/伪装/受伤/变化）→ 更新「外貌分区」');
        lines.push('- 线索状态变化（发现/验证/关联/否定）→ 更新「线索分区」');
        lines.push('');
        lines.push('【C. 铁律】');
        lines.push('');
        lines.push('1. 笔记本不被压缩。对话历史可以压缩，笔记本不动。Token超限时先压缩对话历史。');
        lines.push('2. 物品锁定不可变。一旦进入「已持有」并⛔锁定，该物品不能被替换、不能消失、不能变成别的东西。');
        lines.push('3. 事实不转述。红色箱子≠红色容器≠红色蜡烛。李猎户≠李姓农民≠那个猎人。笔记本中的每一个名词保持原样。');
        lines.push('4. NPC不漂移。每轮必须在「NPC变动」重申在场NPC的位置与当前动作。NPC的位置/动作只有玩家或剧情明确驱动时才改；没说离开就不消失、不重复进出、不重复同一动作（如反复上下楼）。类型标签（队友/助力/普通）一旦设定，除非剧情重大转折，否则不变。');
        lines.push('5. 不否认已记录的信息。被玩家问及笔记本中已存在的人/物/事/线索、或某NPC此前透露过的信息时，必须依据笔记本如实承认并回答，绝不否认其存在、绝不声称"不知道""没听过"。若笔记本记过某NPC提到过某书/某人，被问时必须承认记得，并据此回答。');
        lines.push('');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('三、输出格式');
        lines.push('━━━━━━━━━━━━━━━━━━━━━');
        lines.push('');
        lines.push('每轮回复末尾，附加一个隐藏更新块。此块供后端解析，不展示给玩家:');
        lines.push('');
        lines.push('<kp_note_update>');
        lines.push('当前时间: [更新后时间]');
        lines.push('当前地点: [更新后地点]');
        lines.push('天气/氛围: [如有变化则更新，无变化可省略]');
        lines.push('NPC变动: [每轮必须列出所有当前在场的NPC（不只是有变动的），格式：名字|身份|位置|当前动作|状态|类型，每行一个以-开头。即使无变化也要重申其位置与当前动作，确认其仍在原处做原事。NPC离场则位置写"已离开"。此项是防止NPC位置/动作漂移的关键，不可省略、不可写"无"]');
        lines.push('新增物品: [新获得或新发现的物品，格式：物品名|来源/位置|说明，每行一个以-开头；无则写"无"]');
        lines.push('新探索区域: [新探索的区域，格式：区域名|状态|发现，每行一个以-开头；无则写"无"]');
        lines.push('新线索: [新增的待推进线索及来源，格式：线索描述|来源NPC，每行一个以-开头；无则写"无"]');
        lines.push('已完成: [本轮完成的线索，每行一个以-开头；无则写"无"]');
        lines.push('玩家决策: [玩家做出的重要决策，每行一个以-开头；无则写"无"]');
        lines.push('世界变化: [世界状态的重要变化，每行一个以-开头；无则写"无"]');
        lines.push('物品分区: [物品状态变化，格式：物品名|状态/位置|备注，每行一个以-开头；无则写"无"]');
        lines.push('位置分区: [位置状态变化，格式：位置名|状态|备注，每行一个以-开头；无则写"无"]');
        lines.push('外貌分区: [外貌/着装变化，格式：角色名|当前外貌/着装|备注，每行一个以-开头；无则写"无"]');
        lines.push('线索分区: [线索状态变化，格式：线索名|状态|来源/备注，每行一个以-开头；无则写"无"]');
        lines.push('</kp_note_update>');
        lines.push('');
        lines.push('此隐藏块不展示给玩家。玩家面板由后端解析此块后更新。');

        return lines.join('\n');
    },

    stripUpdateBlock(text) {
        return text.replace(/<kp_note_update>[\s\S]*?<\/kp_note_update>/g, '').trim();
    },

    getSaveData() {
        return JSON.parse(JSON.stringify(this.data));
    },

    loadSaveData(data) {
        if (data) {
            this.data = this._migrate(data);
            this.save();
        }
    },

    search(keyword) {
        if (!keyword) return [];
        var kw = keyword.toLowerCase();
        var results = [];

        this.data.npcs.forEach(function(npc) {
            if (npc.name.toLowerCase().includes(kw) || npc.identity.toLowerCase().includes(kw) || npc.status.toLowerCase().includes(kw)) {
                results.push({ type: 'NPC', data: npc });
            }
        });

        this.data.itemsHeld.forEach(function(item) {
            if (item.name.toLowerCase().includes(kw) || item.source.toLowerCase().includes(kw)) {
                results.push({ type: '物品(已持有)', data: item });
            }
        });

        this.data.itemsFound.forEach(function(item) {
            if (item.name.toLowerCase().includes(kw) || item.location.toLowerCase().includes(kw)) {
                results.push({ type: '物品(已发现)', data: item });
            }
        });

        this.data.exploredAreas.forEach(function(area) {
            if (area.name.toLowerCase().includes(kw) || area.discovery.toLowerCase().includes(kw)) {
                results.push({ type: '区域', data: area });
            }
        });

        this.data.timeline.forEach(function(evt) {
            if (evt.event.toLowerCase().includes(kw) || evt.time.toLowerCase().includes(kw)) {
                results.push({ type: '时间线', data: evt });
            }
        });

        this.data.progress.pendingClues.forEach(function(clue) {
            if (clue.description.toLowerCase().includes(kw) || clue.source.toLowerCase().includes(kw)) {
                results.push({ type: '待推进线索', data: clue });
            }
        });

        this.data.progress.completed.forEach(function(comp) {
            if (comp.toLowerCase().includes(kw)) {
                results.push({ type: '已完成', data: comp });
            }
        });

        this.data.playerDecisions.forEach(function(dec) {
            if (dec.decision.toLowerCase().includes(kw)) {
                results.push({ type: '玩家决策', data: dec });
            }
        });

        this.data.worldStateChanges.forEach(function(ch) {
            if (ch.change.toLowerCase().includes(kw)) {
                results.push({ type: '世界变化', data: ch });
            }
        });

        return results;
    }
};
