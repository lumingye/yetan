const Terminal = {
    outputEl: null,
    inputEl: null,
    sendBtn: null,
    isProcessing: false,
    typewriterSpeed: 30,
    quickMode: true,
    onCommand: null,
    _chatLog: [],
    _chatLogMax: 200,
    _chatLogRestoreMax: 100,

    _saveChatLog() {
        try {
            if (typeof Utils !== 'undefined') {
                Utils.saveToStorage('scribe_chat_log', this._chatLog.slice(-this._chatLogMax));
            }
        } catch (e) {}
    },

    _addChatLog(type, text) {
        if (type === 'kp') {
            text = this.cleanKPText(text);
        }
        this._chatLog.push({ type: type, text: text, ts: Date.now() });
        if (this._chatLog.length > this._chatLogMax) {
            this._chatLog = this._chatLog.slice(-this._chatLogMax);
        }
        this._saveChatLog();
    },

    restoreChatLog() {
        if (typeof Utils === 'undefined') return;
        var saved = Utils.loadFromStorage('scribe_chat_log');
        if (!saved || !saved.length) return;

        var toRestore = saved.slice(-this._chatLogRestoreMax);

        for (var i = 0; i < toRestore.length; i++) {
            var entry = toRestore[i];
            var div = document.createElement('div');
            switch (entry.type) {
                case 'player':
                    div.className = 'message player';
                    div.textContent = '> ' + entry.text;
                    break;
                case 'kp':
                    div.className = 'message kp';
                    div.innerHTML = this.formatKPText(entry.text);
                    break;
                case 'system':
                    div.className = 'message system';
                    div.textContent = entry.text;
                    break;
                case 'error':
                    div.className = 'message error';
                    div.textContent = '⚠ ' + entry.text;
                    break;
                case 'warning':
                    div.className = 'message warning';
                    div.textContent = '🔶 ' + entry.text;
                    break;
                case 'success':
                    div.className = 'message success';
                    div.textContent = '✓ ' + entry.text;
                    break;
                default:
                    continue;
            }
            if (this.outputEl) {
                this.outputEl.appendChild(div);
            }
        }
        this._chatLog = saved;
        this.scrollToBottom();
        if (saved.length > this._chatLogRestoreMax) {
            var sysDiv = document.createElement('div');
            sysDiv.className = 'message system';
            sysDiv.textContent = '(较早的 ' + (saved.length - this._chatLogRestoreMax) + ' 条消息未显示)';
            this.outputEl.insertBefore(sysDiv, this.outputEl.firstChild);
        }
    },

    rebuildFromConversationHistory(history) {
        if (!this.outputEl) return;
        this.outputEl.innerHTML = '';
        this._chatLog = [];

        if (!history || !history.length) return;

        for (var i = 0; i < history.length; i++) {
            var msg = history[i];
            var div = document.createElement('div');
            switch (msg.role) {
                case 'user':
                    div.className = 'message player';
                    div.textContent = '> ' + msg.content;
                    this._chatLog.push({ type: 'player', text: msg.content, ts: Date.now() });
                    break;
                case 'assistant':
                    div.className = 'message kp';
                    div.innerHTML = this.formatKPText(msg.content);
                    this._chatLog.push({ type: 'kp', text: msg.content, ts: Date.now() });
                    break;
                case 'system':
                    div.className = 'message system';
                    div.textContent = msg.content;
                    this._chatLog.push({ type: 'system', text: msg.content, ts: Date.now() });
                    break;
                default:
                    continue;
            }
            this.outputEl.appendChild(div);
        }

        this._saveChatLog();
        this.scrollToBottom();
    },

    init() {
        this.outputEl = document.getElementById('terminal-output');
        this.inputEl = document.getElementById('terminal-input');
        this.sendBtn = document.getElementById('send-btn');

        if (this.inputEl) {
            this.inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.submitInput();
                }
            });
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.submitInput());
        }

        var savedLog = typeof Utils !== 'undefined' ? Utils.loadFromStorage('scribe_chat_log') : null;
        if (savedLog && savedLog.length > 0) {
            this.restoreChatLog();
            this.printSystem('━━━ 会话已恢复 ━━━');
        } else {
            this.printSystem('╔══════════════════════════════════════════╗');
            this.printSystem('║              夜 谭                      ║');
            this.printSystem('║     AI 驱动的 COC 叙事终端              ║');
            this.printSystem('╚══════════════════════════════════════════╝');
            this.printSystem('');
            this.printSystem('输入 /help 查看可用命令，或直接开始对话。');
            this.printSystem('');
        }
    },

    submitInput(meta) {
        if (!this.inputEl) return;
        const text = this.inputEl.value.trim();
        if (!text || this.isProcessing) return;

        this.inputEl.value = '';
        this.printPlayer(text);

        if (text.startsWith('/')) {
            this.handleSlashCommand(text);
        } else if (this.checkModTrigger(text)) {
            return;
        } else if (this.onCommand) {
            this.onCommand(text, meta || {});
        }
    },

    MOD_TRIGGERS: [
        { pattern: /开始.*(?:进入|加载|启动).*暗夜呢喃/i, modFile: 'mods/night-whisper.json', modName: '暗夜呢喃' },
        { pattern: /(?:进入|加载|启动).*暗夜呢喃/i, modFile: 'mods/night-whisper.json', modName: '暗夜呢喃' },
        { pattern: /暗夜呢喃.*(?:开始|启动|进入)/i, modFile: 'mods/night-whisper.json', modName: '暗夜呢喃' }
    ],

    checkModTrigger(text) {
        for (var i = 0; i < this.MOD_TRIGGERS.length; i++) {
            var trigger = this.MOD_TRIGGERS[i];
            if (trigger.pattern.test(text)) {
                this.printSystem(`检测到模组触发指令，正在加载「${trigger.modName}」...`);
                this.handleStartCommand();
                return true;
            }
        }
        return false;
    },

    handleSlashCommand(cmd) {
        const parts = cmd.slice(1).split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (command) {
            case 'help':
                this.printSystem('可用命令：');
                this.printSystem('  /roll [技能名]     - 手动掷骰');
                this.printSystem('  /character         - 查看角色卡');
                this.printSystem('  /notes             - 打开调查手记');
                this.printSystem('  /save [1-3]        - 保存游戏');
                this.printSystem('  /load [1-3]        - 加载存档');
                this.printSystem('  /export            - 导出存档为JSON文件');
                this.printSystem('  /import            - 从JSON文件导入存档');
                this.printSystem('  /time              - 查看游戏内时间');
                this.printSystem('  /start             - 开始预设模组《暗夜呢喃》');
                this.printSystem('  /tutorial          - 开始15分钟试玩教程《雨夜电台》');
                this.printSystem('  /companions        - 查看同行队友');
                this.printSystem('  /contacts          - 查看可联络助力');
                this.printSystem('  /mode              - 切换快速/正常模式');
                this.printSystem('  /difficulty        - 查看/切换难度');
                this.printSystem('  /sancheck [损失式] - 手动SAN检定(如 1/1d3)');
                this.printSystem('  /combat [end]      - 查看战斗状态/结束战斗');
                this.printSystem('  /image [描述]      - 生成场景插图');
                this.printSystem('  /restart           - 重新开始游戏');
                this.printSystem('  /new               - 创建新角色');
                this.printSystem('  /validate          - 校验当前模组JSON');
                this.printSystem('  /settings          - 打开设置');
                break;
            case 'roll':
                this.handleRollCommand(args);
                break;
            case 'character':
                if (typeof Character !== 'undefined' && Character.current) {
                    this.printCharacterCard(Character.current);
                } else {
                    this.printSystem('尚未创建角色。输入 /new 开始创建。');
                }
                break;
            case 'save':
                this.handleSaveCommand(args);
                break;
            case 'load':
                this.handleLoadCommand(args);
                break;
            case 'time':
                if (typeof Story !== 'undefined' && Story.state.gameTime) {
                    this.printSystem(`当前时间：${Utils.formatTime(Story.state.gameTime)}`);
                } else {
                    this.printSystem('游戏尚未开始。');
                }
                break;
            case 'start':
                this.handleStartCommand();
                break;
            case 'tutorial':
            case 'demo':
                if (typeof TutorialDemo !== 'undefined') {
                    TutorialDemo.openSetup();
                } else {
                    this.printSystem('试玩教程模块未加载。');
                }
                break;
            case 'companions':
                this.handleCompanionsCommand();
                break;
            case 'contacts':
                this.handleContactsCommand();
                break;
            case 'mode':
                this.quickMode = !this.quickMode;
                this.printSystem(`已切换为${this.quickMode ? '快速' : '正常'}模式。`);
                if (this.outputEl) { this.outputEl.querySelectorAll('.quick-options').forEach(function (el) { el.remove(); }); }
                break;
            case 'difficulty':
                this.handleDifficultyCommand(args);
                break;
            case 'sancheck':
                this.handleSanCheckCommand(args);
                break;
            case 'combat':
                this.handleCombatCommand(args);
                break;
            case 'export':
                this.handleExportCommand();
                break;
            case 'import':
                this.handleImportCommand();
                break;
            case 'restart':
                this.handleRestartCommand();
                break;
            case 'image':
                this.handleImageCommand(args);
                break;
            case 'bonus':
                if (typeof Main !== 'undefined') {
                    if (Main.gameState.hiddenBonusThisChapter >= 2) {
                        this.printSystem('本章节隐藏奖励骰已达上限（2个）。');
                    } else if (Main.gameState.hiddenBonusTotal >= 5) {
                        this.printSystem('本模组隐藏奖励骰已达上限（5个）。');
                    } else {
                        Main.gameState.hiddenBonusDice++;
                        Main.gameState.hiddenBonusThisChapter++;
                        Main.gameState.hiddenBonusTotal++;
                        this.printSystem(`已授予隐藏奖励骰。（本章${Main.gameState.hiddenBonusThisChapter}/2，总计${Main.gameState.hiddenBonusTotal}/5）`);
                    }
                }
                break;
            case 'new':
                if (typeof CharacterCreation !== 'undefined') {
                    CharacterCreation.open();
                }
                break;
            case 'settings':
                if (typeof Settings !== 'undefined') {
                    Settings.toggle();
                }
                break;
            case 'validate':
                this.handleValidateCommand();
                break;
            default:
                this.printSystem(`未知命令：/${command}。输入 /help 查看可用命令。`);
        }
    },

    handleRollCommand(args) {
        if (typeof COCRules === 'undefined') {
            this.printSystem('规则引擎未加载。');
            return;
        }
        const skillName = args.join(' ');
        if (!skillName) {
            const result = Utils.rollD100();
            this.printSystem(`D100 → ${result}`);
            return;
        }
        if (Character.current) {
            const skillValue = COCRules.getSkillValue(Character.current, skillName);
            if (skillValue !== null) {
                const check = COCRules.performCheck(skillValue, skillName);
                this.printCheckResult(check);
            } else {
                this.printSystem(`未找到技能"${skillName}"。`);
            }
        } else {
            this.printSystem('尚未创建角色。');
        }
    },

    handleSaveCommand(args) {
        const slot = args[0] ? parseInt(args[0]) : 1;
        if (slot < 1 || slot > 3) {
            this.printSystem('存档槽位：1-3');
            return;
        }
        if (typeof Main !== 'undefined' && Main.manualSave(slot)) {
            if (Main.gameState && Main.gameState.isTutorialDemo) {
                this.printSuccess('已保存到《雨夜电台》试玩档。');
                if (typeof SoundSystem !== 'undefined') SoundSystem.play('save');
                return;
            }
            const charName = Main.gameState.character?.name || '无名调查员';
            this.printSuccess(`已保存到存档槽 ${slot}（${charName}）`);
            if (typeof SoundSystem !== 'undefined') SoundSystem.play('save');
        } else {
            this.printSystem('存档失败。');
        }
    },

    handleLoadCommand(args) {
        const slot = args[0] ? parseInt(args[0]) : null;
        if (slot) {
            if (slot < 1 || slot > 3) {
                this.printSystem('存档槽位：1-3');
                return;
            }
            if (typeof Main !== 'undefined' && Main.manualLoad(slot)) {
                if (Main.gameState && Main.gameState.isTutorialDemo) {
                    this.printSuccess('已加载《雨夜电台》试玩档。');
                    if (typeof SoundSystem !== 'undefined') SoundSystem.play('load');
                    return;
                }
                const charName = Main.gameState.character?.name || '无名调查员';
                this.printSuccess(`已加载存档槽 ${slot}（${charName}）`);
                if (typeof SoundSystem !== 'undefined') SoundSystem.play('load');
            } else {
                this.printSystem(`存档槽 ${slot} 为空。`);
            }
        } else {
            const slots = typeof Main !== 'undefined' ? Main.getSaveSlots() : [];
            let text = '可用存档：\n';
            slots.forEach(s => {
                const label = s.isAuto ? '自动' : `槽${s.slot}`;
                if (s.empty) {
                    text += `  ${label}: 空\n`;
                } else {
                    const diffNames = { investigator: '调查员', survivor: '幸存者', nightmare: '噩梦' };
                    text += `  ${label}: ${s.characterName} | ${s.chapter} | ${diffNames[s.difficulty] || '调查员'} | ${new Date(s.timestamp).toLocaleString()}\n`;
                }
            });
            this.printSystem(text.trim());
        }
    },

    handleCompanionsCommand() {
        if (typeof NPCManager === 'undefined' || !NPCManager.companions.length) {
            this.printSystem('当前无同行队友。');
            return;
        }
        let text = '同行队友：\n';
        NPCManager.companions.forEach(c => {
            text += `  ${c.name} - ${c.status} (HP:${c.hp}/${c.hpMax})\n`;
        });
        this.printSystem(text.trim());
    },

    handleContactsCommand() {
        if (typeof NPCManager === 'undefined' || !NPCManager.contacts.length) {
            this.printSystem('当前无可联络助力。');
            return;
        }
        let text = '可联络助力：\n';
        NPCManager.contacts.forEach(c => {
            text += `  ${c.name} - ${c.relation}\n`;
        });
        this.printSystem(text.trim());
    },

    handleDifficultyCommand(args) {
        const diffNames = {
            investigator: '调查员（标准COC体验）',
            survivor: '幸存者（更宽容：SAN损失×0.7，检定+10）',
            nightmare: '噩梦（真正的恐怖：SAN损失×1.3，检定-10）'
        };

        if (!args.length) {
            const current = typeof Main !== 'undefined' ? Main.gameState.difficulty : 'investigator';
            this.printSystem(`当前难度：${diffNames[current] || current}`);
            this.printSystem('可用难度：investigator / survivor / nightmare');
            return;
        }

        const newDiff = args[0].toLowerCase();
        if (!['investigator', 'survivor', 'nightmare'].includes(newDiff)) {
            this.printSystem('无效难度。可用：investigator / survivor / nightmare');
            return;
        }

        if (typeof Main !== 'undefined') {
            Main.gameState.difficulty = newDiff;
            Main.autoSave();
            this.printSuccess(`难度已切换为：${diffNames[newDiff]}`);
        }
    },

    handleSanCheckCommand(args) {
        if (!Character.current) {
            this.printSystem('尚未创建角色。');
            return;
        }

        const sanLossFormula = args[0] || '1/1d3';
        const currentSAN = Character.current.derived?.san || Character.current.san || 0;
        const roll = Utils.rollD100();
        const passed = roll <= currentSAN;

        let loss;
        if (sanLossFormula.includes('/')) {
            const parts = sanLossFormula.split('/');
            loss = passed ? Utils.rollFormula(parts[0]).total : Utils.rollFormula(parts[1]).total;
        } else {
            loss = passed ? 1 : Utils.rollFormula(sanLossFormula).total;
        }

        const diffMult = typeof NPCManager !== 'undefined' ? NPCManager.getDifficultyMultiplier() : { sanMultiplier: 1 };
        loss = Math.round(loss * diffMult.sanMultiplier);

        const oldSAN = currentSAN;
        const newSAN = Math.max(0, currentSAN - loss);

        if (Character.current.derived) {
            Character.current.derived.san = newSAN;
        }
        if (Character.current.san !== undefined) {
            Character.current.san = newSAN;
        }

        if (typeof Main !== 'undefined') {
            Main.updateSidebar();
            Main.autoSave();
        }

        let resultText = `🎲 SAN检定：D100=${roll} vs SAN=${currentSAN}\n`;
        resultText += passed ? `✓ 检定通过！` : `✗ 检定失败！`;
        resultText += ` SAN损失：${loss}（${oldSAN} → ${newSAN}）`;

        if (newSAN === 0) {
            resultText += '\n⚠ 永久疯狂！角色进入永久疯狂状态。';
        } else if (newSAN < currentSAN * 0.3) {
            resultText += '\n⚠ 精神状态危急！';
        }

        this.printSystem(resultText);
    },

    handleCombatCommand(args) {
        if (typeof Main === 'undefined') {
            this.printSystem('游戏系统未加载。');
            return;
        }

        var combat = Main.gameState.combat;

        if (args[0] === 'end') {
            Main.endCombat();
            return;
        }

        if (!combat.active) {
            this.printSystem('当前未在战斗中。');
            return;
        }

        var statusText = '⚔️ 战斗进行中 - 第' + combat.round + '轮\n';
        statusText += '📋 先攻顺序：' + combat.initiative.join(' → ') + '\n';
        statusText += '🎯 当前行动：' + (combat.currentTurn || '未知');
        if (combat.pendingDodge) {
            statusText += '\n⚡ 待处理闪避：' + combat.pendingDodge.enemy + '的攻击';
        }
        this.printSystem(statusText);
    },

    handleExportCommand() {
        if (typeof Main !== 'undefined') {
            try {
                Main.exportSaveAsJSON();
                this.printSuccess('存档已导出为JSON文件。');
            } catch (e) {
                this.printError(`导出失败：${e.message}`);
            }
        }
    },

    handleImportCommand() {
        const fileInput = document.getElementById('importFileInput');
        if (!fileInput) {
            this.printError('文件输入组件未找到。');
            return;
        }

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            fileInput.value = '';

            if (typeof Main !== 'undefined') {
                try {
                    await Main.importSaveFromJSON(file);
                    this.printSuccess('存档已从JSON文件导入。');
                    Main.updateSidebar();
                    Main.updateStatusBar();
                } catch (err) {
                    this.printError(`导入失败：${err.message}`);
                }
            }
        };

        fileInput.click();
        this.printSystem('请选择存档JSON文件...');
    },

    handleRestartCommand() {
        if (typeof Main === 'undefined') return;

        if (!Main.gameState.story?.modName) {
            this.printSystem('当前没有进行中的模组。输入 /start 开始新模组。');
            return;
        }

        this.printSystem('⚠ 确认重新开始？所有未保存的进度将丢失。');
        this.printSystem('输入 /save 先保存，或再次输入 /restart 确认重启。');

        const originalHandler = this.onCommand;
        let confirmed = false;

        const confirmHandler = (text) => {
            if (text === '/restart') {
                Main.gameState.story = Story.getInitialState ? Story.getInitialState() : {};
                Main.gameState.conversationHistory = [];
                if (typeof API !== 'undefined') {
                    if (API.clearHistory) {
                        API.clearHistory();
                    } else {
                        API.conversationHistory = [];
                        if (API.resetUsageStats) API.resetUsageStats();
                    }
                }
                Main.gameState.grieferLevel = 0;
                Main.gameState.grieferHistory = [];
                Main.gameState.appealCount = 0;
                Main.gameState.npcs = { companions: [], contacts: [], allNPCs: {} };
                Main.gameState.usedSkills = [];
                Main.gameState.bonusDice = 0;
                Main.gameState.hiddenBonusDice = 0;
                Main.gameState.hiddenBonusThisChapter = 0;
                Main.gameState.hiddenBonusTotal = 0;
                Main.gameState.combat = { active: false, round: 0, enemies: [], turnOrder: [], currentTurn: 0 };
                if (typeof Character !== 'undefined' && Character.resetPersistentState) {
                    Character.resetPersistentState();
                }
                if (typeof GrieferDetector !== 'undefined') {
                    GrieferDetector.level = 0;
                    GrieferDetector.history = [];
                }
                if (typeof MemorySystem !== 'undefined') {
                    MemorySystem.clearMemory();
                }
                this._chatLog = [];
                if (typeof Utils !== 'undefined') {
                    Utils.saveToStorage('scribe_chat_log', []);
                }
                if (this.outputEl) {
                    this.outputEl.innerHTML = '';
                }
                Main.autoSave();
                this.printSuccess('游戏已重置。输入 /start 开始新模组。');
                this.onCommand = originalHandler;
            } else {
                this.printSystem('重启已取消。');
                this.onCommand = originalHandler;
                if (originalHandler) originalHandler(text, {});
            }
        };

        this.onCommand = confirmHandler;
    },

    handleValidateCommand() {
        if (typeof ModValidator === 'undefined') {
            this.printError('模组校验模块未加载。');
            return;
        }

        var modData = null;
        if (typeof Story !== 'undefined' && Story.state && Story.state.modData) {
            modData = Story.state.modData;
        }

        if (!modData) {
            // 尝试从内置模组列表校验
            if (typeof StoryGenerator !== 'undefined' && StoryGenerator.PRESET_MODULES) {
                this.printSystem('当前无运行中模组，校验所有内置模组：');
                for (var i = 0; i < StoryGenerator.PRESET_MODULES.length; i++) {
                    var mod = StoryGenerator.PRESET_MODULES[i];
                    var result = ModValidator.validate(mod);
                    var report = ModValidator.formatReport(result);
                    this.printSystem(report);
                    this.printSystem('---');
                }
            } else {
                this.printSystem('当前没有运行中的模组，也没有内置模组可校验。请先开始一个模组。');
            }
            return;
        }

        var result = ModValidator.validate(modData);
        var report = ModValidator.formatReport(result);
        this.printSystem(report);
    },

    async handleStartCommand() {
        if (typeof Story === 'undefined') {
            this.printError('剧情系统未加载。');
            return;
        }

        if (!Character.current) {
            this.printSystem('请先创建角色。输入 /new 开始。');
            return;
        }

        if (Story.state.modName) {
            this.printSystem(`当前已在模组「${Story.state.modName}」中。输入 /restart 重新开始。`);
            return;
        }

        this.printSystem('正在加载模组《暗夜呢喃》...');

        try {
            const response = await fetch('mods/night-whisper.json');
            if (!response.ok) throw new Error(`加载失败: ${response.status}`);
            const modData = await response.json();

            Story.startMod(modData);

            if (typeof Main !== 'undefined') {
                Main.gameState.story = Story.state;
                Main.updateStatusBar();
                Main.updateSidebar();
                Main.autoSave();
            }

            this.printSuccess(`模组「${modData.name}」已加载！`);
            this.printSystem(`设定：${modData.setting}`);
            this.printSystem(`目标：${modData.startGoal}`);
            this.printSystem('');
            this.printSystem('冒险开始了。输入你的行动吧。');
        } catch (e) {
            this.printError(`模组加载失败：${e.message}`);
            this.printSystem('尝试使用内置模组数据...');

            const fallbackMod = {
                id: "night-whisper",
                name: "暗夜呢喃",
                startChapter: "海边的低语",
                startGoal: "调查霍普金斯教授的失踪",
                startTime: { year: 1928, month: 10, day: 17, hour: 9, minute: 0, period: "morning" },
                doomsdayClocks: [{ id: "full_moon_ritual", year: 1928, month: 10, day: 21, hour: 0, minute: 0, description: "新月之夜，深海之门将开启", triggered: false }],
                chapters: [
                    { id: "ch1", title: "海边的低语", phase: "prologue", keyClues: ["教授的日记", "海图上的标记", "奇怪的电话记录"], events: ["meet_margaret", "discover_study", "phone_call"] },
                    { id: "ch2", title: "潮汐之下", phase: "investigation", keyClues: ["渔村传说", "灯塔日志", "海底洞穴入口"], events: ["visit_village", "lighthouse_keeper", "cave_entrance"] },
                    { id: "ch3", title: "深渊的呢喃", phase: "approaching_truth", keyClues: ["邪教仪式记录", "教授的囚室", "召唤法术"], events: ["cult_encounter", "find_professor", "ritual_preparation"] },
                    { id: "ch4", title: "新月之夜", phase: "climax", keyClues: [], events: ["final_ritual", "boss_encounter", "ending"] }
                ],
                locations: [
                    { name: "阿卡姆大学", connections: ["阿卡姆警局", "教授住宅"] },
                    { name: "教授住宅", connections: ["阿卡姆大学"] },
                    { name: "阿卡姆警局", connections: ["阿卡姆大学", "渔村"] },
                    { name: "渔村", connections: ["阿卡姆警局", "灯塔", "海岸洞穴"] },
                    { name: "灯塔", connections: ["渔村"] },
                    { name: "海岸洞穴", connections: ["渔村"] }
                ],
                npcs: [
                    { name: "玛格丽特·霍普金斯", type: "client", role: "委托人/教授之女", hp: 8, hpMax: 8, san: 55, sanMax: 55, dex: 50, str: 40, app: 65, skills: { "说服": 40, "心理学": 30, "聆听": 45 }, location: "阿卡姆大学", attitude: "焦急", trust: 7, secret: "知道父亲研究异常，但不知深度，内疚未早关注", dialogueStyle: "眼眶红肿但声音出奇平静，手指绞在一起" },
                    { name: "老汤姆·惠特克", type: "professional", role: "灯塔看守人", hp: 10, hpMax: 10, san: 25, sanMax: 45, dex: 35, str: 45, app: 30, skills: { "导航": 60, "机械维修": 50, "聆听": 55 }, location: "灯塔", attitude: "恐惧", trust: 4, secret: "SAN已低（25/45），见过海中异常，恐惧但无法离开", dialogueStyle: "苍老疲惫，说话时总看向窗外大海，提到'那些夜晚'时声音发抖" },
                    { name: "莎拉·米切尔", type: "professional", role: "警局档案室管理员", hp: 9, hpMax: 9, san: 60, sanMax: 60, dex: 45, str: 35, app: 50, skills: { "图书馆使用": 65, "法律": 40, "历史": 45 }, location: "阿卡姆警局", attitude: "配合", trust: 6, secret: "整理过类似失踪案卷宗，发现规律但不敢上报", dialogueStyle: "安静内敛，提供信息时压低声音，像怕被听到" },
                    { name: "罗伯特·莫里斯", type: "enemy", role: "邪教领袖", hp: 12, hpMax: 12, san: 0, sanMax: 0, dex: 55, str: 50, app: 45, skills: { "神秘学": 70, "说服": 55, "心理学": 50 }, location: "海底洞穴", attitude: "敌对", trust: 2, secret: "SAN为0，完全被深海存在控制，策划新月召唤仪式", dialogueStyle: "表面温和有礼，但眼神空洞，偶尔说出不属于他的话" }
                ],
                introNarrative: "1928年10月17日。阿卡姆的秋天总是来得格外阴冷。\n\n雨水顺着窗玻璃滑下，模糊了街对面的煤气灯。阿卡姆大学历史系的走廊里弥漫着旧书和地板蜡的气味。\n\n玛格丽特·霍普金斯站在走廊尽头，手指绞在一起。她的眼眶红肿，但声音出奇地平静：\n\n「三天了。父亲失踪三天了。警方说他可能只是出去散步——但你们和我一样知道，那不是真的。」\n\n她从手提包里取出一把钥匙，递向你。\n\n「这是他书房的钥匙。拜托了。」\n\n窗外，雨忽然下得更大了。"
            };

            Story.startMod(fallbackMod);

            if (typeof Main !== 'undefined') {
                Main.gameState.story = Story.state;
                Main.updateStatusBar();
                Main.updateSidebar();
                Main.autoSave();
            }

            this.printSuccess(`模组「${fallbackMod.name}」已加载（内置数据）！`);
            this.printSystem(`目标：${fallbackMod.startGoal}`);
        }
    },

    handleImageCommand(args) {
        var self = this;
        var imageType = 'general';
        var typeArg = args[0];
        if (typeArg === '--portrait' || typeArg === '-p') {
            imageType = 'portrait';
            args = args.slice(1);
        } else if (typeArg === '--cg' || typeArg === '-c') {
            imageType = 'cg';
            args = args.slice(1);
        } else if (typeArg === '--npc' || typeArg === '-n') {
            imageType = 'npc';
            args = args.slice(1);
        } else if (typeArg === '--help' || typeArg === '-h') {
            this.printSystem('用法: /image [选项] [图像描述]');
            this.printSystem('选项:');
            this.printSystem('  -p, --portrait  生成主角立绘');
            this.printSystem('  -c, --cg        生成场景CG');
            this.printSystem('  -n, --npc       生成NPC角色立绘');
            this.printSystem('  无选项          通用图片生成');
            this.printSystem('示例:');
            this.printSystem('  /image 一座雾气缭绕的维多利亚式宅邸');
            this.printSystem('  /image --portrait');
            this.printSystem('  /image --cg 黑暗中睁开的无数眼睛');
            return;
        }

        var prompt = args.join(' ').trim();

        if (typeof ImageGenerator === 'undefined') {
            this.printError('图像生成模块未加载。');
            return;
        }

        var config = Settings.currentConfig ? Settings.currentConfig.image_api : null;
        if (!config) {
            this.printError('请先在设置中配置图像生成API。');
            return;
        }

        var char = Main.gameState.character;
        var finalPrompt = prompt;
        var size = config.image_size || '1024x1024';

        if (imageType === 'portrait') {
            if (!char) {
                this.printError('请先创建角色再生成主角立绘。');
                return;
            }
            if (!prompt) {
                prompt = this.buildPortraitPrompt(char);
            }
            finalPrompt = 'COC克苏鲁的呼唤1920年代风格角色立绘，' + prompt;
            size = '512x768';
            this.printSystem('正在生成主角立绘...');
        } else if (imageType === 'cg') {
            if (!prompt) {
                this.printError('请提供CG场景描述。用法: /image --cg [场景描述]');
                return;
            }
            // 形象锚：场景描述中出现已知NPC/调查员时注入外观约束，防止生成跑偏（如苏蔓变红发欧美人）
            var anchors = [];
            if (typeof NPCManager !== 'undefined' && NPCManager.allNPCs) {
                for (var npcKey in NPCManager.allNPCs) {
                    var anchorNpc = NPCManager.allNPCs[npcKey];
                    if (anchorNpc.name && prompt.indexOf(anchorNpc.name) !== -1 && anchorNpc.description) {
                        anchors.push(anchorNpc.name + '：中国人，黑发，' + String(anchorNpc.description).substring(0, 40));
                    }
                }
            }
            if (char && char.name && prompt.indexOf(char.name) !== -1 && char.appearance) {
                anchors.push(char.name + '：中国人，' + String(char.appearance).substring(0, 40));
            }
            var anchorText = anchors.length > 0 ? '，人物外观锚定（必须遵守）：' + anchors.join('；') : '，画面人物均为中国人';
            finalPrompt = 'COC克苏鲁的呼唤1920年代风格场景CG，' + prompt + anchorText + '，电影级构图，暗色调，哥特恐怖氛围，高清细节，画面中严禁出现任何文字、字幕、标题、水印、logo（no text, no captions, no watermark）';
            size = '1792x1024';
            this.printSystem('正在生成场景CG...');
        } else if (imageType === 'npc') {
            if (!prompt) {
                this.printError('请提供NPC角色描述。用法: /image --npc [角色描述]');
                return;
            }
            var npcExtra = this.buildNPCPortraitContext(prompt);
            finalPrompt = 'COC克苏鲁的呼唤1920年代风格NPC立绘，' + npcExtra + prompt + '，半身像，暗色调，哥特风格，高清细节';
            size = '512x768';
            this.printSystem('正在生成NPC立绘...');
        } else {
            if (!prompt) {
                this.printSystem('用法: /image [选项] [图像描述]');
                this.printSystem('输入 /image --help 查看详细帮助');
                return;
            }
            this.printSystem('正在生成图像...');
        }

        // 图像请求纳入调试日志，CG跑偏可溯源
        if (typeof API !== 'undefined' && API._debugLogEnabled) {
            API._debugLog.push({ type: 'image', imageType: imageType, prompt: finalPrompt, size: size, timestamp: new Date().toISOString() });
            try { localStorage.setItem('scribe_debug_log', JSON.stringify(API._debugLog)); } catch (e) {}
        }

        var mode = config.mode || 'api';

        if (mode === 'curl' && config.curl_command) {
            ImageGenerator.generateFromCurl(config.curl_command, {
                prompt: finalPrompt,
                size: size
            })
            .then(function (record) {
                record.imageType = imageType;
                self.displayGeneratedImages(record);
                if (imageType === 'portrait' && char) {
                    self.savePortraitToCharacter(record);
                }
                if (imageType === 'npc' && prompt) {
                    self.savePortraitToNPC(record, prompt);
                }
            })
            .catch(function (e) {
                self.printError('图像生成失败: ' + e.message);
            });
        } else {
            ImageGenerator.generateFromAPI(finalPrompt, {
                size: size,
                quality: config.image_quality || 'standard',
                n: config.image_count || 1
            })
            .then(function (record) {
                record.imageType = imageType;
                self.displayGeneratedImages(record);
                if (imageType === 'portrait' && char) {
                    self.savePortraitToCharacter(record);
                }
                if (imageType === 'npc' && prompt) {
                    self.savePortraitToNPC(record, prompt);
                }
            })
            .catch(function (e) {
                self.printError('图像生成失败: ' + e.message);
            });
        }
    },

    buildPortraitPrompt(char) {
        var parts = [];
        if (char.gender && char.gender !== '未知') parts.push(char.gender + '性');
        if (char.age) parts.push(char.age + '岁');
        if (char.nationality && char.nationality !== '未知') parts.push(char.nationality + '人');
        if (char.occupation) parts.push(char.occupation + '职业');
        if (char.appearance) parts.push(char.appearance);
        return parts.join('，');
    },

    buildNPCPortraitContext(npcNameHint) {
        var parts = [];
        var cleanName = npcNameHint.replace(/[，,。.！!？?]/g, '').trim();
        var npc = null;
        if (typeof NPCManager !== 'undefined') {
            for (var id in NPCManager.allNPCs) {
                var n = NPCManager.allNPCs[id];
                if (n.name === cleanName || n.name.includes(cleanName) || cleanName.includes(n.name)) {
                    npc = n;
                    break;
                }
            }
            if (!npc) {
                for (var i = 0; i < NPCManager.companions.length; i++) {
                    var c = NPCManager.companions[i];
                    if (c.name === cleanName || c.name.includes(cleanName) || cleanName.includes(c.name)) {
                        npc = c;
                        break;
                    }
                }
            }
        }
        if (npc) {
            if (npc.nationality) parts.push(npc.nationality + '人');
            if (npc.ethnicity) parts.push(npc.ethnicity);
            if (npc.gender) parts.push(npc.gender + '性');
            if (npc.age) parts.push(npc.age + '岁');
            if (npc.description) parts.push(npc.description);
        }
        if (typeof Story !== 'undefined' && Story.state && Story.state.settingLanguage) {
            var lang = Story.state.settingLanguage;
            var ethnicityMap = {
                '中文': '东亚人种', '汉语': '东亚人种', '中国': '中国人',
                '英文': '白人', '英语': '白人', '英国': '英国人', '美国': '美国人',
                '法文': '法国人', '法语': '法国人', '德文': '德国人', '德语': '德国人',
                '日文': '日本人', '日语': '日本人', '俄文': '俄罗斯人', '俄语': '俄罗斯人',
                '阿拉伯': '阿拉伯人', '西班牙': '西班牙人', '意大利': '意大利人',
                '拉丁': '拉丁裔', '印地': '印度人', '印度': '印度人'
            };
            var matched = false;
            for (var key in ethnicityMap) {
                if (lang.indexOf(key) !== -1) {
                    var hasAlready = parts.some(function(p) { return p.indexOf(ethnicityMap[key]) !== -1; });
                    if (!hasAlready) parts.unshift(ethnicityMap[key]);
                    matched = true;
                    break;
                }
            }
            if (!matched && lang.indexOf('中') !== -1) {
                var hasAlready = parts.some(function(p) { return p.indexOf('中国') !== -1 || p.indexOf('东亚') !== -1; });
                if (!hasAlready) parts.unshift('东亚人种');
            }
        }
        var nameHint = cleanName;
        var cjkPattern = /[\u4e00-\u9fff\u3400-\u4dbf]/;
        if (cjkPattern.test(nameHint) && parts.every(function(p) { return p.indexOf('东亚') === -1 && p.indexOf('中国') === -1; })) {
            parts.unshift('东亚人种');
        }
        if (parts.length === 0) return '';
        return parts.join('，') + '，';
    },

    savePortraitToCharacter(record) {
        if (!record.images || record.images.length === 0) return;
        var src = ImageGenerator.getImageSrc(record.images[0]);
        if (!src) return;

        var char = Main.gameState.character;
        if (!char) return;

        function doSave(finalSrc) {
            char.portraitSrc = finalSrc;
            if (Character.current) {
                Character.current.portraitSrc = finalSrc;
                Character.save();
            }
            Main.updateSidebar();
            Terminal.printSuccess('主角立绘已保存到角色卡。');
        }

        if (src.startsWith('data:')) {
            doSave(src);
        } else {
            ImageGenerator.convertUrlToBase64(src).then(function (base64Src) {
                doSave(base64Src);
            }).catch(function () {
                doSave(src);
            });
        }
    },

    savePortraitToNPC(record, npcNameHint) {
        if (!record.images || record.images.length === 0) return;
        var src = ImageGenerator.getImageSrc(record.images[0]);
        if (!src) return;
        if (typeof NPCManager === 'undefined') return;

        var npcName = npcNameHint.replace(/[，,。.！!？?]/g, '').trim().split(/\s+/)[0];
        if (!npcName) return;

        var imageId = record.images[0].id || record.images[0].b64?.substring(0, 16) || ('img_' + Date.now());

        function doSaveNPC(finalSrc) {
            var bound = NPCManager.bindPortrait(npcName, finalSrc, imageId);
            if (bound) {
                NPCManager.updateSidebar();
                Terminal.printSuccess(bound.name + ' 的立绘已保存。');
            } else {
                Terminal.printSystem(npcName + ' 未在NPC列表中找到，立绘未绑定。');
            }
        }

        if (src.startsWith('data:')) {
            doSaveNPC(src);
        } else {
            ImageGenerator.convertUrlToBase64(src).then(function (base64Src) {
                doSaveNPC(base64Src);
            }).catch(function () {
                doSaveNPC(src);
            });
        }
    },

    displayGeneratedImages(record) {
        if (!record.images || record.images.length === 0) {
            this.printError('图像生成返回了空结果。');
            return;
        }

        this.printSuccess('图像生成成功！');

        var self = this;
        record.images.forEach(function (img, idx) {
            var src = ImageGenerator.getImageSrc(img);
            if (src) {
                var caption = record.prompt || '';
                if (record.images.length > 1) caption += ' (' + (idx + 1) + '/' + record.images.length + ')';
                if (img.revisedPrompt) caption += ' - ' + img.revisedPrompt;
                self.printImage(src, caption);
            }
        });
    },

    printSystem(text) {
        if (!this.outputEl) return;
        const div = document.createElement('div');
        div.className = 'message system fade-in';
        div.textContent = text;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
        this._addChatLog('system', text);
    },

    printPlayer(text) {
        if (!this.outputEl) return;
        const div = document.createElement('div');
        div.className = 'message player fade-in';
        div.textContent = `> ${text}`;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
        this._addChatLog('player', text);
    },

    async printKP(text, skipTypewriter = false) {
        if (!this.outputEl) return;
        const div = document.createElement('div');
        div.className = 'message kp fade-in';
        this.outputEl.appendChild(div);

        if (skipTypewriter) {
            div.innerHTML = this.formatKPText(text);
            this.scrollToBottom();
            this._addChatLog('kp', text);
            return;
        }

        const formatted = this.formatKPText(text);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formatted;
        const plainText = tempDiv.textContent;

        let displayed = 0;
        for (const char of plainText) {
            displayed++;
            div.textContent = plainText.substring(0, displayed);
            if (displayed % 3 === 0) {
                this.scrollToBottom();
                if (typeof SoundSystem !== 'undefined' && displayed % 6 === 0) {
                    SoundSystem.play('typewriter');
                }
                await Utils.delay(this.typewriterSpeed);
            }
        }

        div.innerHTML = formatted;
        this.scrollToBottom();
        this._addChatLog('kp', text);
    },

    cleanKPText(text) {
        if (text == null) return '';
        return String(text)
            .replace(/<kp_note_update>[\s\S]*?<\/kp_note_update>/gi, '')
            .replace(/<kp_note_update>[\s\S]*$/gi, '')
            .replace(/&lt;kp_note_update&gt;[\s\S]*?&lt;\/kp_note_update&gt;/gi, '')
            .replace(/&lt;kp_note_update&gt;[\s\S]*$/gi, '')
            .replace(/【KP笔记本系统】[\s\S]*?(?=\n【|\n玩家|\n调查员|\n当前|\n$)/g, '')
            .replace(/<\/?span\b[^>]*>/gi, '')
            .replace(/&lt;\/?span\b[\s\S]*?&gt;/gi, '')
            // 剥离KP模型漏出的LaTeX包装（\boxed、\text、\[...\]、\(...\)），保留内容
            .replace(/\\text\{([\s\S]*?)\}/g, '$1')
            .replace(/\\boxed\{([\s\S]*?)\}/g, '$1')
            .replace(/\\\[([\s\S]*?)\\\]/g, '$1')
            .replace(/\\\(([\s\S]*?)\\\)/g, '$1')
            .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
            .trim();
    },

    formatKPText(text) {
        text = this.cleanKPText(text);
        var fxSegments = [];
        var plainText = text.replace(/\[FX:(GLITCH|WHISPER|SHAKE|FADE|BLOOD|RUNE|DISTORT)\]([\s\S]*?)\[\/FX\]/g, function(match, type, content) {
            var idx = fxSegments.length;
            fxSegments.push({ type: type, content: content });
            return '%%FX' + idx + '%%';
        });

        let html = Utils.escapeHtml(plainText);
        html = html.replace(/#{1,3}\s+(.*)/g, '<span style="font-size:1.1em;font-weight:bold;color:var(--accent-green);">$1</span>');
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<span style="font-weight:bold;color:var(--highlight-color);">$1</span>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>');
        html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        html = html.replace(/_{2}(.*?)_{2}/g, '<span class="highlight">$1</span>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
        html = html.replace(/^[-*]\s+(.*)/gm, '<span style="padding-left:12px;display:inline-block;">• $1</span>');
        html = html.replace(/━━+/g, '<div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━</div>');
        // 护栏：等号后的引号是HTML属性不算对话开头；捕获不得跨越标签（防止吃掉自家span的class="highlight"引号对）
        html = html.replace(/「([^<>]*?)」[：:]\s*(?<!=)[""「]([^<>]*?)[""」]/g, '<div class="dialogue"><div class="dialogue-speaker">$1</div><div class="dialogue-text">"$2"</div></div>');
        html = html.replace(/(?<!=)[""「]([^<>]*?)[""」]/g, '<span class="dialogue-text">"$1"</span>');

        for (var i = 0; i < fxSegments.length; i++) {
            var fx = fxSegments[i];
            var escapedContent = Utils.escapeHtml(fx.content);
            var fxClass = 'fx-' + fx.type.toLowerCase();
            var placeholderRaw = '%%FX' + i + '%%';
            var placeholderEscaped = Utils.escapeHtml(placeholderRaw);
            html = html.replace(placeholderEscaped, '<span class="' + fxClass + '">' + escapedContent + '</span>');
            html = html.replace(placeholderRaw, '<span class="' + fxClass + '">' + escapedContent + '</span>');
        }

        html = html.replace(/\[STAGE_ADVANCE\]/g, '');
        html = html.replace(/\[ENDING:[^\]]+\]/g, '');
        html = html.replace(/\[STAGE_FLAG:[^\]]+\]/g, '');
        html = html.replace(/\[EVENT:[^\]]+\]/g, '');
        html = html.replace(/\[GOAL:[^\]]+\]/g, '');
        html = html.replace(/\[LOCATION:[^\]]+\]/g, '');
        html = html.replace(/\[TRANSLATOR:[^\]]+\]/g, '');
        html = html.replace(/&lt;kp_note_update&gt;[\s\S]*?&lt;\/kp_note_update&gt;/g, '');
        html = html.replace(/<kp_note_update>[\s\S]*?<\/kp_note_update>/g, '');
        html = html.replace(/&lt;kp_note_update&gt;[\s\S]*$/g, '');
        html = html.replace(/<kp_note_update>[\s\S]*$/g, '');
        // 注：历代"highlight碎片清洗"补丁已摘除——它们会把自家生成的<span class="highlight">啃成残缺标签，
        // 导致所有**加粗**文字从不显示(2026.6.10铜牌案)。泄漏源已由对话正则护栏根治。

        html = html.replace(/(?:<br\s*\/?>|\n|\r|\s)*(?:[A-D][.．、)]\s*.*?(?:<br\s*\/?>|\n|\r|$)){3,4}\s*$/gis, '');
        html = html.replace(/\*+/g, '');
        return html;
    },

    printError(text) {
        if (!this.outputEl) return;
        const div = document.createElement('div');
        div.className = 'message error fade-in';
        div.textContent = `⚠ ${text}`;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
        this._addChatLog('error', text);
    },

    printImage(src, caption) {
        if (!this.outputEl) return;
        var wrapper = document.createElement('div');
        wrapper.className = 'terminal-image-wrapper fade-in';

        var img = document.createElement('img');
        img.className = 'terminal-image';
        img.src = src;
        img.alt = caption || '生成的图像';
        img.loading = 'lazy';
        img.addEventListener('click', function () {
            Terminal.showImageLightbox(src, caption);
        });

        wrapper.appendChild(img);

        if (caption) {
            var captionEl = document.createElement('div');
            captionEl.className = 'terminal-image-caption';
            captionEl.textContent = caption;
            wrapper.appendChild(captionEl);
        }

        this.outputEl.appendChild(wrapper);
        this.scrollToBottom();
    },

    showImageLightbox(src, caption) {
        var existing = document.querySelector('.image-lightbox');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.className = 'image-lightbox';

        var img = document.createElement('img');
        img.src = src;
        img.alt = caption || '';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'image-lightbox-close';
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', function () { overlay.remove(); });

        var actions = document.createElement('div');
        actions.className = 'image-lightbox-actions';

        var downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> 保存图片';
        downloadBtn.addEventListener('click', function () {
            if (typeof ImageGenerator !== 'undefined') {
                ImageGenerator.downloadImage({ url: src, b64: src.startsWith('data:') ? src.replace(/^data:image\/\w+;base64,/, '') : '' }, 'coc-image-' + Date.now() + '.png');
            } else {
                var link = document.createElement('a');
                link.href = src;
                link.download = 'coc-image-' + Date.now() + '.png';
                link.click();
            }
        });

        var openBtn = document.createElement('button');
        openBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> 新窗口打开';
        openBtn.addEventListener('click', function () {
            window.open(src, '_blank');
        });

        actions.appendChild(downloadBtn);
        actions.appendChild(openBtn);

        overlay.appendChild(img);
        overlay.appendChild(closeBtn);
        overlay.appendChild(actions);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    },

    printWarning(text) {
        if (!this.outputEl) return;
        const div = document.createElement('div');
        div.className = 'message warning fade-in';
        div.textContent = `🔶 ${text}`;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
        this._addChatLog('warning', text);
    },

    printSuccess(text) {
        if (!this.outputEl) return;
        const div = document.createElement('div');
        div.className = 'message success fade-in';
        div.textContent = `✓ ${text}`;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    },

    printCheckResult(check) {
        var displayTarget = check.adjustedTarget || check.targetValue;
        var originalTarget = check.targetValue;
        const div = document.createElement('div');
        div.className = 'message fade-in';

        let resultClass = '';
        let resultText = '';
        let icon = '';
        let ruleHint = '';
        switch (check.result) {
            case 'critical':
                resultClass = 'critical';
                resultText = '大成功！';
                icon = '✦';
                ruleHint = '（01-05为大成功范围）';
                break;
            case 'success':
                resultClass = 'success';
                if (check.successLevel === 3) {
                    resultText = '极难成功';
                    ruleHint = '（≤目标值×⅕=' + Math.floor(displayTarget * 0.2) + '）';
                } else if (check.successLevel === 2) {
                    resultText = '困难成功';
                    ruleHint = '（≤目标值×½=' + Math.floor(displayTarget * 0.5) + '）';
                } else {
                    resultText = '成功';
                    ruleHint = '（≤目标值=' + displayTarget + '）';
                }
                icon = '✓';
                break;
            case 'failure':
                resultClass = 'failure';
                resultText = '失败';
                ruleHint = '（>' + displayTarget + '）';
                icon = '✗';
                break;
            case 'fumble':
                resultClass = 'fumble';
                resultText = '大失败！';
                ruleHint = originalTarget < 50 ? '（技能<50%时96-100为大失败）' : '（技能≥50%时99-100为大失败）';
                icon = '⚠';
                break;
        }

        var skillName = Utils.escapeHtml(check.skillName);
        if (check.isHidden) {
            div.innerHTML = `<div class="check-result ${resultClass}">🕵️ ${skillName}暗骰检定——结果已融入叙事</div>`;
        } else {
            var targetDisplay = displayTarget !== originalTarget ? displayTarget + '(原' + originalTarget + ')' : displayTarget;
            div.innerHTML = `<div class="check-result ${resultClass}">${icon} ${skillName}检定 ${resultText} (${check.roll}/${targetDisplay}) ${ruleHint}</div>`;
        }
        this.outputEl.appendChild(div);
        this.scrollToBottom();

        if (typeof SoundSystem !== 'undefined') {
            SoundSystem.playCheckResult(check.result);
        }
    },

    printSANLoss(current, max, loss) {
        const div = document.createElement('div');
        div.className = 'message fade-in';
        div.innerHTML = `<span class="san-loss">💀 理智损失 -${loss}  SAN: ${current}/${max}</span>`;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    },

    printSANGain(current, max, gain) {
        const div = document.createElement('div');
        div.className = 'message fade-in';
        div.innerHTML = `<span class="san-gain">✦ 理智恢复 +${gain}  SAN: ${current}/${max}</span>`;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    },

    printChapterTitle(title) {
        const div = document.createElement('div');
        div.className = 'chapter-title fade-in';
        div.textContent = `〔 ${title} 〕`;
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    },

    renderQuickOptions(optionsText) {
        const existing = this.outputEl.querySelectorAll('.quick-options');
        existing.forEach(el => el.remove());

        const lines = optionsText.split('\n').filter(l => l.trim().match(/^[A-D][.．、]/i));
        if (lines.length === 0) return;

        const optionTexts = lines.map(line => line.trim().replace(/^[A-D][.．、]\s*/i, ''));
        if (typeof Story !== 'undefined' && Story.recordOptions) {
            Story.recordOptions(optionTexts);
        }

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quick-options fade-in';

        lines.forEach(line => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            const isD = /^D[.．、]/i.test(line.trim());

            if (isD) {
                btn.classList.add('option-d');
                btn.innerHTML = `<span class="option-key">D</span><span>${Utils.escapeHtml(line.trim().replace(/^D[.．、]\s*/i, ''))}</span>`;
                btn.onclick = () => {
                    this.inputEl.focus();
                    this.inputEl.placeholder = '输入你的行动...';
                };
            } else {
                const key = line.trim().charAt(0).toUpperCase();
                const text = line.trim().replace(/^[A-C][.．、]\s*/i, '');
                btn.innerHTML = `<span class="option-key">${key}</span><span>${Utils.escapeHtml(text)}</span>`;
                btn.onclick = () => {
                    const allOptions = optionsDiv.querySelectorAll('.option-btn');
                    allOptions.forEach(b => {
                        b.style.opacity = '0.3';
                        b.style.pointerEvents = 'none';
                    });
                    btn.style.opacity = '1';
                    btn.style.borderColor = 'var(--accent-green)';
                    btn.style.background = 'rgba(0, 255, 136, 0.1)';

                    this.inputEl.value = text;
                    this.submitInput({ isQuickOption: true });
                };
            }

            optionsDiv.appendChild(btn);
        });

        this.outputEl.appendChild(optionsDiv);
        this.scrollToBottom();
    },

    showLoading() {
        const div = document.createElement('div');
        div.className = 'message loading-indicator';
        div.id = 'loading-indicator';
        div.innerHTML = '守秘人正在思考<span class="dots"></span>';
        this.outputEl.appendChild(div);
        this.scrollToBottom();
    },

    hideLoading() {
        const el = document.getElementById('loading-indicator');
        if (el) el.remove();
    },

    printCharacterCard(char) {
        const lines = [
            `═══ ${char.name} 的角色卡 ═══`,
            `职业：${char.occupation}  国籍：${char.nationality || '中国'}  年龄：${char.age || '未知'}`,
            `母语：${char.nativeLanguage || '中文'}`,
            ``,
            `STR: ${char.str}  CON: ${char.con}  SIZ: ${char.siz}  DEX: ${char.dex}`,
            `APP: ${char.app}  INT: ${char.int}  POW: ${char.pow}  EDU: ${char.edu}`,
            `幸运: ${char.luck}`,
            ``,
            `HP: ${char.hp}/${char.hpMax}  MP: ${char.mp}/${char.mpMax}  SAN: ${char.san}/${char.sanMax}`,
            `DB: ${char.db}  体格: ${char.build}  MOV: ${char.mov}`,
            ``,
            `信用评级: ${char.creditRating || 0}%`,
        ];

        if (char.skills) {
            lines.push('');
            lines.push('── 技能 ──');
            const sorted = Object.entries(char.skills)
                .filter(([_, v]) => v > 0)
                .sort((a, b) => b[1] - a[1]);
            sorted.forEach(([name, value]) => {
                lines.push(`  ${name}: ${value}%`);
            });
        }

        this.printSystem(lines.join('\n'));
    },

    setProcessing(state) {
        this.isProcessing = state;
        this.inputEl.disabled = state;
        this.sendBtn.disabled = state;
        if (state) {
            this.inputEl.placeholder = '守秘人正在回应...';
        } else {
            this.inputEl.placeholder = '输入行动或命令...';
        }
    },

    scrollToBottom() {
        if (!this.outputEl) return;
        requestAnimationFrame(() => {
            if (this.outputEl) this.outputEl.scrollTop = this.outputEl.scrollHeight;
        });
    },

    clear() {
        if (!this.outputEl) return;
        this.outputEl.innerHTML = '';
    }
};
