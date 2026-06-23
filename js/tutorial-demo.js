const TutorialDemo = {
    id: 'rain-station-demo',
    SAVE_KEY: 'scribe_tutorial_rain_station_save',
    _setupHandler: null,
    _modalState: null,

    OCCUPATIONS: {
        reporter: {
            label: '调查记者',
            name: '林砚',
            age: 29,
            residence: '上海法租界报馆附近的临时公寓',
            appearance: '深色风衣，随身带速记本和柯达相机，眼下有长期熬夜的阴影。',
            personality: '冷静、好奇、对异常细节有近乎职业病的敏感。',
            belongings: '速记本、钢笔、柯达相机、记者证、怀表、手电筒。',
            background: '《晚潮报》深度调查版记者。三个月来一直追查三起“无声失踪”案，巡捕房全以“离沪”结案，苏蔓是你的夜班搭档。',
            cherished: '一本加密采访笔记，记录着几起被草草结案的失踪案。',
            connections: '苏蔓、《晚潮报》编辑台、旧案剪报、霞飞路电车站。',
            fears: '害怕真相已经被写好，而自己只是按稿走向结局。',
            creditRating: 35
        },
        detective: {
            label: '私家侦探',
            name: '周启明',
            age: 36,
            residence: '上海法租界和华界交界的弄堂二楼事务所',
            appearance: '旧呢大衣、磨损皮鞋，左手总夹着半截未点燃的香烟。',
            personality: '谨慎、现实，对证词里的破绽和街头流言格外敏感。',
            belongings: '左轮手枪、便携手电、开锁工具、旧巡捕证、案件剪报。',
            background: '前公共租界巡捕房顾问，因不愿配合压案而被挤走。三个月前苏蔓冒险把内部档案抄给你，你一直暗中协助追查无声失踪案。',
            cherished: '一本记录旧案欠账的黑皮本，第一页写着苏蔓的名字。',
            connections: '苏蔓、旧巡捕证、案件剪报、霞飞路旧档案。',
            fears: '害怕自己已经习惯把所有人都当成嫌疑人。',
            creditRating: 30
        },
        veteran: {
            label: '退伍军人',
            name: '许临川',
            age: 34,
            residence: '上海法租界边缘的廉租房',
            appearance: '军用外套洗得发白，右臂有旧伤，行动时会先观察出口。',
            personality: '沉默、警觉，习惯用最短路线解决眼前威胁。',
            belongings: '军用匕首、急救包、手电、旧军牌、苏蔓寄来的便条。',
            background: '北伐军退伍，靠替小报社看仓库和跑夜路过活。苏蔓曾帮你压下一篇关于退伍兵“精神异常”的报道，此后你偶尔替她留意失踪案里的异常细节。',
            cherished: '一枚磨损的军牌。',
            connections: '苏蔓、退伍军人互助会、《晚潮报》收发室、旧军医院医生。',
            fears: '害怕枪声停止后，自己仍然只会服从命令。',
            creditRating: 20
        }
    },

    hasSave() {
        return typeof Utils !== 'undefined' && !!Utils.loadFromStorage(this.SAVE_KEY);
    },

    getSaveSummary() {
        if (typeof Utils === 'undefined') return null;
        var data = Utils.loadFromStorage(this.SAVE_KEY);
        if (!data) return null;
        return {
            characterName: data.characterName || data.character?.name || '调查员',
            chapter: data.chapter || data.story?.chapter || '雨声中的播音',
            timestamp: data.timestamp || null
        };
    },

    saveProgress() {
        if (typeof Main === 'undefined' || typeof Utils === 'undefined') return false;
        var saveData = Main.buildSaveData();
        saveData.isTutorialDemo = true;
        saveData.tutorialId = this.id;
        saveData.characterName = saveData.character?.name || '调查员';
        saveData.chapter = saveData.story?.chapter || '雨声中的播音';
        Utils.saveToStorage(this.SAVE_KEY, saveData);
        return true;
    },

    loadProgress() {
        if (typeof Main === 'undefined' || typeof Utils === 'undefined') return false;
        var data = Utils.loadFromStorage(this.SAVE_KEY);
        if (!data) return false;
        Main.loadSaveData(data, { rebuildChat: true });
        Main.gameState.isTutorialDemo = true;
        Main.gameState.tutorialId = this.id;
        if (typeof Terminal !== 'undefined') {
            Terminal.quickMode = true;
            Terminal.printSuccess('已读取《雨夜电台》试玩档。');
            // 读档后从聊天记录里找回最后一组A-D选项，恢复快捷按钮
            var log = Terminal._chatLog || [];
            for (var i = log.length - 1; i >= 0; i--) {
                if (log[i].type === 'kp' && /^A[.、．]/m.test(log[i].text)) {
                    Terminal.renderQuickOptions(log[i].text);
                    break;
                }
            }
        }
        if (typeof MenuSystem !== 'undefined') MenuSystem.closeMenu();
        return true;
    },

    getOccupationProfile(key) {
        return this.OCCUPATIONS[key] || this.OCCUPATIONS.reporter;
    },

    createInvestigator(options) {
        var opts = options || {};
        var occupationKey = opts.occupationKey || 'reporter';
        var profile = this.getOccupationProfile(occupationKey);
        var attrs = opts.attributes || {
            str: 45,
            con: 55,
            siz: 50,
            dex: 60,
            app: 55,
            int: 75,
            pow: 65,
            edu: 70,
            luck: 58
        };
        var derived = this.calculateDerived(attrs);
        var name = opts.name || profile.name;
        return {
            id: opts.id || 'demo-investigator-' + Date.now(),
            name: name,
            age: profile.age,
            gender: opts.gender || '',
            nationality: opts.nationality || '中国',
            residence: profile.residence,
            occupation: profile.label,
            occupationKey: occupationKey,
            appearance: profile.appearance,
            personality: profile.personality,
            belongings: profile.belongings,
            background: profile.background,
            cherished: profile.cherished,
            connections: profile.connections,
            fears: profile.fears,
            creationMode: opts.creationMode || 'demo',
            str: attrs.str,
            con: attrs.con,
            siz: attrs.siz,
            dex: attrs.dex,
            app: attrs.app,
            int: attrs.int,
            pow: attrs.pow,
            edu: attrs.edu,
            luck: attrs.luck,
            hp: derived.hp,
            hpMax: derived.hp,
            san: derived.san,
            sanMax: derived.sanMax,
            mp: derived.mp,
            mpMax: derived.mp,
            db: derived.db,
            build: derived.build,
            mov: derived.mov,
            creditRating: profile.creditRating,
            mythosKnowledge: 0,
            nativeLanguage: '中文',
            skills: this.createOccupationSkills(occupationKey, attrs, opts.skillAllocations || {}),
            createdAt: new Date().toISOString()
        };
    },

    rollAttribute(formula) {
        return Utils.rollFormula(formula).total * 5;
    },

    rollQuickAttributes() {
        return {
            str: this.rollAttribute('3d6'),
            con: this.rollAttribute('3d6'),
            siz: this.rollAttribute('2d6+6'),
            dex: this.rollAttribute('3d6'),
            app: this.rollAttribute('3d6'),
            int: this.rollAttribute('2d6+6'),
            pow: this.rollAttribute('3d6'),
            edu: this.rollAttribute('2d6+6'),
            luck: this.rollAttribute('3d6')
        };
    },

    calculateDerived(attrs) {
        if (typeof COCRules !== 'undefined' && COCRules.calculateDerivedValues) {
            return COCRules.calculateDerivedValues(attrs, 0);
        }
        var hp = Math.floor((attrs.con + attrs.siz) / 10);
        return {
            hp: hp,
            mp: Math.floor(attrs.pow / 5),
            san: attrs.pow,
            sanMax: 99,
            db: '0',
            build: 0,
            mov: 8
        };
    },

    createOccupationSkills(occupationKey, attrs, allocations) {
        var skills;
        if (occupationKey === 'detective') {
            skills = this.createDetectiveSkills(attrs);
        } else if (occupationKey === 'veteran') {
            skills = this.createVeteranSkills(attrs);
        } else {
            skills = this.createReporterSkills(attrs);
        }
        allocations = allocations || {};
        for (var skillName in allocations) {
            if (!Object.prototype.hasOwnProperty.call(allocations, skillName)) continue;
            var base = skills[skillName] || (typeof COCRules !== 'undefined' && COCRules.getSkillBaseValue ? COCRules.getSkillBaseValue(skillName, attrs) : 1);
            skills[skillName] = Math.min(80, base + allocations[skillName]);
        }
        return skills;
    },

    getSkillBaseForSetup(skillName, state) {
        var attrs = state.attributes || {};
        var occKey = state.occupationKey || 'reporter';
        // 预设卡路径下 attributes 为空时，用职业默认属性兜底，避免算出 NaN
        var attrKeys = Object.keys(attrs);
        var hasRealAttrs = attrKeys.length > 0 && attrKeys.some(function(k) { return typeof attrs[k] === 'number' && attrs[k] > 0; });
        if (!hasRealAttrs) {
            var profile = this.getOccupationProfile(occKey);
            // 用职业默认属性构建一份 fallback attrs
            attrs = {
                str: 50, con: 50, siz: 50, dex: 50, app: 50,
                int: 70, pow: 60, edu: 70, luck: 55
            };
            if (occKey === 'reporter') {
                attrs = { str: 45, con: 55, siz: 50, dex: 60, app: 55, int: 75, pow: 65, edu: 70, luck: 58 };
            } else if (occKey === 'detective') {
                attrs = { str: 55, con: 50, siz: 55, dex: 60, app: 45, int: 70, pow: 55, edu: 65, luck: 50 };
            } else if (occKey === 'veteran') {
                attrs = { str: 70, con: 65, siz: 60, dex: 50, app: 45, int: 55, pow: 50, edu: 50, luck: 45 };
            }
        }
        var baseSkills;
        if (occKey === 'detective') {
            baseSkills = this.createDetectiveSkills(attrs);
        } else if (occKey === 'veteran') {
            baseSkills = this.createVeteranSkills(attrs);
        } else {
            baseSkills = this.createReporterSkills(attrs);
        }
        if (baseSkills[skillName] !== undefined) return baseSkills[skillName];
        if (typeof COCRules !== 'undefined' && COCRules.getSkillBaseValue) {
            return COCRules.getSkillBaseValue(skillName, attrs);
        }
        return 1;
    },

    getSkillRecommendations(occupationKey) {
        var common = [
            { name: '侦查', reason: '现场细节与鞋印、蜡筒痕迹' },
            { name: '聆听', reason: '静电、脚步声和播音异常' },
            { name: '闪避', reason: '短战斗轮中的防御动作' }
        ];
        var map = {
            reporter: [
                { name: '图书馆使用', reason: '旧报纸、电台档案和失踪案检索' },
                { name: '心理学', reason: '判断苏蔓与老阚的隐瞒' },
                { name: '说服', reason: '采访与获取非公开信息' }
            ],
            detective: [
                { name: '心理学', reason: '识破证词破绽' },
                { name: '锁匠', reason: '处理电台门锁和档案柜' },
                { name: '火器（手枪）', reason: '战斗轮中的远程选择' }
            ],
            veteran: [
                { name: '急救', reason: '处理战斗后伤势' },
                { name: '斗殴', reason: '战斗轮中的近身选择' },
                { name: '火器（手枪）', reason: '战斗轮中的远程选择' }
            ]
        };
        return common.concat(map[occupationKey] || map.reporter);
    },

    createReporterSkills(attrs) {
        return {
            '侦查': Math.max(55, Math.min(75, attrs.int)),
            '聆听': 55,
            '图书馆使用': Math.max(60, Math.min(80, attrs.edu + 5)),
            '心理学': 55,
            '说服': 50,
            '话术': 45,
            '摄影': 60,
            '母语（中文）': attrs.edu,
            '语言（英语）': 50,
            '历史': 45,
            '神秘学': 25,
            '闪避': Math.floor(attrs.dex / 2),
            '信用评级': 35,
            '克苏鲁神话': 0
        };
    },

    createDetectiveSkills(attrs) {
        return {
            '侦查': Math.max(65, Math.min(80, attrs.int + 5)),
            '聆听': 60,
            '图书馆使用': 55,
            '心理学': 65,
            '说服': 45,
            '话术': 55,
            '锁匠': 45,
            '潜行': 50,
            '法律': 45,
            '汽车驾驶': 40,
            '斗殴': 45,
            '火器（手枪）': 50,
            '闪避': Math.floor(attrs.dex / 2),
            '信用评级': 30,
            '克苏鲁神话': 0
        };
    },

    createVeteranSkills(attrs) {
        return {
            '侦查': 55,
            '聆听': 55,
            '急救': 55,
            '心理学': 35,
            '恐吓': 55,
            '潜行': 45,
            '攀爬': 45,
            '投掷': 45,
            '斗殴': Math.max(60, Math.min(75, attrs.str + 10)),
            '火器（手枪）': 60,
            '火器（步枪/霰弹枪）': 55,
            '闪避': Math.max(Math.floor(attrs.dex / 2), 40),
            '信用评级': 20,
            '克苏鲁神话': 0
        };
    },

    formatAttributes(attrs) {
        return 'STR ' + attrs.str + ' / CON ' + attrs.con + ' / SIZ ' + attrs.siz + ' / DEX ' + attrs.dex +
            '\nAPP ' + attrs.app + ' / INT ' + attrs.int + ' / POW ' + attrs.pow + ' / EDU ' + attrs.edu + ' / 幸运 ' + attrs.luck;
    },

    createScenario() {
        return {
            id: this.id,
            title: '雨夜电台',
            name: '雨夜电台',
            version: '2.0-shanghai',
            era: '1920s',
            setting: '1928 年 11 月 3 日，上海法租界暴雨夜',
            location: '上海法租界·霞飞路尽头·寂声电台',
            difficulty: 1,
            duration: '15分钟试玩',
            tags: ['新手教程', '失声失踪', '时间异常', '单人', '作品集Demo', '上海法租界'],
            structure: '五幕：死亡预告、线索收集、抵达电台、短战斗、最终抉择',
            hook: '一座停播七年的电台，在暴雨中播报了调查员今晚的死亡。',
            startChapter: '雨声中的播音',
            startGoal: '查明寂声电台为何提前播报你的死亡',
            startTime: { year: 1928, month: 11, day: 3, hour: 21, minute: 10, period: 'evening' },
            settingLanguage: '中文为主；法租界相关场景可夹杂法文、英文招牌和巡捕房术语。',
            scriptMode: 'locked',
            scriptedBeats: [
                {
                    stage: '核实死亡预告',
                    allowed: [
                        'A 检查蜡筒和留声机：蜡筒今天下午送到收发室，无寄件人；录音里有一声纸张翻页；可输出 [STAGE_FLAG:demo_evidence_clue_found]。',
                        'B 询问苏蔓：她承认这不是普通恶作剧，但仍隐瞒昨夜也听过播音；她催促继续核实。',
                        'C 翻阅调查资料：必须走图书馆使用；成功时关联1921年寂声电台火灾和近三起失声失踪剪报；可输出 [STAGE_FLAG:demo_evidence_clue_found]。'
                    ],
                    next: '得到任一实证后，用档案室角落收音机自动调频开启第二幕，不开新地点。'
                },
                {
                    stage: '取得第一条实证线索',
                    allowed: [
                        '角落收音机自己响起，播出同一段死亡预告或苏蔓昨夜听到的片段；输出 [STAGE_FLAG:demo_radio_event_done]。',
                        '苏蔓承认昨晚听到播音，内容指向她午夜后失声；她明确阻止绕远调查。',
                        '身体异样按顺序出现：耳鸣、喉咙发紧、呼吸像被收音机牵引。'
                    ],
                    next: '条件满足后立刻让苏蔓推动前往霞飞路尽头寂声电台，输出 [STAGE_ADVANCE]。'
                },
                {
                    stage: '抵达寂声电台外围',
                    allowed: [
                        '短插霞飞路电车站即可，不发展支线。',
                        '电台大门没上锁，门廊有湿脚印，保险丝盒异常发热。',
                        '老阚出现，只说保险丝每天都烧、别让它念完，不解释最终真相。'
                    ],
                    next: '完成门廊/老阚/保险丝任一核心互动后输出 [STAGE_FLAG:demo_station_outer_done] 和 [STAGE_ADVANCE]。'
                },
                {
                    stage: '完成一次短战斗轮',
                    allowed: [
                        '进入内部后只给左播音室、右发射机房的岔口。',
                        '失声听众从发射机房方向扑出，触发 [COMBAT:START|调查员DEX:当前DEX|失声听众DEX:50]。',
                        '短战斗1-2轮结束，最多第3轮自行倒下；苏蔓做NPC SAN教学。'
                    ],
                    next: '战斗结束输出 [STAGE_FLAG:demo_short_combat_done] 和 [STAGE_ADVANCE]。'
                },
                {
                    stage: '完成最终抉择',
                    allowed: [
                        '播音室里出现写到玩家真实行为的稿纸和镜面麦克风。',
                        '先触发高压SAN，再由空白播音员温柔提出借声音。',
                        '只处理三个结局：切断信号、改写稿纸、献声。'
                    ],
                    next: '给出结局，不继续扩展后日谈支线。'
                }
            ],
            progressStages: [
                {
                    name: '核实死亡预告',
                    description: '听完死亡预告，完成轻量SAN检定，并确认蜡筒来自今天下午。',
                    advanceConditions: [
                        { type: 'flag', flag: 'demo_intro_san_done', description: '死亡预告后的轻量SAN检定已完成' }
                    ],
                    requiredConditions: 1,
                    autoAdvance: true,
                    kpDirective: '只围绕《晚潮报》档案室、蜡筒、留声机、苏蔓和已有调查资料展开。不得在死亡预告播音前触发SAN；必须在玩家听完录音、怀表倒走、苏蔓说"很明显，我们查到了对的方向"并输出冲击说明之后，才触发轻量SAN：[DICE:OPEN|SAN|当前SAN值|0/1D3]。第一幕选项固定为：A 检查蜡筒和留声机；B 询问苏蔓的看法；C 翻阅之前整理的调查资料；D 其他行动。玩家选择C或表达翻阅/查阅资料时，必须使用[DICE:OPEN|图书馆使用|技能值|普通]并处理资料检索路径，绝不能回到A的蜡筒/留声机路径。不提电台内部、播音室、发射机；苏蔓不主动说昨晚听到过播音；不出现敌对NPC。'
                },
                {
                    name: '取得第一条实证线索',
                    stageTime: { hour: 21, minute: 40 },
                    description: '至少获得一条实证线索，并触发档案室收音机自己响起的实时事件。',
                    advanceConditions: [
                        { type: 'flag', flag: 'demo_evidence_clue_found', description: '获得蜡筒/苏蔓/旧资料中的一条实证线索' },
                        { type: 'flag', flag: 'demo_radio_event_done', description: '档案室收音机自动调频事件已发生' }
                    ],
                    requiredConditions: 2,
                    autoAdvance: false,
                    advanceNote: '推进到第三幕由玩家出发意图驱动（引擎在 processStageMarkers 检测），条件满足但人未出发时不得自动换幕',
                    kpDirective: '第二幕目标：从"知道是哪个电台"升级到"不去的话苏蔓和我都会出事"。只允许三类推进：实证线索、档案室收音机实时事件、苏蔓和身体反应推动前往寂声电台；必须交付至少一条实证线索并触发实时事件：档案室角落收音机自己响起，苏蔓说昨晚听到的就是这个。A/B/C选项只围绕角落收音机、苏蔓昨夜听到的播音、失踪剪报/电台旧档、身体反应、立刻去寂声电台；不重复"检查蜡筒/询问看法/翻阅资料"三件套。禁止自发新增供电局、查账单/电费、巡捕房支线、监视者/跟踪者、制定战术、寻找武器、召集帮手、拜访无关线人等参考稿外内容。禁止新增主要NPC。玩家用D主动绕远时最多回应1小段，苏蔓必须明确阻止或指出来不及，并以耳鸣、喉咙发紧、呼吸被牵引把目标拉回寂声电台。身体反应按线索递进：先耳鸣，再喉咙发紧，再呼吸像被收音机牵引。'
                },
                {
                    name: '抵达寂声电台外围',
                    stageTime: { hour: 22, minute: 50 },
                    location: '寂声电台',
                    description: '前往霞飞路尽头，在门廊处发现湿脚印、保险丝盒或异常电流，并遇见老阚。',
                    advanceConditions: [
                        { type: 'flag', flag: 'demo_station_outer_done', description: '已抵达电台外围并完成老阚/门廊互动' }
                    ],
                    requiredConditions: 1,
                    autoAdvance: false,
                    advanceNote: '推进到第四幕由玩家进入电台内部的意图驱动（引擎检测），互动完成但人未进门时不得换幕',
                    kpDirective: '按参考稿抵达寂声电台：可短插霞飞路电车站；大门没上锁，湿脚印延伸入内；遇见老阚维修保险丝。只围绕电台外部、门锁、湿脚印、保险丝盒、老阚展开。本幕不触发战斗。老阚不解释空白播音员；若玩家追问他为何守了七年，他可以吐露：七年前它念完过一整篇，名字是他守夜的搭档，第二天应验了——说到这里就停住，再问只摇头。'
                },
                {
                    name: '完成一次短战斗轮',
                    stageTime: { hour: 23, minute: 20 },
                    location: '寂声电台',
                    description: '进入电台内部后遭遇失声听众，展示先攻、攻击/闪避与战斗结束。',
                    advanceConditions: [
                        { type: 'flag', flag: 'demo_short_combat_done', description: '失声听众短战斗已结束' }
                    ],
                    requiredConditions: 1,
                    autoAdvance: true,
                    kpDirective: '按参考稿短战斗：岔口左播音室、右发射机房，失声听众从发射机房扑出；用[COMBAT:START|调查员DEX:当前DEX|失声听众DEX:50]开始战斗，1-2轮结束，最多第3轮自行倒下。失声听众出现时苏蔓进行NPC SAN教学：[DICE:OPEN|SAN|8|1/1D6]，临时疯狂只表现为角落崩溃不拖累战斗。战后不揭示最终播音机制。'
                },
                {
                    name: '完成最终抉择',
                    stageTime: { hour: 23, minute: 45 },
                    location: '播音室',
                    description: '在十一点五十七分前切断发射机、改写播音稿，或让声音借走。',
                    advanceConditions: [],
                    autoAdvance: true,
                    kpDirective: '最终阶段。按参考稿：稿纸写到玩家真实行为和苏蔓是否发疯，先触发高压SAN：[DICE:OPEN|SAN|当前SAN值|1/1D6]，再由空白播音员提出借声音。最终选择：A 切断发射机或毁掉麦克风进入静音；B 写稿进入改稿；C 念稿进入献声，拒绝/质问可转A或B；D 其他行动。空白播音员永远温柔、不催促、不威胁。强调：它不是预言未来，而是朗读未来，使其发生。结局达成时必须给出结局叙事并在回复末尾输出对应标记：切断/砸毁→[ENDING:signal_cut]；改稿→[ENDING:script_rewritten]；献声→[ENDING:voice_taken]；放弃离开→[ENDING:walk_away]。标记必须用半角方括号和半角冒号，不得写成【ENDING:】。结局叙事要求：输出标记前必须有2-4段收束叙事，至少回收一件伏笔（怀表倒走/蜡筒里的翻页声/苏蔓说的"它在吸气但没有肺"/老阚的「别让它念完」——若回收老阚，结局可用一笔交代他：听到结果后的反应或他的去留，与结局逻辑一致），并明确呼应玩家刚才的选择；禁止一句话谢幕。输出[ENDING:]后游戏结束，不再有后续轮次。'
                }
            ],
            doomsdayClocks: [
                {
                    id: 'midnight_broadcast',
                    year: 1928,
                    month: 11,
                    day: 3,
                    hour: 23,
                    minute: 57,
                    description: '十一点五十七分到来，死亡预告开始兑现',
                    triggered: false
                }
            ],
            chapters: [
                {
                    id: 'ch1',
                    title: '雨声中的播音',
                    phase: 'prologue',
                    description: '调查员在报社接到一段不可能存在的播音记录。',
                    keyClues: ['死亡预告录音', '寂声电台停播档案', '倒走的怀表'],
                    events: ['hear_broadcast', 'inspect_wax_cylinder', 'archive_lookup']
                },
                {
                    id: 'ch2',
                    title: '第一条实证线索',
                    phase: 'investigation',
                    description: '调查员通过蜡筒、旧档或苏蔓的隐瞒，确认死亡预告不是普通录音。',
                    keyClues: ['纸张翻页声', '1921年寂声电台火灾', '近三起失声后失踪剪报', '苏蔓昨晚听到自己的播音', '档案室收音机自动调频'],
                    events: ['inspect_wax_cylinder', 'question_suman', 'archive_lookup', 'radio_event']
                },
                {
                    id: 'ch3',
                    title: '抵达寂声电台',
                    phase: 'approaching_truth',
                    description: '调查员抵达霞飞路尽头，在停播七年的电台外遇见看门人老阚。',
                    keyClues: ['门廊湿脚印', '每天更换的保险丝', '墙内温热铜线', '老阚的警告'],
                    events: ['meet_laokan', 'inspect_fuses', 'enter_station']
                },
                {
                    id: 'ch4',
                    title: '失声听众',
                    phase: 'action',
                    description: '进入电台内部后，失声听众从发射机房方向扑出，静电声代替了喉咙。',
                    keyClues: ['喉咙旧疤', '只剩静电的嘴型', '发射机房高温'],
                    events: ['combat_start', 'finish_short_combat', 'choose_room']
                },
                {
                    id: 'ch5',
                    title: '未来的稿纸',
                    phase: 'climax',
                    description: '播音稿写到调查员低头看这一页，最后一行空着，镜面麦克风等待一个活人的声音。',
                    keyClues: ['未干的死亡稿', '镜面麦克风', '空白播音员必须借声完成仪式'],
                    events: ['read_script', 'san_check', 'choose_response', 'ending']
                }
            ],
            locations: [
                {
                    name: '《晚潮报》档案室',
                    description: '低矮潮湿的地下室，墙边堆着过期报纸和蜡筒录音。一盏绿罩台灯只照亮桌面，其余全是影子。',
                    connections: ['霞飞路电车站', '寂声电台']
                },
                {
                    name: '霞飞路电车站',
                    description: '末班电车停在雨幕里，售票员坚持说今晚没有乘客往电台方向去过。车厢里的收音机突然迸出一声静电，然后沉默。',
                    connections: ['《晚潮报》档案室', '寂声电台']
                },
                {
                    name: '寂声电台',
                    description: '霞飞路尽头的三层砖楼被藤蔓包住，门牌上有七年前火灾的黑痕。楼顶天线在雨里发出低沉蜂鸣。',
                    connections: ['霞飞路电车站', '播音室', '发射机房']
                },
                {
                    name: '播音室',
                    description: '隔音棉发霉，散发甜腐味。桌上一支麦克风光滑得像镜子，映出你的脸，但嘴型不对。',
                    connections: ['寂声电台', '发射机房']
                },
                {
                    name: '发射机房',
                    description: '机器早该报废，却在雨夜里滚烫运转。铜线从墙体深处延伸出来，像血管一样脉动。',
                    connections: ['播音室']
                }
            ],
            npcs: [
                {
                    name: '苏蔓',
                    type: 'ally',
                    role: '《晚潮报》夜班编辑',
                    description: '三十岁出头，袖口总沾着油墨。她把死亡预告录音交给调查员，但没有说出自己昨晚也听到过播音。',
                    hp: 9,
                    hpMax: 9,
                    san: 8,
                    sanMax: 55,
                    dex: 45,
                    str: 35,
                    app: 50,
                    skills: { '图书馆使用': 60, '心理学': 45, '说服': 50, '聆听': 45 },
                    location: '《晚潮报》档案室',
                    attitude: '紧张但愿意配合',
                    trust: 7,
                    secret: '她昨晚已经听到过一次播音，播音中提到她会在午夜后失声。',
                    dialogueStyle: '压低声音，句子很短，说完会停顿，像在确认周围没人听到。'
                },
                {
                    name: '老阚',
                    type: 'witness',
                    role: '寂声电台看门人',
                    description: '六十多岁，穿不合身的雨衣，脚边总有一圈水。他声称电台七年前就死了。',
                    hp: 8,
                    hpMax: 8,
                    san: 28,
                    sanMax: 45,
                    dex: 35,
                    str: 40,
                    app: 35,
                    skills: { '聆听': 60, '机械维修': 50, '神秘学': 30 },
                    location: '寂声电台',
                    attitude: '恐惧且回避',
                    trust: 4,
                    secret: '他每天都在更换发射机保险丝，因为机器会在午夜前自行启动。七年前它念完过一整篇——名字是和他一起守夜的搭档，第二天应验了。他留下来，是因为没人信他，也因为那一次他没拦住。',
                    dialogueStyle: '反复说「别让它念完」，一听到静电声就发抖，说到一半会突然看向门口。'
                },
                {
                    name: '空白播音员',
                    type: 'entity',
                    role: '来自未来播音稿中的声音',
                    description: '没有脸，也没有身体，只通过麦克风和收音机存在。它不预言未来，它朗读未来，使其发生。',
                    hp: 0,
                    hpMax: 0,
                    san: 0,
                    sanMax: 0,
                    dex: 0,
                    str: 0,
                    app: 0,
                    skills: { '说服': 80, '心理学': 75, '克苏鲁神话': 40 },
                    location: '播音室',
                    attitude: '温柔、耐心、不紧不慢',
                    trust: 0,
                    secret: '它必须借人类声音读完最后一句，才能把播音稿变成现实。',
                    dialogueStyle: '像深夜电台节目主持人。称调查员为「今晚的听众」，永远不威胁，永远不催促。'
                },
                {
                    name: '失声听众',
                    type: 'enemy',
                    role: '被播音稿夺走声音的袭击者',
                    description: '穿湿透的旧西装，喉咙只能发出静电声。它扑向任何靠近发射机的人，不是出于敌意，而是出于被改写的本能。',
                    hp: 7,
                    hpMax: 7,
                    san: 0,
                    sanMax: 0,
                    dex: 50,
                    str: 45,
                    app: 25,
                    skills: { '斗殴': 40, '闪避': 25 },
                    attacks: [{ name: '扑打', skill: '斗殴', damage: '1D3', note: '用于教程短战斗，不应致命' }],
                    location: '寂声电台',
                    attitude: '敌对',
                    trust: 0,
                    secret: '它不是活尸，而是被播音稿夺走声音的人。',
                    dialogueStyle: '只能发出断裂的播音词和静电声。'
                }
            ],
            chekhovGuns: [
                { plant: '调查员的怀表在播音响起时倒走三分钟', payoff: '最后可用怀表判断真实午夜还剩多久' },
                { plant: '录音蜡筒中夹杂一声纸张翻页', payoff: '证明播音来自一份正在书写的稿纸' },
                { plant: '苏蔓说自己听见了“有什么东西在吸气，但它没有肺”', payoff: '空白播音员需要借活人的声音完成仪式' }
            ],
            endings: [
                {
                    id: 'signal_cut',
                    title: '静音',
                    condition: '切断发射机或毁掉镜面麦克风',
                    description: '播音停止，未来没有被读完；调查员带走一卷只剩静电的蜡筒。'
                },
                {
                    id: 'script_rewritten',
                    title: '改稿',
                    condition: '识破播音稿机制并篡改最后一句',
                    description: '死亡预告变成一条无人能懂的天气新闻或玩家写下的内容。记者：署名稿的名字栏变空；侦探：黑皮本后续案件记录变成空白页；退伍军人：军牌正面的名字磨得认不出来。'
                },
                {
                    id: 'voice_taken',
                    title: '献声',
                    condition: '让空白播音员借用调查员或 NPC 的声音',
                    description: '午夜后，上海所有亮着的收音机都用同一个声音播报明天。那个声音很熟悉。'
                },
                {
                    id: 'walk_away',
                    title: '退场',
                    condition: '调查员两次明确拒绝调查并放弃追查',
                    description: '调查员转身走进雨里，第二天第三版缺了一篇稿子，苏蔓也没有来上班。'
                }
            ],
            introNarrative: '“晚安，上海。本台收到消息，今晚十一点五十七分，【调查员姓名】死于寂声电台发生的一次事故。祝您有个安静的夜晚。”\n\n1928年11月3日，晚上九点十分。雨打在法租界的梧桐叶上。\n\n《晚潮报》地下档案室中，调查员面前摊着无声失踪案的剪报。苏蔓把一只今天下午送到收发室、没有寄件人信息的蜡筒推到调查员面前。留声机落针后，同一句死亡预告从静电中响起。桌下传来一声很轻的金属卡顿声，很快被雨声盖过去。苏蔓低声说：“很明显，我们查到了对的方向。”\n\nA. 检查蜡筒和留声机\nB. 询问苏蔓的看法\nC. 翻阅之前整理的调查资料，看看这与案件有哪些联系\nD. 其他行动（自行输入）',
            kpNotesGlobal: '这是 10 分钟作品集试玩教程，采用上海法租界版《雨夜电台》。固定剧情优先级最高：已经写好的开场、死亡预告、线索、NPC秘密、短战斗和结局条件必须执行，不得重写、替换地点、替换NPC、提前揭示真相或跳幕。阶段顺序：1死亡预告；2线索收集；3抵达电台；4短战斗；5最终抉择。阶段标记规则：获得任一第二幕实证线索时输出 [STAGE_FLAG:demo_evidence_clue_found]；档案室收音机实时事件发生后输出 [STAGE_FLAG:demo_radio_event_done]；抵达电台外并完成门廊/老阚互动后输出 [STAGE_FLAG:demo_station_outer_done]；失声听众短战斗结束后输出 [STAGE_FLAG:demo_short_combat_done]。只有当前阶段推进条件满足，并且叙事自然过渡时，才输出 [STAGE_ADVANCE]；禁止连续输出多个 [STAGE_ADVANCE]。时间硬规则：死亡预告时间是1928-11-03 23:57；23:45以后必须强烈压缩行动，苏蔓催促立刻进电台；23:57到达时必须触发死亡预告兑现或失败结局，不能让玩家继续无事调查。怀表倒走是调查员没有立刻注意到的伏笔；在玩家主动检查怀表/时间前，不得把怀表作为已知信息写入推荐选项。固定死亡预告文本不得改动。不得改变开场中已确立的任何事实。'
        };
    },

    buildIntroSegments(character) {
        var hook = {
            reporter: '1928年11月3日，晚上九点十分。雨打在法租界的梧桐叶上。\n\n《晚潮报》地下档案室中，你面前摊着无声失踪案的剪报——三个月，三个人，先失声再消失，巡捕房全以“离沪”结案。\n\n苏蔓从夜班编辑台走过来，她的手上全是油墨，把一只蜡筒推到你面前。',
            detective: '1928年11月3日。雨打在法租界的梧桐叶上。\n\n晚上九点十分，你在《晚潮报》档案室等了二十分钟。苏蔓今晚约你在这里见面，说有新东西。\n\n她进门时外套全湿了，怀里抱着一只用报纸裹住的蜡筒。',
            veteran: '1928年11月3日。雨打在法租界的梧桐叶上。\n\n一张便条。下午从门缝塞进来的。苏蔓的字迹。没有多余的话——\n\n“今晚九点，档案室。”\n\n你在《晚潮报》档案室找到她的时候，她面前摆着一只蜡筒，指尖在发抖。'
        }[character.occupationKey] || '';
        var deathBroadcast = '“晚安，上海。本台收到消息，今晚十一点五十七分，' + character.name + '死于寂声电台发生的一次事故。\n祝您有个安静的夜晚。”';
        var preSan = deathBroadcast + '\n\n' +
            hook + '\n\n' +
            '“这是今天下午送到收发室的。没有寄件人信息。”\n\n' +
            '留声机落针，静电涌出来，像有什么东西试图从噪音里呼吸。\n\n' +
            '“你听。”她说。\n\n' +
            '然后——一个声音。温柔的，标准的，不带任何口音的声音，像在念睡前故事一样播报：\n\n' +
            deathBroadcast + '\n\n' +
            '在你认真听着这段录音的时候，桌下传来一声很轻的金属卡顿声，很快被雨声盖过去。\n\n' +
            '苏蔓盯着留声机，声音轻得几乎被外面的雨声吞没：“很明显，我们查到了对的方向。”\n\n' +
            '播音的内容和苏蔓的话给你带来了巨大的冲击——一座停播七年的电台，用一个不该存在的声音，播报了你今晚的死亡。而你追查了三个月的案子，突然指向了你自己。';
        var sanMarker = '[DICE:OPEN|SAN|' + (character.san || character.pow || 60) + '|0/1D3]';
        var postSan = '';
        var options = 
            'A. 检查蜡筒和留声机\n' +
            'B. 询问苏蔓的看法\n' +
            'C. 翻阅之前整理的调查资料，看看这与案件有哪些联系\n' +
            'D. 其他行动（自行输入）';
        return { preSan: preSan, sanMarker: sanMarker, postSan: postSan, options: options };
    },

    buildIntroNarrative(character) {
        var intro = this.buildIntroSegments(character);
        return intro.preSan + '\n\n' + intro.options;
    },

    openSetup() {
        if (typeof document === 'undefined') return;
        if (typeof MenuSystem !== 'undefined') MenuSystem.closeMenu();
        this._modalState = {
            step: 'entry',
            occupationKey: 'reporter',
            creationMode: 'demo-rolled',
            name: '',
            gender: '',
            nationality: '中国',
            attributes: null,
            rollIndex: 0,
            skillPoints: 80,
            skillAllocations: {}
        };
        this.renderSetupModal();
    },

    openCharacterSetup() {
        if (!this._modalState) this.openSetup();
        this._modalState.step = 'occupation';
        this.renderSetupModal();
    },

    openAttributeSetup(occupationKey) {
        if (!this._modalState) this.openSetup();
        this._modalState.occupationKey = occupationKey || this._modalState.occupationKey || 'reporter';
        this._modalState.step = 'attributes';
        this.renderSetupModal();
    },

    closeSetupModal() {
        var overlay = document.getElementById('tutorial-setup-overlay');
        if (overlay) overlay.remove();
        this._modalState = null;
    },

    renderSetupModal() {
        var self = this;
        var state = this._modalState || {};
        var overlay = document.getElementById('tutorial-setup-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tutorial-setup-overlay';
            overlay.className = 'tutorial-setup-overlay active';
            document.body.appendChild(overlay);
        }

        var profile = this.getOccupationProfile(state.occupationKey || 'reporter');
        var summary = this.getSaveSummary();
        var html = '<div class="tutorial-modal">';
        html += '<div class="tutorial-modal-header"><div><div class="tutorial-kicker">15分钟试玩</div><h2>雨夜电台</h2></div><button class="tutorial-close" data-action="close">×</button></div>';
        html += '<div class="tutorial-steps"><span class="' + (state.step === 'entry' ? 'active' : '') + '">入口</span><span class="' + (state.step === 'occupation' ? 'active' : '') + '">职业</span><span class="' + (state.step === 'attributes' ? 'active' : '') + '">属性</span><span class="' + (state.step === 'skills' ? 'active' : '') + '">技能</span></div>';

        if (state.step === 'entry') {
            html += '<div class="tutorial-modal-body">';
            html += '<p>《克苏鲁的呼唤》（COC）是一种恐怖推理桌面游戏：你扮演一名「调查员」去查一桩怪事，行动的成败由掷骰子决定，故事由 AI 主持人讲述。接下来用三小步创建你的调查员，然后开始一段约 10 分钟的故事。</p>';
            html += '<p class="tutorial-note">试玩使用独立存档，不影响正式游戏的任何存档。</p>';
            if (summary) {
                html += '<div class="tutorial-save-summary"><strong>已有试玩档</strong><span>' + summary.characterName + ' · ' + summary.chapter + '</span></div>';
            } else {
                html += '<div class="tutorial-save-summary muted"><strong>暂无试玩档</strong><span>可以新建一份独立试玩档。</span></div>';
            }
            html += '<div class="tutorial-actions"><button class="primary" data-action="new">新开试玩档</button><button data-action="load" ' + (summary ? '' : 'disabled') + '>读取试玩档</button></div>';
            html += '<p class="tutorial-note">创建角色共三步：选职业 → 掷属性 → 分配技能点。每步都有说明，跟着点就行。</p>';
            html += '</div>';
        } else if (state.step === 'occupation') {
            html += '<div class="tutorial-modal-body">';
            html += '<p><strong>第一步：选职业。</strong>职业决定你是谁——开场的故事、认识的人和擅长的本事都不同，但没有强弱之分，三个都能玩通。凭感觉选一个顺眼的就好。</p>';
            html += '<div class="tutorial-occ-grid">';
            Object.keys(this.OCCUPATIONS).forEach(function(key) {
                var occ = self.OCCUPATIONS[key];
                var selected = key === state.occupationKey ? ' selected' : '';
                var desc = key === 'reporter' ? '与苏蔓共同追查无声失踪案。' : key === 'detective' ? '从巡捕房旧案和现场破绽切入。' : '从苏蔓求助和危机反应切入。';
                html += '<button class="tutorial-occ-card' + selected + '" data-action="select-occupation" data-key="' + key + '"><strong>' + occ.label + '</strong><span>' + desc + '</span></button>';
            });
            html += '</div><div class="tutorial-actions"><button data-action="back-entry">返回</button><button class="primary" data-action="to-attributes">下一步</button><button data-action="use-pregen">使用已车好的卡：' + profile.name + '</button></div>';
            html += '</div>';
        } else if (state.step === 'attributes') {
            var attrKeys = ['str', 'con', 'siz', 'dex', 'app', 'int', 'pow', 'edu', 'luck'];
            var attrNames = { str: 'STR 力量', con: 'CON 体质', siz: 'SIZ 体型', dex: 'DEX 敏捷', app: 'APP 外貌', int: 'INT 智力', pow: 'POW 意志', edu: 'EDU 教育', luck: '幸运' };
            var attrs = state.attributes || {};
            html += '<div class="tutorial-modal-body">';
            html += '<p><strong>第二步：掷属性。</strong>属性是角色的天生底子——力量、智力、意志等等。COC 的传统是用骰子决定：点下方按钮逐项投掷，掷出多少就是多少，数字越大越强（范围大约 15-90）。运气也是角色的一部分。</p>';
            html += '<label class="tutorial-name-label">调查员姓名<input id="tutorial-character-name" maxlength="16" value="' + (state.name || '') + '" placeholder="输入姓名"></label>';
            html += '<div style="display:flex;gap:8px;margin-bottom:10px;">';
            html += '<label style="flex:1;font-size:12px;">性别<select id="tutorial-gender" style="width:100%;margin-top:2px;">';
            ['男', '女', '其他'].forEach(function(g) {
                html += '<option value="' + g + '"' + (state.gender === g ? ' selected' : '') + '>' + g + '</option>';
            });
            html += '</select></label>';
            html += '<label style="flex:1;font-size:12px;">国籍<select id="tutorial-nationality" style="width:100%;margin-top:2px;">';
            var nationalities = ['中国', '美国', '英国', '法国', '德国', '日本', '俄罗斯', '意大利', '西班牙', '印度', '埃及', '巴西', '墨西哥', '其他'];
            nationalities.forEach(function(n) {
                html += '<option value="' + n + '"' + (state.nationality === n ? ' selected' : '') + '>' + n + '</option>';
            });
            html += '</select></label></div>';
            if (state.nameError) {
                html += '<p class="tutorial-error">请先输入调查员姓名；只有“使用已车好的卡”会采用预设姓名。</p>';
            }
            html += '<div class="tutorial-attr-grid">';
            attrKeys.forEach(function(key, index) {
                var isCurrent = index === state.rollIndex && !attrs[key];
                html += '<div class="tutorial-attr ' + (isCurrent ? 'current' : '') + '"><span>' + attrNames[key] + '</span><strong>' + (attrs[key] || '--') + '</strong></div>';
            });
            html += '</div>';
            var currentKey = attrKeys[state.rollIndex];
            if (currentKey) {
                html += '<div class="tutorial-actions"><button data-action="back-occupation">返回</button><button class="primary" data-action="roll-attr">掷 ' + attrNames[currentKey] + '</button></div>';
            } else {
                html += '<div class="tutorial-actions"><button data-action="reroll-attrs">重新投掷</button><button class="primary" data-action="to-skills">下一步：分配推荐技能</button></div>';
            }
            html += '<p class="tutorial-note">体质和体型决定生命值（HP）；意志决定理智值（SAN）——遇到恐怖事物理智会减少，这是 COC 的招牌机制。掷骰公式：多数属性为 3D6×5，体型/智力/教育为 (2D6+6)×5。</p>';
            html += '</div>';
        } else if (state.step === 'skills') {
            var recs = this.getSkillRecommendations(state.occupationKey);
            html += '<div class="tutorial-modal-body">';
            html += '<p><strong>第三步：分配技能点。</strong>技能是后天练出来的本事，数值就是成功率——「侦查 65」表示掷骰时 65% 概率成功。下面是适合' + profile.label + '的技能，点 + 号加点（每次 +10，剩余 <strong>' + state.skillPoints + '</strong> 点，单项最高 80）。不想研究就点「推荐分配」，一键搞定。</p>';
            html += '<div class="tutorial-skill-list">';
            recs.forEach(function(rec) {
                var added = state.skillAllocations[rec.name] || 0;
                var baseVal = self.getSkillBaseForSetup(rec.name, state);
                var atCap = baseVal + added + 10 > 80;
                html += '<div class="tutorial-skill-row"><div><strong>' + rec.name + ' +' + added + '</strong><span>' + rec.reason + '</span></div><button data-action="skill-minus" data-skill="' + rec.name + '">−</button><button data-action="skill-plus" data-skill="' + rec.name + '" ' + (state.skillPoints <= 0 || atCap ? 'disabled' : '') + '>+</button></div>';
            });
            html += '</div><div class="tutorial-actions"><button data-action="back-attributes">返回</button><button data-action="auto-skills">推荐分配</button><button class="primary" data-action="start">开始试玩</button></div>';
            html += '</div>';
        }

        html += '</div>';
        overlay.innerHTML = html;

        overlay.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.handleSetupAction(this.dataset.action, this.dataset);
            });
        });
        var nameInput = overlay.querySelector('#tutorial-character-name');
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                state.name = this.value.trim();
            });
        }
        var genderInput = overlay.querySelector('#tutorial-gender');
        if (genderInput) {
            genderInput.addEventListener('change', function() {
                state.gender = this.value;
            });
        }
        var natInput = overlay.querySelector('#tutorial-nationality');
        if (natInput) {
            natInput.addEventListener('change', function() {
                state.nationality = this.value;
            });
        }
    },

    handleSetupAction(action, dataset) {
        var state = this._modalState;
        if (!state) return;
        if (action === 'close') {
            this.closeSetupModal();
            if (typeof MenuSystem !== 'undefined') MenuSystem.openMenu();
            return;
        }
        if (action === 'new') {
            state.step = 'occupation';
        } else if (action === 'load') {
            this.closeSetupModal();
            this.loadProgress();
            return;
        } else if (action === 'back-entry') {
            state.step = 'entry';
        } else if (action === 'select-occupation') {
            state.occupationKey = dataset.key;
            state.attributes = null;
            state.rollIndex = 0;
            state.skillAllocations = {};
            state.skillPoints = 80;
        } else if (action === 'to-attributes') {
            state.step = 'attributes';
        } else if (action === 'use-pregen') {
            var profile = this.getOccupationProfile(state.occupationKey);
            state.name = profile.name;
            state.creationMode = 'demo-pregen';
            state.attributes = null;
            state.skillAllocations = {};
            state.skillPoints = 80;
            state.nameError = false;
            state.step = 'skills';
        } else if (action === 'back-occupation') {
            state.step = 'occupation';
        } else if (action === 'roll-attr') {
            this.rollNextSetupAttribute();
        } else if (action === 'reroll-attrs') {
            state.attributes = null;
            state.rollIndex = 0;
        } else if (action === 'to-skills') {
            var input = document.getElementById('tutorial-character-name');
            state.name = input ? input.value.trim() : state.name;
            var genderEl = document.getElementById('tutorial-gender');
            state.gender = genderEl ? genderEl.value : (state.gender || '');
            var natEl = document.getElementById('tutorial-nationality');
            state.nationality = natEl ? natEl.value : (state.nationality || '中国');
            if (!state.name) {
                state.nameError = true;
                this.renderSetupModal();
                return;
            }
            state.nameError = false;
            state.creationMode = 'demo-rolled';
            state.step = 'skills';
        } else if (action === 'back-attributes') {
            state.step = state.creationMode === 'demo-pregen' ? 'occupation' : 'attributes';
        } else if (action === 'skill-plus') {
            if (state.skillPoints >= 10) {
                var plusSkill = dataset.skill;
                var currentAlloc = state.skillAllocations[plusSkill] || 0;
                var baseVal = this.getSkillBaseForSetup(plusSkill, state);
                if (baseVal + currentAlloc + 10 > 80) return;
                state.skillAllocations[plusSkill] = currentAlloc + 10;
                state.skillPoints -= 10;
            }
        } else if (action === 'skill-minus') {
            var minusSkill = dataset.skill;
            if ((state.skillAllocations[minusSkill] || 0) >= 10) {
                state.skillAllocations[minusSkill] -= 10;
                state.skillPoints += 10;
            }
        } else if (action === 'auto-skills') {
            this.autoAllocateSetupSkills();
        } else if (action === 'start') {
            var opts = {
                occupationKey: state.occupationKey,
                creationMode: state.creationMode,
                name: state.creationMode === 'demo-pregen' ? undefined : (state.name || '调查员'),
                attributes: state.attributes || undefined,
                skillAllocations: state.skillAllocations || {},
                gender: state.gender || '',
                nationality: state.nationality || '中国'
            };
            this.closeSetupModal();
            this.start(opts);
            return;
        }
        this.renderSetupModal();
    },

    rollNextSetupAttribute() {
        var state = this._modalState;
        if (!state) return;
        var keys = ['str', 'con', 'siz', 'dex', 'app', 'int', 'pow', 'edu', 'luck'];
        var key = keys[state.rollIndex];
        if (!key) return;
        if (!state.attributes) state.attributes = {};
        if (typeof COCRules !== 'undefined' && COCRules.rollSingleAttribute && key !== 'luck') {
            state.attributes[key] = COCRules.rollSingleAttribute(key);
        } else {
            var formula = (key === 'siz' || key === 'int' || key === 'edu') ? '2d6+6' : '3d6';
            state.attributes[key] = this.rollAttribute(formula);
        }
        state.rollIndex += 1;
    },

    autoAllocateSetupSkills() {
        var state = this._modalState;
        if (!state) return;
        state.skillAllocations = {};
        state.skillPoints = 80;
        var recs = this.getSkillRecommendations(state.occupationKey);
        var self = this;
        var canAdd = function(name) {
            var base = self.getSkillBaseForSetup(name, state);
            return base + (state.skillAllocations[name] || 0) + 10 <= 80;
        };
        for (var i = 0; i < recs.length && state.skillPoints > 0; i++) {
            if (!canAdd(recs[i].name)) continue;
            state.skillAllocations[recs[i].name] = (state.skillAllocations[recs[i].name] || 0) + 10;
            state.skillPoints -= 10;
        }
        for (var j = 0; j < recs.length && state.skillPoints > 0; j++) {
            if (!canAdd(recs[j].name)) continue;
            state.skillAllocations[recs[j].name] = (state.skillAllocations[recs[j].name] || 0) + 10;
            state.skillPoints -= 10;
        }
    },

    installEntryHandler() {
        this.openSetup();
    },

    installOccupationHandler() {
        this.openCharacterSetup();
    },

    installAttributeHandler(occupationKey) {
        this.openAttributeSetup(occupationKey);
    },

    resetRuntime() {
        // 每步独立try/catch：任何一环抛错都不能让后续重置被跳过，
        // 否则旧Story状态(localStorage恢复的通关flag)会带病服役整局(2026.6.10脏档事故根因)
        var steps = [
            function() {
                if (typeof Story !== 'undefined') {
                    // 最先净化Story：旧局flag/进度/结局态全部清零，不等startMod
                    Story.state.stageFlags = {};
                    Story.state.currentStageIndex = 0;
                    Story.state.recentOptions = [];
                    Story.state.ended = false;
                    Story.state._deadlineTurns = 0;
                    Story.state._blockedAdvance = null;
                    Story.state._combatStarted = false;
                    Story.state.turnCount = 0;
                    Story.state.sceneVisitCount = {};
                    Story.state.searchedLocations = {};
                    Story.state.visitedRooms = {};
                    Story.state._laokanSeen = false;
                    Story.state._travelIntentSeen = false;
                    Story.save();
                }
            },
            function() {
                if (typeof Terminal !== 'undefined') {
                    Terminal.clear();
                    Terminal._chatLog = [];
                    if (Terminal._saveChatLog) Terminal._saveChatLog();
                    Terminal.quickMode = true;
                }
            },
            function() {
                if (typeof API !== 'undefined') API.conversationHistory = [];
            },
            function() {
                // 新开局清空调试日志：日志跨会话持久化会把上一局(旧版本)的脏记录混进新导出文件，
                // 制造"开局就脏"的假象(2026.6.11复盘：14:56报告第0条即上一局残留)
                if (typeof API !== 'undefined' && API.clearDebugLog) API.clearDebugLog();
            },
            function() {
                if (typeof NPCManager !== 'undefined') {
                    NPCManager.companions = [];
                    NPCManager.contacts = [];
                    NPCManager.allNPCs = {};
                    NPCManager.save();
                }
            },
            function() {
                if (typeof Character !== 'undefined' && Character.resetPersistentState) Character.resetPersistentState();
            },
            function() {
                if (typeof MemorySystem !== 'undefined') MemorySystem.clearMemory();
            },
            function() {
                if (typeof KPNotebook !== 'undefined' && KPNotebook.reset) KPNotebook.reset();
            }
        ];
        for (var i = 0; i < steps.length; i++) {
            try { steps[i](); } catch (e) {
                if (typeof console !== 'undefined') console.error('resetRuntime第' + i + '步失败:', e);
            }
        }
    },

    async start(options) {
        if (typeof Main === 'undefined' || typeof Story === 'undefined' || typeof Character === 'undefined') {
            if (typeof Terminal !== 'undefined') Terminal.printError('教程启动失败：核心系统未加载。');
            return;
        }

        this.resetRuntime();

        var character = this.createInvestigator(options || {});
        var scenario = this.createScenario();
        var introSegments = this.buildIntroSegments(character);
        var introText = this.buildIntroNarrative(character);
        scenario.introNarrative = introText;

        Character.current = character;
        Main.gameState.character = character;
        Character.save();

        if (typeof Character.initPersistentState === 'function') {
            Character.initPersistentState();
            character.belongings.split('、').forEach(function(item) {
                if (item) Character.addInventoryItem(item.replace(/[。,.，]$/g, ''));
            });
            Character.addInventoryItem('怀表');
        }

        if (typeof MemorySystem !== 'undefined') {
            MemorySystem.initScenario(scenario);
        }

        Story.startMod(scenario, { silent: true });

        // 净化保险：新开局必须零flag零进度（防止任何残留状态污染整局，见2026.6.10长跑日志第0条事故）
        Story.state.stageFlags = {};
        Story.state.currentStageIndex = 0;
        Story.state.recentOptions = [];
        Story.state.ended = false;
        Story.state._deadlineTurns = 0;
        Story.state._blockedAdvance = null;
        Story.state.turnCount = 0;
        Story.state.sceneVisitCount = {};
        Story.state.searchedLocations = {};
        Story.state.visitedRooms = {};
        Story.state._laokanSeen = false;
        Story.state._combatStarted = false;
        Story.state._travelIntentSeen = false;
        Story.save();

        // 把苏蔓加入队友
        if (typeof NPCManager !== 'undefined') {
            var suMan = null;
            for (var npcId in NPCManager.allNPCs) {
                if (NPCManager.allNPCs[npcId].name === '苏蔓') {
                    suMan = NPCManager.allNPCs[npcId];
                    break;
                }
            }
            if (suMan) {
                NPCManager.addCompanion(suMan.id, true);
            }
        }

        Main.gameState.story = Story.state;
        Main.gameState.conversationHistory = [];
        Main.gameState.npcs = typeof NPCManager !== 'undefined' ? NPCManager.getAll() : { companions: [], contacts: [], allNPCs: {}, combatPower: '无' };
        Main.gameState.quickMode = true;
        Main.gameState.difficulty = 'investigator';
        Main.gameState.grieferLevel = 0;
        Main.gameState.grieferHistory = [];
        Main.gameState.usedSkills = [];
        Main.gameState.bonusDice = 0;
        Main.gameState.hiddenBonusDice = 0;
        Main.gameState.hiddenBonusThisChapter = 0;
        Main.gameState.hiddenBonusTotal = 0;
        Main.gameState.isIntroNarrative = false;
        Main.gameState.isTutorialDemo = true;
        Main.gameState.tutorialId = this.id;
        Main.gameState.combat = { active: false, round: 0, initiative: [], currentTurn: null, pendingDodge: null, dodgeCountThisRound: 0 };

        if (typeof GrieferDetector !== 'undefined') {
            GrieferDetector.level = 0;
            GrieferDetector.history = [];
        }

        // 盲测反馈D1：目标与死线必须明示（只说"必须"，不剧透后果）
        Story.state.currentGoal = '在 23:57 前查明真相';

        Main.updateStatusBar();
        Main.updateSidebar();

        if (typeof Terminal !== 'undefined') {
            Terminal.printSuccess('试玩教程已启动：雨夜电台');
            Terminal.printSystem('调查员职业：' + character.occupation + '。试玩使用轻量车卡，属性与推荐技能来自开局弹窗。');
            Terminal.printSystem('━━━ 怎么玩 ━━━\n' +
                '· 每轮故事后会出现 A/B/C 行动按钮，点选即可；选 D 或直接在下方输入框打字，可以做任何你想做的事\n' +
                '· 行动有成败悬念时会弹出骰子窗口，点击投掷——这就是 COC 的 d100 检定，骰出低于技能值即成功\n' +
                '· 左侧边栏实时显示你的 HP（生命）、SAN（理智，遇到恐怖事物会减少）、线索和当前目标\n' +
                '· 故事约 15-20 分钟，有时间压力，注意推进；你的选择会决定结局');
            Terminal.printSystem('━━━ 你的目标 ━━━\n你必须在 23:57 前查明真相。');
            Terminal.printSystem('━━━ 教程开场 ━━━');
            Terminal.printKP(introSegments.preSan);
            Terminal._addChatLog('kp', introSegments.preSan);
            if (typeof Main !== 'undefined' && Main.processDiceMarkers) {
                await Main.processDiceMarkers(introSegments.sanMarker, { autoContinue: false });
            }
            if (typeof Story !== 'undefined' && Story.setStageFlag) {
                Story.setStageFlag('demo_intro_san_done');
            }
            if (introSegments.postSan) {
                Terminal.printKP(introSegments.postSan);
                Terminal._addChatLog('kp', introSegments.postSan);
            }
            Terminal.renderQuickOptions(introSegments.options);
        }

        if (typeof API !== 'undefined') {
            API.conversationHistory.push({
                role: 'assistant',
                content: (typeof Main !== 'undefined' && Main.stripDiceMarkers) ? Main.stripDiceMarkers(introText, true) : introText
            });
        }

        this.saveProgress();

        if (typeof MenuSystem !== 'undefined') {
            MenuSystem.closeMenu();
        }
    }
};
