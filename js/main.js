const Main = {
    SAVE_VERSION: 2,

    gameState: {
        character: null,
        story: {
            modName: '',
            chapter: '序章',
            phase: 'prologue',
            gameTime: null,
            clues: [],
            currentGoal: '',
            events: []
        },
        npcs: {
            companions: [],
            contacts: [],
            combatPower: '无'
        },
        quickMode: true,
        difficulty: 'investigator',
        grieferLevel: 0,
        grieferHistory: [],
        appealCount: 0,
        bonusDice: 0,
        hiddenBonusDice: 0,
        hiddenBonusThisChapter: 0,
        hiddenBonusTotal: 0,
        isIntroNarrative: false,
        _pendingHiddenChecks: [],
        conversationHistory: [],
        combat: {
            active: false,
            round: 0,
            initiative: [],
            currentTurn: null,
            pendingDodge: null,
            dodgeCountThisRound: 0
        }
    },

    init() {
        // 一次性迁移：coc_* → scribe_* 存储键
        this._migrateStorageKeys();

        try { API.init(); } catch (e) { console.error('API.init error:', e); }
        try { Terminal.init(); } catch (e) { console.error('Terminal.init error:', e); }
        try { Settings.init(); } catch (e) { console.error('Settings.init error:', e); }
        if (typeof ImageGenerator !== 'undefined') { try { ImageGenerator.init(); } catch (e) { console.error('ImageGenerator.init error:', e); } }

        if (typeof COCRules !== 'undefined') { try { COCRules.init(); } catch (e) { console.error('COCRules.init error:', e); } }
        if (typeof SoundSystem !== 'undefined') { try { SoundSystem.init(); } catch (e) { console.error('SoundSystem.init error:', e); } }
        if (typeof Character !== 'undefined') { try { Character.init(); } catch (e) { console.error('Character.init error:', e); } }
        if (typeof Story !== 'undefined') { try { Story.init(); } catch (e) { console.error('Story.init error:', e); } }
        if (typeof NPCManager !== 'undefined') { try { NPCManager.init(); } catch (e) { console.error('NPCManager.init error:', e); } }
        if (typeof DiceAnimation !== 'undefined') { try { DiceAnimation.init(); } catch (e) { console.error('DiceAnimation.init error:', e); } }
        if (typeof DiceSystem !== 'undefined') { try { DiceSystem.init(); } catch (e) { console.error('DiceSystem.init error:', e); } }
        if (typeof GrieferDetector !== 'undefined') { try { GrieferDetector.init(); } catch (e) { console.error('GrieferDetector.init error:', e); } }
        if (typeof CaseSystem !== 'undefined') { try { CaseSystem.init(); } catch (e) { console.error('CaseSystem.init error:', e); } }
        if (typeof StoryGenerator !== 'undefined') { try { StoryGenerator.init(); } catch (e) { console.error('StoryGenerator.init error:', e); } }
        if (typeof MemorySystem !== 'undefined') { try { MemorySystem.init(); } catch (e) { console.error('MemorySystem.init error:', e); } }
        if (typeof KPNotebook !== 'undefined') { try { KPNotebook.init(); } catch (e) { console.error('KPNotebook.init error:', e); } }
        if (typeof MenuSystem !== 'undefined') { try { MenuSystem.init(); } catch (e) { console.error('MenuSystem.init error:', e); } }

        Terminal.onCommand = (text, meta) => {
            if (meta && meta.isQuickOption) {
                this.gameState._isQuickOption = true;
            }
            this.handlePlayerInput(text);
        };

        document.getElementById('btn-settings')?.addEventListener('click', () => {
            try { Settings.toggle(); } catch (e) { console.error('Settings.toggle error:', e); }
        });
        document.getElementById('btn-menu')?.addEventListener('click', () => {
            if (typeof MenuSystem !== 'undefined') {
                MenuSystem.toggle();
            }
        });
        document.querySelectorAll('#game-tsw button').forEach(function(dot) {
            dot.addEventListener('click', function() {
                var theme = dot.dataset.set;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('coc-theme', theme);
                document.querySelectorAll('#game-tsw button').forEach(function(d) {
                    d.setAttribute('aria-pressed', d === dot ? 'true' : 'false');
                });
            });
        });
        (function syncGameThemeDots() {
            var cur = document.documentElement.getAttribute('data-theme') || 'detective';
            document.querySelectorAll('#game-tsw button').forEach(function(d) {
                d.setAttribute('aria-pressed', d.dataset.set === cur ? 'true' : 'false');
            });
        })();

        document.getElementById('btn-sidebar-toggle')?.addEventListener('click', () => {
            var sidebar = document.getElementById('sidebar');
            var mainContainer = document.getElementById('main-container');
            if (sidebar) {
                var collapsed = sidebar.classList.toggle('collapsed');
                if (mainContainer) mainContainer.classList.toggle('sidebar-collapsed', collapsed);
            }
        });
        document.getElementById('status-mode')?.addEventListener('click', () => {
            try {
                Terminal.quickMode = !Terminal.quickMode;
                this.gameState.quickMode = Terminal.quickMode;
                var modeLabel = document.querySelector('#status-mode .status-label');
                if (modeLabel) modeLabel.textContent = Terminal.quickMode ? '快速模式' : '正常模式';
                var modeDisplayEl = document.getElementById('setting-mode-display');
                if (modeDisplayEl) modeDisplayEl.textContent = Terminal.quickMode ? '快速模式' : '正常模式';
                Terminal.printSystem('已切换为' + (Terminal.quickMode ? '快速' : '正常') + '模式。');
                if (Terminal.outputEl) { Terminal.outputEl.querySelectorAll('.quick-options').forEach(function (el) { el.remove(); }); }
            } catch (e) { console.error('status-mode click error:', e); }
        });

        document.getElementById('status-sound')?.addEventListener('click', () => {
            if (typeof SoundSystem !== 'undefined') {
                SoundSystem.toggle();
            }
        });

        document.querySelectorAll('#sidebar-tabs .tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#sidebar-tabs .tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('#sidebar-content .tab-panel').forEach(p => p.style.display = 'none');
                document.getElementById(`tab-${tab.dataset.tab}`).style.display = 'block';
            });
        });

        document.getElementById('sidebar-player-notes')?.addEventListener('input', (e) => {
            this.gameState.story.playerNotes = e.target.value;
            if (typeof Story !== 'undefined') {
                Story.state.playerNotes = e.target.value;
                Story.save();
            }
            this.autoSave();
        });

        try { this.loadAutoSave(); } catch (e) { console.error('loadAutoSave error:', e); }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (Settings.isOpen) {
                    Settings.close();
                } else if (document.getElementById('character-creation-overlay')?.classList.contains('active')) {
                    CharacterCreation.close();
                }
            }
        });

        if (!this.gameState.character) {
            Terminal.printSystem('欢迎，调查员。请先创建你的角色。');
            if (!API.config.apiKey) {
                Terminal.printSystem('请先点击右上角 ⚙ 打开设置，配置 API Key 和模型后再开始游戏。');
            } else {
                Terminal.printSystem('输入 /new 开始创建角色，或直接对话。');
            }
        }

        this.updateStatusBar();
        this.updateSidebar();
        setInterval(() => this.updateStatusBar(), 60000);
    },

    async handlePlayerInput(text) {
        if (!this.gameState.character) {
            Terminal.printSystem('请先创建角色。输入 /new 开始。');
            return;
        }

        // 结局终止态：不再把玩家输入送给KP（模型管不住自己续写，引擎掐线）
        if (typeof Story !== 'undefined' && Story.state.ended) {
            Terminal.printSystem('本局冒险已落幕。可在菜单中新开冒险或读取存档；输入 /new 重新开始。');
            return;
        }

        this._syncNPCData();

        if (!API.config.apiKey) {
            Terminal.printError('请先在设置中配置 API Key。');
            return;
        }

        if (!API.config.baseUrl && !API.config.provider) {
            Terminal.printError('请先在设置中配置 API 地址。');
            return;
        }

        if (!API.config.model) {
            Terminal.printError('请先在设置中配置模型名称。');
            return;
        }

        if (typeof GrieferDetector !== 'undefined') {
            const grieferCheck = GrieferDetector.evaluate(text, this.gameState);
            if (grieferCheck.triggered) {
                if (grieferCheck.hardBlock) {
                    this.handleGrieferResult(grieferCheck);
                    return;
                }
                if (grieferCheck.softInject) {
                    this.gameState._grieferInject = {
                        level: grieferCheck.level,
                        suspicionScore: grieferCheck.suspicionScore,
                        action: grieferCheck.action
                    };
                    if (grieferCheck.message) {
                        this.showGrieferNarrativeWarning(grieferCheck);
                    }
                }
            }
        }

        if (this.gameState.bonusDice > 0) {
            this.gameState.bonusDice--;
        }

        this._lastPlayerInput = text;
        Terminal.setProcessing(true);
        this.gameState._skillSuggestions = null;
        this.gameState._pendingHiddenChecks = [];

        const meaninglessResult = this.handleMeaninglessInput(text);
        if (meaninglessResult) {
            this.gameState._meaninglessCount = (this.gameState._meaninglessCount || 0) + 1;
        } else {
            this.gameState._meaninglessCount = 0;
        }

        Terminal.setProcessing(true);
        Terminal.showLoading();

        try {
            var rollContext = await this.resolveRollBeforeNarration(text);
            var messageForKP = this.buildNarrationInput(text, rollContext);
            Terminal.showLoading();
            const result = await API.sendMessage(messageForKP, this.gameState);

            Terminal.hideLoading();

            if (result.error) {
                Terminal.printError(result.error);
                Terminal.setProcessing(false);
                return;
            }

            if (result.stream) {
                let fullText = '';
                let currentDiv = null;

                await API.processStream(
                    result.stream,
                    (chunk) => {
                        fullText += chunk;
                        if (!currentDiv) {
                            currentDiv = document.createElement('div');
                            currentDiv.className = 'message kp';
                            Terminal.outputEl.appendChild(currentDiv);
                        }
                        currentDiv.textContent = this.stripDiceMarkers(fullText);
                        Terminal.scrollToBottom();
                    },
                    (complete) => {
                        var prematureCheck = this._detectDicePremature(complete);
                        var displayComplete = prematureCheck.hasPremature ? prematureCheck.safeText : complete;
                        var displayText = this.stripDiceMarkers(displayComplete, true);
                        if (currentDiv) {
                            currentDiv.innerHTML = Terminal.formatKPText(displayText);
                        }
                        if (prematureCheck.hasPremature) {
                            console.warn('Dice premature result truncated; continuation will run after roll.');
                        }
                        Terminal._addChatLog('kp', this.stripDiceMarkers(displayComplete));
                        this.processAIResponse(complete);
                        Terminal.setProcessing(false);
                    }
                );
            }
        } catch (e) {
            Terminal.hideLoading();
            Terminal.printError(`通信错误：${e.message}`);
            Terminal.setProcessing(false);
        }
    },

    async resolveRollBeforeNarration(playerText) {
        if (typeof API === 'undefined' || !API.judgeRoll || typeof DiceSystem === 'undefined' || typeof COCRules === 'undefined') {
            return { judged: false, needsRoll: false, reason: '裁定器不可用' };
        }

        // 守门人本地预检：明显违规直接拦截，不调 AI
        if (typeof GuardrailLocal !== 'undefined') {
            var localGuard = GuardrailLocal.check(playerText);
            if (localGuard) {
                return {
                    judged: true,
                    needsRoll: false,
                    judgment: {
                        needsRoll: false,
                        reason: '守门人本地拦截：' + localGuard.violations[0].detail,
                        guardrail: localGuard
                    }
                };
            }
        }

        var local = this.localRollJudgment(playerText);
        var judgment = local || await API.judgeRoll(playerText, this.gameState);
        if (!judgment || judgment.error) {
            return { judged: false, needsRoll: false, reason: judgment?.error || '裁定失败' };
        }

        // 本地裁定无守门人字段，补默认值
        if (!judgment.guardrail) {
            judgment.guardrail = { verdict: 'pass', violations: [] };
        }

        if (!judgment.needsRoll) {
            return { judged: true, needsRoll: false, judgment: judgment };
        }

        var result = await this.performJudgedRoll(judgment);
        if (!result) {
            return { judged: true, needsRoll: false, judgment: judgment, reason: '检定未能执行' };
        }

        return {
            judged: true,
            needsRoll: true,
            judgment: judgment,
            rollResult: result,
            summary: this.formatRollResultForPrompt(result)
        };
    },

    localRollJudgment(playerText) {
        var text = String(playerText || '');
        if (/^(继续|接着|然后呢|我等|等待|休息一下|往前走|走过去|进入|离开|打开门|关门|坐下|站起来)[。.!！?？]*$/.test(text.trim())) {
            return { needsRoll: false, reason: '简单行动或过渡行动，无需随机性判定', source: 'local' };
        }
        if (/^(我看看|看看|查看)(周围|眼前|桌面|手里|已经发现的|角色卡|物品)[。.!！?？]*$/.test(text.trim())) {
            return { needsRoll: false, reason: '查看显而易见信息，无需检定', source: 'local' };
        }
        var rules = [
            { re: /(心理学|看穿|看出|判断.*(撒谎|说谎|真实|意图|动机)|他.*(撒谎|说谎)|观察.*(反应|表情|神色))/, skill: '心理学', rollType: 'hidden', reason: '玩家在判断NPC真实意图' },
            { re: /(图书馆|查阅|翻阅|查找|检索|研究|整理).*(资料|记录|档案|剪报|报纸|调查资料|旧档|旧案)|((资料|记录|档案|剪报|报纸|调查资料|旧档|旧案).*(查阅|翻阅|查找|检索|研究|整理))/, skill: '图书馆使用', rollType: 'open', reason: '玩家在查阅资料、记录、档案或剪报' },
            { re: /(侦查|搜查|搜索|翻找|检查|查看.*(房间|桌|柜|抽屉|地面|墙|尸体|物品))/, skill: '侦查', rollType: 'open', reason: '玩家主动搜查具体对象' },
            { re: /(聆听|倾听|听听|听.*(门后|墙后|动静|声音))/, skill: '聆听', rollType: 'open', reason: '玩家主动聆听' },
            { re: /(潜行|偷偷|悄悄|不被发现|溜过去)/, skill: '潜行', rollType: 'hidden', reason: '玩家尝试避免被察觉' },
            { re: /(开锁|撬锁|撬开|解锁)/, skill: '锁匠', rollType: 'open', reason: '玩家尝试开锁' },
            { re: /(说服|劝说|劝他|请求.*同意)/, skill: '说服', rollType: 'open', reason: '玩家试图说服NPC' },
            { re: /(话术|套话|编个|撒谎|骗|糊弄|找借口)/, skill: '话术', rollType: 'open', reason: '玩家使用话术操控对方相信自己' },
            { re: /(恐吓|威胁|吓唬)/, skill: '恐吓', rollType: 'open', reason: '玩家使用威胁施压' }
        ];
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].re.test(text)) {
                var target = COCRules.getSkillValue(this.gameState.character, rules[i].skill);
                if (target !== null && target !== undefined) {
                    return {
                        needsRoll: true,
                        skill: rules[i].skill,
                        rollType: rules[i].rollType,
                        difficulty: '普通',
                        bonusDice: 0,
                        penaltyDice: 0,
                        targetValue: Number(target),
                        reason: rules[i].reason,
                        source: 'local'
                    };
                }
            }
        }
        return null;
    },

    async performJudgedRoll(judgment) {
        Terminal.hideLoading();
        var skill = judgment.skill;
        var target = judgment.targetValue;
        var bonus = judgment.bonusDice || 0;
        var penalty = judgment.penaltyDice || 0;
        var result = null;
        if (judgment.rollType === 'hidden') {
            result = await DiceSystem.requestHiddenRoll(skill, target, penalty, bonus);
        } else {
            result = await DiceSystem.requestOpenRoll(skill, target, judgment.difficulty || '普通', penalty, bonus);
        }
        if (result && typeof SoundSystem !== 'undefined' && !result.isHidden) {
            SoundSystem.playCheckResult(result.result);
        }
        if (result) {
            this._trackUsedSkill(skill);
        }
        return result;
    },

    formatRollResultForPrompt(result) {
        var levelNames = {
            critical: '大成功',
            success: result.successLevel === 3 ? '极难成功' : result.successLevel === 2 ? '困难成功' : '普通成功',
            failure: '失败',
            fumble: '大失败'
        };
        return result.skillName + '：' + result.roll + '/' + result.targetValue + ' → ' + (levelNames[result.result] || result.result);
    },

    buildNarrationInput(playerText, rollContext) {
        if (!rollContext || !rollContext.judged) return playerText;

        // 守门人提示构建
        var guardrailHint = '';
        var g = rollContext.judgment?.guardrail;
        if (g && g.verdict && g.verdict !== 'pass') {
            var violationDetails = (g.violations || []).map(function(v) {
                return v.type + (v.detail ? '：' + v.detail : '');
            }).join('；');
            if (g.verdict === 'reject') {
                guardrailHint = '\n\n【守门人拒绝】玩家本轮行动违反规则，你必须以叙事方式否定此行动，不得让玩家得逞。违反内容：' + (violationDetails || '未指定') + '。';
            } else if (g.verdict === 'warn') {
                guardrailHint = '\n\n【守门人警告】玩家本轮行动存在问题，你需在叙事中自然纠正。问题内容：' + (violationDetails || '未指定') + '。';
            }
        }

        if (rollContext.needsRoll && rollContext.rollResult) {
            // 程序预裁定也算检定：重置无检定计数，否则L3会对KP误报"连续N轮无检定"
            // (2026.6.12 Milo第六轮#20：KP被明令不得输出[DICE]，计数却只认[DICE]，引擎左右手打架)
            if (typeof Story !== 'undefined' && Story.state) Story.state._turnsSinceDice = 0;
            return playerText + '\n\n【检定裁定】本轮已经由程序完成检定。技能=' + rollContext.judgment.skill +
                '；骰法=' + (rollContext.judgment.rollType === 'hidden' ? '暗骰' : '明骰') +
                '；难度=' + (rollContext.judgment.difficulty || '普通') +
                '；原因=' + (rollContext.judgment.reason || '无') +
                '；真实结果=' + rollContext.summary +
                '。请只根据这个真实结果叙述，不得重新判定，不得改用其他技能，不得再输出[DICE]标记。' + guardrailHint;
        }
        return playerText + '\n\n【检定裁定】本轮无需检定。请直接叙述行动反馈，不得输出[DICE]标记。原因=' + (rollContext.judgment?.reason || '行动无需随机性判定') + '。' + guardrailHint;
    },

    handleMeaninglessInput(text) {
        const trimmed = text.trim();
        const meaninglessPatterns = [
            /^[嗯呃啊哦唔]{1,3}[。.！!？?]*$/,
            /^(我想想|让我想想|等一下|稍等|嗯…|呃…)[。.！!？?]*/,
            /^(好像不太对|总觉得不对|有点奇怪|不太对劲)[。.！!？?]*/,
            /^(继续|然后呢|接下来)[。.！!？?]*$/,
            /^(好的|好|行|可以|嗯嗯)[。.！!？?]*$/
        ];

        const isMeaningless = meaninglessPatterns.some(p => p.test(trimmed));

        if (!isMeaningless) return null;

        const type = this.classifyMeaninglessInput(trimmed);

        if (type === 'hesitation') {
            if (typeof Story !== 'undefined' && Story.state.gameTime) {
                Story.advanceTime(5);
            }
        }

        if (type === 'thinking') {
            var clues = (typeof Story !== 'undefined' && Story.state.clues) ? Story.state.clues : (this.gameState.story?.clues || []);
            if (clues.length > 0) {
                this.gameState._meaninglessHint = `当前已知线索：${clues.join('、')}`;
            }
        }

        if (type === 'intuition') {
            if (typeof COCRules !== 'undefined' && this.gameState.character) {
                var storyClues = (typeof Story !== 'undefined' && Story.state.clues) ? Story.state.clues : (this.gameState.story?.clues || []);
                if (storyClues.length > 0) {
                    var check = COCRules.performHiddenCheck(this.gameState.character, '侦查');
                    if (check && check.narrative) {
                        this.gameState._pendingHiddenChecks = this.gameState._pendingHiddenChecks || [];
                        this.gameState._pendingHiddenChecks.push({
                            skill: check.skillName,
                            result: check.result,
                            successLevel: check.successLevel,
                            narrative: check.narrative
                        });
                    }
                }
            }
        }

        if ((this.gameState._meaninglessCount || 0) >= 2) {
            this.gameState._meaninglessExtraHint = '连续两次无明确行动。请尝试更具体的行动描述，如"搜索房间""与NPC交谈""前往某地"。';
        }

        return type;
    },

    classifyMeaninglessInput(text) {
        if (/^[嗯呃啊哦唔]{1,3}/.test(text)) return 'hesitation';
        if (/想|想想|等/.test(text)) return 'thinking';
        if (/不对|奇怪|不对劲/.test(text)) return 'intuition';
        if (/继续|然后|接下来/.test(text)) return 'continuation';
        return 'acknowledgment';
    },

    async generateIntroNarrative() {
        if (!this.gameState.character) return;
        if (!API.config.apiKey) {
            Terminal.printSystem('请先配置 API Key 后再生成导入叙事。');
            return;
        }

        var char = this.gameState.character;
        var introPrompt = '请为我的角色生成导入叙事。角色详细信息：';
        introPrompt += '姓名：' + (char.name || '未知') + '，';
        introPrompt += '职业：' + (char.occupation || '未知') + '，';
        introPrompt += '年龄：' + (char.age || '未知') + '，';
        introPrompt += '社会阶层：' + API.getCharSocialTier(char) + '，';
        introPrompt += '信用评级：' + (char.skills && char.skills['信用评级'] || 0) + '。';
        if (char.cherished) introPrompt += ' 珍爱之物：' + char.cherished + '。';
        if (char.connections) introPrompt += ' 关键连接：' + char.connections + '。';
        if (char.background) introPrompt += ' 背景故事：' + char.background + '。';
        if (char.fears) introPrompt += ' 恐惧与创伤：' + char.fears + '。';
        if (char.occupation && char.occupation !== '未知') {
            introPrompt += ' 请在导入叙事中用一个体现' + char.occupation + '职业特征的日常场景作为开场。';
        }
        if (char.connections && char.connections !== '无') {
            introPrompt += ' 请通过角色与"' + char.connections + '"的关系来引入异常事件。';
        }

        this._lastPlayerInput = introPrompt;

        Terminal.setProcessing(true);
        Terminal.showLoading();

        try {
            const result = await API.sendMessage(introPrompt, this.gameState);

            Terminal.hideLoading();

            if (result.error) {
                Terminal.printError(result.error);
                Terminal.setProcessing(false);
                return;
            }

            if (result.stream) {
                let fullText = '';
                let currentDiv = null;

                await API.processStream(
                    result.stream,
                    (chunk) => {
                        fullText += chunk;
                        if (!currentDiv) {
                            currentDiv = document.createElement('div');
                            currentDiv.className = 'message kp';
                            Terminal.outputEl.appendChild(currentDiv);
                        }
                        currentDiv.textContent = this.stripDiceMarkers(fullText);
                        Terminal.scrollToBottom();
                    },
                    (complete) => {
                        var displayText = this.stripDiceMarkers(complete, true);
                        if (currentDiv) {
                            currentDiv.innerHTML = Terminal.formatKPText(displayText);
                        }
                        Terminal._addChatLog('kp', this.stripDiceMarkers(complete));
                        this.gameState.isIntroNarrative = false;

                        if (typeof Story !== 'undefined' && !Story.state.modName) {
                            Terminal.printSystem('导入叙事完成。输入 /start 开始预设模组《暗夜呢喃》，或直接输入行动开始自由冒险。');
                        } else {
                            Terminal.printSystem('冒险已经开始。输入你的行动吧。');
                        }

                        Terminal.setProcessing(false);
                        this.autoSave();
                    }
                );
            }
        } catch (e) {
            Terminal.hideLoading();
            Terminal.printError(`叙事生成错误：${e.message}`);
            Terminal.setProcessing(false);
        }
    },

    processAIResponse(text, options) {
        options = options || {};
        if (this.gameState.isIntroNarrative) {
            this.gameState.isIntroNarrative = false;

            if (typeof Story !== 'undefined' && !Story.state.modName) {
                Terminal.printSystem('导入叙事完成。输入 /start 或「开始进入暗夜呢喃」开始预设模组，或直接输入行动开始自由冒险。');
            } else {
                Terminal.printSystem('冒险已经开始。输入你的行动吧。');
            }
        }

        var diceCheck = this._detectDicePremature(text);
        if (diceCheck.hasPremature) {
            this.gameState._prematureText = text;
            this.gameState._prematureTruncation = diceCheck;
        }

        this.processDiceMarkers(text, { autoContinue: true });
        this.processClueMarkers(text);
        this.processStageMarkers(text);
        if (typeof API !== 'undefined' && API.amendDebugLogPostState) API.amendDebugLogPostState();

        if (typeof KPNotebook !== 'undefined' && KPNotebook.data) {
            var notebookUpdate = KPNotebook.parseUpdateBlock(text);
            if (notebookUpdate) {
                KPNotebook.applyUpdate(notebookUpdate);
            }
        }

        this.gameState._pendingHiddenChecks = [];
        this.gameState._lastTriggeredSkills = [];

        if (typeof Character !== 'undefined' && Character.extractStateFromAIResponse) {
            Character.extractStateFromAIResponse(text);
        }

        if (typeof Character !== 'undefined' && Character.persistentState && Character.persistentState.appearanceState) {
            var appState = Character.persistentState.appearanceState;
            if (typeof KPNotebook !== 'undefined' && KPNotebook.data && KPNotebook.data.partitions) {
                for (var cat in appState) {
                    var existing = KPNotebook.data.partitions.appearance.find(function(e) { return e.key === '调查员-' + cat; });
                    if (existing) {
                        existing.value = appState[cat].value;
                        existing.note = appState[cat].note || '';
                        existing.updatedAt = appState[cat].updatedAt || '';
                    } else {
                        KPNotebook.data.partitions.appearance.push({
                            key: '调查员-' + cat,
                            value: appState[cat].value,
                            note: appState[cat].note || '',
                            updatedAt: appState[cat].updatedAt || ''
                        });
                    }
                }
                KPNotebook.save();
            }
        }

        if (typeof MemorySystem !== 'undefined' && MemorySystem.layers.state && this.gameState.character) {
            MemorySystem.updateInvestigatorState(this.gameState.character);
        }

        this.detectStoryStagnation(text);

        var hasDiceInterruption = /\[DICE:(OPEN|HIDDEN)\|/.test(text);
        var storyEnded = typeof Story !== 'undefined' && !!Story.state.ended;
        if (Terminal.quickMode && !this.gameState.isIntroNarrative && !hasDiceInterruption && !storyEnded) {
            var quickOptions = this._extractQuickOptions(text);
            if (this._isRainStationDemo()) {
                quickOptions = this._sanitizeRainStationQuickOptions(quickOptions, text);
            }
            if (quickOptions) {
                Terminal.renderQuickOptions(quickOptions);
            } else {
                var fallbackOptions = this._generateFallbackQuickOptions(text);
                if (this._isRainStationDemo()) {
                    fallbackOptions = this._getRainStationQuickOptions();
                }
                Terminal.renderQuickOptions(fallbackOptions);
            }
        }

        if (typeof Story !== 'undefined' && !options.skipActionTime) {
            const actionResult = Story.processAction(this._lastPlayerInput || '');
            Story.updateOfficialNotesAuto();
            this.updateStatusBar();
            this.updateSidebar();
        } else if (typeof Story !== 'undefined') {
            Story.updateOfficialNotesAuto();
            this.updateStatusBar();
            this.updateSidebar();
        }

        this.autoSave();
        this.checkAutoImageGeneration(text);
    },

    CG_TRIGGER_PATTERNS: [
        /首次遭遇|初次遭遇|神话生物|旧日支配者|外神|古神/i,
        /巨大的.*出现在|黑暗中.*浮现|恐怖的.*身影/i,
        /建筑.*崩塌|爆炸|大火|风暴|地震/i,
        /仪式.*完成|召唤.*成功|传送门.*打开/i,
        /深渊|异次元|另一个世界|幻境/i
    ],

    NPC_TRIGGER_PATTERNS: [
        /「([^」]{2,10})」[：:]/g,
        /([^\s]{2,8})(先生|女士|教授|博士|神父|牧师|警长|探员|医生|上校)/g
    ],

    checkAutoImageGeneration(text) {
        var config = Settings.currentConfig ? Settings.currentConfig.image_api : null;
        if (!config || !config.api_key) return;
        if (typeof ImageGenerator === 'undefined') return;

        if (config.auto_gen_cg) {
            var shouldGenCG = this.CG_TRIGGER_PATTERNS.some(function (p) { return p.test(text); });
            if (shouldGenCG) {
                var plainText = text.replace(/\[.*?\]/g, '').replace(/\*\*/g, '').substring(0, 200);
                Terminal.handleImageCommand(['--cg', plainText]);
            }
        }

        if (config.auto_gen_npc) {
            var npcNames = [];
            var npcPattern1 = /「([^」]{2,10})」[：:]/g;
            var m;
            while ((m = npcPattern1.exec(text)) !== null) {
                npcNames.push(m[1]);
            }
            var npcPattern2 = /([^\s「」]{2,8})(先生|女士|教授|博士|神父|牧师|警长|探员|医生|上校)/g;
            while ((m = npcPattern2.exec(text)) !== null) {
                npcNames.push(m[1] + m[2]);
            }
            var uniqueNPCs = [...new Set(npcNames)].slice(0, 1);
            uniqueNPCs.forEach(function (name) {
                if (typeof NPCManager !== 'undefined' && NPCManager.hasPortrait(name)) return;
                Terminal.handleImageCommand(['--npc', name]);
            });
        }
    },

    _sceneHistory: [],
    _stagnationCount: 0,
    _lastSceneSignature: '',

    detectStoryStagnation(text) {
        var signature = this._generateSceneSignature(text);

        if (signature === this._lastSceneSignature && signature.length > 10) {
            this._stagnationCount++;
        } else {
            this._stagnationCount = 0;
        }

        this._lastSceneSignature = signature;

        if (this._stagnationCount >= 3) {
            this._injectStagnationBreaker();
            this._stagnationCount = 0;
        }
    },

    _generateSceneSignature(text) {
        var cleaned = text.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
        var sentences = cleaned.split(/[。！？\n]/).filter(function (s) { return s.trim().length > 5; });
        if (sentences.length < 2) return '';
        var firstPart = sentences.slice(0, 2).map(function (s) {
            return s.trim().substring(0, 25);
        }).join('|');
        var lastPart = sentences.slice(-2).map(function (s) {
            return s.trim().substring(0, 25);
        }).join('|');
        return firstPart + '||' + lastPart;
    },

    _injectStagnationBreaker() {
        var breakers = [
            '【系统提示】玩家在同一场景停滞过久，请在下一条回复中通过以下方式之一推动剧情：NPC主动提供新信息、环境发生意外变化、时间压力加剧、新的威胁出现。不要重复之前的描写。',
            '【系统提示】剧情陷入循环，请确保下一条叙事推进至少一个维度（信息/关系/环境/危机），避免重复描述相同的环境细节。',
            '【系统提示】检测到叙事停滞。请引入一个意外事件或NPC行动来打破当前僵局，推动故事向前发展。'
        ];

        var breaker = breakers[Math.floor(Math.random() * breakers.length)];

        if (typeof API !== 'undefined') {
            API.conversationHistory.push({
                role: 'system',
                content: breaker
            });
        }
    },

    FORCE_HIDDEN_SKILLS: ['心理学', '潜行', '乔装', '追踪', '聆听'],

    parseDiceMarkers(text) {
        var markers = { openDice: [], hiddenDice: [], combatStart: null, combatDodge: null, npcDamage: [], npcJoin: [], npcLeave: [], timeAdvance: null };

        var openRegex = /\[DICE:OPEN\|([^|]+)\|(\d+)\|([^|\]]+)(?:\|([^\]]+))?\]/g;
        var match;
        while ((match = openRegex.exec(text)) !== null) {
            var skillName = match[1].trim();
            var bonusDice = 0;
            var penaltyDice = 0;
            var extraPart = match[4] ? match[4].trim() : '';
            var bonusMatch = extraPart.match(/\+(\d+)B/i);
            var penaltyMatch = extraPart.match(/\+(\d+)P/i);
            if (bonusMatch) bonusDice = parseInt(bonusMatch[1]);
            if (penaltyMatch) penaltyDice = parseInt(penaltyMatch[1]);

            if (skillName === 'SAN') {
                markers.openDice.push({ skill: skillName, target: parseInt(match[2]), sanLoss: match[3].trim(), difficulty: '普通', bonusDice: bonusDice, penaltyDice: penaltyDice });
            } else if (this.FORCE_HIDDEN_SKILLS.includes(skillName)) {
                console.warn('[DICE] 技能 ' + skillName + ' 应为暗骰，已自动转为暗骰');
                markers.hiddenDice.push({ skill: skillName, target: parseInt(match[2]), bonusDice: bonusDice, penaltyDice: penaltyDice });
            } else {
                markers.openDice.push({ skill: skillName, target: parseInt(match[2]), difficulty: match[3].trim(), bonusDice: bonusDice, penaltyDice: penaltyDice });
            }
        }

        var hiddenRegex = /\[DICE:HIDDEN\|([^|]+)\|(\d+)(?:\|([^\]]+))?\]/g;
        while ((match = hiddenRegex.exec(text)) !== null) {
            var hBonusDice = 0;
            var hPenaltyDice = 0;
            var hExtraPart = match[3] ? match[3].trim() : '';
            var hBonusMatch = hExtraPart.match(/\+(\d+)B/i);
            var hPenaltyMatch = hExtraPart.match(/\+(\d+)P/i);
            if (hBonusMatch) hBonusDice = parseInt(hBonusMatch[1]);
            if (hPenaltyMatch) hPenaltyDice = parseInt(hPenaltyMatch[1]);

            markers.hiddenDice.push({ skill: match[1].trim(), target: parseInt(match[2]), bonusDice: hBonusDice, penaltyDice: hPenaltyDice });
        }

        var combatRegex = /\[COMBAT:START\|([^\]]+)\]/;
        var combatMatch = text.match(combatRegex);
        if (combatMatch) {
            markers.combatStart = combatMatch[1];
        }

        var dodgeRegex = /\[COMBAT:DODGE\|([^|]+)\|(\d+)\]/;
        var dodgeMatch = text.match(dodgeRegex);
        if (dodgeMatch) {
            markers.combatDodge = { enemy: dodgeMatch[1], dodgeValue: parseInt(dodgeMatch[2]) };
        }

        var spellRegex = /\[SPELL:([^|]+)\|(\d+)\]/;
        var spellMatch = text.match(spellRegex);
        if (spellMatch) {
            markers.spellCast = { name: spellMatch[1].trim(), mpCost: parseInt(spellMatch[2]) };
        }

        var npcDmgRegex = /\[NPC:DMG\|([^|]+)\|(\d+)\]/g;
        while ((match = npcDmgRegex.exec(text)) !== null) {
            markers.npcDamage.push({ name: match[1].trim(), damage: parseInt(match[2]) });
        }

        var npcJoinRegex = /\[NPC:JOIN\|([^|]+)\|([^|]+)\|(\d+)\|(\d+)\|(\d+)\]/g;
        while ((match = npcJoinRegex.exec(text)) !== null) {
            // demo白名单守门：私货NPC不得入队
            if (this._isRainStationDemo() && ['苏蔓', '老阚', '失声听众', '空白播音员'].indexOf(match[1].trim()) === -1) continue;
            markers.npcJoin.push({ name: match[1].trim(), type: match[2].trim(), hp: parseInt(match[3]), san: parseInt(match[4]), dex: parseInt(match[5]) });
        }

        var npcLeaveRegex = /\[NPC:LEAVE\|([^\]]+)\]/g;
        while ((match = npcLeaveRegex.exec(text)) !== null) {
            markers.npcLeave.push({ name: match[1].trim() });
        }

        var timeRegex = /\[TIME:(\d+)\]/;
        var timeMatch = text.match(timeRegex);
        if (timeMatch) {
            markers.timeAdvance = parseInt(timeMatch[1]);
        }

        return markers;
    },

    stripDiceMarkers(text, keepFx) {
        var result = text
            .replace(/\[DICE:OPEN\|[^|\]]+\|\d+\|[^|\]]+\]/g, '')
            .replace(/\[DICE:HIDDEN\|[^|\]]+\|\d+\]/g, '')
            .replace(/\[COMBAT:START\|[^\]]+\]/g, '')
            .replace(/\[COMBAT:DODGE\|[^|]+\|\d+\]/g, '')
            .replace(/\[SPELL:[^|]+\|\d+\]/g, '')
            .replace(/\[NPC:DMG\|[^|]+\|\d+\]/g, '')
            .replace(/\[NPC:JOIN\|[^|]+\|[^|]+\|\d+\|\d+\|\d+\]/g, '')
            .replace(/\[NPC:LEAVE\|[^\]]+\]/g, '')
            .replace(/\[TIME:\d+\]/g, '')
            .replace(/\[CLUE:[^\]]+\]/g, '')
            .replace(/\[ENDING:[^\]]+\]/g, '')
            .replace(/【\s*ENDING[^】]*】/gi, '')
            .replace(/\[STAGE_FLAG:[^\]]+\]/g, '')
            .replace(/\[STAGE_ADVANCE\]/g, '')
            .replace(/\[EVENT:[^\]]+\]/g, '')
            .replace(/\[GOAL:[^\]]+\]/g, '')
            .replace(/\[LOCATION:[^\]]+\]/g, '')
            .replace(/\[TRANSLATOR:[^\]]+\]/g, '')
            .replace(/\[MOOD:[^\]]+\]/g, '')
            .replace(/<kp_note_update>[\s\S]*?<\/kp_note_update>/g, '')
            .replace(/<kp_note_update>[\s\S]*$/g, '');
        if (!keepFx) {
            result = result
                .replace(/\[FX:(GLITCH|WHISPER|SHAKE|FADE|BLOOD|RUNE|DISTORT)\]/g, '')
                .replace(/\[\/FX\]/g, '');
        }
        if (typeof Terminal !== 'undefined' && Terminal.cleanKPText) {
            result = Terminal.cleanKPText(result);
        }
        result = this._injectGlossary(result);
        return result.trim();
    },

    // 时代名词首释：prompt规则10对低服从模型不兑现(2026.6.12 Milo第六轮#19)，引擎确定性兜底——
    // 首次出现时追加括号短释，且仅当KP自己没有就地解释时(同句已含"——"或括号解释则跳过)
    GLOSSARY: {
        '蜡筒': '一种蜡质滚筒，留声机用它录音和放音',
        '工部局': '租界的市政管理机构',
        '蜡筒留声机': '用蜡质滚筒录放声音的老式留声机'
    },

    _injectGlossary(text) {
        if (!text || typeof Story === 'undefined' || !Story.state) return text;
        if (!Story.state._glossarySeen) Story.state._glossarySeen = {};
        var seen = Story.state._glossarySeen;
        // 长词优先，防止"蜡筒留声机"被"蜡筒"截胡
        var terms = Object.keys(this.GLOSSARY).sort(function(a, b) { return b.length - a.length; });
        for (var i = 0; i < terms.length; i++) {
            var term = terms[i];
            if (seen[term]) continue;
            var idx = text.indexOf(term);
            if (idx === -1) continue;
            seen[term] = true;
            // KP已就地解释(命中处后紧跟破折号或括号)则不重复
            var after = text.slice(idx + term.length, idx + term.length + 2);
            if (/^[（(—-]/.test(after)) continue;
            text = text.slice(0, idx + term.length) + '（' + this.GLOSSARY[term] + '）' + text.slice(idx + term.length);
        }
        return text;
    },

    VAGUE_INTENT_PATTERNS: [
        /^(我在?找|找找|看看|到处看看|四处看看|随便看看|随便翻翻|翻翻|逛逛|转转)/,
        /^(我想|我要|能不能|可不可以)/,
        /^(你好|谢谢|再见|请问|不好意思|打扰了)/,
        /^(等等|等一下|先|停)/,
        /^(观察|看看|瞧瞧|瞅瞅)$/
    ],

    SPECIFIC_INTENT_PATTERNS: [
        /(搜查|搜索|翻找|检查|查看|翻阅|搜索)(.{2,})/,
        /(撬|开锁|解锁|打开)(.{2,})/,
        /(说服|恐吓|威胁|劝|套话|质问|逼问)(.{2,})/,
        /(攀爬|翻越|跳|爬)(.{2,})/,
        /(急救|治疗|包扎|止血)(.{2,})/,
        /(修理|修复|操作|启动)(.{2,})/,
        /(读|研究|查阅|翻阅|调查)(.{2,})/,
        /(攻击|打|开枪|射击|挥|刺|踢)(.{2,})/,
        /(躲|藏|潜行|偷溜|悄悄)(.{2,})/,
        /(追踪|跟踪|尾随)(.{2,})/,
        /(聆听|仔细听|竖起耳朵)(.{2,})/
    ],

    _extractQuickOptions(text) {
        if (!text) return null;

        var lines = text.split('\n');
        var optionLines = [];
        var foundStart = false;

        for (var i = lines.length - 1; i >= 0; i--) {
            var line = lines[i].trim();
            if (/^[A-D][.．、)\s]/i.test(line)) {
                optionLines.unshift(line);
                foundStart = true;
            } else if (foundStart) {
                break;
            }
        }

        if (optionLines.length < 3) {
            var optionRegex = /[A-D][.．、]\s*[^\n]+/gi;
            var allMatches = text.match(optionRegex);
            if (allMatches && allMatches.length >= 3) {
                var lastIdx = -1;
                for (var mi = allMatches.length - 1; mi >= 2; mi--) {
                    if (/^D[.．、]/i.test(allMatches[mi]) || /^C[.．、]/i.test(allMatches[mi])) {
                        lastIdx = mi - 2;
                        break;
                    }
                }
                if (lastIdx >= 0) {
                    optionLines = allMatches.slice(lastIdx, lastIdx + 4);
                } else {
                    optionLines = allMatches.slice(-4);
                }
            }
        }

        if (optionLines.length >= 3) {
            var hasD = optionLines.some(function(l) { return /^D[.．、]/i.test(l.trim()); });
            if (!hasD) {
                optionLines.push('D. 其他（自行输入）');
            }
            return optionLines.join('\n');
        }

        return null;
    },

    _isRainStationDemo() {
        return !!(this.gameState && this.gameState.isTutorialDemo && this.gameState.tutorialId === 'rain-station-demo');
    },

    _sanitizeRainStationQuickOptions(optionsText, narrationText) {
        var fallback = this._getRainStationQuickOptions();
        var fallbackLines = fallback.split('\n');
        if (!optionsText) return fallback;

        // 逐条过滤：只替换踩线的单条选项，保留模型给出的合规选项（整组替换会导致按钮永远是固定兜底=鬼打墙）
        var forbidden = /(供电局|电费|账单|线路档案|苏家|苏蔓家人|住处|巡捕房|无关线人|监视者|跟踪者|制定战术|战术方案|寻找武器|搜索武器|武器装备|召集帮手|埋伏|陷阱|武器库|码头|找船|船夫|新同伴|新反派|幕后人|主要NPC|怀表|锁匠|锁铺|寻人启事|调音室|面摊|拍下|相机拍)/;
        var stageName = this._getCurrentStageName();
        var stageForbidden = null;
        if (/核实死亡预告/.test(stageName)) {
            stageForbidden = /(离开档案室|去电台|寂声电台|霞飞路|播音室|发射机房|失声听众|老阚)/;
        } else if (/取得第一条实证线索/.test(stageName)) {
            // 收音机事件未发生前，选项不得指向苏蔓尚未吐露的秘密
            var flags = (typeof Story !== 'undefined' && Story.state.stageFlags) || {};
            if (!flags.demo_radio_event_done) {
                stageForbidden = /(昨夜|昨晚|她也听|苏蔓听到|午夜后失声)/;
            }
        } else if (/抵达寂声电台外围/.test(stageName)) {
            stageForbidden = /(播音室|发射机房|失声听众|稿纸|空白播音员)/;
        }

        var lines = optionsText.split('\n').filter(function(line) { return line.trim(); });
        var normalized = [];
        for (var i = 0; i < lines.length && normalized.length < 4; i++) {
            var line = lines[i].trim();
            if (/^D[.．、)]/i.test(line)) {
                normalized.push('D. 其他（自行输入）');
            } else if (forbidden.test(line) || (stageForbidden && stageForbidden.test(line))) {
                var slot = fallbackLines[normalized.length] || fallbackLines[0];
                if (normalized.indexOf(slot) === -1) normalized.push(slot);
            } else {
                normalized.push(line);
            }
        }
        for (var fi = 0; normalized.length < 4 && fi < fallbackLines.length; fi++) {
            if (normalized.indexOf(fallbackLines[fi]) === -1) normalized.push(fallbackLines[fi]);
        }
        if (!normalized.some(function(line) { return /^D[.．、)]/i.test(line); })) {
            normalized[3] = 'D. 其他（自行输入）';
        }
        return normalized.slice(0, 4).join('\n');
    },

    _getCurrentStageName() {
        if (typeof Story !== 'undefined' && Story.getCurrentStage) {
            var stage = Story.getCurrentStage();
            if (stage && stage.name) return stage.name;
        }
        return (this.gameState && this.gameState.story && this.gameState.story.chapter) || '';
    },

    _getRainStationQuickOptions() {
        var stageName = this._getCurrentStageName();
        if (/核实死亡预告/.test(stageName)) {
            return 'A. 检查蜡筒和留声机\nB. 询问苏蔓的看法\nC. 翻阅调查资料\nD. 其他（自行输入）';
        }
        if (/取得第一条实证线索/.test(stageName)) {
            return 'A. 检查角落收音机\nB. 和苏蔓商量下一步\nC. 现在去寂声电台\nD. 其他（自行输入）';
        }
        if (/抵达寂声电台外围/.test(stageName)) {
            // 老阚/保险丝兜底只在地点确已同步到电台时启用，否则给出发导向选项（防止人在档案室冒出电台选项）
            var atStation = typeof Story !== 'undefined' && Story.state.currentLocation === '寂声电台';
            if (atStation) {
                return 'A. 查看湿脚印\nB. 询问老阚\nC. 检查保险丝盒\nD. 其他（自行输入）';
            }
            return 'A. 立刻前往寂声电台\nB. 和苏蔓一起出发\nC. 路上留意身后动静\nD. 其他（自行输入）';
        }
        if (/完成一次短战斗轮/.test(stageName)) {
            // 战斗选项只在战斗实际进行中给；已倒地/已结束时给探索选项
            // (2026.6.12 Milo第六轮#21：听众已倒地，stage未推进，兜底仍回卷战斗选项)
            var combatLive = this.gameState && this.gameState.combat && this.gameState.combat.active;
            if (combatLive) {
                return 'A. 闪避失声听众\nB. 推开它撤退\nC. 保护苏蔓\nD. 其他（自行输入）';
            }
            return 'A. 检查播音室\nB. 查看发射机房\nC. 和苏蔓确认下一步\nD. 其他（自行输入）';
        }
        if (/完成最终抉择/.test(stageName)) {
            return 'A. 切断发射机\nB. 改写播音稿\nC. 回答播音员\nD. 其他（自行输入）';
        }
        return 'A. 检查蜡筒和留声机\nB. 询问苏蔓的看法\nC. 翻阅调查资料\nD. 其他（自行输入）';
    },

    _generateFallbackQuickOptions(text) {
        if (this._isRainStationDemo()) {
            return this._getRainStationQuickOptions();
        }

        var char = this.gameState.character;
        var occupation = char ? (char.occupation || '') : '';
        var hasNPC = /「[^」]{2,10}」[：:]/.test(text) || /[^\s]{2,8}(先生|女士|教授|博士|神父|牧师|警长|探员|医生|上校)/.test(text);
        var hasDanger = /危险|恐怖|黑暗|尖叫|血|尸体|怪物|阴影/.test(text);
        var hasClue = /线索|发现|秘密|隐藏|日记|信件|钥匙|地图/.test(text);
        var hasDoor = /门|走廊|楼梯|房间|通道/.test(text);

        var optionA = '仔细观察周围环境';
        var optionB = '与在场的人交谈';
        var optionC = '保持警惕，谨慎行动';

        if (hasDanger) {
            optionA = '准备逃跑或寻找掩护';
            optionB = '鼓起勇气面对恐惧';
            optionC = '寻找隐藏的出路';
        } else if (hasClue) {
            optionA = '仔细检查发现的线索';
            optionB = '尝试解读线索的含义';
            optionC = '将线索收好，继续探索';
        } else if (hasDoor) {
            optionA = '打开门进去看看';
            optionB = '先仔细听门后的动静';
            optionC = '寻找其他入口';
        } else if (hasNPC) {
            optionA = '直接上前搭话';
            optionB = '先观察对方的行为';
            optionC = '悄悄绕开对方';
        }

        if (occupation) {
            var occMap = {
                '侦探': ['调查可疑之处', '分析人物动机', '设下陷阱引蛇出洞'],
                '医生': ['检查是否有伤者', '分析症状与病因', '寻找医疗用品'],
                '记者': ['记录关键信息', '采访在场人员', '寻找独家新闻线索'],
                '警察': ['控制现场秩序', '盘问可疑人员', '搜查犯罪证据'],
                '学者': ['研究文献资料', '分析超自然现象', '寻找学术解释'],
                '军人': ['警戒四周', '制定战术方案', '搜索武器装备'],
                '艺术家': ['用直觉感受环境', '描绘所见所闻', '寻找灵感来源'],
                '神职人员': ['祈祷寻求庇护', '驱散邪恶气息', '安抚受惊的人']
            };
            for (var key in occMap) {
                if (occupation.indexOf(key) !== -1) {
                    optionA = occMap[key][0];
                    optionB = occMap[key][1];
                    optionC = occMap[key][2];
                    break;
                }
            }
        }

        return 'A. ' + optionA + '\nB. ' + optionB + '\nC. ' + optionC + '\nD. 其他（自行输入）';
    },

    _detectDicePremature(text) {
        var diceMarkerRegex = /\[DICE:(OPEN|HIDDEN)\|/;
        var match = diceMarkerRegex.exec(text);
        if (!match) return { hasPremature: false };

        var markerPos = match.index;
        var beforeMarker = text.substring(0, markerPos);

        var prematurePatterns = [
            /(?:成功|失败|通过了?|未通过|检定成功|检定失败|大成功|大失败|极难成功|困难成功|普通成功)/,
            /(?:发现了?|找到了?|看到了?|察觉到|注意到|没发现|没找到|什么也没)/,
            /(?:锁开了?|门开|撬开|没撬开|锁没开)/,
            /(?:说服了?|说服成功|说服失败|对方同意|对方拒绝)/,
            /(?:躲过了?|没被发现|被发现|潜行成功|潜行失败)/
        ];

        var hasPremature = false;
        var prematureEnd = markerPos;
        for (var i = 0; i < prematurePatterns.length; i++) {
            var pMatch = prematurePatterns[i].exec(beforeMarker);
            if (pMatch) {
                hasPremature = true;
                var sentenceEnd = beforeMarker.lastIndexOf('。', pMatch.index);
                var lineEnd = beforeMarker.lastIndexOf('\n', pMatch.index);
                var cutPoint = Math.max(sentenceEnd, lineEnd, 0);
                prematureEnd = cutPoint;
                break;
            }
        }

        return {
            hasPremature: hasPremature,
            markerPos: markerPos,
            prematureEnd: prematureEnd,
            safeText: hasPremature ? text.substring(0, prematureEnd + 1) : text
        };
    },

    async _requestContinuation(prompt) {
        if (!API.config.apiKey) return;
        Terminal.printSystem('⏳ 检定结果已出，正在续写叙事...');

        try {
            var result = await API.sendMessage(prompt, this.gameState);
            if (result.error) {
                Terminal.printError('续写失败：' + result.error);
                return;
            }
            if (result.stream) {
                var fullText = '';
                var currentDiv = null;
                await API.processStream(
                    result.stream,
                    function(chunk) {
                        fullText += chunk;
                        if (!currentDiv) {
                            currentDiv = document.createElement('div');
                            currentDiv.className = 'message kp continuation';
                            Terminal.outputEl.appendChild(currentDiv);
                        }
                        currentDiv.textContent = fullText;
                        Terminal.scrollToBottom();
                    },
                    function(complete) {
                        var displayText = Main.stripDiceMarkers(complete, true);
                        if (currentDiv) {
                            currentDiv.innerHTML = Terminal.formatKPText(displayText);
                        }
                        Terminal._addChatLog('kp', Main.stripDiceMarkers(complete));
                        Main.processAIResponse(complete, { skipActionTime: true });
                        Terminal.setProcessing(false);
                        Main.autoSave();
                    }
                );
            }
        } catch (e) {
            Terminal.printError('续写错误：' + e.message);
            Terminal.setProcessing(false);
        }
    },

    analyzePlayerIntent(input) {
        if (!input || typeof input !== 'string') return { isVague: false, isSpecific: false, intentType: null };

        var trimmed = input.trim();

        for (var i = 0; i < this.VAGUE_INTENT_PATTERNS.length; i++) {
            if (this.VAGUE_INTENT_PATTERNS[i].test(trimmed)) {
                for (var j = 0; j < this.SPECIFIC_INTENT_PATTERNS.length; j++) {
                    if (this.SPECIFIC_INTENT_PATTERNS[j].test(trimmed)) {
                        return { isVague: false, isSpecific: true, intentType: 'specific' };
                    }
                }
                return { isVague: true, isSpecific: false, intentType: 'vague' };
            }
        }

        for (var k = 0; k < this.SPECIFIC_INTENT_PATTERNS.length; k++) {
            if (this.SPECIFIC_INTENT_PATTERNS[k].test(trimmed)) {
                return { isVague: false, isSpecific: true, intentType: 'specific' };
            }
        }

        return { isVague: false, isSpecific: false, intentType: null };
    },

    filterDiceByIntent(markers, playerInput) {
        var intent = this.analyzePlayerIntent(playerInput);

        if (!intent.isVague) return markers;

        var filtered = {
            openDice: [],
            hiddenDice: markers.hiddenDice,
            combatStart: markers.combatStart,
            combatDodge: markers.combatDodge,
            spellCast: markers.spellCast,
            npcDamage: markers.npcDamage,
            npcJoin: markers.npcJoin,
            npcLeave: markers.npcLeave,
            timeAdvance: markers.timeAdvance
        };

        var vagueFilterSkills = ['侦查', '聆听', '心理学', '图书馆使用', '神秘学'];

        for (var i = 0; i < markers.openDice.length; i++) {
            var dice = markers.openDice[i];
            if (dice.skill === 'SAN') {
                filtered.openDice.push(dice);
            } else if (vagueFilterSkills.indexOf(dice.skill) !== -1) {
                // Vague intent can make the model over-trigger investigative checks.
            } else {
                filtered.openDice.push(dice);
            }
        }

        return filtered;
    },

    deduplicateWithCOCRules(markers) {
        var lastTriggered = this.gameState._lastTriggeredSkills || [];
        var pending = this.gameState._pendingHiddenChecks || [];
        var checkedSkills = {};

        pending.forEach(function (check) {
            checkedSkills[check.skill] = true;
        });
        lastTriggered.forEach(function (skill) {
            checkedSkills[skill] = true;
        });

        if (Object.keys(checkedSkills).length === 0) return markers;

        var filtered = {
            openDice: markers.openDice.filter(function (dice) {
                if (checkedSkills[dice.skill]) {
                    return false;
                }
                return true;
            }),
            hiddenDice: markers.hiddenDice.filter(function (dice) {
                if (checkedSkills[dice.skill]) {
                    return false;
                }
                return true;
            }),
            combatStart: markers.combatStart,
            combatDodge: markers.combatDodge,
            spellCast: markers.spellCast,
            npcDamage: markers.npcDamage,
            npcJoin: markers.npcJoin,
            npcLeave: markers.npcLeave,
            timeAdvance: markers.timeAdvance
        };

        return filtered;
    },

    async processDiceMarkers(text, options) {
        options = options || {};
        var shouldAutoContinue = options.autoContinue === true;
        var markers = this.parseDiceMarkers(text);

        // demo第一幕开场SAN已完成后，同幕内不得重复触发SAN（防"询问看法"又掷一次）
        if (this._isRainStationDemo() && typeof Story !== 'undefined' &&
            (Story.state.currentStageIndex || 0) === 0 && (Story.state.stageFlags || {}).demo_intro_san_done) {
            markers.openDice = markers.openDice.filter(function(d) { return d.skill !== 'SAN'; });
        }

        // 心理学明骰闸：凡 [DICE:OPEN|心理学|...] 一律按暗骰处理
        var psychologyOpen = [];
        var psychologyKept = [];
        markers.openDice.forEach(function(d) {
            if (d.skill === '心理学') {
                psychologyOpen.push(d);
            } else {
                psychologyKept.push(d);
            }
        });
        markers.openDice = psychologyKept;
        psychologyOpen.forEach(function(d) {
            markers.hiddenDice.push({ skill: d.skill, target: d.target, bonusDice: d.bonusDice || 0, penaltyDice: d.penaltyDice || 0 });
        });

        // 同轮内同技能的重复 DICE 标记只保留第一个
        var seenSkills = {};
        markers.openDice = markers.openDice.filter(function(d) {
            var key = d.skill;
            if (seenSkills[key]) return false;
            seenSkills[key] = true;
            return true;
        });
        markers.hiddenDice = markers.hiddenDice.filter(function(d) {
            var key = d.skill;
            if (seenSkills[key]) return false;
            seenSkills[key] = true;
            return true;
        });

        if (markers.combatStart && this._isRainStationDemo() && typeof Story !== 'undefined') {
            Story.state._combatStarted = true;
            Story.save();
        }

        if (markers.openDice.length === 0 && markers.hiddenDice.length === 0 && !markers.combatStart && !markers.combatDodge && !markers.spellCast && (!markers.npcDamage || markers.npcDamage.length === 0) && (!markers.npcJoin || markers.npcJoin.length === 0) && (!markers.npcLeave || markers.npcLeave.length === 0) && !markers.timeAdvance) {
            return;
        }

        markers = this.filterDiceByIntent(markers, this._lastPlayerInput || '');

        markers = this.deduplicateWithCOCRules(markers);

        if (typeof DiceSystem === 'undefined') return;

        var allResults = [];

        for (var i = 0; i < markers.openDice.length; i++) {
            var dice = markers.openDice[i];
            try {
                if (dice.skill === 'SAN') {
                    var sanResult = await this.handleSANCheck(dice);
                    if (sanResult) allResults.push(sanResult);
                } else {
                    var result = await DiceSystem.requestOpenRoll(dice.skill, dice.target, dice.difficulty, dice.penaltyDice || 0, dice.bonusDice || 0);
                    allResults.push(result);
                    if (typeof SoundSystem !== 'undefined') {
                        SoundSystem.playCheckResult(result.result);
                    }
                    this._trackUsedSkill(dice.skill);
                }
            } catch (e) {
                console.error('Open roll error:', e);
            }
        }

        for (var j = 0; j < markers.hiddenDice.length; j++) {
            var hdice = markers.hiddenDice[j];
            try {
                var hresult = await DiceSystem.requestHiddenRoll(hdice.skill, hdice.target, hdice.penaltyDice || 0, hdice.bonusDice || 0);
                allResults.push(hresult);
            } catch (e) {
                console.error('Hidden roll error:', e);
            }
        }

        if (markers.combatStart) {
            var initiativeList = markers.combatStart.split('|');
            this.gameState.combat = {
                active: true,
                round: 1,
                initiative: initiativeList,
                currentTurn: initiativeList[0] || null,
                pendingDodge: null,
                dodgeCountThisRound: 0
            };
            Terminal.printSystem('⚔️ 战斗开始！第1轮');
            Terminal.printSystem('📋 先攻顺序：' + initiativeList.join(' → '));
            if (typeof SoundSystem !== 'undefined') {
                SoundSystem.play('combat_start');
            }
        }

        if (markers.combatDodge) {
            this.gameState.combat.pendingDodge = markers.combatDodge;
            this.showDodgePrompt(markers.combatDodge);
        }

        if (markers.spellCast) {
            this.handleSpellCast(markers.spellCast);
        }

        if (markers.npcDamage && markers.npcDamage.length > 0 && typeof NPCManager !== 'undefined') {
            for (var n = 0; n < markers.npcDamage.length; n++) {
                var nd = markers.npcDamage[n];
                var targetNPC = NPCManager.companions.find(function(c) { return c.name === nd.name; }) || Object.values(NPCManager.allNPCs || {}).find(function(n) { return n.name === nd.name; });
                if (targetNPC) {
                    NPCManager.damageNPC(targetNPC.id, nd.damage);
                    Terminal.printSystem('💥 ' + nd.name + ' 受到 ' + nd.damage + ' 点伤害（HP:' + targetNPC.hp + '/' + targetNPC.hpMax + '）');
                }
            }
        }

        if (markers.npcJoin && markers.npcJoin.length > 0 && typeof NPCManager !== 'undefined') {
            for (var ji = 0; ji < markers.npcJoin.length; ji++) {
                var nj = markers.npcJoin[ji];
                if (this._isRainStationDemo && this._isRainStationDemo() && ['苏蔓', '老阚'].indexOf(nj.name) === -1) {
                    console.warn('Rain Station demo ignored unexpected NPC join:', nj.name);
                    continue;
                }
                var existingNPC = null;
                for (var eid in NPCManager.allNPCs) {
                    if (NPCManager.allNPCs[eid].name === nj.name) {
                        existingNPC = NPCManager.allNPCs[eid];
                        break;
                    }
                }
                if (existingNPC) {
                    if (NPCManager.addCompanion(existingNPC.id, true)) {
                        Terminal.printSystem('👥 ' + nj.name + ' 加入了队伍！');
                    } else {
                        Terminal.printSystem('⚠️ ' + nj.name + ' 无法加入队伍（队伍已满）');
                    }
                } else {
                    var newNPC = NPCManager.addNPC({
                        name: nj.name,
                        type: nj.type,
                        hp: nj.hp,
                        hpMax: nj.hp,
                        san: nj.san,
                        sanMax: 99,
                        dex: nj.dex,
                        str: 50,
                        app: 50
                    });
                    if (NPCManager.addCompanion(newNPC.id, true)) {
                        Terminal.printSystem('👥 ' + nj.name + ' 加入了队伍！');
                    } else {
                        Terminal.printSystem('⚠️ ' + nj.name + ' 无法加入队伍（队伍已满）');
                    }
                }
            }
        }

        if (markers.npcLeave && markers.npcLeave.length > 0 && typeof NPCManager !== 'undefined') {
            for (var li = 0; li < markers.npcLeave.length; li++) {
                var nl = markers.npcLeave[li];
                var leaveNPC = NPCManager.companions.find(function(c) { return c.name === nl.name; });
                if (leaveNPC) {
                    NPCManager.removeFromCompanions(leaveNPC.id);
                    Terminal.printSystem('👋 ' + nl.name + ' 离开了队伍');
                }
            }
        }

        if (markers.timeAdvance && typeof Story !== 'undefined' && Story.state.gameTime) {
            var timeAdvance = markers.timeAdvance;
            if (this._isRainStationDemo && this._isRainStationDemo()) {
                timeAdvance = Math.min(timeAdvance, 10);
            }
            Story.advanceTime(timeAdvance);
            Terminal.printSystem('⏰ 时间流逝 — 当前：' + Utils.formatTime(Story.state.gameTime));
        }

        if (allResults.length > 0) {
            var resultSummary = allResults.map(function (r) {
                if (r.isHidden) {
                    return '[暗骰] ' + r.skillName + '：检定完成（结果已融入叙事）';
                }
                var levelNames = { critical: '大成功', success: r.successLevel === 3 ? '极难成功' : r.successLevel === 2 ? '困难成功' : '普通成功', failure: '失败', fumble: '大失败' };
                return r.skillName + '：' + r.roll + '/' + r.targetValue + ' → ' + (levelNames[r.result] || r.result);
            }).join(' | ');

            if (typeof API !== 'undefined') {
                API.conversationHistory.push({
                    role: 'system',
                    content: '骰子检定结果：' + resultSummary
                });
            }

            if (!shouldAutoContinue) {
                return;
            }

            // 两段式投骰：检定轮不直接给结果；骰子完成后按玩家原始行动续写。
            if (this.gameState._prematureText && this.gameState._prematureTruncation) {
                var truncInfo = this.gameState._prematureTruncation;
                var originalAction = this._lastPlayerInput || '';
                var continuationPrompt = '【系统指令】你之前在检定标记前提前写了检定结果，这违反了规则。玩家刚才的原始行动是：“' + originalAction + '”。现在真实骰子结果已出：' + resultSummary + '。请严格围绕这个原始行动续写检定后的叙事，不要改写成其他选项或其他行动。只写检定结果之后的后续叙事，不要重复之前的场景描写，不要再次使用[DICE]标记。';
                this._requestContinuation(continuationPrompt);
                this.gameState._prematureText = null;
                this.gameState._prematureTruncation = null;
            } else {
                var actionText = this._lastPlayerInput || '';
                var currentStageName = (typeof Story !== 'undefined' && Story.getCurrentStage && Story.getCurrentStage()) ? Story.getCurrentStage().name : '';
                var prompt = '【系统指令】玩家刚才的行动因为需要检定而暂停。玩家原始行动是：“' + actionText + '”。当前阶段：' + currentStageName + '。骰子检定结果：' + resultSummary + '。请严格围绕玩家原始行动续写检定后的叙事，不要改写成其他选项或其他行动，不要再次使用[DICE]标记。';
                this._requestContinuation(prompt);
            }
        }
    },

    processClueMarkers(text) {
        var clueRegex = /\[CLUE:([^\]]+)\]/g;
        var match;
        var newClues = [];
        while ((match = clueRegex.exec(text)) !== null) {
            var clueText = match[1].trim();
            if (clueText && newClues.indexOf(clueText) === -1) {
                newClues.push(clueText);
            }
        }
        if (newClues.length === 0) return;

        if (typeof Story !== 'undefined') {
            newClues.forEach(function(clue) {
                Story.addClue(clue);
            });
        }

        // Story.addClue 已负责同步到 Main.gameState.story.clues，此处不再重复

        this.updateSidebar();

        if (newClues.length === 1) {
            Terminal.printSystem('🔍 发现新线索：' + newClues[0]);
        } else {
            Terminal.printSystem('🔍 发现' + newClues.length + '条新线索！');
        }
    },

    // demo幕推进意图门：第二幕→第三幕要"出发去电台"，第三幕→第四幕要"进入电台内部"
    _demoTravelIntent(input) {
        return /(去|前往|出发|动身|赶往|赶到|走向|走到|奔向|进)[^\n]{0,12}(寂声电台|电台|霞飞路)|现在就去|立刻去|马上去|出发/.test(input || '');
    },

    _demoEnterIntent(input) {
        return /(进入|走进|推门|进门|进去|踏进|踏入|跨进)|(打开|拉开|推开)[^\n]{0,8}门/.test(input || '');
    },

    processStageMarkers(text) {
        if (typeof Story === 'undefined') return;

        // demo房间级到访追踪：KP常忘[LOCATION:]标记，引擎从叙事(非选项行)直接记账，
        // 供每轮提醒禁止"已进过的房间再来一遍首次进入"(2026.6.10复测：播音室/门厅反复重置为首入)
        if (Story.state.modId === 'rain-station-demo') {
            if (!Story.state.visitedRooms) Story.state.visitedRooms = {};
            var roomScanText = text.split('\n').filter(function(l) { return !/^\s*[A-D][.．、)]/i.test(l.trim()); }).join('\n');
            var roomPlayerInput = this._lastPlayerInput || '';
            ['门厅', '播音室', '发射机房'].forEach(function(room) {
                if (new RegExp('(走进|进入|踏进|踏入|推开|站在|来到|冲进|闯进|穿过|回到|退回|退到)[^\\n]{0,16}' + room).test(roomScanText) ||
                    new RegExp(room + '[^\\n]{0,10}(的门[^口]|门边|内部|里面)').test(roomScanText) ||
                    // 玩家自己声明去某房间是最可靠的入账证据(2026.6.11验证轮：玩家"回到门厅"但KP回复无动词句式，门厅漏记)
                    new RegExp('(去|回到|走向|进|前往|返回)[^\\n]{0,8}' + room).test(roomPlayerInput)) {
                    Story.state.visitedRooms[room] = true;
                }
            });
            if (/老阚/.test(roomScanText)) Story.state._laokanSeen = true;

            // 短战斗结束追认：听众已倒地但KP没出flag时引擎补账，防stage卡住导致选项兜底回卷战斗
            // (2026.6.12 Milo第六轮#21：倒地后stage停在短战斗轮直到23:45)
            if (Story.state._combatStarted &&
                !(Story.state.stageFlags && Story.state.stageFlags['demo_short_combat_done']) &&
                /失声听众[^\n]{0,20}(倒地|倒下|瘫|不再动|不再试图|停止了动作|没有再起来)/.test(roomScanText)) {
                Story.setStageFlag('demo_short_combat_done');
                console.warn('[引擎追认] 失声听众倒地叙事命中，补账: demo_short_combat_done');
            }
            Story.save();

            // 玩家明确等到死线：按时间意图直推引擎时钟，不按普通动作几分钟几分钟磨
            // (2026.6.11 Milo：玩家"等到23:57"，KP写到23:16就拖住不动，死线永不触发)
            var waitInput = this._lastPlayerInput || '';
            if (/(等|守|熬|拖)(到|至|过)[^\n]{0,10}(23[:：]?57|十一点五十七|零点|午夜|死线|预告|播音开始)/.test(waitInput) &&
                Story.state.gameTime && !Story.state.ended) {
                var wgt = Story.state.gameTime;
                var wNow = (wgt.hour || 0) * 60 + (wgt.minute || 0);
                var wTarget = 23 * 60 + 57;
                if (wgt.day === 3 && wNow < wTarget) {
                    Story.advanceTime(wTarget - wNow);
                }
            }
        }

        var flagRegex = /\[STAGE_FLAG:([^\]]+)\]/g;
        var flagMatch;
        var DEMO_VALID_FLAGS = ['demo_intro_san_done', 'demo_evidence_clue_found', 'demo_radio_event_done', 'demo_station_outer_done', 'demo_short_combat_done'];
        while ((flagMatch = flagRegex.exec(text)) !== null) {
            // 清洗模型转义残留：[STAGE_FLAG:xxx\]存成'xxx\'会让真flag永远缺席、_canAdvanceStage永假，
            // 一根反斜杠瘫痪整局所有下游门(2026.6.11 Milo第四轮案发链根因)
            var flagName = flagMatch[1].trim().replace(/[\\\/'"`。．.，,；;:：]+$/g, '');
            if (this._isRainStationDemo()) {
                // demo flag是封闭集合：未知flag打warning拒收，不静默污染状态
                if (DEMO_VALID_FLAGS.indexOf(flagName) === -1) {
                    if (typeof console !== 'undefined') console.warn('忽略未知demo flag:', flagMatch[1]);
                    continue;
                }
                // demo战斗flag为引擎专有：必须真正打过[COMBAT:START]，拆机器查管子糊弄不算
                if (flagName === 'demo_short_combat_done' && !Story.state._combatStarted) {
                    continue;
                }
            }
            Story.setStageFlag(flagName);
        }

        // 兜底：demo第二幕KP叙述了收音机实时事件但忘了输出[STAGE_FLAG]时，引擎代设flag
        if (Story.state.modId === 'rain-station-demo' && (Story.state.currentStageIndex || 0) === 1 &&
            !(Story.state.stageFlags || {}).demo_radio_event_done &&
            /收音机[^\n]{0,40}(自动调频|自己响|突然响|响了起来|响起)/.test(text)) {
            Story.setStageFlag('demo_radio_event_done');
        }

        // demo第二幕→第三幕由"玩家出发意图"驱动：选项/远景里提到电台不算，必须玩家明确要去。
        // 意图跨轮持久(_travelIntentSeen)：玩家上轮说出发、KP本轮才写到抵达，同样要追认
        // (2026.6.11 Milo：玩家#1出发#2抵达，逐轮判定漏接导致状态终生锁死报馆)
        if (Story.state.modId === 'rain-station-demo' && (Story.state.currentStageIndex || 0) <= 1) {
            var lastInput = this._lastPlayerInput || '';
            var travelIntent = this._demoTravelIntent(lastInput);
            if (travelIntent) { Story.state._travelIntentSeen = true; Story.save(); }
            // 叙事追认只扫描非选项行，且必须有过玩家出发意图，防止KP在A/B/C里提到电台就被误判为已抵达
            var narrativeOnly = text.split('\n').filter(function(l) { return !/^\s*[A-D][.．、)]/i.test(l.trim()); }).join('\n');
            var arrivedInNarrative = /(抵达|来到|走进|站在|赶到|冲进|推开|踏上|停在)[^\n]{0,20}(寂声电台|电台的?正?门|霞飞路尽头|门廊)/.test(narrativeOnly) ||
                /寂声电台[^\n]{0,30}(门廊|大门|铁门)/.test(narrativeOnly);
            // 越幕内容泄漏也算抵达证据：KP都写到门厅/播音室/失声听众了，状态还坐在报馆只会持续积累错位
            var interiorLeak = /(门厅|播音室|发射机房|失声听众)/.test(narrativeOnly);
            if ((travelIntent || Story.state._travelIntentSeen) && (arrivedInNarrative || interiorLeak || /\[LOCATION:寂声电台\]/.test(text))) {
                Story.setStageFlag('demo_intro_san_done');
                Story.setStageFlag('demo_evidence_clue_found');
                Story.setStageFlag('demo_radio_event_done');
                var guard = 0;
                while ((Story.state.currentStageIndex || 0) < 2 && guard < 3) {
                    if (!Story.advanceStage()) break;
                    guard++;
                }
                Story.setCurrentLocation('寂声电台');
            } else if (travelIntent && (Story.state.currentStageIndex || 0) === 1 && Story._canAdvanceStage && Story._canAdvanceStage()) {
                // 条件已满足且玩家明确出发：正常推进到第三幕并同步地点
                Story.advanceStage();
                Story.setCurrentLocation('寂声电台');
            }
        }

        // demo第三幕：老阚/门廊互动关键词兜底 + 玩家明确进入内部时推进到第四幕
        if (Story.state.modId === 'rain-station-demo' && (Story.state.currentStageIndex || 0) === 2) {
            if (!(Story.state.stageFlags || {}).demo_station_outer_done &&
                /老阚[^\n]{0,40}(说|开口|抬|看着|发抖|颤|摇头)|别让它念完|湿脚印[^\n]{0,30}(延伸|通向|进了|入内)/.test(text)) {
                Story.setStageFlag('demo_station_outer_done');
            }
            var enterInput = this._lastPlayerInput || '';
            // 玩家进门意图(含"打开门"，2026.6.10复测第16轮漏判) 或 叙事已实际进入内部房间，都算进入第四幕
            var interiorReached = Story.state.visitedRooms &&
                (Story.state.visitedRooms['门厅'] || Story.state.visitedRooms['播音室'] || Story.state.visitedRooms['发射机房']);
            // 叙事已入内但外围flag缺席时引擎追认补设：老阚守门交给每轮提醒去逼KP，
            // 引擎不把玩家拽回门外(架构原则：追认叙事，意图为门)
            if (interiorReached && !(Story.state.stageFlags || {}).demo_station_outer_done) {
                Story.setStageFlag('demo_station_outer_done');
            }
            if ((this._demoEnterIntent(enterInput) || interiorReached) &&
                Story._canAdvanceStage && Story._canAdvanceStage()) {
                Story.advanceStage();
            }
        }

        var advanceMatch = text.match(/\[STAGE_ADVANCE\]/g);
        if (advanceMatch) {
            // demo意图门：KP的[STAGE_ADVANCE]不能绕过玩家意图(2026.6.10复测第21轮：玩家走回大门
            // KP就推进到短战斗幕)。二→三幕须有出发意图，三→四幕须有进门意图或已实际入内
            var intentBlocked = false;
            if (Story.state.modId === 'rain-station-demo') {
                var gateIdx = Story.state.currentStageIndex || 0;
                var gateInput = this._lastPlayerInput || '';
                if (gateIdx === 1 && !this._demoTravelIntent(gateInput)) intentBlocked = true;
                if (gateIdx === 2) {
                    var gateInterior = Story.state.visitedRooms &&
                        (Story.state.visitedRooms['门厅'] || Story.state.visitedRooms['播音室'] || Story.state.visitedRooms['发射机房']);
                    if (!this._demoEnterIntent(gateInput) && !gateInterior) intentBlocked = true;
                }
            }
            if (!intentBlocked) {
                var advanced = Story.advanceStage();
                if (!advanced && Story.recordBlockedAdvance) {
                    Story.recordBlockedAdvance();
                }
            }
        }

        // 结局标记归一化：兼容全角括号/全角冒号/内部空格/尾部转义残留
        // (2026.6.11终验：KP输出【ENDING: signal_cut】未被识别，玩家正确结局被死线兜底改写成voice_taken)
        var endingMatch = text.match(/[\[【]\s*ENDING[\s:：]+([^\]】]+)[\]】]/i);
        if (endingMatch && Story.endStory) {
            var endingId = endingMatch[1].trim().replace(/[\\\/'"`。．.，,；;:：\s]+$/g, '');
            Story.endStory(endingId);
        }

        // 检定频次计数：低服从模型(如deepseek)可能整局零检定(2026.6.11盲测日志实锤)，供L3提级提醒
        if (/\[DICE[:|]/.test(text)) Story.state._turnsSinceDice = 0;
        else Story.state._turnsSinceDice = (Story.state._turnsSinceDice || 0) + 1;

        // 通用：当前幕推进条件关键词追认——KP叙事已写到位但忘输出[STAGE_FLAG:]时引擎补账
        // (2026.6.12 Milo第五轮：夜语第二幕KP给了村民传说叙事但没出nw_village_legend)
        this._backfillStageFlags(text);

        // 通用：终幕结局动作硬门——玩家明确执行结局动作后KP最多再赖一轮，否则引擎强制结局
        // (2026.6.12 Milo第五轮：雨夜电台#12'砸毁麦克风并切断发射机'被吞、夜语两种结局动作均不收束)
        this._enforceEndingActions(text);

        // 通用：末日钟触发兜底——带endingId的钟触发后宽限graceTurns轮，仍未结局则强制兑现
        // (2026.6.12 Milo第五轮：full_moon_ritual触发后叙事承认'晚了'但状态不终止)
        if (Story.state.modId !== 'rain-station-demo' && !Story.state.ended && Story.state.doomsdayClocks) {
            for (var ci = 0; ci < Story.state.doomsdayClocks.length; ci++) {
                var dclock = Story.state.doomsdayClocks[ci];
                if (!dclock.triggered || !dclock.endingId || Story.state.ended) continue;
                dclock._postTurns = (dclock._postTurns || 0) + 1;
                if (dclock._postTurns >= (dclock.graceTurns || 3) && Story.endStory) {
                    var doomId = (Story.state._pendingEnding && Story.state._pendingEnding.id) || dclock.endingId;
                    Story.endStory(doomId);
                }
            }
            Story.save();
        }

        // demo死线强制谢幕：超时后KP连续多轮仍不肯输出[ENDING]，引擎强制结局。
        // 强制前先看玩家最近的结局动作——玩家做了正确选择时不得用voice_taken覆盖(2026.6.11终验)
        if (Story.state.modId === 'rain-station-demo' && !Story.state.ended && Story.state.gameTime) {
            var egt = Story.state.gameTime;
            var emin = (egt.hour || 0) * 60 + (egt.minute || 0);
            if ((egt.day === 3 && emin >= 23 * 60 + 57) || egt.day >= 4) {
                Story.state._deadlineTurns = (Story.state._deadlineTurns || 0) + 1;
                if (Story.state._deadlineTurns >= 3 && Story.endStory) {
                    var forcedInput = this._lastPlayerInput || '';
                    var forcedId = 'voice_taken';
                    if (/(切断|砸|毁|破坏|拔|斩断|烧)[^\n]{0,12}(发射机|麦克风|电线|信号|线缆|机器)/.test(forcedInput)) forcedId = 'signal_cut';
                    else if (/(改写|篡改|涂改|重写|写下|划掉)[^\n]{0,12}(稿|最后一句|结尾|内容)/.test(forcedInput)) forcedId = 'script_rewritten';
                    else if (/(转身离开|放弃|不管了|走出电台|离开电台)/.test(forcedInput)) forcedId = 'walk_away';
                    Story.endStory(forcedId);
                }
                Story.save();
            }
        }

        var eventRegex = /\[EVENT:([^\]]+)\]/g;
        var eventMatch;
        while ((eventMatch = eventRegex.exec(text)) !== null) {
            Story.triggerEvent(eventMatch[1].trim());
        }

        var goalRegex = /\[GOAL:([^\]]+)\]/g;
        var goalMatch;
        while ((goalMatch = goalRegex.exec(text)) !== null) {
            Story.setGoal(goalMatch[1].trim());
        }

        var locationRegex = /\[LOCATION:([^\]]+)\]/g;
        var locMatch;
        while ((locMatch = locationRegex.exec(text)) !== null) {
            var locName = locMatch[1].trim();
            Story.setCurrentLocation(locName);
            Story.recordEntity('locations', locName);
        }

        var translatorRegex = /\[TRANSLATOR:([^\]]+)\]/g;
        var transMatch;
        while ((transMatch = translatorRegex.exec(text)) !== null) {
            var parts = transMatch[1].trim().split(',');
            var npcName = parts[0];
            var active = parts.length > 1 ? parts[1].trim() === 'on' : true;
            Story.setTranslator(npcName, active);
        }

        // [MOOD:NPC名,轴,增量] 标记解析
        var moodRegex = /\[MOOD:([^\]]+)\]/g;
        var moodMatch;
        while ((moodMatch = moodRegex.exec(text)) !== null) {
            var moodParts = moodMatch[1].trim().split(',');
            if (moodParts.length >= 3 && typeof NPCManager !== 'undefined') {
                var mNpcName = moodParts[0].trim();
                var mAxis = moodParts[1].trim();
                var mDelta = parseInt(moodParts[2].trim(), 10);
                if (mAxis === 'affinity' || mAxis === 'trust' || mAxis === 'fear' || mAxis === 'agitation') {
                    // 兼容旧标记：trust → affinity
                    if (mAxis === 'trust') mAxis = 'affinity';
                    // 通过名字查找NPC
                    var found = null;
                    for (var nid in NPCManager.allNPCs) {
                        if (NPCManager.allNPCs[nid].name === mNpcName) {
                            found = nid;
                            break;
                        }
                    }
                    if (found) {
                        var result = NPCManager.adjustMood(found, mAxis, mDelta);
                        if (result && result.triggered) {
                            Terminal.printSystem(result.triggered.message);
                        }
                        Story.recordEntity('npcs', mNpcName);
                    }
                }
            }
        }

        Story.checkAndAutoAdvance();
    },

    // 去掉KP回复中的选项行，只留叙事正文用于扫描（防选项措辞污染追认，2026.6.10电台正则误判教训）
    _narrativeForScan(text) {
        return (text || '').split('\n').filter(function(l) {
            return !/^[A-D][.、．]/.test(l.trim());
        }).join('\n');
    },

    _backfillStageFlags(text) {
        var st = Story.state;
        if (st.ended || !st.progressStages) return;
        var stage = st.progressStages[st.currentStageIndex || 0];
        if (!stage) return;
        var conds = stage.advanceConditions || [];
        var narrative = this._narrativeForScan(text);
        for (var i = 0; i < conds.length; i++) {
            var cond = conds[i];
            if (cond.type !== 'flag' || !cond.keywords) continue;
            if (st.stageFlags && st.stageFlags[cond.flag]) continue;
            try {
                if (new RegExp(cond.keywords).test(narrative)) {
                    Story.setStageFlag(cond.flag);
                    console.warn('[引擎追认] KP叙事命中条件关键词但缺STAGE_FLAG，补账:', cond.flag);
                }
            } catch (e) { /* 模组keywords正则非法时静默跳过 */ }
        }
    },

    _endingActionTable() {
        var st = Story.state;
        if (st.modId === 'rain-station-demo') {
            return [
                { id: 'signal_cut', pattern: /(切断|砸|毁|破坏|拔|斩断|烧)[^\n]{0,12}(发射机|麦克风|电线|信号|线缆|机器)/ },
                { id: 'script_rewritten', pattern: /(改写|篡改|涂改|重写|划掉)[^\n]{0,12}(稿|最后一句|结尾|内容)/ },
                { id: 'voice_taken', pattern: /(念稿|朗读稿|献出?声|借出声音|对着麦克风(念|开口|朗读))/ },
                { id: 'walk_away', pattern: /(转身离开|放弃|不管了|走出电台|离开电台)/ }
            ];
        }
        var ends = st.modData && st.modData.endings;
        if (!ends) return [];
        var table = [];
        for (var i = 0; i < ends.length; i++) {
            if (!ends[i].actionPattern) continue;
            try { table.push({ id: ends[i].id, pattern: new RegExp(ends[i].actionPattern) }); } catch (e) { }
        }
        return table;
    },

    _enforceEndingActions(text) {
        var st = Story.state;
        if (st.ended || !st.progressStages) return;
        if ((st.currentStageIndex || 0) !== st.progressStages.length - 1) return;
        var input = this._lastPlayerInput || '';
        var matched = null;
        var matchedSrc = '';
        var table = this._endingActionTable();
        // 否定语境守卫：命中词前若紧跟否定/放弃语，则该结局动作不算数，继续扫后续pattern
        // (2026.6.12 Milo验证轮#11：'来不及阻止仪式，放弃并撤离'被裸词'阻止仪式'误判为ritual_stopped)
        var NEG_BEFORE = /(来不及|无法|没法|没能|不想|不再|难以|放弃|别去|不去|拦不住|不打算)$/;
        for (var i = 0; i < table.length; i++) {
            var m = table[i].pattern.exec(input);
            if (!m) continue;
            var before = input.slice(Math.max(0, m.index - 4), m.index);
            if (NEG_BEFORE.test(before)) continue;
            matched = table[i].id;
            matchedSrc = String(table[i].pattern);
            break;
        }
        var pend = st._pendingEnding;
        if (matched) {
            // 本轮玩家做了结局动作而KP没收束（收束则ended已为true到不了这里）：记一次失败
            st._pendingEnding = { id: matched, turns: (pend && pend.id === matched) ? (pend.turns || 0) + 1 : 1, src: matchedSrc };
        } else if (pend) {
            pend.turns = (pend.turns || 0) + 1;
        }
        pend = st._pendingEnding;
        if (pend && pend.turns >= 2 && Story.endStory) {
            console.warn('[引擎强制结局] 玩家结局动作被KP连续吞掉，强制:', pend.id, '命中pattern:', pend.src || '未记录');
            Story.endStory(pend.id);
            st._pendingEnding = null;
        }
        Story.save();
    },

    async handleSANCheck(diceInfo) {
        var char = this.gameState.character;
        if (!char) return null;

        var currentSAN = char.san || char.derived?.san || 0;
        var sanLossFormula = diceInfo.sanLoss || diceInfo.target || '1/1d3';

        if (typeof DiceSystem !== 'undefined' && DiceSystem.requestSANRoll) {
            var result = await DiceSystem.requestSANRoll(currentSAN, sanLossFormula);
            if (result) {
                var newSAN = result.newSAN !== undefined ? result.newSAN : Math.max(0, currentSAN - result.loss);
                if (char.derived) char.derived.san = newSAN;
                if (char.san !== undefined) char.san = newSAN;

                if (newSAN <= 0) {
                    this.applyInsanityState({
                        type: 'permanent',
                        source: diceInfo.skill || 'SAN检定',
                        loss: result.loss,
                        newSAN: newSAN
                    });
                    Terminal.printSystem('⚠️ 永久疯狂！角色进入永久疯狂状态。');
                    if (typeof SoundSystem !== 'undefined') SoundSystem.play('horror_reveal');
                } else if (result.insanityTriggered) {
                    this.applyInsanityState({
                        type: result.insanityType,
                        duration: result.insanityDuration,
                        madness: result.madnessResult,
                        source: diceInfo.skill || 'SAN检定',
                        loss: result.loss,
                        newSAN: newSAN
                    });
                    if (typeof SoundSystem !== 'undefined') SoundSystem.play('san_loss');
                    if (result.insanityType === 'indefinite') {
                        Terminal.printSystem('⚠️ 不定疯狂发作！INT检定失败，角色将陷入' + (result.insanityDuration || '1D10') + '小时的疯狂状态。');
                    } else {
                        Terminal.printSystem('⚠️ 短暂疯狂发作！INT检定成功，角色将陷入' + (result.insanityDuration || '1D10') + '轮的短暂疯狂。');
                    }
                } else if (result.loss > 0) {
                    if (typeof SoundSystem !== 'undefined') SoundSystem.play('san_loss');
                }

                this.updateSidebar();
                this.autoSave();

                if (typeof NPCManager !== 'undefined' && NPCManager.companions.length > 0) {
                    NPCManager.processCompanionHorror(sanLossFormula, 'mythos_creature');
                }

                return {
                    roll: result.roll,
                    targetValue: currentSAN,
                    skillName: 'SAN',
                    result: result.crit ? 'critical' : (result.fumble ? 'fumble' : (result.passed ? 'success' : 'failure')),
                    successLevel: result.crit ? 2 : (result.passed ? 1 : 0),
                    isHidden: false,
                    sanLoss: result.loss,
                    newSAN: newSAN
                };
            }
        }

        var roll = Utils.rollD100();
        var passed = roll <= currentSAN;
        var loss = passed ? 1 : 3;
        var newSAN = Math.max(0, currentSAN - loss);
        if (char.derived) char.derived.san = newSAN;
        if (char.san !== undefined) char.san = newSAN;
        this.updateSidebar();
        this.autoSave();

        if (typeof NPCManager !== 'undefined' && NPCManager.companions.length > 0) {
            NPCManager.processCompanionHorror(sanLossFormula, 'mythos_creature');
        }

        return {
            roll: roll,
            targetValue: currentSAN,
            skillName: 'SAN',
            result: passed ? 'success' : 'failure',
            successLevel: passed ? 1 : 0,
            isHidden: false,
            sanLoss: loss,
            newSAN: newSAN
        };
    },

    applyInsanityState(info) {
        var char = this.gameState.character;
        if (!char) return;

        if (!char.conditions) char.conditions = [];
        if (!char.insanityEpisodes) char.insanityEpisodes = [];

        var type = info.type || 'brief';
        var typeName = type === 'indefinite' ? '不定疯狂' : (type === 'permanent' ? '永久疯狂' : '短暂疯狂');
        var madness = info.madness || null;
        var durationUnit = type === 'indefinite' ? '小时' : '轮';
        var durationText = type === 'permanent' ? '永久' : ((info.duration || '?') + durationUnit);
        var conditionName = typeName + (madness && madness.name ? '：' + madness.name : '');

        if (char.conditions.indexOf(conditionName) === -1) {
            char.conditions.push(conditionName);
        }

        var episode = {
            type: type,
            typeName: typeName,
            symptom: madness ? madness.name : typeName,
            description: madness ? madness.desc : '',
            duration: info.duration || null,
            durationUnit: type === 'permanent' ? '永久' : durationUnit,
            source: info.source || 'SAN检定',
            sanLoss: info.loss || 0,
            sanAfter: info.newSAN,
            startedAt: new Date().toISOString()
        };
        char.insanityEpisodes.push(episode);
        if (char.insanityEpisodes.length > 12) {
            char.insanityEpisodes = char.insanityEpisodes.slice(-12);
        }

        if (typeof Character !== 'undefined') {
            Character.current = char;
            if (Character.addCondition) Character.addCondition(conditionName);
            if (Character.addKeyEvent) {
                Character.addKeyEvent('SAN发作：' + conditionName + '（' + durationText + '）');
            }
            if (Character.save) Character.save();
        }

        if (typeof Terminal !== 'undefined') {
            Terminal.printSystem('🧠 理智创伤记录：' + conditionName + '，持续 ' + durationText + (episode.description ? '\n' + episode.description : ''));
        }
    },

    showDodgePrompt(dodgeInfo) {
        var self = this;
        var char = this.gameState.character;
        var dodgeValue = dodgeInfo.dodgeValue;

        if (char && char.skills && char.skills['闪避']) {
            dodgeValue = char.skills['闪避'];
        }

        var dodgeCount = this.gameState.combat.dodgeCountThisRound || 0;
        var penaltyDice = dodgeCount >= 1 ? 1 : 0;

        var promptDiv = document.createElement('div');
        promptDiv.className = 'dodge-prompt fade-in';

        var textDiv = document.createElement('div');
        textDiv.className = 'dodge-prompt-text';
        textDiv.textContent = '⚡ ' + dodgeInfo.enemy + ' 向你发起攻击！';
        promptDiv.appendChild(textDiv);

        var btnContainer = document.createElement('div');
        btnContainer.className = 'dodge-prompt-buttons';

        var dodgeBtn = document.createElement('button');
        dodgeBtn.className = 'dodge-btn dodge';
        var penaltyText = penaltyDice > 0 ? '（惩罚骰×' + penaltyDice + '）' : '';
        dodgeBtn.textContent = '🛡️ 闪避（' + dodgeValue + '）' + penaltyText;
        dodgeBtn.addEventListener('click', async function () {
            promptDiv.remove();
            self.gameState.combat.dodgeCountThisRound = (self.gameState.combat.dodgeCountThisRound || 0) + 1;
            if (typeof DiceSystem !== 'undefined') {
                var result = await DiceSystem.requestOpenRoll('闪避', dodgeValue, '普通', penaltyDice);
                if (result) {
                    var outcome = result.result === 'critical' || result.result === 'success' ? '闪避成功！' : '闪避失败！';
                    var penaltyNote = penaltyDice > 0 ? '（第' + self.gameState.combat.dodgeCountThisRound + '次闪避，惩罚骰×' + penaltyDice + '）' : '';
                    Terminal.printSystem('🛡️ 闪避检定：' + result.roll + '/' + dodgeValue + ' → ' + outcome + penaltyNote);
                    if (typeof API !== 'undefined') {
                        API.conversationHistory.push({
                            role: 'system',
                            content: '闪避检定结果：' + result.roll + '/' + dodgeValue + ' → ' + outcome + penaltyNote
                        });
                    }
                    if (typeof SoundSystem !== 'undefined') {
                        SoundSystem.playCheckResult(result.result);
                    }
                }
            } else {
                var roll = Utils.rollD100();
                var success = roll <= dodgeValue;
                Terminal.printSystem('🛡️ 闪避检定：' + roll + '/' + dodgeValue + ' → ' + (success ? '闪避成功！' : '闪避失败！'));
            }
            self.gameState.combat.pendingDodge = null;
        });
        btnContainer.appendChild(dodgeBtn);

        var takeHitBtn = document.createElement('button');
        takeHitBtn.className = 'dodge-btn take-hit';
        takeHitBtn.textContent = '💥 承受攻击';
        takeHitBtn.addEventListener('click', function () {
            promptDiv.remove();
            Terminal.printSystem('💥 你选择承受攻击。');
            if (typeof API !== 'undefined') {
                API.conversationHistory.push({
                    role: 'system',
                    content: '玩家选择不闪避，承受攻击。'
                });
            }
            self.gameState.combat.pendingDodge = null;
        });
        btnContainer.appendChild(takeHitBtn);

        promptDiv.appendChild(btnContainer);
        Terminal.outputEl.appendChild(promptDiv);
        Terminal.scrollToBottom();
    },

    endCombat() {
        this.gameState.combat = {
            active: false,
            round: 0,
            initiative: [],
            currentTurn: null,
            pendingDodge: null,
            dodgeCountThisRound: 0
        };
        Terminal.printSystem('⚔️ 战斗结束。');
        // demo第四幕：战斗结束是引擎确定性事件，flag由引擎直设，不依赖KP输出标记
        if (this._isRainStationDemo() && typeof Story !== 'undefined' &&
            Story.getCurrentStage && /完成一次短战斗轮/.test((Story.getCurrentStage() || {}).name || '')) {
            Story.setStageFlag('demo_short_combat_done');
        }
    },

    handleGrieferResult(result) {
        this.gameState.grieferLevel = Math.max(this.gameState.grieferLevel || 0, result.level);
        this.gameState.grieferHistory.push({
            action: result.action,
            level: result.level,
            timestamp: new Date().toISOString()
        });

        const warningDiv = document.createElement('div');
        warningDiv.className = 'griefer-warning level-3 fade-in';
        warningDiv.textContent = result.message;
        Terminal.outputEl.appendChild(warningDiv);
        Terminal.scrollToBottom();

        this.showGrieferBlockOptions(result);
    },

    showGrieferNarrativeWarning(result) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'griefer-warning level-1 fade-in';
        warningDiv.textContent = result.message;
        Terminal.outputEl.appendChild(warningDiv);
        Terminal.scrollToBottom();
    },

    showGrieferBlockOptions(result) {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;gap:8px;margin:8px 0;';

        const continueBtn = document.createElement('button');
        continueBtn.className = 'nav-btn primary';
        continueBtn.textContent = '继续执行';
        continueBtn.onclick = () => {
            div.remove();
            Terminal.printSystem('你执意继续……');

            this.gameState._grieferInject = {
                level: result.level,
                suspicionScore: result.suspicionScore,
                action: result.action,
                forced: true
            };

            const sanLoss = Utils.rollFormula('1D3');
            if (this.gameState.character) {
                this.gameState.character.san = Math.max(0, this.gameState.character.san - sanLoss.total);
                Terminal.printSANLoss(
                    this.gameState.character.san,
                    this.gameState.character.sanMax,
                    sanLoss.total
                );
                this.updateSidebar();
            }

            this._lastPlayerInput = result.action;
            Terminal.setProcessing(true);
            Terminal.showLoading();

            (async () => {
                try {
                    const apiResult = await API.sendMessage(result.action, this.gameState);
                    Terminal.hideLoading();
                    if (apiResult.error) {
                        Terminal.printError(apiResult.error);
                        Terminal.setProcessing(false);
                        return;
                    }
                    if (apiResult.stream) {
                        let fullText = '';
                        let currentDiv = null;
                        await API.processStream(apiResult.stream, (chunk) => {
                            fullText += chunk;
                            if (!currentDiv) {
                                currentDiv = document.createElement('div');
                                currentDiv.className = 'message kp';
                                Terminal.outputEl.appendChild(currentDiv);
                            }
                            currentDiv.textContent = this.stripDiceMarkers(fullText);
                            Terminal.scrollToBottom();
                        }, (complete) => {
                            const displayText = this.stripDiceMarkers(complete, true);
                            if (currentDiv) currentDiv.innerHTML = Terminal.formatKPText(displayText);
                            Terminal._addChatLog('kp', this.stripDiceMarkers(complete));
                            this.processAIResponse(complete);
                            Terminal.setProcessing(false);
                        });
                    } else {
                        Terminal.setProcessing(false);
                    }
                } catch (err) {
                    Terminal.hideLoading();
                    Terminal.printError('AI 请求失败：' + err.message);
                    Terminal.setProcessing(false);
                }
            })();
        };

        const appealBtn = document.createElement('button');
        appealBtn.className = 'nav-btn';
        appealBtn.textContent = '提出申诉';
        appealBtn.onclick = () => {
            div.remove();
            this.openAppealModal(result);
        };

        div.appendChild(continueBtn);
        div.appendChild(appealBtn);
        Terminal.outputEl.appendChild(div);
        Terminal.scrollToBottom();
    },

    openAppealModal(result) {
        const modal = document.getElementById('appeal-modal');
        modal.classList.add('active');

        const submitBtn = document.getElementById('appeal-submit');
        const acceptBtn = document.getElementById('appeal-accept');
        const textarea = document.getElementById('appeal-text');

        const handleSubmit = async () => {
            const appealText = textarea.value.trim();
            if (!appealText) return;

            modal.classList.remove('active');
            Terminal.printSystem('申诉已提交，守秘人正在审核...');

            this.gameState.appealCount++;

            const isReasonable = this.evaluateAppeal(appealText, result);

            if (isReasonable) {
                Terminal.printSuccess('申诉通过。守秘人撤销了警告。');
                GrieferDetector.decayLevel();
                this.gameState.grieferLevel = Math.max(0, (this.gameState.grieferLevel || 0) - 1);
            } else {
                if (this.gameState.appealCount >= 3) {
                    Terminal.printError('你多次滥用申诉机制。守秘人不再接受申诉。');
                    if (typeof GrieferDetector !== 'undefined') {
                        GrieferDetector.level = Math.min(3, GrieferDetector.level + 1);
                        GrieferDetector.save();
                    }
                } else {
                    Terminal.printWarning('申诉被驳回。这不是合理的角色动机。');
                }
            }

            cleanup();
        };

        const handleAccept = () => {
            modal.classList.remove('active');
            Terminal.printSystem('你接受了守秘人的判定。');
            cleanup();
        };

        const cleanup = () => {
            submitBtn.removeEventListener('click', handleSubmit);
            acceptBtn.removeEventListener('click', handleAccept);
            textarea.value = '';
        };

        submitBtn.addEventListener('click', handleSubmit);
        acceptBtn.addEventListener('click', handleAccept);
    },

    evaluateAppeal(appealText, result) {
        const isLongEnough = appealText.length >= 10;
        const hasMotivation = /因为|所以|为了|想要|需要|由于|动机|原因|理由/.test(appealText);

        if (isLongEnough && hasMotivation) return true;
        if (appealText.length >= 20) return true;

        return false;
    },

    applyGrieferPenalty(result) {
        const char = this.gameState.character;
        if (!char) return;

        if (result.level === 3) {
            const sanLoss = Utils.rollFormula('1D3');
            char.san = Math.max(0, char.san - sanLoss.total);
            Terminal.printSANLoss(char.san, char.sanMax, sanLoss.total);
            this.updateSidebar();
        }
    },

    checkCharacterStatus() {
        var char = this.gameState.character;
        if (!char) return;

        if (!char.conditions) char.conditions = [];

        var hp = char.hp || 0;
        var hpMax = char.hpMax || 1;
        var san = char.san || 0;

        var newConditions = [];

        if (hp <= -2) {
            newConditions.push('死亡');
            Terminal.printError('💀 角色已死亡！HP降至-2以下。');
        } else if (hp <= 0) {
            newConditions.push('昏迷');
            if (char.conditions.indexOf('昏迷') === -1) {
                Terminal.printError('💤 角色陷入昏迷！HP降至0，需要急救检定来稳定伤势。');
            }
        } else if (hp <= Math.floor(hpMax / 2)) {
            newConditions.push('重伤');
            if (char.conditions.indexOf('重伤') === -1 && char.conditions.indexOf('昏迷') === -1) {
                Terminal.printWarning('🩸 角色身受重伤！主要伤口可能造成永久伤害。');
            }
        }

        if (san <= 0) {
            newConditions.push('永久疯狂');
            if (char.conditions.indexOf('永久疯狂') === -1) {
                Terminal.printError('🧠 角色永久疯狂！SAN降至0，调查员生涯结束。');
            }
        }

        var existingMentalConditions = char.conditions.filter(function(condition) {
            return /疯狂|恐惧症|偏执|幻觉|妄想|失忆|狂躁|执念|嗜睡|否认|孤立|回避|隐藏|负罪感/.test(condition);
        });
        existingMentalConditions.forEach(function(condition) {
            if (newConditions.indexOf(condition) === -1) newConditions.push(condition);
        });

        char.conditions = newConditions;
    },

    _trackUsedSkill(skillName) {
        if (!skillName) return;
        if (!this.gameState.usedSkills) this.gameState.usedSkills = [];
        if (this.gameState.usedSkills.indexOf(skillName) === -1) {
            this.gameState.usedSkills.push(skillName);
        }
    },

    handleSpellCast(spellInfo) {
        var char = this.gameState.character;
        if (!char) {
            Terminal.printWarning('没有可用的角色数据。');
            return;
        }

        var cthulhuMythos = (char.skills && char.skills['克苏鲁神话']) || 0;
        if (cthulhuMythos <= 0) {
            Terminal.printWarning('角色未习得克苏鲁神话，无法施法。');
            return;
        }

        var currentMP = char.mp || 0;
        var result = COCRules.castSpell(spellInfo.name, spellInfo.mpCost, cthulhuMythos, currentMP);

        if (!result.success && result.reason === 'mp_insufficient') {
            Terminal.printError('🔮 ' + result.message);
            return;
        }

        char.mp = result.newMP;

        if (result.passed) {
            Terminal.printSystem('🔮 施法成功！' + spellInfo.name + ' — D100=' + result.roll + '/' + result.targetValue + '，消耗' + result.mpCost + 'MP，损失' + result.sanLoss + '点SAN');
            if (result.sanLoss > 0) {
                char.san = Math.max(0, (char.san || 0) - result.sanLoss);
                if (char.derived) char.derived.san = char.san;
            }
        } else {
            Terminal.printSystem('🔮 施法失败！' + spellInfo.name + ' — D100=' + result.roll + '/' + result.targetValue + '，消耗' + result.mpCost + 'MP');
        }

        if (typeof API !== 'undefined') {
            API.conversationHistory.push({
                role: 'system',
                content: result.message
            });
        }

        this.updateSidebar();
        this.autoSave();
    },

    handleDevelopmentChecks() {
        var char = this.gameState.character;
        if (!char || !char.skills) {
            Terminal.printWarning('没有可用的角色数据。');
            return;
        }

        var usedSkills = this.gameState.usedSkills;
        if (!usedSkills || usedSkills.length === 0) {
            Terminal.printWarning('本次冒险中没有使用过任何技能，无法进行成长检定。');
            return;
        }

        Terminal.printSystem('📜 冒险结束——开始成长检定……');
        var results = COCRules.performDevelopmentChecks(char.skills, usedSkills);
        var improvedCount = 0;

        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            if (r.improved) {
                char.skills[r.skill] = r.newValue;
                Terminal.printSystem('📈 ' + r.skill + '：' + r.oldValue + ' → ' + r.newValue + '（D100=' + r.roll + ' > ' + r.oldValue + '，提升+' + r.gain + '）');
                improvedCount++;
            } else {
                Terminal.printSystem('· ' + r.skill + '：' + r.oldValue + '（D100=' + r.roll + ' ≤ ' + r.oldValue + '，未提升）');
            }
        }

        Terminal.printSystem('📜 成长检定完成：' + improvedCount + '/' + results.length + '项技能提升。');
        this.gameState.usedSkills = [];
        this.updateSidebar();
        this.autoSave();
    },

    _migrateStorageKeys() {
        var migrationMap = {
            'coc_text_api_config': 'scribe_text_api_config',
            'coc_image_api_config': 'scribe_image_api_config',
            'coc_advanced_config': 'scribe_advanced_config',
            'coc_custom_providers': 'scribe_custom_providers',
            'coc_chat_log': 'scribe_chat_log',
            'coc_memory_system': 'scribe_memory_system',
            'coc_kp_notebook': 'scribe_kp_notebook',
            'coc_current_case': 'scribe_current_case',
            'coc_image_gen_history': 'scribe_image_gen_history',
            'coc_legacies': 'scribe_legacies',
            'coc_settings_toggles': 'scribe_settings_toggles',
            'coc_character': 'scribe_character'
        };
        var migrated = false;
        for (var oldKey in migrationMap) {
            var newKey = migrationMap[oldKey];
            var value = localStorage.getItem(oldKey);
            if (value !== null && localStorage.getItem(newKey) === null) {
                localStorage.setItem(newKey, value);
                localStorage.removeItem(oldKey);
                migrated = true;
            } else if (value !== null && localStorage.getItem(newKey) !== null) {
                localStorage.removeItem(oldKey);
            }
        }
        if (migrated) {
            console.log('[迁移] coc_* → scribe_* 存储键迁移完成');
        }
    },
};

document.addEventListener('DOMContentLoaded', () => Main.init());
