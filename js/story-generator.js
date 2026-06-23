const StoryGenerator = {
    PRESET_MODULES: null,

    STORY_TEMPLATES: {
        structures: [
            { name: '密室推理', layers: ['表面犯罪', '超自然边缘', '克苏鲁真相'], coreElements: ['密室', '不在场证明', '时间诡计'] },
            { name: '失踪调查', layers: ['失踪案', '线索追踪', '异界入口'], coreElements: ['最后行踪', '研究笔记', '不该存在的门'] },
            { name: '封闭机构', layers: ['公共卫生事件', '异常发现', '古老存在'], coreElements: ['隔离', '目击报告', '地质异常'] },
            { name: '遗产争夺', layers: ['表面犯罪', '器物来历', '封印真相'], coreElements: ['遗嘱', '古董', '家族秘密'] }
        ],

        eras: [
            { id: '1920s', name: '1920年代', locations: ['阿卡姆', '纽约', '波士顿', '伦敦', '京都', '北平', '上海'] },
            { id: 'victorian', name: '维多利亚时代', locations: ['伦敦', '爱丁堡', '曼彻斯特', '利物浦'] },
            { id: 'modern', name: '现代', locations: ['纽约', '洛杉矶', '东京', '上海'] }
        ],

        atmospheres: [
            { id: 'cosmic_horror', name: '宇宙恐怖', entities: ['深潜者', '米·戈', '廷达洛斯猎犬', '奈亚拉托提普', '古老存在'] },
            { id: 'mystery', name: '神秘推理', entities: ['封印', '古老仪式', '家族诅咒', '异界入口'] },
            { id: 'folk_horror', name: '民俗恐怖', entities: ['地方传说', '古老祭祀', '土地之灵', '祖先意识'] }
        ],

        occupations: [
            { name: '私家侦探', skills: ['侦查', '心理学'], traits: ['职业关系', '信息渠道'] },
            { name: '记者', skills: ['图书馆', '说服'], traits: ['人脉广泛', '不受限制'] },
            { name: '医生', skills: ['医学', '科学'], traits: ['专业知识', '同行关系'] },
            { name: '教授', skills: ['考古学', '历史'], traits: ['学术资源', '文献解读'] },
            { name: '警察', skills: ['侦查', '格斗'], traits: ['执法权限', '官方渠道'] },
            { name: '建筑师', skills: ['建筑学', '地质学'], traits: ['结构直觉', '空间感知'] }
        ],

        clueTypes: [
            { type: 'physical', name: '物证', examples: ['遗物', '文件', '器物', '痕迹'] },
            { type: 'testimony', name: '证词', examples: ['目击者', '嫌疑人', '知情者', '受害者'] },
            { type: 'document', name: '文献', examples: ['日记', '笔记', '信件', '档案'] },
            { type: 'environment', name: '环境', examples: ['异常现象', '地质特征', '建筑结构'] }
        ],

        checkTypes: [
            { skill: '侦查', difficulty: '常规', purpose: '发现隐藏线索' },
            { skill: '心理学', difficulty: '困难', purpose: '判断NPC真实意图' },
            { skill: '图书馆', difficulty: '常规', purpose: '查阅文献资料' },
            { skill: '说服', difficulty: '困难', purpose: '获取NPC信任' },
            { skill: '神秘学', difficulty: '极难', purpose: '理解超自然知识' }
        ]
    },

    NARRATIVE_PATTERNS: {
        openings: [
            '你接到{委托来源}——{事件描述}。等你赶到时，{现场状态}。',
            '{时间}，{地点}。{事件概述}。现在，你站在{当前位置}。',
            '{死者/失踪者}，{身份描述}，{时间}在{地点}{事件}。{后续发展}。'
        ],

        sceneDescriptions: [
            '{地点}的{时间}，{氛围描写}。{感官细节}。',
            '你走进{地点}，{第一印象}。{细节描写}。',
            '{地点}里{环境状态}。{关键物品}在{位置}。'
        ],

        npcDialogues: {
            cooperative: '{NPC名}将{物品/信息}递过来，{动作描写}："{对话内容}"',
            reserved: '{NPC名}的{神态描写}："{简短回应}"',
            hostile: '{NPC名}{敌意动作}："{拒绝/威胁}"',
            breaking: '{NPC名}{崩溃描写}，{坦白内容}'
        },

        clueReveals: [
            '你注意到{线索描述}。{推理提示}。',
            '{检定技能}检定成功：{发现内容}。',
            '{NPC名}透露：{关键信息}。'
        ],

        truthReveals: [
            '综合所有线索，你可以得出结论：{真相概述}。',
            '{NPC名}最终承认：{核心真相}。',
            '你意识到{克苏鲁元素}——{最终解释}。'
        ]
    },

    init() {
        this.loadPresetModules();
    },

    loadPresetModules() {
        this.PRESET_MODULES = [
            {
                id: 'tidehouse-requiem',
                title: '潮汐房间的安魂曲',
                era: '1920s',
                location: '阿卡姆北郊·潮汐庄园',
                difficulty: 3,
                duration: '2.5-3.5小时',
                tags: ['密室推理', '深海', '封印', '单人'],
                hook: '潮水退去时，那栋房子会露出不该存在的第十二个房间。',
                structure: '密室推理',
                layers: [
                    { name: '第一幕·晚宴', focus: '推理为主，超自然仅作暗示。密室之死+法医检验异常为转折点', duration: '40-60分钟' },
                    { name: '第二幕·潮汐', focus: '推理与超自然并行，线索开始闭合。发现地下通道/大潮倒计时为转折点', duration: '50-80分钟' },
                    { name: '第三幕·深渊', focus: '超自然为主，推理成果决定结局。Z\'hal-Voth显现', duration: '40-60分钟' }
                ],
                npcs: [
                    { name: '埃德蒙·索恩', role: '死者之弟/古董商', trust: 4, secret: '知道家族秘密，想变卖庄园还债，篡改遗嘱', dialogueStyle: '圆滑幽默，眼神总是在计算，紧张时摸左手无名指', trustThresholds: { '3-4': '只谈生意，否认异常', '5-6': '承认阿比盖尔变奇怪', '7-8': '承认家族有传统', '9-10': '全盘托出，只想走人' } },
                    { name: '玛格丽特·韦恩', role: '考古学教授/死者旧友', trust: 5, secret: '翻译过封印文献，选择否认和逃避三年', dialogueStyle: '学究气，引用频繁，紧张时语速极快，习惯推眼镜', trustThresholds: { '3-4': '只谈学术，否认翻译异常文献', '5-6': '承认翻译过拉丁文', '7-8': '承认文献涉及仪式', '9-10': '崩溃，交出翻译笔记' } },
                    { name: '哈罗德·基特里奇', role: '庄园管家', trust: 3, secret: '知道庄园一切，每天协助仪式，SAN已低，偶尔听到地下低语', dialogueStyle: '沉默寡言，措辞精确，回答前停顿2-3秒斟酌', trustThresholds: { '0-2': '只答是/否', '3-4': '极简回答直接问题', '5-6': '透露日常细节', '7-8': '承认知道地下的东西', '9-10': '全盘托出，包括低语和封印' } },
                    { name: '莉莉安·克罗斯', role: '私人医生', trust: 6, secret: '发现死者X光片有不可能的脑部结构变化，选择不深究', dialogueStyle: '专业冷静，回避精神状态提问，用医学术语制造距离感', trustThresholds: { '5-6': '承认死者有失眠和幻觉', '7-8': '承认X光片异常', '9-10': '交出X光片，承认逃避' } },
                    { name: '多丽丝·帕尔默', role: '女仆', trust: 7, secret: '无大秘密但是最佳信息源，知道夫人日常、厨房渗咸水、地下传来歌声', dialogueStyle: '胆小话多，容易紧张，像连珠炮，跑题内容往往有用' }
                ],
                chekhovGuns: [
                    { plant: '门环章鱼造型，触手缠绕球体', payoff: '球体是封印容器，触手数=封印层数' },
                    { plant: '女仆提到夫人每天黄昏去海边祈祷室', payoff: '祈祷室实为祭坛，夫人一直在维持封印' },
                    { plant: '书房翻开的《潮汐与月相》，当前页"大潮"', payoff: '大潮之夜庄园与海底通道完全连接' },
                    { plant: '管家递来加冰威士忌，冰块形状不规则', payoff: '冰取自地下室冷库，冷库建在海底通道入口上方' },
                    { plant: '死者怀表停在9:17，但法医判断死亡8:30-9:00', payoff: '9:17是潮水涨到特定高度的时刻，密室"墙壁"移动过' },
                    { plant: '走廊7幅肖像，1712年那幅画中人手持三叉戟', payoff: '三叉戟是封印法器，1712年封印建立之年' },
                    { plant: '花园玫瑰全部朝向大海生长', payoff: '植物被地下渗出的深海物质影响' },
                    { plant: '东翼钟每天慢三分钟修不好', payoff: '钟靠近空间扭曲区域，时间流速不同' },
                    { plant: '晚宴菜单有深海螯虾浓汤，死者只喝一口', payoff: '死者尝出汤中有深海生物体液' },
                    { plant: '海鸥撞死在庄园窗户上', payoff: '海鸥被深海低频声波驱使，封印松动时从地下传出' }
                ],
                entity: 'Z\'hal-Voth（潮汐之影）',
                entityData: { name: 'Z\'hal-Voth', type: '外神眷族', pow: 20, hp: 22, attacks: [{ name: '潮汐碾压', chance: 35, damage: '2D6' }, { name: '精神侵蚀', effect: '视线内每轮自动-1SAN' }], sanLoss: '1/1D6', weakness: '封印法器造成全额伤害，退潮时力量减半' },
                subEntity: { name: '深渊守望者', type: '深渊族裔退化形态', pow: 16, hp: 16, attacks: [{ name: '腐蚀之触', chance: 50, damage: '1D4+1' }, { name: '深渊低语', effect: '30码内POW检定，失败1/1D3SAN' }], sanLoss: '0/1D4', note: '优先对话，不是单纯怪物，想将封印传递给下一个看守者' },
                endings: [
                    { condition: '完成封印，埃德蒙提供血脉之血', result: '安魂曲——封印稳固，获得"潮汐低语"', sanChange: '+1D6' },
                    { condition: '完成封印，但念咒者SAN归零', result: '潮汐的代价——封印完成但调查者永久疯狂，成为新守望者', sanChange: '永久疯狂' },
                    { condition: '释放Z\'hal-Voth', result: '大海的记忆——短期安全，长期灾难', sanChange: '-1D10' },
                    { condition: '杀死守望者完成封印', result: '十年的安宁——临时解决，10年后封印再松动', sanChange: '-1D6' },
                    { condition: '未在大潮之夜做出选择', result: '溺亡——Z\'hal-Voth部分显现，庄园被海水吞没', sanChange: '-1D6' }
                ],
                recommendedOccupations: [
                    { name: '私家侦探', reason: '受雇调查索恩家族，侦查/心理学高', npcBonus: '埃德蒙+1，哈罗德-1' },
                    { name: '记者', reason: '阿卡姆公报记者，图书馆/说服高', npcBonus: '埃德蒙-1，多丽丝+1' },
                    { name: '医生', reason: '莉莉安的同行，医学/急救高', npcBonus: '莉莉安+2' },
                    { name: '教授', reason: '密斯卡托尼克大学，考古学/神秘学高', npcBonus: '玛格丽特+2' },
                    { name: '建筑师', reason: '历史建筑修复师，建筑学/地质学高', npcBonus: '哈罗德+2' }
                ],
                openingNarrative: '海风裹着盐粒和低沉的雷鸣，拍打在你的脸上。阿卡姆北郊的沿海公路在悬崖边蜿蜒，你的左侧是灰色的石壁，右侧是同样灰色的大西洋。\n\n潮汐庄园出现在路的尽头。它蹲伏在悬崖上，像一只蜷缩的动物——三层灰石建筑，哥特式尖顶被海风侵蚀得圆钝，窗户狭长，像半闭的眼睛。庄园下方，退潮的海水露出大片黑色礁石，海藻挂在上面像湿漉漉的头发。\n\n你走上前，伸手去叩门。手指触到门环的瞬间，你停住了——那是一个章鱼造型的铜环，八条触手缠绕着一个球体，球体表面光滑得不正常，像是经常被人触摸。你叩了三下。\n\n声音还没消散，你身后的海面上，一只海鸥突然折转方向，笔直地撞上了庄园二楼的一扇窗户。玻璃没有碎，但海鸥滑落下去，落在玫瑰丛中。花园里的玫瑰——你注意到了——全部朝着大海的方向倾斜，像是被一只看不见的手按下去的。\n\n门开了。',
                kpNotes: '核心设计理念：1.推理不是铺垫——潮汐制造密室是物理机制，超自然不取消推理而是扩展推理维度。2.恐惧来自理解——阿比盖尔不是被谋杀，是被压垮，她邀请你来是为了找接班人。3.每个NPC都有人性——谎言不是因为邪恶，是因为无法面对真相。4.单人体验核心是孤独感。困难自适应：调查者快速破案则提前触发深层线索；卡关则多丽丝/莉莉安主动提供信息；想战斗则守望者更愿意对话；想逃跑则大潮之夜空间扭曲。'
            },
            {
                id: 'senbonji-lost',
                title: '千本路迷失',
                era: '1920s',
                location: '京都·东山·千本路',
                difficulty: 3,
                duration: '2-3小时',
                tags: ['失踪调查', '古代文书', '异界入口', '单人'],
                hook: '研究古代祭祀的学者在京都消失，他走进了一扇"不该存在的门"。',
                structure: '失踪调查',
                layers: [
                    { name: '第一层·失踪', focus: '鳟井最后行踪、消失前异常行为——失踪案调查', duration: '40-60分钟' },
                    { name: '第二层·文书', focus: '敦煌残片内容、鳟井对它的解读——文献考据与推理', duration: '50-70分钟' },
                    { name: '第三层·门', focus: '"门"的本质、鳟井去了哪里——克苏鲁真相', duration: '30-50分钟' }
                ],
                npcs: [
                    { name: '安东教授', role: '京都大学人文科学研究所教授', trust: 4, secret: '知道敦煌残片内容，不愿借出是因为"有些东西还在运作"', dialogueStyle: '复杂神态，学术严谨但内心恐惧', trustThresholds: { '3-4': '只承认认识鳟井', '5-6': '透露鳟井来借残片被拒', '7-8': '承认残片记载七窍镜', '9-10': '交出鳟井留给他的信，透露最终真相' } },
                    { name: '高桥', role: '鳟井的助手/研究生', trust: 6, secret: '见过七窍镜，知道鳟井最后状态"我找到了"', dialogueStyle: '年轻焦虑，对导师忠诚，急于找到鳟井' },
                    { name: '古贺', role: '鸠车堂古董店主', trust: 5, secret: '知道鳟井追查铜镜，鳟井问过他"门"的定义', dialogueStyle: '六十多岁老人，说话慢，对古物有敬畏' }
                ],
                chekhovGuns: [
                    { plant: '七窍镜——镜背刻"七窍"，边缘北斗七星孔洞', payoff: '引导灵魂穿越的器具，"让死者看见生人"' },
                    { plant: '鳟井留给安东的信', payoff: '信中可能记载鳟井最终发现的真相' },
                    { plant: '敦煌残片原文："以己之魂为引，唤彼方之物"', payoff: '开门需要使用者灵魂为引，被呼唤的存在应声而来' },
                    { plant: '古贺说的"门"——不应该出现的地方出现的东西', payoff: '门不是空间，是状态——两个世界交汇的临界点' },
                    { plant: '秋分之夜', payoff: '特定时节，阴阳交界，"门"更容易出现' },
                    { plant: '镜面边缘的计数刻痕——七个一组共五组', payoff: '暗示镜子被使用过五次，五个人"进去"过' }
                ],
                entity: '先于人类的存在',
                entityData: { name: '先于人类的存在', type: '附着于器物的远古意识', manifestation: '不是鬼魂，是在人类出现之前就存在于这片土地的东西，死后"记忆"附着在器物上', danger: '进入门的人不是"探访"而是"留下"，意识永远困在那个地方' },
                endings: [
                    { condition: '止步于此，将真相告知委托人', result: '保住自己，但鳟井永远留在门的那一边', sanChange: '-1D6' },
                    { condition: '继续追查，寻找那座神社', result: '可能进入门，面临与鳟井相同的命运', sanChange: '-1D10' }
                ],
                recommendedOccupations: [
                    { name: '东京警视厅刑警', reason: '有协作渠道进入现场，但地方警察可能不配合', npcBonus: '安东+1（官方身份）' },
                    { name: '《朝日新闻》记者', reason: '接触各方不受限，但可能被官方施压', npcBonus: '高桥+1（媒体关注有利）' },
                    { name: '东京帝国大学助教', reason: '与鳟井有学术关联，可整理遗物', npcBonus: '安东+2（学术同行）' },
                    { name: '鳟井旧友/同期', reason: '私人关系，获取研究资料不受限', npcBonus: '高桥+2' }
                ],
                openingNarrative: '昭和二年，十一月十三日。\n\n你接到委托——或者，你决定去查这件事。无论如何，你来到了京都。\n\n鳟井秋水，东京帝国大学东洋史副教授，五天前在京都失踪。最后一次被人看到，是在东山"清水寺"附近的千本路。他当天独自出门，说是去"看看那座老神社"。之后再也没有回来。\n\n警方搜索了两天，在山里找到了他的外套和笔记本。外衣上有一个符号，用红墨水画着——不是鳟井的笔迹。笔记本最后几页被撕去了。\n\n现在，你站在京都站前。十一月的水汽从鸭川上飘过来。',
                kpNotes: '三层结构严格递进：第一层是失踪案，纯推理；第二层引入超自然但保持学术距离；第三层才揭示克苏鲁真相。关键：七窍镜不是用来"照"的，是用来"听"的——那些声音会用你认识的人的声音说话。门不是空间，是状态。鳟井不是死了，是"去了另一边"。如果调查者卡关，让安东主动联系调查者；如果调查者想跳过推理，让NPC拒绝配合——没有推理基础，超自然信息无法理解。'
            },
            {
                id: 'old-peking-tales',
                title: '旧京怪谈',
                era: '1920s',
                location: '北京·西四砖塔胡同',
                difficulty: 3,
                duration: '2-3小时',
                tags: ['遗产争夺', '古董', '封印', '单人'],
                hook: '前清遗族宅邸中的一场"闹鬼"，牵扯出一桩六十年前的封印与一件不该存在于人间的东西。',
                structure: '遗产争夺',
                layers: [
                    { name: '第一层·闹鬼', focus: '遗产争夺与家人嫌疑——表面犯罪', duration: '40-60分钟' },
                    { name: '第二层·古董', focus: '青铜器物的来历与死者的精神异变——超自然边缘', duration: '50-70分钟' },
                    { name: '第三层·真相', focus: '"祖器"的本质与六十年前的封印——克苏鲁真相', duration: '30-50分钟' }
                ],
                npcs: [
                    { name: '阿蕙', role: '和田仓侧室', trust: 6, secret: '最后发现尸体，知道死者死前与人"求饶"，见过书房窗纸上的非人影子', dialogueStyle: '脸色苍白，眼圈发暗，被恐惧压垮后的麻木，声音很轻' },
                    { name: '刘顺', role: '管家（跟随二十年）', trust: 4, secret: '知道地窖入口，见过老爷跪地磕头念"先人"，听到地底传来的很老的声音', dialogueStyle: '腰微驼但眼亮，有"该来的总会来"的认命感，说"先人"时眼睛向下看' },
                    { name: '沈先生', role: '华国学会学者', trust: 5, secret: '和田仓死前一天带图来鉴定，沈先生判断"这不是人造的东西"', dialogueStyle: '蓄短须，江浙口音，对来访不意外但有所保留' },
                    { name: '和田玉', role: '和田仓之弟/天津商人', trust: 3, secret: '来得太快像早知出事，持有和田仓寄出的警告信', dialogueStyle: '商人精明，对哥哥的死有真实悲伤但更关心遗产' }
                ],
                chekhovGuns: [
                    { plant: '正厅门匾下新鲜刮痕，边缘有铜绿色', payoff: '刮痕像钩爪，来自祖器中的存在' },
                    { plant: '院中残棋，白子放在"玉柱"位', payoff: '道教仪式中"镇灵"的位置' },
                    { plant: '东厢房杂物堆下有地窖入口', payoff: '存放祭器的地方，地窖非和田仓所建，是旧有宗教场所' },
                    { plant: '账簿记录十月十五日"亲手开箱验视"', payoff: '精神异常始于开箱之后' },
                    { plant: '《金石录》中夹着"安西州·白亭镇·塔尔寺废墟"纸条', payoff: '器物出土的确切地点' },
                    { plant: '日记暗格——十一月十一日起字迹潦草', payoff: '记录精神异变全过程，最后一页"不是自杀。它在看着我"' },
                    { plant: '第三口箱内纸条："见之者半月之内神志不宁"', payoff: '与和田仓开箱后时间线吻合' },
                    { plant: '地窖墙壁上的藏文符号', payoff: '地窖曾被用作宗教封印场所' }
                ],
                entity: '祖器中的存在',
                entityData: { name: '祖器', type: '人首蛇身青铜器物', appearance: '头部是空洞面具，七个孔洞排列如北斗', origin: '出土于甘肃安西州塔尔寺废墟，六十年前被流沙封印', danger: '开箱者半月内神志不宁，夜梦故人，存在通过梦境"找能容它的人"', sanLoss: '0/1D6（见器物）+ 1/1D3（理解真相）+ 1/1D6（接触存在）' },
                endings: [
                    { condition: '将祖器送回塔尔寺废墟重新封印', result: '封印维持，但六十年后可能再松动', sanChange: '-1D6' },
                    { condition: '通过沈先生交由华国学会保管', result: '暂时安全，但学会可能研究它', sanChange: '-1D4' },
                    { condition: '打开祖器', result: '释放存在，和田仓的噩梦成为现实', sanChange: '-1D10' },
                    { condition: '毁掉祖器', result: '存在被驱散但未消灭，可能附着于碎片', sanChange: '-1D8' }
                ],
                recommendedOccupations: [
                    { name: '警务处侦探', reason: '与死者有旧识关系，进入现场有合法渠道', npcBonus: '刘顺+1（老爷说过只有一人能信）' },
                    { name: '《晨报》记者', reason: '接触各方不受限，但可能被施压', npcBonus: '阿蕙+1（同情弱者）' },
                    { name: '华国学会研究员', reason: '对祭祀器和古代文献有知识背景', npcBonus: '沈先生+2（学术同行）' },
                    { name: '和家故交/世交子弟', reason: '可直接以吊唁名义进入', npcBonus: '刘顺+2（认得你）' }
                ],
                openingNarrative: '民国十三年，十一月十七日。\n\n你接到线报，说和田仓的家人来警局报案——他在西四砖塔胡同的宅子里"死了"。等你赶到时，尸体已被移走，现场封锁。警局内部的说法是"自缢"，但和田仓的妾侍坚持说他是被人害死的，因为死前一天他还说"这东西不能留"。\n\n和田仓是什么人？北平古玩行的老人，做的是将西北古董经天津租界出口的生意。你认识他——十年前，在豫王府打杂时，他是你同事。\n\n现在你站在他的宅子门口。门楣上"和宅"两字已褪色，门环上有一道新鲜的刮痕。',
                kpNotes: '核心：无战斗，纯调查推理。SAN压力分段递减而非一次性重创。线索链中等偏清晰，但关键线索（日记暗格、地窖符号）需成功检定。如果调查者卡关：阿蕙主动补充信息，刘顺在信任度够时"不小心"提到地窖。和田仓的日记是情感核心——"不是自杀。它在看着我。它一直在看着我。"这句话要在调查者读完日记后独立呈现，不要加任何解释。'
            },
            {
                id: 'plateau-mask',
                title: '高原假面',
                era: '1920s',
                location: '锡金·达吉岭高山疗养院',
                difficulty: 3,
                duration: '2-3小时',
                tags: ['封闭机构', '地质异常', '古老存在', '单人'],
                hook: '喜马拉雅山脚下的疗养院里，一场"流感"吞噬着生命——但死去的人或许并未真正离开。',
                structure: '封闭机构',
                layers: [
                    { name: '第一层·流感', focus: '病人和医生相继死亡，官方说法可疑——公共卫生事件', duration: '40-60分钟' },
                    { name: '第二层·植物学家', focus: '失踪的英国植物学家的研究——他发现了什么不该发现的东西', duration: '50-70分钟' },
                    { name: '第三层·高原', focus: '"没有脸的东西"的本质，疗养院建在这片土地上的真正原因——克苏鲁真相', duration: '30-50分钟' }
                ],
                npcs: [
                    { name: '玛丽·考克森', role: '护士长', trust: 5, secret: '知道死者眼睛"干净得不正常"，目击霍尔尼斯医生整夜站在窗前', dialogueStyle: '专业但压抑着恐惧，说"干净的眼睛"时声音会变' },
                    { name: '霍尔尼斯医生', role: '疗养院院长', trust: 3, secret: '已被侵蚀，整夜不睡站在窗前看外面，说"他们已经在路上了"', dialogueStyle: '表面平静但眼神空洞，偶尔说出不像是他会说的话' },
                    { name: '杂货店老板', role: '达吉岭本地人', trust: 6, secret: '认识疗养院仆人巴桑，巴桑目击白色东西后三天死亡', dialogueStyle: '英语不好但能交流，对疗养院有本能的不信任' },
                    { name: '教会学校校长', role: '英国人', trust: 5, secret: '知道地质调查队报告——地层"不属于任何已知年代"，本地人称山为"空山"', dialogueStyle: '学者风度，对本地传说半信半疑' }
                ],
                chekhovGuns: [
                    { plant: '死者眼睛"干净得不正常"', payoff: '灵魂被抽空的痕迹——存在"进入"后吞噬精神' },
                    { plant: '爱德华遗言"父亲，别让他们进来"', payoff: '死前最后挣扎，"他们"指白色无脸影子' },
                    { plant: '温特沃斯的"尸骨苔藓"', payoff: '只生长在古老骨殖上的苔藓——那些骨殖不是任何已知动物' },
                    { plant: '温特沃斯说"洞只在夜里才会出现"', payoff: '岩洞深处的"门"——通往存在所在之处' },
                    { plant: '本地人叫这座山"空山"——"因为山在看"', payoff: '山体石灰岩中渗入的远古意识在"观察"' },
                    { plant: '地质调查队报告：地层不属于任何已知年代', payoff: '比喜马拉雅山形成更古老的存在的遗骸' }
                ],
                entity: '原住民存在',
                entityData: { name: '原住民存在', type: '比人类更古老的意识残影', manifestation: '白色的、没有脸的影子，站在走廊尽头', origin: '在人类出现之前就存在，死后意识渗入石灰岩地层', danger: '通过"进入"梦境杀死宿主——生病/发烧/半梦半醒时更容易被感知', sanLoss: '0/1（目击影子）+ 0/1D3（阅读笔记本）+ 0/1D6（理解真相）' },
                endings: [
                    { condition: '止步于此，写成报告离开', result: '理智损失但保住自己，疗养院继续有人"死去"', sanChange: '-1D6' },
                    { condition: '寻找那扇"门"', result: '可能进入岩洞，面临与温特沃斯相同的命运', sanChange: '-1D10' },
                    { condition: '烧毁骨殖样本切断联系', result: '暂时切断"门"的通道，但山还在"看"', sanChange: '-1D4' }
                ],
                recommendedOccupations: [
                    { name: '英印警察局探员', reason: '有官方授权进入疗养院', npcBonus: '考克森+1' },
                    { name: '议员私人代表', reason: '受议员委托，有非官方调查权', npcBonus: '考克森+2（为爱德华而来）' },
                    { name: '《泰晤士报》驻印记者', reason: '以调查公共卫生为由进入', npcBonus: '杂货店老板+1' },
                    { name: '伦敦教会慈善机构成员', reason: '疗养院有教会背景，可慈善探访名义进入', npcBonus: '教会学校校长+2' }
                ],
                openingNarrative: '1927年11月，达吉岭。\n\n你站在达吉岭小镇的集市上，抬头望去——远处，雪山在阳光下闪着刺眼的白光。达吉岭高山疗养院就在山腰上，白色的建筑群嵌在松林和雪山之间，像是一串遗落的念珠。\n\n你接到消息：过去两个月，这家疗养院有七人死于"流感"。但真正让你来的，不是死亡数字——是那封寄到伦敦的信。议员之子爱德华·霍尔，死前给父亲写的最后一封信里，有一句话让老议员夜不能寐：\n\n"那些没有脸的东西在看着我们。"\n\n疗养院已经被隔离。你想进去。',
                kpNotes: '核心恐惧不是怪物，而是"被看见"——那些存在不需要靠近你，只需要"看见"你。关键意象：干净的眼睛（灵魂被抽空）、白色的无脸影子、山在"看"。温特沃斯和霍尔尼斯是两条平行的悲剧线：温特沃斯主动进入门，霍尔尼斯被动被侵蚀。如果调查者卡关：考克森主动分享更多信息，杂货店老板提供巴桑遗孀的线索。不要让霍尔尼斯成为单纯的敌人——他也是受害者。'
            },
            {
                id: 'night-whisper',
                title: '暗夜呢喃',
                era: '1920s',
                location: '阿卡姆·海岸',
                difficulty: 3,
                duration: '3-4小时',
                tags: ['失踪调查', '深海', '邪教', '经典'],
                hook: '阿卡姆大学教授失踪三天，他的女儿递给你一把书房钥匙——窗外，雨忽然下得更大了。',
                structure: '失踪调查',
                layers: [
                    { name: '第一章·海边的低语', focus: '调查教授失踪，发现日记和海图上的异常标记', duration: '40-60分钟' },
                    { name: '第二章·潮汐之下', focus: '追查渔村传说、灯塔日志，发现海底洞穴入口', duration: '60-80分钟' },
                    { name: '第三章·深渊的呢喃', focus: '遭遇邪教，找到教授囚室，发现召唤法术', duration: '50-70分钟' },
                    { name: '第四章·新月之夜', focus: '新月仪式，最终对抗，决定教授命运', duration: '40-60分钟' }
                ],
                npcs: [
                    { name: '玛格丽特·霍普金斯', role: '委托人/教授之女', trust: 7, secret: '知道父亲研究异常，但不知深度，内疚未早关注', dialogueStyle: '眼眶红肿但声音出奇平静，手指绞在一起' },
                    { name: '老汤姆·惠特克', role: '灯塔看守人', trust: 4, secret: 'SAN已低（25/45），见过海中异常，恐惧但无法离开', dialogueStyle: '苍老疲惫，说话时总看向窗外大海，提到"那些夜晚"时声音发抖' },
                    { name: '莎拉·米切尔', role: '警局档案室管理员', trust: 6, secret: '整理过类似失踪案卷宗，发现规律但不敢上报', dialogueStyle: '安静内敛，提供信息时压低声音，像怕被听到' },
                    { name: '罗伯特·莫里斯', role: '邪教领袖', trust: 2, secret: 'SAN为0，完全被深海存在控制，策划新月召唤仪式', dialogueStyle: '表面温和有礼，但眼神空洞，偶尔说出不属于他的话' }
                ],
                chekhovGuns: [
                    { plant: '教授书房的海图，上面有红笔圈出的坐标', payoff: '海底洞穴入口的位置' },
                    { plant: '教授日记中反复出现的"潮汐低语"', payoff: '深海存在通过潮汐频率传递信息' },
                    { plant: '灯塔日志中每月新月夜的异常记录', payoff: '邪教每月新月举行仪式' },
                    { plant: '渔村老人说的"海里来的人"', payoff: '深潜者混入渔村的证据' },
                    { plant: '教授书房里的银质三叉戟', payoff: '对深海族裔造成全额伤害的武器' },
                    { plant: '玛格丽特手上的鱼形吊坠', payoff: '教授留给女儿的保护物，对深海存在有微弱驱散效果' }
                ],
                entity: '深潜者族群',
                entityData: { name: '深潜者', type: '深海两栖族裔', pow: 14, hp: 12, attacks: [{ name: '利爪', chance: 60, damage: '1D6+DB' }, { name: '深渊低语', effect: 'POW检定，失败1/1D3SAN' }], sanLoss: '1/1D6', weakness: '火焰和电击造成全额伤害，干燥环境行动力减半' },
                endings: [
                    { condition: '在新月仪式前救出教授，阻止召唤', result: '教授获救但精神受损，深潜者暂时退去', sanChange: '+1D4' },
                    { condition: '在新月仪式中对抗莫里斯，部分阻止', result: '教授存活但深潜者部分显现，海岸线受威胁', sanChange: '-1D6' },
                    { condition: '未能阻止仪式', result: '深海之门开启，阿卡姆海岸陷入恐怖', sanChange: '-1D10' },
                    { condition: '与深潜者达成交易', result: '教授获救但代价惨重，调查者欠下深海之债', sanChange: '-2D6' }
                ],
                recommendedOccupations: [
                    { name: '私家侦探', reason: '受雇调查失踪，侦查/心理学高', npcBonus: '玛格丽特+1' },
                    { name: '记者', reason: '调查阿卡姆异常事件，图书馆/说服高', npcBonus: '莎拉+1' },
                    { name: '医生', reason: '可评估教授精神状态，医学/科学高', npcBonus: '玛格丽特+2' },
                    { name: '教授', reason: '学术圈人脉，了解教授研究方向', npcBonus: '莎拉+2' }
                ],
                openingNarrative: '1928年10月17日。阿卡姆的秋天总是来得格外阴冷。\n\n雨水顺着窗玻璃滑下，模糊了街对面的煤气灯。阿卡姆大学历史系的走廊里弥漫着旧书和地板蜡的气味。\n\n玛格丽特·霍普金斯站在走廊尽头，手指绞在一起。她的眼眶红肿，但声音出奇地平静：\n\n「三天了。父亲失踪三天了。警方说他可能只是出去散步——但你们和我一样知道，那不是真的。」\n\n她从手提包里取出一把钥匙，递向你。\n\n「这是他书房的钥匙。拜托了。」\n\n窗外，雨忽然下得更大了。',
                kpNotes: '经典COC入门模组，节奏明快。四幕结构：序章→调查→对抗→高潮。核心：教授不是被绑架，是"自愿"进入洞穴——他在研究深海文明时被低语侵蚀。莫里斯不是疯子，是被完全控制的傀儡。如果调查者卡关：莎拉主动提供档案线索，老汤姆在灯塔主动分享异常记录。战斗不是最优解——深潜者数量多，正面战斗危险。潜入、交涉、利用环境才是正确策略。末日时钟：新月之夜仪式，给调查者时间压力。'
            }
        ];
    },

    getPresetModules() {
        return this.PRESET_MODULES || [];
    },

    getModuleById(moduleId) {
        return this.PRESET_MODULES.find(m => m.id === moduleId);
    },

    generateRandomStory(options = {}, mythosCombo = null) {
        var era;
        if (options.era) {
            era = this.STORY_TEMPLATES.eras.find(e => e.id === options.era) || this.STORY_TEMPLATES.eras[0];
        } else {
            era = this.STORY_TEMPLATES.eras[Math.floor(Math.random() * this.STORY_TEMPLATES.eras.length)];
        }

        var structure;
        if (options.structure) {
            structure = this.STORY_TEMPLATES.structures.find(s => s.name === options.structure) || this.STORY_TEMPLATES.structures[0];
        } else {
            structure = this.STORY_TEMPLATES.structures[Math.floor(Math.random() * this.STORY_TEMPLATES.structures.length)];
        }
        const atmosphere = options.atmosphere || this.STORY_TEMPLATES.atmospheres[Math.floor(Math.random() * this.STORY_TEMPLATES.atmospheres.length)];
        const location = era.locations[Math.floor(Math.random() * era.locations.length)];

        var entity = atmosphere.entities[Math.floor(Math.random() * atmosphere.entities.length)];
        if (mythosCombo) {
            if (mythosCombo.creatures) {
                entity = mythosCombo.creatures;
            } else if (mythosCombo.deities) {
                entity = mythosCombo.deities + '眷族';
            } else if (mythosCombo.cults) {
                entity = mythosCombo.cults + '召唤之物';
            } else if (mythosCombo.rituals) {
                entity = mythosCombo.rituals + '引发的异象';
            } else if (mythosCombo.tomes) {
                entity = mythosCombo.tomes + '中记载的存在';
            }
        }

        const difficulty = options.difficulty || (2 + Math.floor(Math.random() * 2));

        const title = this.generateTitle(structure, location, atmosphere, mythosCombo);
        const hook = this.generateHook(structure, location, entity, mythosCombo);
        const npcs = this.generateNPCs(3 + Math.floor(Math.random() * 2), era, structure);
        const chekhovGuns = this.generateChekhovGuns(structure, atmosphere, 4 + Math.floor(Math.random() * 3), mythosCombo);
        const entityData = this.generateEntityData(entity, atmosphere, difficulty, mythosCombo);
        const endings = this.generateEndings(structure, entity, mythosCombo);
        const kpNotes = this.generateKPNotes(structure, atmosphere, entity, npcs, mythosCombo);
        const recommendedOccupations = this.generateRecommendedOccupations(structure, location);

        const layerNames = {
            '密室推理': ['第一幕·不可能犯罪', '第二幕·超自然边缘', '第三幕·克苏鲁真相'],
            '失踪调查': ['第一章·失踪', '第二章·追踪', '第三章·门'],
            '封闭机构': ['第一层·异常事件', '第二层·隐藏发现', '第三层·古老真相'],
            '遗产争夺': ['第一层·遗产与死亡', '第二层·器物与异变', '第三层·封印与真相']
        };

        const layerFocuses = {
            '密室推理': [
                '推理为主，超自然仅作暗示。不可能犯罪+法医异常为转折点',
                '推理与超自然并行，线索开始闭合。发现隐藏空间/倒计时为转折点',
                '超自然为主，推理成果决定结局。实体显现'
            ],
            '失踪调查': [
                '失踪者最后行踪、消失前异常行为——失踪案调查',
                '追查研究笔记、目击证词，发现不该存在的入口',
                '"门"的本质、失踪者去了哪里——克苏鲁真相'
            ],
            '封闭机构': [
                '官方说法可疑，目击者证词矛盾——公共卫生/安全事件',
                '失踪的研究者/异常的发现——超自然边缘',
                '存在的本质，机构建在这里的真正原因——克苏鲁真相'
            ],
            '遗产争夺': [
                '遗产争夺与家人嫌疑——表面犯罪',
                '器物来历与死者精神异变——超自然边缘',
                '封印本质与古老秘密——克苏鲁真相'
            ]
        };

        const names = layerNames[structure.name] || layerNames['失踪调查'];
        const focuses = layerFocuses[structure.name] || layerFocuses['失踪调查'];

        var progressStages = names.map(function(name, i) {
            var stage = {
                name: name,
                description: focuses[i] || '调查深入',
                advanceConditions: [],
                requiredConditions: 1,
                kpDirective: '',
                autoAdvance: false
            };

            if (i === 0) {
                stage.advanceConditions = [
                    { type: 'clue', keyword: '', description: '获得关键线索' },
                    { type: 'flag', flag: 'layer1_complete', description: '完成初步调查' }
                ];
                stage.requiredConditions = 1;
                stage.kpDirective = '引导调查员熟悉环境、接触核心NPC、获得进入下一阶段的关键信息。不要急于推进，让调查员充分探索。';
            } else if (i === names.length - 1) {
                stage.advanceConditions = [];
                stage.kpDirective = '这是最终阶段。调查员面对核心真相，必须做出选择。呈现所有可能的结局路径，不要替调查员做决定。';
            } else {
                stage.advanceConditions = [
                    { type: 'clue', keyword: '', description: '发现深层线索' },
                    { type: 'flag', flag: 'layer' + (i + 1) + '_complete', description: '完成第' + (i + 1) + '层调查' }
                ];
                stage.requiredConditions = 1;
                stage.kpDirective = '调查员正在深入真相。根据已获得的线索逐步揭示更多信息，但保留最终真相到下一阶段。';
            }

            return stage;
        });

        var doomsdayClocks = [];

        if (structure.name === '密室推理') {
            doomsdayClocks.push({
                name: '潮汐/月相',
                description: '自然规律的倒计时，特定时间点将触发不可逆事件',
                consequence: '时间耗尽，密室机制被触发，事态急剧恶化',
                triggered: false
            });
        } else if (structure.name === '失踪调查') {
            doomsdayClocks.push({
                name: '失踪者生存时间',
                description: '失踪者可能还活着，但时间在流逝',
                consequence: '失踪者可能永远无法被找回',
                triggered: false
            });
        } else if (structure.name === '封闭机构') {
            doomsdayClocks.push({
                name: '机构封锁/隔离失效',
                description: '机构的隔离措施正在逐渐失效',
                consequence: '封锁完全失效，内部异常向外扩散',
                triggered: false
            });
        } else if (structure.name === '遗产争夺') {
            doomsdayClocks.push({
                name: '封印松动',
                description: '与遗产相关的古老封印正在逐渐松动',
                consequence: '封印完全失效，被封印的存在开始显现',
                triggered: false
            });
        }

        if (mythosCombo && mythosCombo.rituals) {
            doomsdayClocks.push({
                name: mythosCombo.rituals,
                description: '某种仪式正在接近完成',
                consequence: '仪式完成，不可逆转的后果发生',
                triggered: false
            });
        }

        var mythosElementSummary = '';
        if (mythosCombo) {
            var catNames = { deities: '神祇', creatures: '生物', tomes: '典籍', locations: '地点', cults: '邪教', rituals: '仪式' };
            var parts = [];
            for (var cat in mythosCombo) {
                parts.push((catNames[cat] || cat) + '：' + mythosCombo[cat]);
            }
            mythosElementSummary = parts.join('、');
        }

        return {
            id: `generated_${Date.now()}`,
            title: title,
            era: era.id,
            eraName: era.name,
            location: location,
            difficulty: difficulty,
            duration: difficulty >= 3 ? '3-4小时' : '2-3小时',
            tags: [structure.name, atmosphere.name, entity, 'AI生成', '单人'],
            hook: hook,
            structure: structure.name,
            layers: names.map((name, i) => ({
                name: name,
                focus: focuses[i] || structure.layers[i] || '调查深入',
                duration: `${40 + Math.floor(Math.random() * 30)}分钟`
            })),
            npcs: npcs,
            chekhovGuns: chekhovGuns,
            entity: entity,
            entityData: entityData,
            endings: endings,
            recommendedOccupations: recommendedOccupations,
            openingNarrative: '',
            kpNotes: kpNotes,
            mythosCombo: mythosCombo,
            mythosElementSummary: mythosElementSummary,
            isGenerated: true,
            progressStages: progressStages,
            doomsdayClocks: doomsdayClocks,
            locations: [
                { name: location, description: '主要事件发生地', connections: [] }
            ],
            generatedAt: new Date().toISOString()
        };
    },

    generateTitle(structure, location, atmosphere, mythosCombo) {
        const titleParts = {
            '密室推理': {
                prefixes: ['血色', '迷雾', '暗潮', '沉默的'],
                suffixes: ['密室', '房间', '不可能犯罪', '第七扇门'],
                locations: ['庄园', '宅邸', '公馆', '阁楼']
            },
            '失踪调查': {
                prefixes: ['消失的', '迷失', '沉没', '遗忘的'],
                suffixes: ['学者', '足迹', '低语', '回声'],
                locations: ['海岸', '山路', '古寺', '废墟']
            },
            '封闭机构': {
                prefixes: ['白色', '隔离', '沉默的', '空心的'],
                suffixes: ['疗养院', '研究所', '病房', '走廊'],
                locations: ['山腰', '岛上', '深谷', '高地']
            },
            '遗产争夺': {
                prefixes: ['锈蚀的', '尘封', '诅咒的', '最后的'],
                suffixes: ['遗嘱', '器物', '封印', '血脉'],
                locations: ['胡同', '旧宅', '祠堂', '地窖']
            }
        };

        var mythosPrefixes = {
            deities: ['神谕', '低语', '眷顾', '凝视'],
            creatures: ['暗影', '深渊', '异形', '畸变'],
            tomes: ['禁忌', '秘典', '遗篇', '残卷'],
            locations: ['迷失', '幽暗', '沉寂', '荒芜'],
            cults: ['异端', '誓约', '暗流', '集会'],
            rituals: ['仪式', '祭典', '轮回', '裂隙']
        };

        const parts = titleParts[structure.name] || titleParts['失踪调查'];
        const prefix = parts.prefixes[Math.floor(Math.random() * parts.prefixes.length)];
        const suffix = parts.suffixes[Math.floor(Math.random() * parts.suffixes.length)];

        if (mythosCombo) {
            var comboKeys = Object.keys(mythosCombo);
            if (comboKeys.length > 0) {
                var primaryCat = comboKeys[Math.floor(Math.random() * comboKeys.length)];
                var mPrefixes = mythosPrefixes[primaryCat];
                if (mPrefixes) {
                    var mPrefix = mPrefixes[Math.floor(Math.random() * mPrefixes.length)];
                    if (Math.random() > 0.4) {
                        return `${mPrefix}${suffix}`;
                    }
                }
            }
        }

        if (Math.random() > 0.5) {
            return `${prefix}${suffix}`;
        }
        return `${location}${suffix}`;
    },

    generateHook(structure, location, entity, mythosCombo) {
        const hooks = {
            '密室推理': [
                `${location}的一栋老宅里，有人在密室中死去——门窗从内锁死，但尸体上的伤痕不可能是自杀。`,
                `${location}发生了一起不可能犯罪：所有嫌疑人都有不在场证明，但死者确实被谋杀了。`,
                `一具尸体出现在${location}的密闭房间中，房间内没有任何凶器——但死者身上的伤口绝非自然形成。`
            ],
            '失踪调查': [
                `有人在${location}消失，留下的唯一线索指向某种不该存在的东西。`,
                `${location}的一位学者失踪了，他的研究笔记最后一页写着"我找到了那扇门"。`,
                `三天前，${location}的一个人走进了一条巷子——然后再也没有出来。巷子是死胡同，里面什么都没有。`
            ],
            '封闭机构': [
                `${location}的封闭机构里发生了异常事件，官方说法掩盖着更深的真相。`,
                `${location}的隔离区内，死亡人数持续上升——但死者的表情不像生病，更像是在死前看到了什么。`,
                `${location}的疗养院被封锁了，里面传出的不是哭声，而是笑声。`
            ],
            '遗产争夺': [
                `${location}的一场遗产争夺牵扯出古老的秘密，有人为此付出了代价。`,
                `${location}的旧宅中，一个人在遗物前死去。他的遗言是"别打开那口箱子"。`,
                `一场看似普通的遗产继承，却因为一件不该存在于人间的器物变得致命。`
            ]
        };
        const hookList = hooks[structure.name] || hooks['失踪调查'];
        var baseHook = hookList[Math.floor(Math.random() * hookList.length)];

        if (mythosCombo) {
            var mythosHooks = [];
            if (mythosCombo.deities) {
                mythosHooks.push(baseHook + '而所有线索都指向一个不该被提及的名字——' + mythosCombo.deities + '。');
            }
            if (mythosCombo.creatures) {
                mythosHooks.push(baseHook + '目击者声称看到了不属于这个世界的东西——' + mythosCombo.creatures + '。');
            }
            if (mythosCombo.tomes) {
                mythosHooks.push(baseHook + '一切似乎都和一本古书有关——' + mythosCombo.tomes + '。');
            }
            if (mythosCombo.cults) {
                mythosHooks.push(baseHook + '在表象之下，一个名为"' + mythosCombo.cults + '"的组织若隐若现。');
            }
            if (mythosHooks.length > 0 && Math.random() > 0.3) {
                return mythosHooks[Math.floor(Math.random() * mythosHooks.length)];
            }
        }

        return baseHook;
    },

    generateNPCs(count, era, structure) {
        const npcs = [];
        const usedNames = new Set();

        const npcArchetypes = {
            '密室推理': [
                { role: '死者亲属/继承人', trustBase: 4, secretPool: ['知道家族秘密', '篡改遗嘱', '欠债想变卖遗产'], dialoguePool: ['圆滑世故，紧张时摸手指', '表面悲伤但眼神在计算'] },
                { role: '学者/专家', trustBase: 5, secretPool: ['翻译过禁忌文献', '发现异常但选择否认', '研究涉及超自然领域'], dialoguePool: ['学究气，紧张时语速极快', '引用频繁，回避关键问题'] },
                { role: '仆人/管家', trustBase: 3, secretPool: ['知道一切但守口如瓶', 'SAN已低，偶尔异常', '协助某种仪式多年'], dialoguePool: ['沉默寡言，措辞精确', '回答前停顿斟酌，像在筛选信息'] },
                { role: '医生/法医', trustBase: 6, secretPool: ['发现尸检异常', '知道死者精神状态变化', '选择不深究'], dialoguePool: ['专业冷静，用术语制造距离感', '回避精神状态提问'] },
                { role: '女仆/杂工', trustBase: 7, secretPool: ['无大秘密但是最佳信息源', '知道日常异常细节', '听到不该听到的声音'], dialoguePool: ['胆小话多，像连珠炮', '跑题内容往往有用'] }
            ],
            '失踪调查': [
                { role: '委托人/失踪者亲属', trustBase: 7, secretPool: ['知道失踪者研究异常', '内疚未早关注', '持有失踪者留下的物品'], dialoguePool: ['表面平静但手指绞在一起', '声音出奇克制'] },
                { role: '同事/助手', trustBase: 6, secretPool: ['见过异常器物', '知道失踪者最后状态', '发现研究笔记异常'], dialoguePool: ['年轻焦虑，急于找到人', '对导师/同事忠诚'] },
                { role: '知情人/老者', trustBase: 5, secretPool: ['知道不该知道的事', '见过不该见的东西', '恐惧但无法离开'], dialoguePool: ['说话慢，对古物有敬畏', '提到关键事时声音发抖'] },
                { role: '官方人员', trustBase: 4, secretPool: ['档案中有被删除的记录', '知道规律但不敢上报', '被命令停止调查'], dialoguePool: ['公事公办，但偶尔透露过多', '压低声音提供信息'] }
            ],
            '封闭机构': [
                { role: '护士/工作人员', trustBase: 5, secretPool: ['知道死者异常', '目击同事异变', '发现记录被篡改'], dialoguePool: ['专业但压抑着恐惧', '说关键信息时声音会变'] },
                { role: '院长/负责人', trustBase: 3, secretPool: ['已被侵蚀', '整夜不睡做异常行为', '知道真相但无法/不愿说'], dialoguePool: ['表面平静但眼神空洞', '偶尔说出不像他说的话'] },
                { role: '本地人', trustBase: 6, secretPool: ['认识内部人员', '知道本地传说', '目击过异常现象'], dialoguePool: ['对机构有本能不信任', '说话直白但信息量大'] },
                { role: '外部学者', trustBase: 5, secretPool: ['知道地质/历史异常', '持有被压制的研究报告', '半信半疑'], dialoguePool: ['学者风度，对传说半信半疑', '有所保留但愿意分享'] }
            ],
            '遗产争夺': [
                { role: '侧室/家属', trustBase: 6, secretPool: ['最后发现尸体', '知道死者死前异常', '见过非人影子'], dialoguePool: ['被恐惧压垮后的麻木', '声音很轻，像怕惊动什么'] },
                { role: '管家/老仆', trustBase: 4, secretPool: ['知道地窖/密室', '见过主人异常行为', '听到地底传来的声音'], dialoguePool: ['认命感，"该来的总会来"', '说关键词时眼睛向下看'] },
                { role: '学者/鉴定师', trustBase: 5, secretPool: ['鉴定过异常器物', '判断"这不是人造的"', '知道出土地点'], dialoguePool: ['对来访不意外但有所保留', '专业但恐惧'] },
                { role: '争夺者/商人', trustBase: 3, secretPool: ['来得太快像早知出事', '持有警告信', '表面悲伤实际关心遗产'], dialoguePool: ['精明，有真实悲伤但更关心利益', '试图控制信息流'] }
            ]
        };

        const archetypes = npcArchetypes[structure.name] || npcArchetypes['失踪调查'];
        const shuffled = [...archetypes].sort(() => Math.random() - 0.5);
        const selectedArchetypes = shuffled.slice(0, count);

        const westernFirstNames = ['威廉', '亨利', '爱德华', '罗伯特', '詹姆斯', '亚瑟', '查尔斯', '托马斯'];
        const westernLastNames = ['威廉姆斯', '约翰逊', '史密斯', '布朗', '威尔逊', '戴维斯', '泰勒', '安德森'];
        const easternLastNames = ['田中', '佐藤', '铃木', '高桥', '渡边', '王', '李', '张', '刘', '陈'];
        const easternFirstNames = ['一郎', '健二', '美惠', '百合子', '明', '志远', '书华', '静安'];

        for (let i = 0; i < selectedArchetypes.length; i++) {
            const archetype = selectedArchetypes[i];
            let name;

            if (era.id === '1920s') {
                if (location === '京都' || location === '北平' || location === '上海') {
                    const lastName = easternLastNames[Math.floor(Math.random() * easternLastNames.length)];
                    const firstName = easternFirstNames[Math.floor(Math.random() * easternFirstNames.length)];
                    name = lastName + firstName;
                } else {
                    const firstName = westernFirstNames[Math.floor(Math.random() * westernFirstNames.length)];
                    const lastName = westernLastNames[Math.floor(Math.random() * westernLastNames.length)];
                    name = firstName + '·' + lastName;
                }
            } else if (era.id === 'victorian') {
                const firstName = westernFirstNames[Math.floor(Math.random() * westernFirstNames.length)];
                const lastName = westernLastNames[Math.floor(Math.random() * westernLastNames.length)];
                name = firstName + '·' + lastName;
            } else {
                name = `NPC${i + 1}`;
            }

            if (usedNames.has(name)) continue;
            usedNames.add(name);

            const secret = archetype.secretPool[Math.floor(Math.random() * archetype.secretPool.length)];
            const dialogueStyle = archetype.dialoguePool[Math.floor(Math.random() * archetype.dialoguePool.length)];
            const trust = archetype.trustBase + Math.floor(Math.random() * 2) - 1;

            const trustThresholds = {};
            const thresholdLevels = [
                { range: `0-${Math.max(trust - 2, 1)}`, response: '拒绝交流，只答是/否或否认一切' },
                { range: `${Math.max(trust - 1, 2)}-${trust}`, response: '极简回答直接问题，不主动提供信息' },
                { range: `${trust + 1}-${trust + 2}`, response: '透露日常细节，承认表面异常' },
                { range: `${trust + 3}-${trust + 4}`, response: '承认知道更多，分享关键线索' },
                { range: `${trust + 5}-10`, response: '全盘托出，包括秘密和恐惧' }
            ];
            thresholdLevels.forEach(t => { trustThresholds[t.range] = t.response; });

            npcs.push({
                name: name,
                role: archetype.role,
                trust: trust,
                secret: secret,
                dialogueStyle: dialogueStyle,
                trustThresholds: trustThresholds
            });
        }

        return npcs;
    },

    generateChekhovGuns(structure, atmosphere, count, mythosCombo) {
        const gunPools = {
            '密室推理': [
                { plant: '门环/门把手上的异常造型', payoff: '封印容器或法器的一部分' },
                { plant: '怀表/时钟停在异常时间', payoff: '密室形成的关键时刻' },
                { plant: '植物朝异常方向生长', payoff: '地下渗出超自然物质' },
                { plant: '建筑某处钟表持续走慢', payoff: '空间扭曲区域的时间异常' },
                { plant: '死者只碰了一口的餐食/饮品', payoff: '尝出/感知到不该存在的东西' },
                { plant: '走廊/楼梯的肖像画中有异常细节', payoff: '画中隐藏的封印法器或家族历史' },
                { plant: '仆人提到的日常异常（渗水/异响）', payoff: '超自然存在的物理影响' },
                { plant: '建筑图纸上不存在的空间', payoff: '隐藏房间/通道的入口' },
                { plant: '天气/潮汐的异常规律', payoff: '超自然力量的运作周期' },
                { plant: '动物的非自然行为', payoff: '被超自然频率驱使' }
            ],
            '失踪调查': [
                { plant: '失踪者留下的研究笔记/海图上的标记', payoff: '异常入口/坐标的位置' },
                { plant: '失踪者日记中反复出现的特定词语', payoff: '超自然存在传递信息的方式' },
                { plant: '灯塔/岗哨日志中的规律性异常记录', payoff: '超自然事件的发生周期' },
                { plant: '本地人说的古老谚语/传说', payoff: '超自然存在的真实描述' },
                { plant: '失踪者书房中的异常物品', payoff: '对抗超自然存在的武器/保护物' },
                { plant: '失踪者留给亲属的"护身符"', payoff: '对超自然存在有微弱驱散效果' },
                { plant: '失踪者外套上的异常符号', payoff: '不是失踪者画的——是超自然存在留下的标记' },
                { plant: '镜面/器物边缘的计数刻痕', payoff: '暗示被使用过的次数/受害者数量' }
            ],
            '封闭机构': [
                { plant: '死者眼睛/表情的异常', payoff: '灵魂被侵蚀的物理痕迹' },
                { plant: '死者遗言中的"他们"', payoff: '超自然存在的复数形式' },
                { plant: '研究员采集的异常标本', payoff: '只生长在超自然遗骸上的生物' },
                { plant: '研究员说"只在夜里才会出现"', payoff: '通往超自然存在所在之处的入口' },
                { plant: '本地人对山的称呼/禁忌', payoff: '山体中渗入的远古意识' },
                { plant: '地质调查报告中的异常数据', payoff: '比已知地质年代更古老的存在' },
                { plant: '机构建筑图纸上被涂黑的部分', payoff: '被封锁的超自然区域' },
                { plant: '病人的梦境记录', payoff: '超自然存在通过梦境接触人类' }
            ],
            '遗产争夺': [
                { plant: '门/家具上的新鲜刮痕', payoff: '超自然存在留下的物理痕迹' },
                { plant: '院中棋局/摆设的异常位置', payoff: '仪式中的镇灵/封印方位' },
                { plant: '杂物堆下的隐藏入口', payoff: '旧有宗教/封印场所' },
                { plant: '账簿/日记中的异常日期记录', payoff: '精神异变开始的时间点' },
                { plant: '书籍中夹着的纸条/地图', payoff: '器物出土的确切地点' },
                { plant: '日记暗格/字迹变化', payoff: '精神异变全过程记录' },
                { plant: '箱内/器物旁的警告纸条', payoff: '与时间线吻合的超自然影响' },
                { plant: '墙壁/地窖上的古老符号', payoff: '曾被用作宗教封印场所' }
            ]
        };

        const pool = gunPools[structure.name] || gunPools['失踪调查'];
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, pool.length));
    },

    generateEntityData(entity, atmosphere, difficulty, mythosCombo) {
        const entityTemplates = {
            '深潜者': { type: '深海两栖族裔', pow: 14, hp: 12, attacks: [{ name: '利爪', chance: 60, damage: '1D6+DB' }, { name: '深渊低语', effect: 'POW检定，失败1/1D3SAN' }], sanLoss: '1/1D6', weakness: '火焰和电击造成全额伤害，干燥环境行动力减半' },
            '米·戈': { type: '外星真菌族裔', pow: 15, hp: 10, attacks: [{ name: '电击枪', chance: 65, damage: '1D8' }, { name: '精神提取', effect: 'POW对抗，失败失去1D4MP' }], sanLoss: '1/1D6', weakness: '紫外线和高温造成额外伤害' },
            '廷达洛斯猎犬': { type: '时空掠食者', pow: 18, hp: 16, attacks: [{ name: '时空撕裂', chance: 50, damage: '2D4' }, { name: '时间侵蚀', effect: 'CON检定，失败老化1D10年' }], sanLoss: '1/1D8', weakness: '无法穿越角度小于120度的空间' },
            '奈亚拉托提普': { type: '外神化身', pow: 25, hp: 30, attacks: [{ name: '疯狂低语', effect: '范围内自动1/1D6SAN' }, { name: '变形触手', chance: 80, damage: '2D6+DB' }], sanLoss: '1D6/1D20', weakness: '无法直接杀死，只能暂时驱退' },
            '古老存在': { type: '远古意识残影', pow: 16 + difficulty * 2, hp: 14 + difficulty * 2, attacks: [{ name: '精神侵蚀', effect: 'POW检定，失败1/1D4SAN' }, { name: '物理显化', chance: 40, damage: '1D8' }], sanLoss: '0/1D6', weakness: '封印法器/特定仪式可驱散' },
            '封印': { type: '封印中的存在', pow: 20, hp: 20, attacks: [{ name: '封印反噬', effect: '接触者1/1D4SAN' }, { name: '精神渗透', effect: '梦境中POW对抗' }], sanLoss: '1/1D6', weakness: '维持封印的器物/血脉' },
            '古老仪式': { type: '仪式召唤的存在', pow: 18, hp: 18, attacks: [{ name: '仪式之力', chance: 45, damage: '1D10' }, { name: '信徒献祭', effect: '每有一个信徒+1POW' }], sanLoss: '1/1D8', weakness: '打断仪式可阻止完全显现' },
            '家族诅咒': { type: '血脉中的远古意识', pow: 15, hp: 15, attacks: [{ name: '诅咒发作', effect: '家族成员POW对抗' }, { name: '噩梦侵蚀', effect: '睡眠中1/1D3SAN' }], sanLoss: '0/1D4', weakness: '解除诅咒需要找到源头' },
            '异界入口': { type: '门后的存在', pow: 22, hp: 0, attacks: [{ name: '门之吸引', effect: '靠近者POW检定' }, { name: '异界渗透', effect: '周围环境逐渐异化' }], sanLoss: '1/1D6', weakness: '关闭入口需要特定条件' },
            '地方传说': { type: '土地中沉睡的意识', pow: 14, hp: 12, attacks: [{ name: '土地震颤', chance: 35, damage: '1D6' }, { name: '古老低语', effect: '范围内1/1D3SAN' }], sanLoss: '0/1D4', weakness: '离开其领地范围即安全' },
            '古老祭祀': { type: '祭祀唤醒的远古存在', pow: 17, hp: 16, attacks: [{ name: '祭祀之力', chance: 50, damage: '1D8' }, { name: '信徒狂热', effect: '控制信徒攻击' }], sanLoss: '1/1D6', weakness: '毁掉祭器可削弱' },
            '土地之灵': { type: '与土地融合的远古意识', pow: 16, hp: 0, attacks: [{ name: '土地操控', effect: '范围内地形变化' }, { name: '精神压迫', effect: 'POW检定，失败1D3SAN' }], sanLoss: '0/1D3', weakness: '无法离开其土地范围' },
            '祖先意识': { type: '附着于血脉/器物的祖先残影', pow: 13, hp: 10, attacks: [{ name: '血脉呼唤', effect: '家族成员POW对抗' }, { name: '器物共鸣', effect: '接触者1/1D3SAN' }], sanLoss: '0/1D3', weakness: '断绝血脉联系或毁掉器物' }
        };

        const template = entityTemplates[entity] || entityTemplates['古老存在'];
        var result = {
            name: entity,
            type: template.type,
            pow: template.pow + (difficulty - 2) * 2,
            hp: template.hp + (difficulty - 2) * 3,
            attacks: template.attacks,
            sanLoss: template.sanLoss,
            weakness: template.weakness
        };

        if (mythosCombo && !entityTemplates[entity]) {
            if (mythosCombo.deities) {
                result.type = mythosCombo.deities + '的影响';
                result.sanLoss = '1/1D10';
                result.weakness = '与' + mythosCombo.deities + '相关的封印法器';
            }
            if (mythosCombo.creatures) {
                result.type = mythosCombo.creatures + '族裔';
            }
            if (mythosCombo.tomes) {
                result.weakness = mythosCombo.tomes + '中记载的驱散方法';
            }
        }

        return result;
    },

    generateEndings(structure, entity, mythosCombo) {
        const endingTemplates = {
            '密室推理': [
                { condition: '完成封印仪式，有血脉/法器支持', result: '封印稳固，获得特殊洞察', sanChange: '+1D4' },
                { condition: '完成封印，但执行者付出惨重代价', result: '封印完成但执行者精神受损', sanChange: '-1D6' },
                { condition: '释放/未能阻止超自然存在', result: '短期安全，长期灾难', sanChange: '-1D10' },
                { condition: '杀死看守者/中间人完成封印', result: '临时解决，未来封印会再松动', sanChange: '-1D6' },
                { condition: '未在关键时刻做出选择', result: '超自然存在部分显现，灾难降临', sanChange: '-1D8' }
            ],
            '失踪调查': [
                { condition: '止步于此，将已知真相告知委托人', result: '保住自己，但失踪者永远留在另一边', sanChange: '-1D6' },
                { condition: '继续追查，找到入口', result: '可能进入异界，面临与失踪者相同的命运', sanChange: '-1D10' },
                { condition: '找到方法暂时关闭入口', result: '失踪者无法回归，但阻止了更多人消失', sanChange: '-1D4' },
                { condition: '与超自然存在达成交易', result: '失踪者获救但代价惨重', sanChange: '-2D6' }
            ],
            '封闭机构': [
                { condition: '止步于此，写成报告离开', result: '理智损失但保住自己，机构继续有人"死去"', sanChange: '-1D6' },
                { condition: '寻找超自然入口', result: '可能进入异界，面临与研究者相同的命运', sanChange: '-1D10' },
                { condition: '切断超自然联系（烧毁标本/毁掉入口）', result: '暂时切断通道，但存在仍在', sanChange: '-1D4' },
                { condition: '完全理解真相并接受', result: '获得深层知识但SAN大幅下降', sanChange: '-2D4' }
            ],
            '遗产争夺': [
                { condition: '将器物送回出土之地重新封印', result: '封印维持，但数十年后可能再松动', sanChange: '-1D6' },
                { condition: '交由专业机构保管', result: '暂时安全，但机构可能研究它', sanChange: '-1D4' },
                { condition: '打开/激活器物', result: '释放存在，噩梦成为现实', sanChange: '-1D10' },
                { condition: '毁掉器物', result: '存在被驱散但未消灭，可能附着于碎片', sanChange: '-1D8' }
            ]
        };

        return endingTemplates[structure.name] || endingTemplates['失踪调查'];
    },

    generateKPNotes(structure, atmosphere, entity, npcs, mythosCombo) {
        const structureNotes = {
            '密室推理': '核心：推理不是铺垫，超自然不取消推理而是扩展推理维度。恐惧来自理解——死者不是被谋杀，是被压垮。每个NPC都有人性——谎言不是因为邪恶，是因为无法面对真相。',
            '失踪调查': '核心：三层结构严格递进——第一层纯推理，第二层引入超自然但保持距离，第三层才揭示克苏鲁真相。门不是空间，是状态。失踪者不是死了，是"去了另一边"。',
            '封闭机构': '核心恐惧不是怪物，而是"被看见"——那些存在不需要靠近你，只需要"看见"你。两条平行的悲剧线：主动进入的人 vs 被动被侵蚀的人。不要让被侵蚀者成为单纯的敌人——他也是受害者。',
            '遗产争夺': '核心：无战斗，纯调查推理。SAN压力分段递减而非一次性重创。线索链中等偏清晰，但关键线索需成功检定。死者的日记/遗言是情感核心——要在调查者读完后独立呈现，不加任何解释。'
        };

        const pacingNotes = {
            'cosmic_horror': '节奏：日常→不安→确认→绝望，永远不要一步跳到绝望。用"虚惊"建立紧张（突然的关门声、猫的尖叫），交替调查与恐怖场景防止疲劳。最恐怖的时刻应该是心理性的，不是怪物。',
            'mystery': '节奏：每个场景都包含可被发现的线索，线索之间构成逻辑链。信息差是核心：NPC知道调查员不知道的事。当玩家提出合理推理时给予正面反馈——哪怕不完全正确，也让部分信息得到验证。',
            'folk_horror': '节奏：从日常的怪异感开始——不是恐怖，是"不对劲"。本地人的禁忌比怪物更可怕。让调查者逐渐意识到：这片土地本身就在"看"着他们。'
        };

        const stuckNotes = [];
        if (npcs.length > 0) {
            const highTrustNPC = npcs.reduce((a, b) => a.trust > b.trust ? a : b);
            stuckNotes.push(`调查者卡关时：${highTrustNPC.name}（信任度${highTrustNPC.trust}）主动提供信息`);
        }
        if (npcs.length > 1) {
            const lowTrustNPC = npcs.reduce((a, b) => a.trust < b.trust ? a : b);
            stuckNotes.push(`${lowTrustNPC.name}（信任度${lowTrustNPC.trust}）在信任度提升后"不小心"透露关键信息`);
        }
        stuckNotes.push('环境暗示：地板吱呀声不同、光线角度变化、气味突然改变——用感官细节引导方向');

        let notes = structureNotes[structure.name] || structureNotes['失踪调查'];
        notes += '\n\n';
        notes += pacingNotes[atmosphere.id] || pacingNotes['cosmic_horror'];
        notes += '\n\n卡关应对：' + stuckNotes.join('；');
        notes += '\n\n困难自适应：调查者快速破案则提前触发深层线索；想战斗则存在更愿意对话/谈判；想逃跑则空间扭曲/时间紧迫。';

        if (mythosCombo) {
            var catNames = { deities: '神祇', creatures: '生物', tomes: '典籍', locations: '地点', cults: '邪教', rituals: '仪式' };
            notes += '\n\n【本模组由AI从神话池抽取元素生成，以下元素必须自然融入叙事】';
            for (var cat in mythosCombo) {
                notes += '\n' + (catNames[cat] || cat) + '：' + mythosCombo[cat];
            }
            notes += '\n\n元素使用规则：';
            notes += '\n1. 上述元素是冒险的核心，但应逐步揭示，而非一开始就全部出现。';
            notes += '\n2. 元素之间应产生有机联系（如邪教崇拜某个神祇，在某地点进行某种仪式）。';
            notes += '\n3. 禁止在开场导入中直接暴露神话存在或生物的真实面貌。';
            notes += '\n4. 元素的真实名称不应在NPC对话中轻易出现，应以代号、别名、传闻形式呈现。';
            notes += '\n5. 本模组无固定开场叙事，你需要根据角色背景、模组钩子和神话元素自行创作一个300-500字的导入叙事。';
        }

        return notes;
    },

    generateRandomOpening(era, location, structure, hook, npcs) {
        const eraAtmosphere = {
            '1920s': { weather: ['雨水顺着窗玻璃滑下', '海风裹着盐粒拍打在脸上', '秋天的雾气从河面飘来', '黄昏的光线把一切染成琥珀色'], sound: ['远处传来轮船的汽笛', '煤气灯在风中噼啪作响', '打字机的声音从隔壁传来'], smell: ['旧书和地板蜡的气味', '咸腥的海风', '煤烟和雨水的味道'] },
            'victorian': { weather: ['泰晤士河的雾气浓得像幕布', '煤气灯在雾中变成模糊的光球', '雨已经下了三天'], sound: ['马车碾过石板路', '远处教堂的钟声', '壁炉中木柴的噼啪声'], smell: ['煤烟和湿羊毛', '皮革和旧纸张', '壁炉的烟味'] },
            'modern': { weather: ['霓虹灯在雨水中模糊成一片', '空调的嗡嗡声和远处的车流', '手机屏幕的光映在窗户上'], sound: ['电梯的提示音', '键盘的敲击', '远处救护车的鸣笛'], smell: ['咖啡和消毒水', '电子设备的臭氧味', '雨水冲刷后的沥青'] }
        };

        const atm = eraAtmosphere[era.id] || eraAtmosphere['1920s'];
        const weather = atm.weather[Math.floor(Math.random() * atm.weather.length)];
        const sound = atm.sound[Math.floor(Math.random() * atm.sound.length)];
        const smell = atm.smell[Math.floor(Math.random() * atm.smell.length)];

        let narrative = `${era.name}。${location}。\n\n`;
        narrative += `${weather}。${sound}。空气里弥漫着${smell}。\n\n`;

        if (npcs.length > 0) {
            const client = npcs.find(n => n.trust >= 6) || npcs[0];
            narrative += `${client.name}站在你面前。${client.dialogueStyle}。\n\n`;
            narrative += `「${hook}」\n\n`;
        } else {
            narrative += `${hook}\n\n`;
        }

        narrative += `你站在那里，面前是未知的道路。`;

        return narrative;
    },

    generateRecommendedOccupations(structure, location) {
        const occupationMap = {
            '密室推理': [
                { name: '私家侦探', reason: '受雇调查，侦查/心理学高' },
                { name: '建筑师', reason: '建筑结构知识，建筑学/地质学高' },
                { name: '医生', reason: '法医知识，医学/科学高' },
                { name: '记者', reason: '信息渠道广泛，图书馆/说服高' }
            ],
            '失踪调查': [
                { name: '私家侦探', reason: '受雇调查失踪，侦查/心理学高' },
                { name: '记者', reason: '调查渠道广泛，图书馆/说服高' },
                { name: '教授', reason: '学术圈人脉，考古学/神秘学高' },
                { name: '警察', reason: '官方调查渠道，侦查/格斗高' }
            ],
            '封闭机构': [
                { name: '医生', reason: '专业知识匹配，医学/科学高' },
                { name: '记者', reason: '以调查为由进入，图书馆/说服高' },
                { name: '警察', reason: '有官方授权进入，侦查/格斗高' },
                { name: '教授', reason: '学术背景，考古学/地质学高' }
            ],
            '遗产争夺': [
                { name: '警察/侦探', reason: '调查死因，侦查/心理学高' },
                { name: '教授', reason: '器物鉴定知识，考古学/历史高' },
                { name: '记者', reason: '接触各方不受限，图书馆/说服高' },
                { name: '古董商', reason: '专业鉴定能力，估价/考古学高' }
            ]
        };

        return occupationMap[structure.name] || occupationMap['失踪调查'];
    },

    generateOpeningNarrative(module) {
        if (!module) return '';

        const era = this.STORY_TEMPLATES.eras.find(e => e.id === module.era) || this.STORY_TEMPLATES.eras[0];
        const templates = this.NARRATIVE_PATTERNS.openings;

        let narrative = templates[0]
            .replace('{委托来源}', '委托')
            .replace('{事件描述}', module.hook)
            .replace('{现场状态}', '调查即将开始')
            .replace('{时间}', era.name)
            .replace('{地点}', module.location);

        return narrative;
    },

    generateSceneDescription(location, time = '白天', atmosphere = '神秘') {
        const templates = this.NARRATIVE_PATTERNS.sceneDescriptions;
        return templates[0]
            .replace('{地点}', location)
            .replace('{时间}', time)
            .replace('{氛围描写}', `空气中弥漫着${atmosphere}的气息`)
            .replace('{感官细节}', '你注意到周围的一切都显得不寻常')
            .replace('{第一印象}', '一种异样的感觉涌上心头')
            .replace('{细节描写}', '每个角落都可能隐藏着线索')
            .replace('{环境状态}', '安静而压抑')
            .replace('{关键物品}', '一件引人注目的东西')
            .replace('{位置}', '显眼的位置');
    },

    generateNPCDialogue(npc, type = 'cooperative', topic = '') {
        const templates = this.NARRATIVE_PATTERNS.npcDialogues[type] || this.NARRATIVE_PATTERNS.npcDialogues.reserved;

        return templates
            .replace('{NPC名}', npc.name)
            .replace('{物品/信息}', '相关信息')
            .replace('{动作描写}', '说道')
            .replace('{对话内容}', `关于${topic || '这件事'}，我知道一些情况...`)
            .replace('{神态描写}', '神态复杂')
            .replace('{简短回应}', '我没什么可说的')
            .replace('{敌意动作}', '警惕地看着你')
            .replace('{拒绝/威胁}', '你不该来这里')
            .replace('{崩溃描写}', '终于崩溃')
            .replace('{坦白内容}', '好吧，我告诉你真相');
    },

    importStoryFromJSON(jsonContent) {
        try {
            const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;

            const requiredFields = ['title', 'hook'];
            const missing = requiredFields.filter(f => !data[f]);

            if (missing.length > 0) {
                return {
                    success: false,
                    errors: [{ field: missing.join(', '), message: '缺少必要字段', level: 'fatal' }]
                };
            }

            const story = {
                id: data.id || `imported_${Date.now()}`,
                title: data.title,
                era: data.era || '1920s',
                eraName: data.eraName || '1920年代',
                location: data.location || '未知地点',
                difficulty: data.difficulty || 2,
                duration: data.duration || '2-3小时',
                tags: data.tags || [],
                hook: data.hook,
                structure: data.structure || '失踪调查',
                layers: data.layers || [
                    { name: '第一层', focus: '初步调查', duration: '40-60分钟' },
                    { name: '第二层', focus: '深入线索', duration: '50-70分钟' },
                    { name: '第三层', focus: '真相揭露', duration: '30-50分钟' }
                ],
                npcs: data.npcs || [],
                chekhovGuns: data.chekhovGuns || [],
                clues: data.clues || [],
                entity: data.entity || '未知存在',
                endings: data.endings || [],
                opening: data.opening || '',
                scenes: data.scenes || [],
                importedAt: new Date().toISOString()
            };

            return { success: true, story: story };
        } catch (e) {
            return {
                success: false,
                errors: [{ field: 'JSON', message: `解析错误: ${e.message}`, level: 'fatal' }]
            };
        }
    },

    importStoryFromMarkdown(markdownContent) {
        try {
            const story = {
                id: `md_imported_${Date.now()}`,
                name: '',
                title: '',
                era: '1920s',
                eraName: '1920年代',
                location: '',
                difficulty: 2,
                duration: '2-3小时',
                tags: [],
                hook: '',
                structure: '失踪调查',
                layers: [],
                npcs: [],
                chekhovGuns: [],
                clues: [],
                entity: '',
                endings: [],
                openingNarrative: '',
                scenes: [],
                kpNotes: '',
                rawContent: markdownContent,
                importedAt: new Date().toISOString()
            };

            const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
            if (titleMatch) { story.title = titleMatch[1].replace(/[《》]/g, ''); story.name = story.title; }

            const aboutMatch = markdownContent.match(/##\s*这个故事是关于什么的[\s\S]*?\n\n(.+?)(?:\n\n|$)/);
            if (aboutMatch) {
                story.hook = aboutMatch[1].trim();
            }

            const hookMatch = markdownContent.match(/\*\*一句话\*\*[：:]\s*(.+?)(?:\n|$)/);
            if (hookMatch && !story.hook) story.hook = hookMatch[1];

            const infoSection = markdownContent.match(/##\s*基本信息[\s\S]*?(?=##|$)/);
            if (infoSection) {
                const info = infoSection[0];
                const eraMatch = info.match(/[时代][：:]\s*(.+?)(?:\n|$)/);
                if (eraMatch) {
                    story.era = eraMatch[1].includes('192') ? '1920s' : eraMatch[1].includes('维多利亚') ? 'victorian' : 'modern';
                    story.eraName = eraMatch[1].trim();
                }
                const locMatch = info.match(/\*{0,2}地点\*{0,2}[：:]\s*(.+?)(?:\n|$)/);
                if (locMatch) story.location = locMatch[1].trim();
                const diffMatch = info.match(/难度[：:]\s*([^*\n]+)/);
                if (diffMatch) {
                    const stars = (diffMatch[1].match(/★/g) || []).length;
                    story.difficulty = stars > 0 ? Math.min(5, Math.max(1, stars)) : 2;
                }
                const durMatch = info.match(/[时长][：:]\s*(.+?)(?:\n|$)/);
                if (durMatch) story.duration = durMatch[1].trim();
                const typeMatch = info.match(/[类型][：:]\s*(.+?)(?:\n|$)/);
                if (typeMatch) {
                    if (typeMatch[1].includes('密室')) story.structure = '密室推理';
                    else if (typeMatch[1].includes('调查')) story.structure = '失踪调查';
                    else if (typeMatch[1].includes('恐怖')) story.structure = '恐怖生存';
                    else story.structure = typeMatch[1].trim();
                }
            }

            const locationMatch = markdownContent.match(/\*{0,2}地点\*{0,2}[：:]\s*(.+?)(?:\n|$)/);
            if (locationMatch && !story.location) story.location = locationMatch[1].trim();

            const difficultyMatch = markdownContent.match(/难度[等级]*[：:]\s*(★+)/);
            if (difficultyMatch && story.difficulty === 2) {
                const stars = (difficultyMatch[1].match(/★/g) || []).length;
                if (stars > 0) story.difficulty = Math.min(5, Math.max(1, stars));
            }

            const kpIntroMatch = markdownContent.match(/##\s*KP导入[\s\S]*?(?=\n---\n|\n##\s)/);
            if (kpIntroMatch) {
                let introText = kpIntroMatch[0].replace(/^##\s*KP导入\s*\n/, '');
                introText = introText.replace(/^>\s*/gm, '').trim();
                story.openingNarrative = introText;
            }

            const npcSection = markdownContent.match(/###\s*阿木|###\s*扎西|###\s*央金|##\s*人[\s\S]*?(?=\n##\s)/);
            if (npcSection) {
                const npcBlocks = npcSection[0].match(/###\s+(.+?)(?:\n[\s\S]*?)(?=###\s+|\n##\s|$)/g);
                if (npcBlocks) {
                    for (const block of npcBlocks) {
                        const nameMatch = block.match(/###\s+(.+?)(?:\n|$)/);
                        if (!nameMatch) continue;
                        const rawName = nameMatch[1].trim();
                        const nameParts = rawName.split(/[·•\-—]/);
                        const name = nameParts[0].trim();
                        const role = nameParts.length > 1 ? nameParts[1].trim() : '关键人物';

                        const descMatch = block.match(/\*\*他是什么样的人\*\*[：:]\s*([\s\S]*?)(?=\n\n\*\*|\n\n[A-Z])/i)
                            || block.match(/\*\*她是什么样的人\*\*[：:]\s*([\s\S]*?)(?=\n\n\*\*|\n\n[A-Z])/i);
                        const coreTrait = descMatch ? descMatch[1].trim().substring(0, 100) : '';

                        const speechMatch = block.match(/\*\*他的说话方式\*\*[：:]\s*([\s\S]*?)(?=\n\n\*\*|\n\n[A-Z])/i)
                            || block.match(/\*\*她的说话方式\*\*[：:]\s*([\s\S]*?)(?=\n\n\*\*|\n\n[A-Z])/i);
                        const speechStyle = speechMatch ? speechMatch[1].trim().substring(0, 100) : '';

                        const secretMatch = block.match(/\*\*他知道什么\*\*[：:]\s*([\s\S]*?)(?=\n\n\*\*|\n\n[A-Z])/i)
                            || block.match(/\*\*她知道什么\*\*[：:]\s*([\s\S]*?)(?=\n\n\*\*|\n\n[A-Z])/i);
                        const secret = secretMatch ? secretMatch[1].trim().substring(0, 150) : '';

                        story.npcs.push({
                            id: name,
                            name: name,
                            role: role,
                            coreTrait: coreTrait,
                            speechStyle: speechStyle,
                            secret: secret,
                            trust: 5
                        });
                    }
                }
            }

            const fallbackNpcSection = markdownContent.match(/##\s*关键NPC[\s\S]*?(?=##|$)/);
            if (fallbackNpcSection && story.npcs.length === 0) {
                const npcMatches = fallbackNpcSection[0].matchAll(/####\s*━━━\s*(.+?)\s*━━/g);
                for (const match of npcMatches) {
                    story.npcs.push({
                        name: match[1].split('（')[0].trim(),
                        role: '关键人物',
                        trust: 5,
                        secret: ''
                    });
                }
            }

            const layerMatches = markdownContent.matchAll(/##\s*第([一二三四五])层[：:]\s*(.+?)(?:\n|$)/g);
            const layerNames = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5 };
            story.layers = [];
            for (const lm of layerMatches) {
                story.layers.push({
                    name: `第${lm[1]}层`,
                    focus: lm[2].trim(),
                    duration: ''
                });
            }
            if (story.layers.length === 0) {
                story.layers = [
                    { name: '第一层', focus: '初步调查', duration: '40-60分钟' },
                    { name: '第二层', focus: '深入线索', duration: '50-70分钟' },
                    { name: '第三层', focus: '真相揭露', duration: '30-50分钟' }
                ];
            }

            const checkTables = markdownContent.matchAll(/\|.*检定.*\|[\s\S]*?(?=\n\n|\n##|$)/g);
            story.clues = [];
            for (const table of checkTables) {
                const rows = table[0].matchAll(/\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/g);
                for (const row of rows) {
                    const skill = row[1].trim();
                    if (skill === '检定' || skill.startsWith('-')) continue;
                    story.clues.push({
                        id: `clue_${story.clues.length + 1}`,
                        name: skill,
                        type: '检定',
                        location: '',
                        description: `成功：${row[3].trim()}；失败：${row[4].trim()}`,
                        associatedNPC: '',
                        act: story.clues.length < 3 ? 1 : story.clues.length < 6 ? 2 : 3
                    });
                }
            }

            const progressMatch = markdownContent.match(/##\s*阶段定义[\s\S]*?(?=##\s*骰子|$)/);
            if (progressMatch) {
                const stages = progressMatch[0].matchAll(/###\s*阶段(\d+)[：:]\s*(.+?)(?:\n|$)/g);
                for (const stage of stages) {
                    story.scenes.push({
                        id: `scene_${stage[1]}`,
                        name: `阶段${stage[1]}：${stage[2].trim()}`,
                        description: '',
                        npcs: [],
                        clues: []
                    });
                }
            }

            const tabooMatch = markdownContent.match(/###\s*禁忌[\s\S]*?(?=\n###|\n##|$)/);
            if (tabooMatch) {
                story.kpNotes = tabooMatch[0].replace(/^###\s*禁忌\s*\n/, '').trim();
            }

            const styleMatch = markdownContent.match(/###\s*叙事风格指引[\s\S]*?(?=\n##|$)/);
            if (styleMatch) {
                const styleText = styleMatch[0].replace(/^###\s*叙事风格指引\s*\n/, '').trim();
                story.kpNotes = story.kpNotes ? story.kpNotes + '\n\n' + styleText : styleText;
            }

            const npcStyleMatch = markdownContent.match(/###\s*NPC语言风格[\s\S]*?(?=\n##|\n---|$)/);
            if (npcStyleMatch) {
                const styleText = npcStyleMatch[0].replace(/^###\s*NPC语言风格\s*\n/, '').trim();
                story.kpNotes = story.kpNotes ? story.kpNotes + '\n\n' + styleText : styleText;
            }

            if (!story.hook) {
                const firstParagraph = markdownContent.split('\n\n').find(p => p.length > 50 && !p.startsWith('#'));
                if (firstParagraph) story.hook = firstParagraph.substring(0, 100) + '...';
            }

            if (!story.location) {
                const locMatch2 = markdownContent.match(/\*\*(.+?)\*\*[·—\-]\s*(.+?)(?:\n|$)/);
                if (locMatch2) story.location = locMatch2[2].trim();
            }

            story.progressStages = this._buildProgressStages(markdownContent, story);

            story.doomsdayClocks = this._buildDoomsdayClocks(markdownContent, story);

            story.settingLanguage = this._detectSettingLanguage(markdownContent, story);

            return { success: true, story: story };
        } catch (e) {
            return {
                success: false,
                errors: [{ field: 'Markdown', message: `解析错误: ${e.message}`, level: 'fatal' }]
            };
        }
    },

    exportStoryToJSON(story) {
        return JSON.stringify(story, null, 2);
    },

    _buildProgressStages(markdownContent, story) {
        var stages = [];
        var layerRegex = /##\s*第([一二三四五])层[：:]\s*(.+?)(?:\n|$)/g;
        var layerMatches = [];
        var lm;
        while ((lm = layerRegex.exec(markdownContent)) !== null) {
            layerMatches.push({ full: lm[0], name: lm[2].trim(), index: layerMatches.length });
        }

        if (layerMatches.length === 0) {
            var sectionRegex = /##\s*(第一幕|第二幕|第三幕|序幕|终幕|序章|终章|第一章|第二章|第三章)[：:]*\s*(.+?)(?:\n|$)/gi;
            while ((lm = sectionRegex.exec(markdownContent)) !== null) {
                layerMatches.push({ full: lm[0], name: lm[1].trim() + (lm[2] ? '：' + lm[2].trim() : ''), index: layerMatches.length });
            }
        }

        if (layerMatches.length === 0) {
            stages.push({
                name: '调查',
                description: '自由调查阶段，探索环境、收集线索、与NPC交流',
                advanceConditions: [
                    { type: 'clue', keyword: '', description: '获得关键线索' },
                    { type: 'flag', flag: 'investigation_complete', description: '调查阶段完成' }
                ],
                requiredConditions: 1,
                kpDirective: '引导调查员探索环境，通过NPC对话和场景描述提供信息',
                autoAdvance: false
            });
            stages.push({
                name: '真相',
                description: '调查员逐步接近核心真相',
                advanceConditions: [
                    { type: 'flag', flag: 'truth_revealed', description: '核心真相被揭露' }
                ],
                requiredConditions: 1,
                kpDirective: '根据调查员的推理深度逐步揭示真相',
                autoAdvance: false
            });
            stages.push({
                name: '抉择',
                description: '调查员面对最终选择',
                advanceConditions: [],
                kpDirective: '呈现所有可能的结局选项，让调查员做出选择',
                autoAdvance: false
            });
            return stages;
        }

        for (var i = 0; i < layerMatches.length; i++) {
            var layer = layerMatches[i];
            var sectionStart = markdownContent.indexOf(layer.full);
            var nextSectionStart = -1;
            if (i + 1 < layerMatches.length) {
                nextSectionStart = markdownContent.indexOf(layerMatches[i + 1].full);
            }
            var sectionContent = nextSectionStart > 0
                ? markdownContent.substring(sectionStart, nextSectionStart)
                : markdownContent.substring(sectionStart);

            var stage = {
                name: layer.name,
                description: '',
                advanceConditions: [],
                requiredConditions: 1,
                kpDirective: '',
                autoAdvance: false
            };

            var descMatch = sectionContent.match(/(?:调查员|玩家)[^\n]*?(?:发现|进入|面对|需要)[\s\S]*?(?=\n###|\n##|\n---|$)/);
            if (descMatch) {
                stage.description = descMatch[0].trim().substring(0, 200);
            } else {
                var firstPara = sectionContent.split('\n\n').find(function(p) { return p.trim().length > 20 && !p.trim().startsWith('#') && !p.trim().startsWith('|'); });
                if (firstPara) stage.description = firstPara.trim().substring(0, 200);
            }

            if (!stage.description) {
                stage.description = layer.name;
            }

            var checkTableRows = sectionContent.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g);
            if (checkTableRows) {
                for (var r = 0; r < checkTableRows.length; r++) {
                    var cells = checkTableRows[r].split('|').filter(function(c) { return c.trim(); });
                    if (cells.length >= 1 && cells[0].trim() !== '检定' && !cells[0].trim().startsWith('-')) {
                        stage.advanceConditions.push({
                            type: 'clue',
                            keyword: cells[0].trim(),
                            description: '通过' + cells[0].trim() + '获得线索'
                        });
                    }
                }
            }

            var npcMentions = sectionContent.match(/(?:从|向|找|与|和|问)(.{1,6}?)(?:那里|那里|对话|交谈|询问|追问|见面)/g);
            if (npcMentions) {
                var mentionedNpcs = {};
                for (var n = 0; n < npcMentions.length; n++) {
                    var npcName = npcMentions[n].replace(/^(?:从|向|找|与|和|问)/, '').replace(/(?:那里|对话|交谈|询问|追问|见面)$/, '').trim();
                    if (npcName.length <= 6 && !mentionedNpcs[npcName]) {
                        mentionedNpcs[npcName] = true;
                        stage.advanceConditions.push({
                            type: 'npc_trust',
                            npcName: npcName,
                            minTrust: 6,
                            description: '与' + npcName + '建立信任关系'
                        });
                    }
                }
            }

            if (i === 0) {
                stage.advanceConditions.push({
                    type: 'flag',
                    flag: 'layer1_complete',
                    description: '完成初步调查'
                });
                stage.kpDirective = '引导调查员熟悉环境、接触核心NPC、获得进入下一阶段的关键信息。不要急于推进，让调查员充分探索。';
            } else if (i === layerMatches.length - 1) {
                stage.advanceConditions = [];
                stage.kpDirective = '这是最终阶段。调查员面对核心真相，必须做出选择。呈现所有可能的结局路径，不要替调查员做决定。';
            } else {
                stage.advanceConditions.push({
                    type: 'flag',
                    flag: 'layer' + (i + 1) + '_complete',
                    description: '完成第' + (i + 1) + '层调查'
                });
                stage.kpDirective = '调查员正在深入真相。根据已获得的线索逐步揭示更多信息，但保留最终真相到下一阶段。';
            }

            if (stage.advanceConditions.length > 0) {
                stage.requiredConditions = Math.max(1, Math.ceil(stage.advanceConditions.length * 0.5));
            }

            stages.push(stage);
        }

        return stages;
    },

    _buildDoomsdayClocks(markdownContent, story) {
        var clocks = [];

        var timeLimitMatch = markdownContent.match(/时间限制[：:]\s*(.+?)(?:\n|$)/i);
        var deadlineMatch = markdownContent.match(/(?:截止|期限|最后期限|deadline)[：:]\s*(.+?)(?:\n|$)/i);
        var urgencyMatch = markdownContent.match(/(?:紧急|紧迫|倒计时|倒數)[：:]\s*(.+?)(?:\n|$)/i);

        if (timeLimitMatch || deadlineMatch || urgencyMatch) {
            var timeDesc = (timeLimitMatch || deadlineMatch || urgencyMatch)[1].trim();
            clocks.push({
                name: '时间限制',
                description: timeDesc,
                consequence: '时间耗尽，事态恶化',
                triggered: false
            });
        }

        var countdownSection = markdownContent.match(/##\s*(?:末日钟|倒计时|时间压力)[\s\S]*?(?=\n##\s|$)/i);
        if (countdownSection) {
            var clockEntries = countdownSection[0].match(/###\s+(.+?)(?:\n|$)/g);
            if (clockEntries) {
                for (var i = 0; i < clockEntries.length; i++) {
                    var clockName = clockEntries[i].replace(/^###\s+/, '').trim();
                    clocks.push({
                        name: clockName,
                        description: '',
                        consequence: '',
                        triggered: false
                    });
                }
            }
        }

        return clocks;
    },

    _detectSettingLanguage(markdownContent, story) {
        var LOCATION_LANG_MAP = {
            '阿卡姆': '英语', '方山': '中文', '密斯卡托尼克': '英语',
            '纽约': '英语', '伦敦': '英语', '巴黎': '法语', '柏林': '德语',
            '东京': '日语', '莫斯科': '俄语', '罗马': '意大利语',
            '开罗': '阿拉伯语', '孟买': '印地语', '上海': '中文',
            '北京': '中文', '香港': '中文', '西藏': '中文', '藏区': '中文',
            '苍雾寨': '中文', '拉萨': '中文', '成都': '中文',
            '新奥尔良': '英语', '波士顿': '英语', '洛杉矶': '英语',
            '维也纳': '德语', '布拉格': '捷克语', '布宜诺斯艾利斯': '西班牙语',
            '墨西哥城': '西班牙语', '里约': '葡萄牙语'
        };

        var langMatch = markdownContent.match(/(?:语言|主导语言|当地语言|背景语言)[：:]\s*(.+?)(?:\n|$)/i);
        if (langMatch) return langMatch[1].trim();

        var loc = story.location || '';
        for (var key in LOCATION_LANG_MAP) {
            if (loc.indexOf(key) !== -1) return LOCATION_LANG_MAP[key];
        }

        var content = markdownContent.substring(0, 3000);
        for (var key in LOCATION_LANG_MAP) {
            if (content.indexOf(key) !== -1) return LOCATION_LANG_MAP[key];
        }

        var era = story.era || '';
        if (era === '1920s' || era === 'victorian') return '英语';

        return '';
    },

    getRecommendedOccupations(story) {
        if (!story) return [];

        const recommendations = [];
        const occupations = this.STORY_TEMPLATES.occupations;
        const tags = story.tags || [];
        const npcs = story.npcs || [];

        for (const occ of occupations) {
            let score = 0;
            let reasons = [];

            if (story.structure === '密室推理' && ['私家侦探', '警察'].includes(occ.name)) {
                score += 2;
                reasons.push('适合推理分析');
            }

            if (story.structure === '失踪调查' && occ.name === '记者') {
                score += 2;
                reasons.push('调查渠道广泛');
            }

            if (story.structure === '封闭机构' && occ.name === '医生') {
                score += 2;
                reasons.push('专业知识匹配');
            }

            if (tags.includes('古董') && occ.name === '教授') {
                score += 2;
                reasons.push('文献解读能力强');
            }

            if (score > 0) {
                recommendations.push({
                    occupation: occ.name,
                    skills: occ.skills,
                    traits: occ.traits,
                    score: score,
                    reasons: reasons
                });
            }
        }

        return recommendations.sort((a, b) => b.score - a.score).slice(0, 4);
    },

    generateKPNotes(story) {
        if (!story) return '';

        let notes = `## AI KP 操作手册\n\n`;
        notes += `### 剧本概述\n`;
        notes += `- 标题：${story.title}\n`;
        notes += `- 时代：${story.eraName || story.era}\n`;
        notes += `- 地点：${story.location}\n`;
        notes += `- 难度：${'★'.repeat(story.difficulty)}${'☆'.repeat(5 - story.difficulty)}\n\n`;

        notes += `### 三层结构\n`;
        if (story.layers) {
            story.layers.forEach((layer, i) => {
                notes += `${i + 1}. ${layer.name}：${layer.focus}（约${layer.duration}）\n`;
            });
        }
        notes += `\n`;

        notes += `### 关键NPC\n`;
        if (story.npcs) {
            story.npcs.forEach(npc => {
                notes += `- **${npc.name}**（${npc.role}）：信任度${npc.trust}，秘密：${npc.secret || '未知'}\n`;
            });
        }
        notes += `\n`;

        notes += `### 契诃夫之枪\n`;
        if (story.chekhovGuns) {
            story.chekhovGuns.forEach((gun, i) => {
                notes += `${i + 1}. 埋设：${gun.plant} → 回收：${gun.payoff}\n`;
            });
        }
        notes += `\n`;

        notes += `### 核心实体\n`;
        notes += `${story.entity || '未知存在'}\n`;

        return notes;
    }
};
