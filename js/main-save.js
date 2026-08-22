Object.assign(Main, {
    // 章节条右侧的存档指示器：存盘时闪一下「已保存」，随后回到「已就位」
    _flashSaveDot() {
        const el = document.getElementById('save-dot');
        if (!el) return;
        const txt = el.querySelector('.save-text');
        if (!txt) return;
        txt.textContent = '已保存';
        el.classList.add('saving');
        clearTimeout(this._saveDotTimer);
        this._saveDotTimer = setTimeout(function() {
            txt.textContent = '已就位';
            el.classList.remove('saving');
        }, 1600);
    },

    autoSave() {
        this._flashSaveDot();
        const saveData = this.buildSaveData();
        if (this.gameState.isTutorialDemo) {
            saveData.isTutorialDemo = true;
            saveData.tutorialId = this.gameState.tutorialId || (typeof TutorialDemo !== 'undefined' ? TutorialDemo.id : 'rain-station-demo');
            saveData.characterName = saveData.character?.name || '林砚';
            saveData.chapter = saveData.story?.chapter || '雨声中的播音';
            Utils.saveToStorage('scribe_tutorial_rain_station_save', saveData);
            return;
        }
        Utils.saveToStorage('scribe_autosave', saveData);
    },

    buildSaveData() {
        var notesEl = typeof document !== 'undefined' ? document.getElementById('sidebar-player-notes') : null;
        if (notesEl && this.gameState.story) {
            this.gameState.story.playerNotes = notesEl.value;
            if (typeof Story !== 'undefined' && Story.state) {
                Story.state.playerNotes = notesEl.value;
            }
        }

        var apiHistory = (typeof API !== 'undefined' && API.conversationHistory) ? API.conversationHistory : this.gameState.conversationHistory;
        var historyToSave = apiHistory || [];
        if (historyToSave.length > 40) {
            var summaryParts = [];
            var oldPart = historyToSave.slice(0, -20);
            oldPart.forEach(function(msg) {
                if (msg.role === 'user' && summaryParts.length < 6) {
                    summaryParts.push('玩家：' + (msg.content || '').substring(0, 50));
                } else if (msg.role === 'assistant' && summaryParts.length < 10) {
                    summaryParts.push('KP：' + (msg.content || '').substring(0, 60));
                }
            });
            var summaryMsg = {
                role: 'system',
                content: '[前情摘要]\n' + summaryParts.join('\n')
            };
            historyToSave = [summaryMsg, ...historyToSave.slice(-20)];
        }

        var npcsData = this.gameState.npcs || {};
        if (typeof NPCManager !== 'undefined') {
            npcsData = {
                companions: NPCManager.companions || [],
                contacts: NPCManager.contacts || [],
                allNPCs: NPCManager.allNPCs || {},
                combatPower: npcsData.combatPower || '无'
            };
        }

        return {
            saveVersion: this.SAVE_VERSION,
            character: this.gameState.character,
            story: this.gameState.story,
            npcs: npcsData,
            quickMode: this.gameState.quickMode,
            difficulty: this.gameState.difficulty,
            grieferLevel: this.gameState.grieferLevel,
            grieferHistory: this.gameState.grieferHistory,
            appealCount: this.gameState.appealCount,
            bonusDice: this.gameState.bonusDice,
            hiddenBonusDice: this.gameState.hiddenBonusDice,
            hiddenBonusThisChapter: this.gameState.hiddenBonusThisChapter,
            hiddenBonusTotal: this.gameState.hiddenBonusTotal,
            combat: this.gameState.combat,
            conversationHistory: historyToSave,
            usedSkills: this.gameState.usedSkills || [],
            memorySystemData: typeof MemorySystem !== 'undefined' ? Utils.loadFromStorage('scribe_memory_system') : null,
            kpNotebookData: typeof KPNotebook !== 'undefined' ? KPNotebook.getSaveData() : null,
            chatLog: typeof Terminal !== 'undefined' ? Terminal._chatLog.slice(-100) : [],
            isTutorialDemo: !!this.gameState.isTutorialDemo,
            tutorialId: this.gameState.tutorialId || null,
            timestamp: new Date().toISOString(),
            version: '2.0'
        };
    },

    manualSave(slot) {
        if (this.gameState.isTutorialDemo) {
            this.autoSave();
            return true;
        }
        if (slot < 1 || slot > 3) return false;
        const saveData = this.buildSaveData();
        saveData.slot = slot;
        saveData.characterName = saveData.character?.name || '无名调查员';
        saveData.chapter = saveData.story?.chapter || '未开始';
        Utils.saveToStorage(`scribe_save_${slot}`, saveData);
        this.autoSave();
        return true;
    },

    manualLoad(slot) {
        if (this.gameState.isTutorialDemo) {
            const tutorialData = Utils.loadFromStorage('scribe_tutorial_rain_station_save');
            if (tutorialData) {
                this.loadSaveData(tutorialData, { rebuildChat: true });
                return true;
            }
            return false;
        }
        if (slot < 1 || slot > 3) return false;
        const data = Utils.loadFromStorage(`scribe_save_${slot}`);
        if (data) {
            this.loadSaveData(data, { rebuildChat: true });
            this.autoSave();
            return true;
        }
        return false;
    },

    exportSaveAsJSON() {
        const saveData = this.buildSaveData();
        saveData.exportDate = new Date().toISOString();
        saveData.exportVersion = '1.0';
        const json = JSON.stringify(saveData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `夜谭_存档_${saveData.characterName || '无名'}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    },

    importSaveFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.version && !data.character && !data.story) {
                        reject(new Error('无效的存档文件格式'));
                        return;
                    }
                    this.loadSaveData(data, { rebuildChat: true });
                    resolve(true);
                } catch (err) {
                    reject(new Error('存档文件解析失败'));
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    },

    getSaveSlots() {
        const slots = [];
        for (let i = 1; i <= 3; i++) {
            const data = Utils.loadFromStorage(`scribe_save_${i}`);
            slots.push({
                slot: i,
                empty: !data,
                timestamp: data?.timestamp,
                characterName: data?.characterName || data?.character?.name || '无名调查员',
                chapter: data?.chapter || data?.story?.chapter || '未开始',
                difficulty: data?.difficulty || 'investigator'
            });
        }
        const autoData = Utils.loadFromStorage('scribe_autosave');
        slots.push({
            slot: 0,
            empty: !autoData,
            timestamp: autoData?.timestamp,
            characterName: autoData?.characterName || autoData?.character?.name || '无名调查员',
            chapter: autoData?.chapter || autoData?.story?.chapter || '未开始',
            difficulty: autoData?.difficulty || 'investigator',
            isAuto: true
        });
        return slots;
    },

    deleteSaveSlot(slot) {
        if (slot === 0) {
            Utils.removeFromStorage('scribe_autosave');
        } else if (slot >= 1 && slot <= 3) {
            Utils.removeFromStorage(`scribe_save_${slot}`);
        }
    },

    loadAutoSave() {
        const data = Utils.loadFromStorage('scribe_autosave');
        if (data) {
            this.loadSaveData(data);
        }
    },

    loadSaveData(data, options) {
        if (!data) return;
        var opts = options || {};
        var isManualLoad = opts.rebuildChat || false;

        data = this._migrateSaveData(data);

        if (data.character) {
            this.gameState.character = data.character;
            Character.current = data.character;
        }
        if (data.story) {
            Object.assign(this.gameState.story, data.story);
            if (typeof Story !== 'undefined') {
                Object.assign(Story.state, data.story);
                Story.save();
            }
        }
        if (data.npcs) {
            this.gameState.npcs = data.npcs;
            if (typeof NPCManager !== 'undefined') {
                NPCManager.companions = data.npcs.companions || [];
                NPCManager.contacts = data.npcs.contacts || [];
                NPCManager.allNPCs = data.npcs.allNPCs || {};
            }
        }
        if (data.quickMode !== undefined) {
            Terminal.quickMode = data.quickMode;
            this.gameState.quickMode = data.quickMode;
        }
        if (data.difficulty) {
            this.gameState.difficulty = data.difficulty;
        }
        if (data.grieferLevel !== undefined) {
            this.gameState.grieferLevel = data.grieferLevel;
            if (typeof GrieferDetector !== 'undefined') { GrieferDetector.level = data.grieferLevel; }
        }
        if (data.grieferHistory) {
            this.gameState.grieferHistory = data.grieferHistory;
            if (typeof GrieferDetector !== 'undefined') { GrieferDetector.history = data.grieferHistory; }
        }
        if (data.appealCount !== undefined) {
            this.gameState.appealCount = data.appealCount;
        }
        if (data.bonusDice !== undefined) {
            this.gameState.bonusDice = data.bonusDice;
        }
        if (data.hiddenBonusDice !== undefined) {
            this.gameState.hiddenBonusDice = data.hiddenBonusDice;
        }
        if (data.hiddenBonusThisChapter !== undefined) {
            this.gameState.hiddenBonusThisChapter = data.hiddenBonusThisChapter;
        }
        if (data.hiddenBonusTotal !== undefined) {
            this.gameState.hiddenBonusTotal = data.hiddenBonusTotal;
        }
        if (data.combat) {
            this.gameState.combat = data.combat;
            if (data.combat.active) {
                Terminal.printSystem('⚔️ 战斗状态已恢复（第' + data.combat.round + '轮）');
            }
        }
        if (data.conversationHistory) {
            this.gameState.conversationHistory = data.conversationHistory;
            API.conversationHistory = data.conversationHistory;
            if (isManualLoad && typeof Terminal !== 'undefined' && Terminal.rebuildFromConversationHistory) {
                Terminal.rebuildFromConversationHistory(data.conversationHistory);
                Terminal.printSystem('━━━ 存档已加载，上下文已回退 ━━━');
            }
        }
        if (data.usedSkills) {
            this.gameState.usedSkills = data.usedSkills;
        }
        this.gameState.isTutorialDemo = !!data.isTutorialDemo;
        this.gameState.tutorialId = data.tutorialId || null;
        if (data.memorySystemData && typeof MemorySystem !== 'undefined') {
            Utils.saveToStorage('scribe_memory_system', data.memorySystemData);
            MemorySystem.loadFromStorage();
        }
        if (isManualLoad && data.chatLog && typeof Terminal !== 'undefined') {
            Terminal._chatLog = data.chatLog;
            Terminal._saveChatLog();
        }
        if (typeof Story !== 'undefined') {
            Object.assign(Story.state, this.gameState.story);
            this.gameState.story = Story.state;
            Story.save();
        }
        if (typeof NPCManager !== 'undefined') {
            this.gameState.npcs = {
                companions: NPCManager.companions,
                contacts: NPCManager.contacts,
                allNPCs: NPCManager.allNPCs,
                combatPower: this.gameState.npcs?.combatPower || '无'
            };
        }
        this.gameState.isIntroNarrative = false;
        if (typeof MythosPool !== 'undefined' && !MythosPool.selector) {
            MythosPool.init();
        }
        if (data.kpNotebookData && typeof KPNotebook !== 'undefined') {
            KPNotebook.loadSaveData(data.kpNotebookData);
        }
        this.updateStatusBar();
        this.updateSidebar();
    },

    _migrateSaveData(data) {
        if (!data) return data;
        var version = data.saveVersion || 0;

        if (version < 1) {
            if (data.character) {
                if (!data.character.conditions) data.character.conditions = [];
                if (data.character.skills && data.character.skills['闪避'] === undefined) {
                    data.character.skills['闪避'] = Math.floor((data.character.dex || 50) / 2);
                }
                if (data.character.skills && data.character.skills['语言（母语）'] === undefined) {
                    var hasNativeLang = Object.keys(data.character.skills).some(function(k) { return k.indexOf('语言（母语-') === 0; });
                    if (!hasNativeLang) {
                        data.character.skills['语言（母语）'] = data.character.edu || 50;
                    }
                }
                if (!data.character.nationality) {
                    data.character.nationality = '中国';
                }
                if (!data.character.nativeLanguage) {
                    var natLangKey = Object.keys(data.character.skills || {}).find(function(k) { return k.indexOf('语言（母语-') === 0; });
                    if (natLangKey) {
                        data.character.nativeLanguage = natLangKey.replace('语言（母语-', '').replace('）', '');
                    } else {
                        data.character.nativeLanguage = '中文';
                    }
                }
            }
            if (!data.usedSkills) data.usedSkills = [];
            if (data.combat && data.combat.dodgeCountThisRound === undefined) {
                data.combat.dodgeCountThisRound = 0;
            }
        }

        if (version < 2) {
            if (data.character && data.character.derived) {
                var d = data.character.derived;
                if (d.mpMax === undefined && data.character.pow) {
                    d.mpMax = Math.floor(data.character.pow / 5);
                    if (d.mp === undefined) d.mp = d.mpMax;
                }
            }
        }

        data.saveVersion = this.SAVE_VERSION;
        return data;
    },

    _syncNPCData() {
        if (typeof NPCManager !== 'undefined') {
            this.gameState.npcs = {
                companions: NPCManager.companions || [],
                contacts: NPCManager.contacts || [],
                allNPCs: NPCManager.allNPCs || {},
                combatPower: this.gameState.npcs?.combatPower || '无'
            };
        }
    }
});
