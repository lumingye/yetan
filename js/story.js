const Story = {
    state: {
        modName: '',
        modId: '',
        chapter: '序章',
        phase: 'prologue',
        gameTime: null,
        clues: [],
        currentGoal: '',
        events: [],
        officialNotes: '',
        playerNotes: '',
        doomsdayClocks: [],
        triggeredEvents: [],
        chapterHistory: [],
        currentChapterData: null,
        chapters: [],
        locations: [],
        currentLocation: '',
        turnCount: 0,
        lastActionType: '',
        mythosCombo: null,
        searchedLocations: {},
        sceneVisitCount: {},
        progressStages: [],
        currentStageIndex: 0,
        stageFlags: {},
        settingLanguage: '',
        languageBarriers: [],
        stageStartTurn: 0,
        recentOptions: []
    },

    PHASES: {
        prologue: '序章',
        investigation: '调查中',
        approaching_truth: '接近真相',
        climax: '终局'
    },

    ACTION_TIME_COSTS: {
        search_room: 30,
        search_thorough: 60,
        talk_npc: 15,
        travel_local: 30,
        travel_distant: 120,
        library: 120,
        rest: 480,
        eat: 30,
        combat: 10,
        chase: 20,
        heal: 30,
        ritual: 60,
        pick_lock: 15,
        hide: 5,
        listen: 5,
        quick_action: 5
    },

    TIME_PERIODS: [
        { key: 'dawn', name: '黎明', hourRange: [5, 7] },
        { key: 'morning', name: '上午', hourRange: [7, 12] },
        { key: 'noon', name: '正午', hourRange: [12, 13] },
        { key: 'afternoon', name: '下午', hourRange: [13, 17] },
        { key: 'dusk', name: '黄昏', hourRange: [17, 19] },
        { key: 'evening', name: '夜晚', hourRange: [19, 22] },
        { key: 'midnight', name: '深夜', hourRange: [22, 24] },
        { key: 'late_night', name: '凌晨', hourRange: [0, 5] }
    ],

    init() {
        const saved = Utils.loadFromStorage('scribe_story');
        if (saved) {
            Object.assign(this.state, saved);
            if (!this.state.recentOptions) this.state.recentOptions = [];
        }
        if (typeof Main !== 'undefined' && Main.gameState) {
            Object.assign(Main.gameState.story, this.state);
        }
    },

    save() {
        Utils.saveToStorage('scribe_story', this.state);
        // 同步到 Main.gameState.story，确保 buildSystemPrompt 等读取方拿到最新数据
        if (typeof Main !== 'undefined' && Main.gameState && Main.gameState.story) {
            Object.assign(Main.gameState.story, this.state);
            if (Main.updateSidebar) Main.updateSidebar();
        }
    },

    async startMod(modData, options) {
        if (!modData) return;
        var opts = options || {};
        var silent = opts.silent || false;
        this.state = {
            modName: modData.name || modData.title,
            modId: modData.id,
            chapter: modData.startChapter || '序章',
            phase: 'prologue',
            gameTime: Utils.deepClone(modData.startTime) || (function() {
                var era = modData.era || '1920s';
                if (era === 'victorian') return { year: 1888, month: 11, day: 5, hour: 10, minute: 0, period: 'morning' };
                if (era === 'modern') return { year: 2024, month: 3, day: 15, hour: 9, minute: 0, period: 'morning' };
                return { year: 1928, month: 10, day: 17, hour: 9, minute: 0, period: 'morning' };
            })(),
            clues: [],
            currentGoal: modData.startGoal || '',
            events: [],
            officialNotes: '',
            playerNotes: '',
            doomsdayClocks: Utils.deepClone(modData.doomsdayClocks) || [],
            triggeredEvents: [],
            chapterHistory: [{ chapter: modData.startChapter || '序章', phase: 'prologue', time: new Date().toISOString() }],
            currentChapterData: null,
            chapters: Utils.deepClone(modData.chapters) || [],
            locations: Utils.deepClone(modData.locations) || [],
            currentLocation: modData.locations?.[0]?.name || '',
            turnCount: 0,
            lastActionType: '',
            mythosCombo: modData.mythosCombo || null,
            searchedLocations: {},
            sceneVisitCount: {},
            progressStages: Utils.deepClone(modData.progressStages) || [],
            currentStageIndex: 0,
            stageFlags: {},
            settingLanguage: modData.settingLanguage || '',
            languageBarriers: [],
            modData: Utils.deepClone(modData),
            recentOptions: [],
            ended: false,
            _deadlineTurns: 0,
            discoveredLocations: [modData.locations?.[0]?.name || ''].filter(Boolean),
            randomEvents: Utils.deepClone(modData.randomEvents) || [],
            triggeredRandomEvents: [],
            _turnCounter: 0,
            entityMemory: { npcs: {}, items: {}, locations: {} }
        };

        const startChapter = this.state.chapters.find(c => c.title === this.state.chapter);
        if (startChapter) {
            this.state.currentChapterData = startChapter;
            this.state.phase = startChapter.phase || 'prologue';
        }

        if (modData.npcs && typeof NPCManager !== 'undefined') {
            for (const npcData of modData.npcs) {
                NPCManager.addNPC(npcData);
            }
        }

        this.state.introNarrative = modData.introNarrative || modData.openingNarrative || '';

        // 模组加载时自动校验，有严重错误时在控制台警告
        if (typeof ModValidator !== 'undefined') {
            var validationResult = ModValidator.validate(modData);
            if (!validationResult.valid) {
                console.warn('[模组校验] ' + modData.name + ' 有 ' + validationResult.errors.length + ' 个错误：');
                for (var ve = 0; ve < validationResult.errors.length; ve++) {
                    console.warn('  - ' + validationResult.errors[ve].message);
                }
            }
        }

        if (typeof Main !== 'undefined') {
            Main.gameState.isIntroNarrative = false;
        }

        this.save();

        if (!silent && (modData.introNarrative || modData.openingNarrative)) {
            var narrative = modData.introNarrative || modData.openingNarrative;
            if (typeof Terminal !== 'undefined') {
                Terminal.printKP(narrative);
                Terminal._addChatLog('kp', narrative);
            }
            if (typeof API !== 'undefined') {
                API.conversationHistory.push({
                    role: 'assistant',
                    content: narrative
                });
            }
        }

        if (typeof MythosPool !== 'undefined') {
            MythosPool.init();
            if (this.state.mythosCombo) {
                MythosPool.selector.currentCombo = this.state.mythosCombo;
            } else {
                const combo = MythosPool.generate();
                this.state.mythosCombo = combo;
            }
            this.save();
        }

        return this.state;
    },

    advanceTime(minutes) {
        if (!this.state.gameTime) return;

        const gt = this.state.gameTime;
        let totalMinutes = gt.hour * 60 + gt.minute + minutes;

        while (totalMinutes >= 24 * 60) {
            totalMinutes -= 24 * 60;
            gt.day++;
            var daysInMonth = new Date(gt.year, gt.month, 0).getDate();
            if (gt.day > daysInMonth) {
                gt.day = 1;
                gt.month++;
                if (gt.month > 12) {
                    gt.month = 1;
                    gt.year++;
                }
            }
        }

        gt.hour = Math.floor(totalMinutes / 60);
        gt.minute = totalMinutes % 60;
        gt.period = this.getTimePeriod(gt.hour);

        this.checkDoomsdayClocks();
        this.save();
    },

    estimateActionTime(actionText) {
        const text = actionText.toLowerCase();

        if (this.state.modId === 'rain-station-demo') {
            // 只有从报馆赶往电台才算赶路(15分钟)；电台内/外的挪步按室内移动计价，
            // 否则"走向播音室"每步烧15分钟，时间预算在战斗幕就破产(2026.6.11实测00:21才进终幕)
            if (/霞飞路|电台/.test(text) && this.state.currentLocation === '《晚潮报》档案室') return 15;
            if (/前往|去|走|离开|进入/.test(text)) return 3;
            if (/图书馆|查阅|翻阅|研究|资料|档案|剪报/.test(text)) return 5;
            if (/搜索|翻找|搜查|检查|查看|侦查|观察|听|聆听/.test(text)) return 2;
            if (/问|说|交谈|对话|询问|追问|说服|心理学/.test(text)) return 2;
            if (/攻击|打|开枪|射击|战斗|闪避|推开|保护/.test(text)) return 2;
            if (/等待|休息|拖延|睡觉|吃|喝/.test(text)) return 10;
            return 1;
        }

        if (/搜索|翻找|搜查|检查房间/.test(text)) {
            if (/仔细|彻底|翻遍/.test(text)) return this.ACTION_TIME_COSTS.search_thorough;
            return this.ACTION_TIME_COSTS.search_room;
        }
        if (/问|说|交谈|对话|询问|谈判|说服|恐吓/.test(text)) return this.ACTION_TIME_COSTS.talk_npc;
        if (/前往|去|走|前往.*路|旅行/.test(text)) {
            if (/远|另一.*城|火车|汽车/.test(text)) return this.ACTION_TIME_COSTS.travel_distant;
            return this.ACTION_TIME_COSTS.travel_local;
        }
        if (/图书馆|查阅|翻阅.*书|研究/.test(text)) return this.ACTION_TIME_COSTS.library;
        if (/休息|睡觉|睡一觉/.test(text)) return this.ACTION_TIME_COSTS.rest;
        if (/吃|喝|用餐/.test(text)) return this.ACTION_TIME_COSTS.eat;
        if (/攻击|打|开枪|射击|战斗/.test(text)) return this.ACTION_TIME_COSTS.combat;
        if (/追|跑|追赶/.test(text)) return this.ACTION_TIME_COSTS.chase;
        if (/治疗|包扎|急救/.test(text)) return this.ACTION_TIME_COSTS.heal;
        if (/仪式|施法|念咒/.test(text)) return this.ACTION_TIME_COSTS.ritual;
        if (/开锁|撬/.test(text)) return this.ACTION_TIME_COSTS.pick_lock;
        if (/躲|藏|隐蔽/.test(text)) return this.ACTION_TIME_COSTS.hide;
        if (/听|聆听/.test(text)) return this.ACTION_TIME_COSTS.listen;

        return this.ACTION_TIME_COSTS.quick_action;
    },

    processAction(actionText) {
        this.state.turnCount++;
        this.state.lastActionType = this.classifyAction(actionText);

        if (!this.state.searchedLocations) this.state.searchedLocations = {};
        if (!this.state.sceneVisitCount) this.state.sceneVisitCount = {};

        if (this.state.currentLocation) {
            if (!this.state.sceneVisitCount[this.state.currentLocation]) {
                this.state.sceneVisitCount[this.state.currentLocation] = 0;
            }
            this.state.sceneVisitCount[this.state.currentLocation]++;
        }

        if (this.state.lastActionType === 'investigate' && this.state.currentLocation) {
            if (!this.state.searchedLocations[this.state.currentLocation]) {
                this.state.searchedLocations[this.state.currentLocation] = 0;
            }
            this.state.searchedLocations[this.state.currentLocation]++;
        }

        const estimatedTime = this.estimateActionTime(actionText);
        this.advanceTime(estimatedTime);

        this.save();

        return {
            turnCount: this.state.turnCount,
            timeAdvanced: estimatedTime,
            currentTime: Utils.formatTime(this.state.gameTime),
            searchCount: this.state.searchedLocations[this.state.currentLocation] || 0,
            visitCount: this.state.sceneVisitCount[this.state.currentLocation] || 0
        };
    },

    classifyAction(text) {
        if (/搜查|搜索|翻找|检查|查看|翻阅|侦查/.test(text)) return 'investigate';
        if (/说服|恐吓|威胁|套话|质问|逼问|交谈|对话|询问|话术|魅惑/.test(text)) return 'social';
        if (/前往|去到|走到|旅行|移动|进入|离开/.test(text)) return 'travel';
        if (/攻击|开枪|射击|战斗|斗殴|挥|刺|踢|砍/.test(text)) return 'combat';
        if (/休息|睡觉|吃|喝|恢复/.test(text)) return 'rest';
        if (/读|研究|图书馆|查阅|调查|分析/.test(text)) return 'research';
        if (/躲|藏|潜行|逃跑|偷溜|悄悄/.test(text)) return 'stealth';
        if (/撬|开锁|解锁|修理|修复|操作|急救|治疗|包扎/.test(text)) return 'skill_use';
        if (/看|瞧|找|观察|注意/.test(text)) return 'observe';
        return 'other';
    },

    getTimePeriod(hour) {
        for (const period of this.TIME_PERIODS) {
            if (hour >= period.hourRange[0] && hour < period.hourRange[1]) {
                return period.key;
            }
            if (period.hourRange[0] > period.hourRange[1]) {
                if (hour >= period.hourRange[0] || hour < period.hourRange[1]) {
                    return period.key;
                }
            }
        }
        return 'late_night';
    },

    addClue(clue) {
        if (!this.state.clues.includes(clue)) {
            this.state.clues.push(clue);
            // 同步由 save() 统一负责，不再手动同步
            this.save();
            this.updateOfficialNotesAuto();
            return true;
        }
        return false;
    },

    removeClue(clue) {
        const idx = this.state.clues.indexOf(clue);
        if (idx >= 0) {
            this.state.clues.splice(idx, 1);
            // 同步由 save() 统一负责，不再手动同步
            this.save();
            return true;
        }
        return false;
    },

    recordOptions(options) {
        if (!Array.isArray(options) || options.length === 0) return;
        if (!this.state.recentOptions) this.state.recentOptions = [];
        this.state.recentOptions.push(options.slice());
        this.save();
    },

    // 拼到每轮用户消息末尾的短提醒——利用模型对末尾内容的高服从度，治选项重复和卡幕
    // 结局机制：KP输出[ENDING:id]或引擎强制时调用，游戏进入终止态
    endStory(endingId) {
        if (this.state.ended) return false;
        var endings = (this.state.modData && this.state.modData.endings) || [];
        var ending = endings.find(function(e) { return e.id === endingId; }) || null;
        this.state.ended = endingId || 'unknown';
        this.save();
        if (typeof Terminal !== 'undefined') {
            Terminal.printSystem('━━━ 结局 ━━━');
            if (ending) {
                Terminal.printSystem('【' + ending.title + '】');
                Terminal.printKP(ending.description);
            } else {
                Terminal.printSystem('冒险已结束。');
            }
            Terminal.printSystem('感谢游玩《' + (this.state.modName || '') + '》。可在菜单中重新开始或读取存档。');
        }
        if (typeof Main !== 'undefined') {
            Main.updateStatusBar();
            Main.updateSidebar();
            Main.autoSave();
        }
        return true;
    },

    buildTurnReminder() {
        var lines = [];
        if (this.state.ended) {
            return '【游戏已结束】本局已到达结局，不再推进剧情。玩家如有发言，只做结语式回应，不生成新选项、新场景或新检定。';
        }
        // 事实锚定：防止地点/时间/队友状态漂移
        var anchor = [];
        if (this.state.currentLocation) anchor.push('当前地点：' + this.state.currentLocation);
        if (this.state.gameTime && typeof Utils !== 'undefined' && Utils.formatTime) anchor.push('当前时间：' + Utils.formatTime(this.state.gameTime));
        if (typeof NPCManager !== 'undefined' && NPCManager.companions && NPCManager.companions.length > 0) {
            anchor.push('在场队友：' + NPCManager.companions.map(function(c) { return c.name; }).join('、'));
        }
        // 空间拓扑：可达地点约束
        var adjacent = this.getAdjacentLocations();
        if (adjacent.length > 0) {
            anchor.push('可达地点：' + adjacent.join('、'));
        }
        if (anchor.length > 0) {
            lines.push('事实状态（权威，叙事不得与之矛盾；变化必须经[LOCATION:]/[TIME:]标记）：' + anchor.join('；'));
        }
        // 末日钟临近时叙事层也要给体感：红字是系统仪表盘，压迫感得长在文本里(宁宁 2026.6.11)
        var ddClocks = this.getDoomsdayClockStatus ? this.getDoomsdayClockStatus() : [];
        for (var ci = 0; ci < ddClocks.length; ci++) {
            if (ddClocks[ci].urgency === 'warning' || ddClocks[ci].urgency === 'critical') {
                lines.push('末日钟临近（剩约' + ddClocks[ci].remaining + '分钟）：本轮叙事必须织入一处时间流逝的具象体现（怀表指针/远处钟声/NPC下意识看表或催促/光线雨声变化），一两句即可，不点破机制、不报剩余数字');
                break;
            }
        }
        // 零检定兜底：低服从模型整局不出[DICE](2026.6.11盲测deepseek实锤)，连续多轮无检定时提级提醒
        if ((this.state._turnsSinceDice || 0) >= 3 && !this.state.ended) {
            lines.push('已连续' + this.state._turnsSinceDice + '轮没有任何检定。提醒：玩家执行有成败悬念的主动行动（搜查/聆听/撬锁/攀爬/说服/追逐）时必须输出[DICE:]标记交给骰子决定，不得替玩家直接叙述成功或失败；若近几轮玩家确实没有此类行动，忽略本条');
        }

        // demo死线硬规则：23:57后(含跨午夜)每轮置顶提醒，禁止普通调查
        if (this.state.modId === 'rain-station-demo' && this.state.gameTime) {
            var dgt = this.state.gameTime;
            var dmin = (dgt.hour || 0) * 60 + (dgt.minute || 0);
            if ((dgt.day === 3 && dmin >= 23 * 60 + 57) || dgt.day >= 4) {
                var dProgress = this.getStageProgress();
                if (dProgress && dProgress.isFinalStage) {
                    // 终幕内不抢玩家的最终抉择：催节奏但把ENDING交给"玩家执行结局动作"那条规则
                    lines.push('死亡预告时刻(23:57)已到：空白播音员已开始念稿，本轮必须直接呈现最终抉择场面（稿纸/镜面麦克风/借声提议），只给结局向选项，不得再有任何调查、探索或拖延内容');
                } else {
                    lines.push('死亡预告时刻(23:57)已到：本轮必须给出结局叙事并在末尾输出[ENDING:对应结局id]，不得继续普通调查，不得输出常规A/B/C调查选项');
                }
            }
        }
        // demo第二幕身体反应递进：氛围指令没有触发器就永远被忽略，引擎按轮数逼级
        if (this.state.modId === 'rain-station-demo' && (this.state.currentStageIndex || 0) === 1) {
            var bodyTurns = (this.state.turnCount || 0) - (this.state.stageStartTurn || 0);
            var bodyLevels = ['左耳深处响起一声极细的耳鸣，像收音机没调准的频率', '喉咙发紧，像有看不见的手指搭在声带上', '呼吸的节奏开始不受控制，像被远处的收音机牵引着同步'];
            var bodyLevel = Math.min(bodyTurns, bodyLevels.length - 1);
            lines.push('本轮叙事必须自然织入调查员的身体异样（第' + (bodyLevel + 1) + '级）：' + bodyLevels[bodyLevel] + '。一两句即可，不触发检定，不解释原因');
        }
        // demo专属：NPC白名单 + 已访问房间状态
        if (this.state.modId === 'rain-station-demo') {
            var bStage = this.getCurrentStage();
            if (bStage && bStage.description) {
                lines.push('当前幕边界「' + bStage.name + '」：' + bStage.description + '。叙事不得越过本幕：后续幕的场景、NPC、道具（播音室稿纸/镜面麦克风/空白播音员/失声听众等未到幕的内容）一概不得提前出现');
            }
            lines.push('本试玩全程仅允许以下具名NPC：苏蔓、老阚、失声听众、空白播音员。不得引入任何其他具名人物、不得给路人姓名/身世/台词戏份，已出现的参考稿外人物不再跟进');
            var visited = Object.keys(this.state.sceneVisitCount || {}).filter(function(k) { return k; });
            Object.keys(this.state.visitedRooms || {}).forEach(function(room) {
                if (visited.indexOf(room) === -1) visited.push(room);
            });
            if (visited.length > 0) {
                lines.push('已访问地点：' + visited.join('、') + '。不得再以"首次进入/先确认门/过去看看"形式重复给出，已搜过的房间不再产生新线索；已进入过的房间再次进入时只用一句"你回到X"带过，禁止任何推门/门缝/初见式描写，禁止在已访问地点追加新异象或新线索');
            }
            var demoIdx = this.state.currentStageIndex || 0;
            // 第三幕老阚守门：他是demo核心NPC，不能被NPC收紧一并裁掉(2026.6.10复测全程缺席)
            if (demoIdx === 2 && !this.state._laokanSeen) {
                lines.push('老阚是本幕核心NPC：本轮必须让他在电台门廊自然登场（修保险丝的看门人，只警告"别让它念完"，不解释真相），不得让玩家在没有遇到老阚的情况下进入电台内部');
            }
            // 第四幕战斗逼出：stage到了短战斗但KP不开打，整幕教学就空转(2026.6.10复测缺失)
            if (demoIdx === 3 && !this.state._combatStarted) {
                lines.push('当前是短战斗教学幕：本轮必须让失声听众从发射机房方向扑出并输出[COMBAT:START|调查员DEX:调查员当前DEX|失声听众DEX:50]，不得继续普通探索、调查或对话叙事');
            }
        }
        // 终幕结局指令：玩家执行了结局动作就必须谢幕
        var progressForEnding = this.getStageProgress();
        if (this.state.modId === 'rain-station-demo' && progressForEnding && progressForEnding.isFinalStage) {
            lines.push('终幕结局规则：玩家已执行结局动作时（切断/砸毁发射机或麦克风→signal_cut；改写/篡改稿纸→script_rewritten；念稿/献声→voice_taken；明确放弃离开→walk_away），本轮必须给出结局叙事并在回复末尾输出[ENDING:对应id]，绝不再引入新地点、新NPC、新线索或拖延');
        }
        var ro = this.state.recentOptions || [];
        if (ro.length > 0) {
            // 只平铺最近3轮，防止提醒随局面无限膨胀稀释关键指令(挂账#3)
            var flat = [];
            ro.slice(-3).forEach(function(round) { flat = flat.concat(round); });
            flat = flat.filter(function(opt, i) { return flat.indexOf(opt) === i; });
            lines.push('本轮A/B/C选项不得重复或仅改写以下本幕内已给过的选项：' + flat.join('；'));
            lines.push('每个选项必须从本轮叙事的最后一拍引出（刚出现的事物/NPC刚说的话/刚发生的变化），并对应当前阶段推进条件、已发现线索或在场NPC，不得发明叙事中未出现的方向；选项只能引用叙事中已明示的信息，不得指向NPC尚未吐露的秘密或未触发的伏笔（不得替玩家"想到"他不知道的事）');
            lines.push('同一轮的A/B/C必须互斥：不得两项指向同一动作（如"直接去电台"和"现在去电台"），不得三项全部对同一NPC提问——同一目标只留最好的一项，其余换成不同维度的行动');
        }
        var progress = this.getStageProgress();
        if (progress && progress.canAdvance && !progress.isFinalStage) {
            lines.push('当前阶段推进条件已全部满足：本轮A/B/C中必须有一个是直接前往/进入下一阶段的行动选项；若玩家已表达前进意愿或NPC已催促，叙事直接推进并在末尾输出[STAGE_ADVANCE]，不得再原地添加新调查内容');
        }
        if (progress && !progress.canAdvance) {
            var current = this.getCurrentStage() || {};
            var conds = current.advanceConditions || [];
            var unmet = [];
            for (var i = 0; i < progress.conditionDetails.length; i++) {
                var d = progress.conditionDetails[i];
                if (d.met) continue;
                var flagHint = (conds[i] && conds[i].type === 'flag') ? '（达成时在回复末尾输出 [STAGE_FLAG:' + conds[i].flag + ']）' : '';
                unmet.push(d.description + flagHint);
            }
            if (unmet.length > 0) {
                lines.push('当前阶段「' + progress.stageName + '」未满足的推进条件：' + unmet.join('；') + '。叙事应朝这些条件推进');
            }
        }
        // 随机事件系统：每轮检查触发
        if (typeof RandomEvents !== 'undefined') {
            var evtPrompt = RandomEvents.check();
            if (evtPrompt) lines.push(evtPrompt);
        }

        // 实体记忆索引
        var entityCtx = this.buildEntityMemoryContext();
        if (entityCtx) lines.push(entityCtx);

        if (lines.length === 0) return '';
        return '【KP本轮硬性要求】\n- ' + lines.join('\n- ');
    },

    setChapter(chapterIdOrTitle, phase) {
        let chapterData = null;

        if (typeof chapterIdOrTitle === 'string') {
            chapterData = this.state.chapters.find(c => c.id === chapterIdOrTitle || c.title === chapterIdOrTitle);
        }

        const chapterTitle = chapterData ? chapterData.title : chapterIdOrTitle;
        const chapterPhase = phase || (chapterData ? chapterData.phase : null);

        this.state.chapter = chapterTitle;
        this.state.currentChapterData = chapterData;
        if (chapterPhase) this.state.phase = chapterPhase;

        this.state.chapterHistory.push({
            chapter: chapterTitle,
            phase: this.state.phase,
            time: new Date().toISOString(),
            gameTime: Utils.formatTime(this.state.gameTime)
        });

        if (chapterData && chapterData.keyClues) {
            for (const clue of chapterData.keyClues) {
                this.addClue(clue);
            }
        }

        this.save();

        if (typeof Terminal !== 'undefined') {
            Terminal.printChapterTitle(chapterTitle);
        }

        if (typeof Main !== 'undefined') {
            Main.updateStatusBar();
            Main.updateSidebar();
            Main.autoSave();
        }
    },

    setGoal(goal) {
        this.state.currentGoal = goal;
        this.save();
    },

    setPhase(phase) {
        this.state.phase = phase;
        this.save();
        if (typeof Main !== 'undefined') {
            Main.autoSave();
        }
    },

    setCurrentLocation(locationName) {
        this.state.currentLocation = locationName;
        // 记录到访
        if (!this.state.discoveredLocations) this.state.discoveredLocations = [];
        if (locationName && !this.state.discoveredLocations.includes(locationName)) {
            this.state.discoveredLocations.push(locationName);
        }
        this.save();
        if (typeof Main !== 'undefined') {
            Main.updateStatusBar();
            Main.updateSidebar();
            Main.autoSave();
        }
    },

    getLocationData(locationName) {
        if (!locationName) return null;
        var name = locationName.trim();
        for (var i = 0; i < this.state.locations.length; i++) {
            var loc = this.state.locations[i];
            if (loc.name === name) return loc;
        }
        return null;
    },

    getAdjacentLocations(locationName) {
        var loc = this.getLocationData(locationName || this.state.currentLocation);
        if (!loc) return [];
        return loc.connections || [];
    },

    canTravelTo(targetLocation) {
        var adjacent = this.getAdjacentLocations();
        if (adjacent.length === 0) return true; // 无拓扑数据时保守放行
        return adjacent.some(function(name) {
            return name === targetLocation || targetLocation.indexOf(name) !== -1 || name.indexOf(targetLocation) !== -1;
        });
    },

    discoverLocation(locationName) {
        if (!locationName) return false;
        if (!this.state.discoveredLocations) this.state.discoveredLocations = [];
        if (this.state.discoveredLocations.includes(locationName)) return false;
        this.state.discoveredLocations.push(locationName);
        this.save();
        return true;
    },

    // === 实体记忆索引 ===
    recordEntity(type, name, detail) {
        if (!this.state.entityMemory) this.state.entityMemory = { npcs: {}, items: {}, locations: {} };
        var bucket = this.state.entityMemory[type];
        if (!bucket) return;
        if (!bucket[name]) {
            bucket[name] = { firstSeen: this.state.turnCount || 0, lastSeen: this.state.turnCount || 0, detail: detail || '' };
        } else {
            bucket[name].lastSeen = this.state.turnCount || 0;
            if (detail) bucket[name].detail = detail;
        }
    },

    buildEntityMemoryContext() {
        if (!this.state.entityMemory) return '';
        var em = this.state.entityMemory;
        var parts = [];

        // NPC 记忆：只列见过的
        var npcNames = Object.keys(em.npcs || {});
        if (npcNames.length > 0) {
            parts.push('已遇NPC：' + npcNames.map(function(n) {
                return n + '(第' + em.npcs[n].firstSeen + '轮)';
            }).join('、'));
        }

        // 物品记忆
        var itemNames = Object.keys(em.items || {});
        if (itemNames.length > 0) {
            parts.push('已获物品：' + itemNames.map(function(n) {
                return n + (em.items[n].detail ? '(' + em.items[n].detail + ')' : '');
            }).join('、'));
        }

        if (parts.length === 0) return '';
        return '【实体记忆】' + parts.join('；');
    },

    buildLocationContext() {
        var current = this.state.currentLocation;
        if (!current) return '';

        var locData = this.getLocationData(current);
        var ctx = '【空间拓扑——地点约束】\n';
        ctx += '当前地点：' + current + '\n';

        if (locData) {
            if (locData.region) {
                ctx += '所在区域：' + locData.region + '\n';
            }
            if (locData.description) {
                ctx += '地点描述：' + locData.description + '\n';
            }
            if (locData.connections && locData.connections.length > 0) {
                ctx += '可达地点（玩家只能前往以下地点，不得凭空出现新地点）：' + locData.connections.join('、') + '\n';
            }
        }

        var discovered = this.state.discoveredLocations || [];
        if (discovered.length > 0) {
            ctx += '已发现地点：' + discovered.join('、') + '\n';
        }

        ctx += '\n空间规则：\n';
        ctx += '- 玩家移动只能前往当前地点的可达地点，不得跳到未连接的地点\n';
        ctx += '- 引入新地点时必须在模组地点列表中有定义，或通过[LOCATION:新地点名]标记声明\n';
        ctx += '- 同一地点的描述必须保持一致，再次进入时只描述变化部分\n';
        ctx += '- 玩家在A地，NPC在B地，NPC不能凭空出现在A地（除非有叙事理由移动过来）\n';
        ctx += '- 跨区域移动时需描述过渡（如从城区到海岸线需经过道路）\n';

        return ctx;
    },

    getCurrentRegion() {
        var loc = this.getLocationData(this.state.currentLocation);
        return loc ? (loc.region || '') : '';
    },

    // 阶段推进时解锁新地点连接
    unlockLocationsForStage(stage) {
        if (!stage || !stage.unlockLocations) return;
        var unlocks = stage.unlockLocations;
        for (var i = 0; i < unlocks.length; i++) {
            var unlock = unlocks[i];
            var loc = this.getLocationData(unlock.from);
            if (loc && loc.connections.indexOf(unlock.to) === -1) {
                loc.connections.push(unlock.to);
            }
            // 双向连接
            var targetLoc = this.getLocationData(unlock.to);
            if (targetLoc && targetLoc.connections.indexOf(unlock.from) === -1) {
                targetLoc.connections.push(unlock.from);
            }
        }
        this.save();
    },

    getAvailableLocations() {
        const current = this.state.locations.find(l => l.name === this.state.currentLocation);
        if (!current) return this.state.locations.map(l => l.name);
        return current.connections || this.state.locations.map(l => l.name);
    },

    triggerEvent(eventId) {
        if (!this.state.triggeredEvents.includes(eventId)) {
            this.state.triggeredEvents.push(eventId);
            this.save();
            return true;
        }
        return false;
    },

    isEventTriggered(eventId) {
        return this.state.triggeredEvents.includes(eventId);
    },

    updateOfficialNotes(notes) {
        this.state.officialNotes = notes;
        this.save();

        const el = document.getElementById('sidebar-official-notes');
        if (el) el.textContent = notes;
    },

    updateOfficialNotesAuto() {
        const parts = [];

        if (this.state.modName) {
            parts.push(`【${this.state.modName}】`);
        }

        parts.push(`章节：${this.state.chapter}（${this.PHASES[this.state.phase] || this.state.phase}）`);

        if (this.state.gameTime) {
            parts.push(`时间：${Utils.formatTime(this.state.gameTime)}`);
        }

        if (this.state.currentGoal) {
            parts.push(`目标：${this.state.currentGoal}`);
        }

        if (this.state.clues.length > 0) {
            parts.push(`线索：${this.state.clues.join('、')}`);
        }

        if (this.state.currentLocation) {
            parts.push(`位置：${this.state.currentLocation}`);
        }

        if (this.state.triggeredEvents.length > 0) {
            parts.push(`已触发：${this.state.triggeredEvents.join('、')}`);
        }

        const notes = parts.join('\n');
        this.updateOfficialNotes(notes);
    },

    checkDoomsdayClocks() {
        if (!this.state.doomsdayClocks || !this.state.gameTime) return [];

        const triggered = [];
        const toMinutes = function(t) {
            return (((((t.year || 0) * 12 + ((t.month || 1) - 1)) * 31 + ((t.day || 1) - 1)) * 24 + (t.hour || 0)) * 60) + (t.minute || 0);
        };

        for (const clock of this.state.doomsdayClocks) {
            if (clock.triggered) continue;

            const gt = this.state.gameTime;
            const gameTimeValue = toMinutes(gt);
            const clockTimeValue = toMinutes(clock);

            if (gameTimeValue >= clockTimeValue) {
                clock.triggered = true;
                triggered.push(clock);
                this.save();

                if (typeof Terminal !== 'undefined') {
                    Terminal.printWarning(`末日钟响起：${clock.description || '时间已到。'}`);
                    if (this.state.modId === 'rain-station-demo') {
                        Terminal.printError('十一点五十七分已经到来。死亡预告开始兑现，试玩进入失败后果。');
                    }
                }
                if (this.state.modId === 'rain-station-demo') {
                    this.addEvent('demo_death_broadcast_triggered');
                }
            }
        }

        return triggered;
    },

    getDoomsdayClockStatus() {
        if (!this.state.doomsdayClocks || !this.state.gameTime) return [];
        const toMinutes = function(t) {
            return (((((t.year || 0) * 12 + ((t.month || 1) - 1)) * 31 + ((t.day || 1) - 1)) * 24 + (t.hour || 0)) * 60) + (t.minute || 0);
        };

        return this.state.doomsdayClocks.map(clock => {
            const gt = this.state.gameTime;
            const gameTimeValue = toMinutes(gt);
            const clockTimeValue = toMinutes(clock);

            const remaining = clockTimeValue - gameTimeValue;
            let urgency = 'safe';
            if (clock.triggered) urgency = 'triggered';
            else if (remaining <= 0) urgency = 'triggered';
            else if (remaining <= 10) urgency = 'critical';
            else if (remaining <= 30) urgency = 'warning';

            return {
                ...clock,
                urgency,
                remaining
            };
        });
    },

    getChapterProgress() {
        if (!this.state.chapters || this.state.chapters.length === 0) return null;

        const currentIndex = this.state.chapters.findIndex(
            c => c.title === this.state.chapter || c.id === this.state.chapter
        );

        if (currentIndex < 0) return null;

        const current = this.state.chapters[currentIndex];
        const totalClues = current.keyClues?.length || 0;
        const foundClues = (current.keyClues || []).filter(c => this.state.clues.includes(c)).length;
        const totalEvents = current.events?.length || 0;
        const triggeredEvents = (current.events || []).filter(e => this.state.triggeredEvents.includes(e)).length;

        return {
            chapterIndex: currentIndex,
            totalChapters: this.state.chapters.length,
            chapterTitle: current.title,
            clueProgress: totalClues > 0 ? `${foundClues}/${totalClues}` : '-',
            eventProgress: totalEvents > 0 ? `${triggeredEvents}/${totalEvents}` : '-',
            isComplete: totalClues > 0 && foundClues >= totalClues
        };
    },

    shouldAdvanceChapter() {
        const progress = this.getChapterProgress();
        if (!progress || !progress.isComplete) return false;

        const nextIndex = progress.chapterIndex + 1;
        return nextIndex < this.state.chapters.length;
    },

    getNextChapter() {
        const progress = this.getChapterProgress();
        if (!progress) return null;

        const nextIndex = progress.chapterIndex + 1;
        if (nextIndex >= this.state.chapters.length) return null;

        return this.state.chapters[nextIndex];
    },

    getGameState() {
        return {
            modName: this.state.modName,
            modId: this.state.modId,
            chapter: this.state.chapter,
            phase: this.state.phase,
            gameTime: this.state.gameTime,
            clues: this.state.clues,
            currentGoal: this.state.currentGoal,
            triggeredEvents: this.state.triggeredEvents,
            currentLocation: this.state.currentLocation,
            turnCount: this.state.turnCount,
            chapterProgress: this.getChapterProgress(),
            doomsdayClockStatus: this.getDoomsdayClockStatus(),
            progressStage: this.getCurrentStage(),
            stageProgress: this.getStageProgress()
        };
    },

    getCurrentStage() {
        if (!this.state.progressStages || this.state.progressStages.length === 0) return null;
        var idx = this.state.currentStageIndex || 0;
        if (idx >= this.state.progressStages.length) idx = this.state.progressStages.length - 1;
        return this.state.progressStages[idx];
    },

    getStageProgress() {
        var stages = this.state.progressStages;
        if (!stages || stages.length === 0) return null;
        var idx = this.state.currentStageIndex || 0;
        if (idx >= stages.length) idx = stages.length - 1;
        var current = stages[idx];
        if (!current) return null;

        var conditions = current.advanceConditions || [];
        var met = 0;
        var details = [];

        for (var i = 0; i < conditions.length; i++) {
            var cond = conditions[i];
            var isMet = this._checkCondition(cond);
            if (isMet) met++;
            details.push({
                description: cond.description,
                met: isMet
            });
        }

        return {
            stageIndex: idx,
            totalStages: stages.length,
            stageName: current.name,
            stageDescription: current.description,
            conditionsMet: met,
            conditionsTotal: conditions.length,
            conditionDetails: details,
            canAdvance: this._canAdvanceStage(),
            isFinalStage: idx >= stages.length - 1
        };
    },

    _checkCondition(cond) {
        var flags = this.state.stageFlags || {};
        switch (cond.type) {
            case 'clue':
                var kw = cond.keyword || '';
                var kwNorm = this._normalizeForMatch(kw);
                return this.state.clues.some(function(c) {
                    var cNorm = this._normalizeForMatch(c);
                    if (cNorm.indexOf(kwNorm) !== -1 || kwNorm.indexOf(cNorm) !== -1) return true;
                    var kwTerms = kwNorm.split(/[，、\s]+/).filter(function(t) { return t.length >= 2; });
                    var cTerms = cNorm.split(/[，、\s]+/).filter(function(t) { return t.length >= 2; });
                    var overlap = 0;
                    for (var i = 0; i < kwTerms.length; i++) {
                        for (var j = 0; j < cTerms.length; j++) {
                            if (kwTerms[i].indexOf(cTerms[j]) !== -1 || cTerms[j].indexOf(kwTerms[i]) !== -1) {
                                overlap++;
                                break;
                            }
                        }
                    }
                    return overlap > 0 && overlap >= Math.min(kwTerms.length, cTerms.length) * 0.5;
                }.bind(this));
            case 'event':
                return this.state.triggeredEvents.indexOf(cond.eventId) !== -1;
            case 'flag':
                return flags[cond.flag] === true;
            case 'npc_trust':
            case 'npc_affinity':
                if (typeof NPCManager === 'undefined') return false;
                var npc = NPCManager.allNPCs[cond.npcName];
                return npc && npc.mood && (npc.mood.affinity ?? 0) >= (cond.minAffinity ?? cond.minTrust ?? 2);
            case 'location':
                return this.state.currentLocation === cond.location;
            case 'custom':
                return flags[cond.id] === true;
            default:
                return false;
        }
    },

    _normalizeForMatch(text) {
        return text.replace(/[""「」『』""'']/g, '')
                   .replace(/[（）()【】\[\]{}]/g, '')
                   .replace(/[：:，,、；;。.！!？?\-—–·]/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim()
                   .toLowerCase();
    },

    _canAdvanceStage() {
        var stages = this.state.progressStages;
        if (!stages || stages.length === 0) return false;
        var idx = this.state.currentStageIndex || 0;
        if (idx >= stages.length - 1) return false;

        var current = stages[idx];
        if (!current) return false;

        var conditions = current.advanceConditions || [];
        if (conditions.length === 0) return true;

        var requiredMet = current.requiredConditions || conditions.length;
        var met = 0;
        for (var i = 0; i < conditions.length; i++) {
            if (this._checkCondition(conditions[i])) met++;
        }

        return met >= requiredMet;
    },

    recordBlockedAdvance() {
        var progress = this.getStageProgress();
        if (!progress) return;
        var missing = (progress.conditionDetails || []).filter(function(d) { return !d.met; });
        this.state._blockedAdvance = {
            stageName: progress.stageName,
            missing: missing.map(function(d) { return d.description; })
        };
        this.save();
    },

    advanceStage() {
        if (!this._canAdvanceStage()) return false;
        this.state._blockedAdvance = null;

        var stages = this.state.progressStages;
        var oldIdx = this.state.currentStageIndex || 0;
        var newIdx = oldIdx + 1;

        if (newIdx >= stages.length) return false;

        this.state.currentStageIndex = newIdx;
        this.state.stageStartTurn = this.state.turnCount || 0;
        this.state.recentOptions = [];
        var newStage = stages[newIdx];

        // 进入终幕时重置死线宽限：宽限轮若在战斗幕烧光，玩家刚进终幕就被强制谢幕，
        // 最终抉择整幕被吞(2026.6.11实测)。23:57的意义是"它开始念稿"——那正是终幕本身
        if (newIdx >= stages.length - 1) {
            this.state._deadlineTurns = 0;
        }

        if (newStage.chapter) {
            this.setChapter(newStage.chapter, newStage.phase);
        }
        if (newStage.goal) {
            this.setGoal(newStage.goal);
        }
        if (newStage.location) {
            this.setCurrentLocation(newStage.location);
        }
        // 幕时间锚：推进时把引擎时钟校准到该幕标准时刻，保证末日钟张力不依赖逐轮估时。
        // 必须按"绝对时间"比较：锚点属于开局当天，已跨日(凌晨)时锚点在过去，绝不回拨（防04:38倒流回23:46）
        if (newStage.stageTime && this.state.gameTime) {
            var st = newStage.stageTime;
            var gt = this.state.gameTime;
            var startDay = (this.state.modData && this.state.modData.startTime && this.state.modData.startTime.day) || gt.day;
            var nowAbs = ((gt.day || startDay) - startDay) * 1440 + (gt.hour || 0) * 60 + (gt.minute || 0);
            var anchorAbs = (st.hour || 0) * 60 + (st.minute || 0);
            if (anchorAbs > nowAbs) {
                gt.hour = st.hour;
                gt.minute = st.minute;
                gt.period = this.getTimePeriod(gt.hour);
            }
        }

        // 阶段推进时解锁新地点连接
        this.unlockLocationsForStage(newStage);

        this.save();
        this.updateOfficialNotesAuto();

        if (typeof Terminal !== 'undefined') {
            Terminal.printSystem('━━━ 剧情推进 ━━━');
            Terminal.printSystem('进入阶段：' + newStage.name);
            if (newStage.narrativeHint) {
                Terminal.printKP(newStage.narrativeHint);
            }
        }

        if (typeof Main !== 'undefined') {
            Main.updateStatusBar();
            Main.updateSidebar();
            Main.autoSave();
        }

        return true;
    },

    setStageFlag(key, value) {
        if (!this.state.stageFlags) this.state.stageFlags = {};
        this.state.stageFlags[key] = value !== undefined ? value : true;
        this.save();

        if (this._canAdvanceStage()) {
            if (typeof Terminal !== 'undefined') {
                var progress = this.getStageProgress();
                if (progress) {
                    Terminal.printSystem('📋 阶段推进条件已满足：' + progress.stageName + ' → ' + (this.state.progressStages[this.state.currentStageIndex + 1] || {}).name);
                }
            }
        }
    },

    checkAndAutoAdvance() {
        if (this._canAdvanceStage()) {
            var stages = this.state.progressStages;
            var current = stages[this.state.currentStageIndex];
            if (current && current.autoAdvance !== false) {
                return this.advanceStage();
            }
        }
        return false;
    },

    checkLanguageBarrier() {
        if (!this.state.settingLanguage) return null;
        var char = (typeof Main !== 'undefined' && Main.gameState) ? Main.gameState.character : null;
        if (!char) return null;

        var nativeLang = char.nativeLanguage || '中文';
        var charLangs = [nativeLang];
        var skills = char.skills || {};
        Object.keys(skills).forEach(function(k) {
            if (k.indexOf('语言（') === 0 && k.indexOf('母语-') === -1 && skills[k] > 0) {
                var langName = k.replace('语言（', '').replace('）', '');
                charLangs.push(langName);
            }
        });

        var settingLang = this.state.settingLanguage;
        var canSpeak = charLangs.some(function(l) {
            return l === settingLang || settingLang.indexOf(l) !== -1 || l.indexOf(settingLang) !== -1;
        });

        if (canSpeak) return null;

        var hasTranslator = (this.state.languageBarriers || []).some(function(b) {
            return b.type === 'translator' && b.active;
        });

        return {
            characterLanguage: nativeLang,
            settingLanguage: settingLang,
            hasTranslator: hasTranslator,
            barrierLevel: hasTranslator ? 'partial' : 'full'
        };
    },

    setTranslator(npcName, active) {
        if (!this.state.languageBarriers) this.state.languageBarriers = [];
        var existing = this.state.languageBarriers.find(function(b) { return b.npcName === npcName && b.type === 'translator'; });
        if (existing) {
            existing.active = active;
        } else {
            this.state.languageBarriers.push({ type: 'translator', npcName: npcName, active: active });
        }
        this.save();
    },

    buildLanguageContext() {
        var barrier = this.checkLanguageBarrier();
        if (!barrier) return '';

        var ctx = '【语言障碍系统】\n';
        ctx += '调查员的母语：' + barrier.characterLanguage + '\n';
        ctx += '故事背景语言：' + barrier.settingLanguage + '\n';

        if (barrier.barrierLevel === 'full') {
            ctx += '⚠ 调查员不会当地语言，且没有翻译！\n';
            ctx += '语言不通规则：\n';
            ctx += '- 与NPC交谈时，需要通过幸运检定才能让对方理解基本意图\n';
            ctx += '- 失败则对方完全无法理解，可能产生误解或被无视\n';
            ctx += '- 复杂信息（如调查线索、技术细节）无法通过比划传达\n';
            ctx += '- 阅读当地文字、文件需要通过语言（外语）检定\n';
            ctx += '- 在叙事中体现语言不通的困难和挫折感\n';
        } else if (barrier.barrierLevel === 'partial') {
            ctx += '调查员有翻译协助，但沟通效率降低：\n';
            ctx += '- 翻译在场时可以进行基本交流，但信息可能失真\n';
            ctx += '- 说服、话术、恐吓等社交技能检定获得惩罚骰\n';
            ctx += '- 翻译不在场时，按完全不通语言处理\n';
            ctx += '- 微妙的暗示、双关语等无法通过翻译传达\n';
        }

        return ctx;
    },

    buildProgressContext() {
        var stages = this.state.progressStages;
        if (!stages || stages.length === 0) return '';

        var idx = this.state.currentStageIndex || 0;
        var current = stages[idx];
        if (!current) return '';

        var progress = this.getStageProgress();
        var context = '';

        context += '【阶段式进度系统——当前模组进度】\n';
        context += '当前阶段：' + current.name + '（' + (idx + 1) + '/' + stages.length + '）\n';
        context += '阶段描述：' + current.description + '\n';

        var turnsInStage = (this.state.turnCount || 0) - (this.state.stageStartTurn || 0);
        context += '本阶段已进行轮数：' + turnsInStage + '\n';
        if (turnsInStage < 3 && progress && progress.canAdvance) {
            context += '⚠️ 注意：本阶段仅进行了' + turnsInStage + '轮，建议至少3轮后再推进，确保玩家充分体验\n';
        }
        if (turnsInStage >= 8 && !progress.canAdvance) {
            context += '⚠️ 注意：本阶段已进行' + turnsInStage + '轮但条件未满足，考虑通过NPC引导或事件推动玩家\n';
        }

        if (progress && progress.conditionDetails.length > 0) {
            context += '推进条件：\n';
            var conds = current.advanceConditions || [];
            for (var i = 0; i < progress.conditionDetails.length; i++) {
                var d = progress.conditionDetails[i];
                var marker = (conds[i] && conds[i].type === 'flag' && !d.met) ? '（满足时必须在回复末尾输出 [STAGE_FLAG:' + conds[i].flag + ']）' : '';
                context += '  ' + (d.met ? '✅' : '⬜') + ' ' + d.description + marker + '\n';
            }
            if (progress.canAdvance) {
                context += '⚠️ 所有推进条件已满足！你应当在合适的叙事时机推进到下一阶段。\n';
            }
        }

        if (idx < stages.length - 1) {
            var next = stages[idx + 1];
            context += '下一阶段：' + next.name + '\n';
            if (next.advanceHint) {
                context += '推进提示：' + next.advanceHint + '\n';
            }
        } else {
            context += '这是最终阶段。调查员的选择将决定结局。\n';
        }

        // 终幕结局动作硬门：玩家上一轮已执行结局动作但KP未收束，本轮是最后机会(再拖引擎强制)
        if (this.state._pendingEnding && !this.state.ended) {
            context += '🔴 玩家已明确执行结局动作（对应结局 ' + this.state._pendingEnding.id + '）：本轮必须给出2-4段结局收束叙事并在回复末尾输出[ENDING:' + this.state._pendingEnding.id + ']。不得继续普通调查、不得给常规A/B/C选项、不得引入新地点/新NPC/新线索、不得把玩家的结局动作改写成环境异象。\n';
        }

        // 末日钟触发后的不可逆兑现指令
        if (!this.state.ended && this.state.doomsdayClocks) {
            for (var dci = 0; dci < this.state.doomsdayClocks.length; dci++) {
                var dclk = this.state.doomsdayClocks[dci];
                if (dclk.triggered && dclk.endingId) {
                    context += '🔴 末日钟「' + (dclk.description || dclk.id) + '」已触发且不可逆：本轮叙事必须兑现其后果，不得描写成"也许还来得及"。玩家若无有效应对动作，应在' + (dclk.graceTurns || 3) + '轮内推向结局并输出[ENDING:' + dclk.endingId + ']；玩家若执行了其他结局动作，按该动作收束。\n';
                }
            }
        }

        if (current.kpDirective) {
            context += 'KP指令：' + current.kpDirective + '\n';
        }

        if (this.state.modId === 'rain-station-demo' && this.state.modData && this.state.modData.scriptedBeats) {
            var lockedBeat = this.state.modData.scriptedBeats.find(function(beat) {
                return beat.stage === current.name;
            });
            if (lockedBeat) {
                context += '当前阶段强制剧本拍点：\n';
                (lockedBeat.allowed || []).forEach(function(line) {
                    context += '  - ' + line + '\n';
                });
                if (lockedBeat.next) {
                    context += '  下一拍：' + lockedBeat.next + '\n';
                }
                context += '  规则：只能围绕以上拍点叙事；玩家偏离时短暂回应后拉回，不得自由扩写。\n';
            }
        }

        context += '\n推进规则：\n';
        context += '- 当所有推进条件满足时，你应在叙事中自然过渡到下一阶段\n';
        context += '- 不要跳过阶段，每个阶段的体验是必要的\n';
        if (this.state.modId === 'rain-station-demo') {
            context += '- 《雨夜电台》试玩不得跨幕提前推进；只有当前阶段列出的推进条件满足后，才允许使用[STAGE_ADVANCE]\n';
        } else {
            context += '- 如果玩家行为直接触发了下一阶段的核心条件（如直接前往洞穴），可以提前推进\n';
        }
        context += '- 推进时使用[STAGE_ADVANCE]标记，系统会自动更新状态\n';
        context += '\n节奏控制（极其重要——沉浸感优先）：\n';
        if (this.state.modId === 'rain-station-demo') {
            context += '- 《雨夜电台》是15分钟试玩，不要求每阶段3-5轮；条件满足后应在1轮内自然推进\n';
            context += '- 不扩充新地点或新主要NPC来拖长流程；苏蔓、身体反应和时间压力应把玩家推向下一幕\n';
        } else {
            context += '- 不要急于推进！即使条件满足，也要等待叙事自然过渡的时机\n';
            context += '- 每个阶段至少经历3-5轮对话后再考虑推进，让玩家充分探索\n';
            context += '- 推进前用环境描写、NPC反应等方式暗示变化即将来临\n';
            context += '- 如果玩家仍在积极探索当前阶段内容，即使条件满足也不要推进\n';
            context += '- 推进应该是"水到渠成"而非"条件达标即切换"\n';
            context += '- 但也不要无限拖延——当玩家已明显失去当前阶段的探索兴趣时，适时推进\n';
        }

        if (this.state._blockedAdvance && this.state._blockedAdvance.stageName === current.name) {
            context += '\n⛔ 重要：你上一轮输出了[STAGE_ADVANCE]但推进未生效（条件未满足）。剧情仍停留在「' + current.name + '」，你的叙事不得越过本阶段。缺少的条件：\n';
            this.state._blockedAdvance.missing.forEach(function(m) {
                context += '  - ' + m + '\n';
            });
            context += '本轮优先完成上述条件并输出对应的[STAGE_FLAG:]标记，再视时机输出[STAGE_ADVANCE]。\n';
        }

        if (this.state.modId === 'rain-station-demo' && progress && !progress.canAdvance && turnsInStage >= 2) {
            var unmet = (progress.conditionDetails || []).filter(function(d) { return !d.met; });
            if (unmet.length > 0) {
                context += '\n🔴 本轮硬性指令（15分钟试玩节奏，优先级高于沉浸感）：本阶段已进行' + turnsInStage + '轮，必须在本轮叙事中直接触发以下未满足条件，不得再等玩家自己撞上：\n';
                unmet.forEach(function(d) {
                    context += '  - ' + d.description + '\n';
                });
                context += '完成后在回复末尾输出对应的[STAGE_FLAG:]标记。\n';
            }
        }

        if (this.state.recentOptions && this.state.recentOptions.length > 0) {
            context += '\n【选项去重规则】\n';
            context += '- 最近已给过的选项（最近' + this.state.recentOptions.length + '轮）：\n';
            this.state.recentOptions.forEach(function(round, i) {
                context += '  第' + (i + 1) + '轮：' + round.join('、') + '\n';
            });
            context += '- 不得重复：本轮 A/B/C 选项不得与上述任意一轮重复或仅作措辞改写，除非该行动因新线索/新事件有了实质变化\n';
            context += '- 选项接地：每个选项必须对应当前阶段的推进条件、已发现的线索、或当前在场的 NPC 之一，不得发明叙事中从未出现的地点、人物或调查方向\n';
        }

        return context;
    }
};
