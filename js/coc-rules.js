const COCRules = {
    ATTRIBUTES: {
        str: { name: '力量', abbr: 'STR', dice: '3D6', formula: { n: 3, sides: 6, mod: 0 }, min: 15, max: 90 },
        con: { name: '体质', abbr: 'CON', dice: '3D6', formula: { n: 3, sides: 6, mod: 0 }, min: 15, max: 90 },
        siz: { name: '体型', abbr: 'SIZ', dice: '(2D6+6)×5', formula: { n: 2, sides: 6, mod: 6 }, min: 40, max: 90 },
        dex: { name: '敏捷', abbr: 'DEX', dice: '3D6', formula: { n: 3, sides: 6, mod: 0 }, min: 15, max: 90 },
        app: { name: '外貌', abbr: 'APP', dice: '3D6', formula: { n: 3, sides: 6, mod: 0 }, min: 15, max: 90 },
        int: { name: '智力', abbr: 'INT', dice: '(2D6+6)×5', formula: { n: 2, sides: 6, mod: 6 }, min: 40, max: 90 },
        pow: { name: '意志', abbr: 'POW', dice: '3D6', formula: { n: 3, sides: 6, mod: 0 }, min: 15, max: 90 },
        edu: { name: '教育', abbr: 'EDU', dice: '(2D6+6)×5', formula: { n: 2, sides: 6, mod: 6 }, min: 40, max: 90 }
    },

    SKILL_BASE: {
        '会计': 5, '人类学': 1, '估价': 5, '考古学': 1,
        '艺术与工艺': 5, '魅惑': 15, '攀爬': 20, '信用评级': 0,
        '克苏鲁神话': 0, '乔装': 1, '闪避': 0, '汽车驾驶': 20,
        '电器维修': 10, '电子学': 1, '话术': 5, '斗殴': 25,
        '火器（手枪）': 20, '火器（步枪/霰弹枪）': 25, '火器（弓弩）': 15,
        '急救': 30, '历史': 5, '恐吓': 15, '跳跃': 20,
        '语言（母语）': 0, '语言（外语）': 1, '法律': 5,
        '图书馆使用': 20, '聆听': 20, '锁匠': 1, '机械维修': 10,
        '医学': 1, '自然学': 10, '导航': 10, '神秘学': 5,
        '操作重型机械': 1, '说服': 10, '驾驶（飞行器）': 1,
        '驾驶（船）': 1, '心理学': 10, '精神分析': 1, '骑术': 5,
        '科学': 1, '潜行': 20, '侦查': 25, '生存': 10,
        '游泳': 20, '投掷': 20, '追踪': 10
    },

    MODERN_SKILLS: ['电子学'],

    OCCUPATIONS: {
        '会计师': {
            skills: ['会计', '法律', '图书馆使用', '聆听', '说服', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [30, 70], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '杂技演员': {
            skills: ['攀爬', '闪避', '跳跃', '投掷', '侦查', '游泳'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 20], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '演员': {
            skills: ['艺术与工艺', '乔装', '斗殴', '历史', '魅惑', '话术', '心理学'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 40], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '古物学者': {
            skills: ['估价', '艺术与工艺', '历史', '图书馆使用', '语言（外语）', '话术', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [30, 70], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '古董商': {
            skills: ['会计', '估价', '汽车驾驶', '话术', '恐吓', '历史', '图书馆使用', '导航'],
            creditRange: [30, 50], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '考古学家': {
            skills: ['估价', '考古学', '历史', '语言（外语）', '图书馆使用', '侦查', '机械维修', '导航'],
            creditRange: [10, 40], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '建筑师': {
            skills: ['会计', '艺术与工艺', '法律', '语言（母语）', '图书馆使用', '说服', '心理学', '科学'],
            creditRange: [30, 70], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '艺术家': {
            skills: ['艺术与工艺', '历史', '话术', '语言（外语）', '心理学', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 50], skillFormula: '教育×2+敏捷或意志×2', pointKey: 'edu2_dex_or_pow2'
        },
        '精神病院看护': {
            skills: ['闪避', '斗殴', '急救', '魅惑', '恐吓', '聆听', '心理学', '潜行'],
            creditRange: [8, 20], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '运动员': {
            skills: ['攀爬', '跳跃', '斗殴', '骑术', '话术', '游泳', '投掷'],
            creditRange: [9, 70], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '作家': {
            skills: ['艺术与工艺', '历史', '图书馆使用', '自然学', '语言（外语）', '语言（母语）', '心理学'],
            creditRange: [9, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '酒保': {
            skills: ['会计', '魅惑', '话术', '斗殴', '聆听', '心理学', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [8, 25], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '猎人': {
            skills: ['火器（步枪/霰弹枪）', '聆听', '自然学', '导航', '科学', '潜行', '追踪'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [20, 50], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '书商': {
            skills: ['会计', '估价', '汽车驾驶', '历史', '图书馆使用', '语言（母语）', '语言（外语）', '说服'],
            creditRange: [20, 40], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '赏金猎人': {
            skills: ['汽车驾驶', '电器维修', '斗殴', '话术', '法律', '心理学', '追踪', '潜行'],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '拳击手': {
            skills: ['闪避', '斗殴', '恐吓', '跳跃', '心理学', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 60], skillFormula: '教育×2+力量×2', pointKey: 'edu2_str2'
        },
        '管家/仆人': {
            skills: ['会计', '艺术与工艺', '急救', '聆听', '语言（外语）', '心理学', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 40], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '神职人员': {
            skills: ['会计', '历史', '图书馆使用', '聆听', '语言（外语）', '说服', '心理学'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 60], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '工匠': {
            skills: ['会计', '艺术与工艺', '机械维修', '自然学', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [10, 40], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '罪犯-窃贼': {
            skills: ['估价', '攀爬', '电器维修', '聆听', '锁匠', '潜行', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [5, 40], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '罪犯-欺诈师': {
            skills: ['估价', '艺术与工艺', '法律', '聆听', '话术', '恐吓', '心理学'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [10, 65], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '罪犯-打手': {
            skills: ['汽车驾驶', '斗殴', '火器（手枪）', '魅惑', '恐吓', '心理学', '潜行', '侦查'],
            creditRange: [5, 30], skillFormula: '教育×2+力量×2', pointKey: 'edu2_str2'
        },
        '罪犯-走私者': {
            skills: ['火器（手枪）', '聆听', '导航', '话术', '汽车驾驶', '心理学', '潜行', '侦查'],
            creditRange: [20, 60], skillFormula: '教育×2+外貌或敏捷×2', pointKey: 'edu2_app_or_dex2'
        },
        '教团首领': {
            skills: ['会计', '魅惑', '恐吓', '神秘学', '心理学', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [30, 60], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '设计师': {
            skills: ['会计', '艺术与工艺', '图书馆使用', '机械维修', '心理学', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [20, 60], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '潜水员': {
            skills: ['急救', '机械维修', '驾驶（船）', '科学', '侦查', '游泳'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 30], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '医生': {
            skills: ['急救', '医学', '语言（外语）', '心理学', '科学'],
            customSlots: [{ count: 2, desc: '任意其他学术或个人特长' }],
            creditRange: [30, 80], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '流浪者': {
            skills: ['攀爬', '跳跃', '聆听', '导航', '话术', '潜行'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [0, 5], skillFormula: '教育×2+外貌或敏捷×2', pointKey: 'edu2_app_or_dex2'
        },
        '私人司机': {
            skills: ['汽车驾驶', '魅惑', '话术', '聆听', '机械维修', '导航', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [10, 40], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '出租车司机': {
            skills: ['会计', '汽车驾驶', '电器维修', '话术', '机械维修', '导航', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 30], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '编辑': {
            skills: ['会计', '历史', '语言（母语）', '魅惑', '话术', '心理学', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [10, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '政府官员': {
            skills: ['魅惑', '历史', '恐吓', '话术', '聆听', '语言（母语）', '说服', '心理学'],
            creditRange: [50, 90], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '工程师': {
            skills: ['艺术与工艺', '电器维修', '图书馆使用', '机械维修', '操作重型机械', '科学'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [30, 60], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '艺人': {
            skills: ['艺术与工艺', '乔装', '魅惑', '话术', '聆听', '心理学'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 70], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '探险家': {
            skills: ['攀爬', '火器（步枪/霰弹枪）', '历史', '跳跃', '自然学', '导航', '语言（外语）', '生存'],
            creditRange: [55, 80], skillFormula: '教育×2+外貌或敏捷或力量×2', pointKey: 'edu2_app_or_dex_or_str2'
        },
        '农民': {
            skills: ['艺术与工艺', '汽车驾驶', '话术', '机械维修', '自然学', '操作重型机械', '追踪'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '联邦探员': {
            skills: ['汽车驾驶', '斗殴', '火器（手枪）', '法律', '说服', '潜行', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [20, 40], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '消防员': {
            skills: ['攀爬', '闪避', '汽车驾驶', '急救', '跳跃', '机械维修', '操作重型机械', '投掷'],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '驻外记者': {
            skills: ['历史', '语言（外语）', '语言（母语）', '聆听', '魅惑', '话术', '心理学'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [10, 40], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '法医': {
            skills: ['语言（外语）', '图书馆使用', '医学', '说服', '科学', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [40, 60], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '赌徒': {
            skills: ['会计', '艺术与工艺', '魅惑', '话术', '聆听', '心理学', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [8, 50], skillFormula: '教育×2+外貌或敏捷×2', pointKey: 'edu2_app_or_dex2'
        },
        '黑帮老大': {
            skills: ['斗殴', '火器（手枪）', '法律', '聆听', '魅惑', '恐吓', '心理学', '侦查'],
            creditRange: [60, 95], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '绅士/淑女': {
            skills: ['艺术与工艺', '魅惑', '话术', '火器（步枪/霰弹枪）', '历史', '语言（外语）', '导航', '骑术'],
            creditRange: [40, 90], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '勤杂护工': {
            skills: ['电器维修', '话术', '斗殴', '急救', '聆听', '机械维修', '心理学', '潜行'],
            creditRange: [6, 15], skillFormula: '教育×2+力量×2', pointKey: 'edu2_str2'
        },
        '调查记者': {
            skills: ['艺术与工艺', '话术', '历史', '图书馆使用', '语言（母语）', '心理学', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '法官': {
            skills: ['历史', '恐吓', '法律', '图书馆使用', '聆听', '语言（母语）', '说服', '心理学'],
            creditRange: [50, 80], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '实验室助理': {
            skills: ['图书馆使用', '电器维修', '语言（外语）', '科学', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他学术或个人特长' }],
            creditRange: [10, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '非熟练工人': {
            skills: ['汽车驾驶', '电器维修', '斗殴', '急救', '机械维修', '操作重型机械', '投掷'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '律师': {
            skills: ['会计', '法律', '图书馆使用', '魅惑', '话术', '恐吓', '心理学'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [30, 80], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '图书管理员': {
            skills: ['会计', '图书馆使用', '语言（外语）', '语言（母语）'],
            customSlots: [{ count: 4, desc: '任意其他学术或个人特长' }],
            creditRange: [9, 35], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '技师': {
            skills: ['艺术与工艺', '攀爬', '汽车驾驶', '电器维修', '机械维修', '操作重型机械'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代或技术特长' }],
            creditRange: [9, 40], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '军官': {
            skills: ['会计', '火器（步枪/霰弹枪）', '导航', '急救', '魅惑', '恐吓', '心理学'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [20, 70], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '传教士': {
            skills: ['艺术与工艺', '急救', '机械维修', '医学', '自然学', '说服'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [0, 30], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '登山家': {
            skills: ['攀爬', '急救', '跳跃', '聆听', '导航', '语言（外语）', '生存', '追踪'],
            creditRange: [30, 60], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '博物馆管理员': {
            skills: ['会计', '估价', '考古学', '历史', '图书馆使用', '神秘学', '语言（外语）', '侦查'],
            creditRange: [10, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '音乐家': {
            skills: ['艺术与工艺', '话术', '聆听', '心理学'],
            customSlots: [{ count: 4, desc: '任意其他技能' }],
            creditRange: [9, 30], skillFormula: '教育×2+意志或敏捷×2', pointKey: 'edu2_pow_or_dex2'
        },
        '护士': {
            skills: ['急救', '聆听', '医学', '说服', '心理学', '科学', '侦查'],
            creditRange: [9, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '神秘学家': {
            skills: ['人类学', '历史', '图书馆使用', '话术', '神秘学', '语言（外语）', '科学'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 65], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '药剂师': {
            skills: ['会计', '急救', '语言（外语）', '图书馆使用', '说服', '心理学', '科学'],
            creditRange: [35, 75], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '摄影师': {
            skills: ['艺术与工艺', '话术', '心理学', '科学', '潜行', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '飞行员': {
            skills: ['电器维修', '机械维修', '导航', '操作重型机械', '驾驶（飞行器）', '科学'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [20, 70], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '警探': {
            skills: ['艺术与工艺', '乔装', '火器（手枪）', '法律', '聆听', '话术', '心理学', '侦查'],
            customSlots: [{ count: 1, desc: '任意其他技能' }],
            creditRange: [20, 50], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '巡警': {
            skills: ['斗殴', '火器（手枪）', '急救', '话术', '法律', '心理学', '侦查', '汽车驾驶'],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '私家侦探': {
            skills: ['艺术与工艺', '乔装', '法律', '图书馆使用', '话术', '心理学', '侦查', '锁匠'],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '教授': {
            skills: ['图书馆使用', '语言（外语）', '语言（母语）', '心理学'],
            customSlots: [{ count: 4, desc: '任意其他学术、时代或个人特长' }],
            creditRange: [20, 70], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '精神病学家': {
            skills: ['语言（外语）', '聆听', '医学', '说服', '精神分析', '心理学', '科学'],
            creditRange: [30, 80], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '研究员': {
            skills: ['历史', '图书馆使用', '话术', '语言（外语）', '侦查'],
            customSlots: [{ count: 3, desc: '任意其他学术领域' }],
            creditRange: [9, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '海员': {
            skills: ['电器维修', '斗殴', '火器（手枪）', '急救', '导航', '驾驶（船）', '生存', '游泳'],
            creditRange: [9, 30], skillFormula: '教育×2+敏捷或力量×2', pointKey: 'edu2_dex_or_str2'
        },
        '推销员': {
            skills: ['会计', '魅惑', '话术', '汽车驾驶', '聆听', '心理学', '潜行'],
            customSlots: [{ count: 1, desc: '任意其他技能' }],
            creditRange: [9, 40], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '科学家': {
            skills: ['科学', '图书馆使用', '语言（外语）', '语言（母语）', '话术', '侦查'],
            customSlots: [{ count: 2, desc: '任意其他学术或个人特长' }],
            creditRange: [9, 50], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '秘书': {
            skills: ['会计', '艺术与工艺', '魅惑', '话术', '语言（母语）', '图书馆使用', '心理学'],
            creditRange: [9, 30], skillFormula: '教育×2+敏捷或外貌×2', pointKey: 'edu2_dex_or_app2'
        },
        '士兵': {
            skills: ['攀爬', '闪避', '斗殴', '火器（步枪/霰弹枪）', '潜行', '生存', '急救', '机械维修'],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '间谍': {
            skills: ['艺术与工艺', '乔装', '火器（手枪）', '聆听', '语言（外语）', '话术', '心理学', '潜行'],
            creditRange: [20, 60], skillFormula: '教育×2+外貌或敏捷×2', pointKey: 'edu2_app_or_dex2'
        },
        '学生': {
            skills: ['语言（母语）', '语言（外语）', '图书馆使用', '聆听', '科学', '历史'],
            creditRange: [5, 10], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '替身演员': {
            skills: ['攀爬', '闪避', '斗殴', '急救', '跳跃', '游泳', '汽车驾驶'],
            creditRange: [10, 50], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '部落成员': {
            skills: ['攀爬', '斗殴', '聆听', '自然学', '神秘学', '侦查', '游泳', '生存'],
            creditRange: [0, 15], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '殡葬师': {
            skills: ['会计', '汽车驾驶', '话术', '历史', '神秘学', '心理学', '科学'],
            creditRange: [20, 40], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '服务生': {
            skills: ['会计', '艺术与工艺', '闪避', '聆听', '魅惑', '话术', '心理学'],
            creditRange: [9, 20], skillFormula: '教育×2+外貌或敏捷×2', pointKey: 'edu2_app_or_dex2'
        },
        '职员': {
            skills: ['会计', '语言（母语）', '法律', '图书馆使用', '聆听', '话术'],
            customSlots: [{ count: 2, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 20], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '狂热者': {
            skills: ['历史', '魅惑', '恐吓', '心理学', '潜行'],
            customSlots: [{ count: 3, desc: '任意其他个人或时代特长' }],
            creditRange: [0, 30], skillFormula: '教育×2+外貌或意志×2', pointKey: 'edu2_app_or_pow2'
        },
        '大使': {
            skills: ['魅惑', '历史', '恐吓', '话术', '聆听', '语言（母语）', '说服', '心理学'],
            creditRange: [50, 90], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '超心理学家': {
            skills: ['人类学', '艺术与工艺', '历史', '图书馆使用', '神秘学', '语言（外语）', '心理学'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 30], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '旅行家': {
            skills: ['火器（手枪）', '急救', '聆听', '自然学', '导航', '侦查', '生存', '追踪'],
            creditRange: [5, 20], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '心理咨询师': {
            skills: ['艺术与工艺', '话术', '恐吓', '法律', '语言（外语）', '心理学', '精神分析'],
            customSlots: [{ count: 2, desc: '任意其他学术、个人或时代特长' }],
            creditRange: [30, 50], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '密医': {
            skills: ['医学', '急救', '会计', '话术', '法律', '科学', '语言（外语）'],
            creditRange: [10, 70], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '佣兵': {
            skills: ['攀爬', '闪避', '斗殴', '火器（步枪/霰弹枪）', '潜行', '生存', '急救', '机械维修'],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '占卜师': {
            skills: ['艺术与工艺', '历史', '图书馆使用', '魅惑', '话术', '神秘学', '心理学'],
            creditRange: [9, 30], skillFormula: '教育×2+外貌或意志×2', pointKey: 'edu2_app_or_pow2'
        },
        '厨师': {
            skills: ['艺术与工艺', '科学', '斗殴', '自然学', '侦查', '语言（外语）'],
            customSlots: [{ count: 1, desc: '任意其他个人或时代特长' }],
            creditRange: [9, 30], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '交际花': {
            skills: ['艺术与工艺', '估价', '潜行', '魅惑', '急救', '语言（外语）', '心理学', '骑术'],
            creditRange: [9, 30], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '贵族': {
            skills: ['语言（外语）', '法律', '话术', '骑术', '火器（步枪/霰弹枪）'],
            customSlots: [{ count: 3, desc: '任意其他个人或时代特长' }],
            creditRange: [70, 99], skillFormula: '教育×2+外貌×2', pointKey: 'edu2_app2'
        },
        '咨询侦探': {
            skills: ['人类学', '估价', '科学', '急救', '历史', '法律', '图书馆使用', '聆听', '心理学', '语言（外语）', '侦查', '追踪'],
            creditRange: [10, 60], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '退役军官': {
            skills: ['潜行', '急救', '火器（手枪）', '导航', '语言（外语）', '话术', '心理学', '骑术'],
            creditRange: [40, 75], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '店老板': {
            skills: ['会计', '魅惑', '话术', '电器维修', '聆听', '机械维修', '心理学', '侦查'],
            creditRange: [20, 40], skillFormula: '教育×2+外貌或敏捷×2', pointKey: 'edu2_app_or_dex2'
        },
        '渔夫': {
            skills: ['机械维修', '操作重型机械', '游泳', '驾驶（船）', '科学', '导航', '自然学', '侦查'],
            creditRange: [9, 30], skillFormula: '教育×2+力量或敏捷×2', pointKey: 'edu2_str_or_dex2'
        },
        '马戏团表演者': {
            skills: ['攀爬', '闪避', '跳跃', '投掷', '侦查', '游泳', '艺术与工艺'],
            creditRange: [9, 20], skillFormula: '教育×2+敏捷×2', pointKey: 'edu2_dex2'
        },
        '证券经纪人': {
            skills: ['会计', '估价', '语言（母语）', '魅惑', '话术', '恐吓', '心理学'],
            creditRange: [60, 90], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '小企业家': {
            skills: ['会计', '魅惑', '话术', '恐吓', '心理学'],
            customSlots: [{ count: 3, desc: '任意其他个人或时代特长' }],
            creditRange: [50, 70], skillFormula: '教育×4', pointKey: 'edu4'
        },
        '自选职业': {
            skills: [],
            customSlots: [{ count: 8, desc: '任意技能' }],
            creditRange: [0, 99], skillFormula: '教育×4', pointKey: 'edu4',
            isCustom: true
        }
    },

    DIFFICULTY_MULTIPLIERS: {
        normal: 1,
        hard: 0.5,
        extreme: 0.2
    },

    CHECK_DIFFICULTY: {
        routine: { name: '日常', multiplier: 1, desc: '无压力下的日常行为，通常不需要检定', autoSuccess: true },
        normal: { name: '普通', multiplier: 1, desc: '标准难度，目标值不变', autoSuccess: false },
        hard: { name: '困难', multiplier: 0.5, desc: '目标值减半，如时间紧迫、条件恶劣', autoSuccess: false },
        extreme: { name: '极难', multiplier: 0.2, desc: '目标值×0.2，如极限操作、几乎不可能', autoSuccess: false },
        critical: { name: '临界', multiplier: 0.1, desc: '目标值×0.1，如生死一线、奇迹般的操作', autoSuccess: false },
        '日常': { name: '日常', multiplier: 1, desc: '无压力下的日常行为，通常不需要检定', autoSuccess: true },
        '普通': { name: '普通', multiplier: 1, desc: '标准难度，目标值不变', autoSuccess: false },
        '困难': { name: '困难', multiplier: 0.5, desc: '目标值减半，如时间紧迫、条件恶劣', autoSuccess: false },
        '极难': { name: '极难', multiplier: 0.2, desc: '目标值×0.2，如极限操作、几乎不可能', autoSuccess: false },
        '临界': { name: '临界', multiplier: 0.1, desc: '目标值×0.1，如生死一线、奇迹般的操作', autoSuccess: false }
    },

    ADVANTAGE_STATES: {
        none: { bonusDice: 0, penaltyDice: 0, desc: '无特殊状态' },
        advantage: { bonusDice: 1, penaltyDice: 0, desc: '优势：获得1个奖励骰（取较好结果）' },
        disadvantage: { bonusDice: 0, penaltyDice: 1, desc: '劣势：获得1个惩罚骰（取较差结果）' },
        great_advantage: { bonusDice: 2, penaltyDice: 0, desc: '大优势：获得2个奖励骰' },
        great_disadvantage: { bonusDice: 0, penaltyDice: 2, desc: '大劣势：获得2个惩罚骰' }
    },

    ADVANTAGE_TRIGGERS: {
        advantage: [
            '拥有专业工具且状态良好',
            '目标处于无防备状态',
            '队友提供协助（协助者技能≥50%时）',
            '拥有相关专业知识或已获得充分情报',
            '环境条件有利（充足光线、安静场所等）'
        ],
        disadvantage: [
            '工具损坏或缺乏专业工具',
            '目标处于高度戒备状态',
            '环境恶劣（黑暗、暴雨、噪音等）',
            '角色受伤（HP≤一半时）',
            '时间极度紧迫',
            '角色精神不稳定（SAN≤30时）'
        ]
    },

    CRITICAL_EFFECTS: {
        combat: {
            critical: { damageMultiplier: 2, desc: '大成功：伤害翻倍，可选择特殊效果（击倒、缴械、击退等）' },
            fumble: { selfDamage: '1', desc: '大失败：武器脱手/损坏，或对自己造成1点伤害，敌人获得额外行动机会' }
        },
        skill: {
            critical: { desc: '大成功：获得额外信息或额外行动机会，结果超出预期' },
            fumble: { desc: '大失败：产生严重负面后果，可能造成物品损坏、关系恶化或暴露行踪' }
        },
        social: {
            critical: { desc: '大成功：对方完全信任/配合，主动提供额外信息或帮助' },
            fumble: { desc: '大失败：对方产生敌意，关系降级，可能报警或攻击' }
        },
        investigation: {
            critical: { desc: '大成功：发现隐藏线索+额外关联信息，可能触发灵感' },
            fumble: { desc: '大失败：破坏现场证据，触发陷阱，或得出错误结论' }
        },
        san: {
            critical: { desc: '大成功：SAN损失为0，获得对该恐怖源的永久抗性+1' },
            fumble: { desc: '大失败：SAN损失翻倍，自动触发不定疯狂' }
        }
    },

    CONFLICT_PRIORITY: [
        { rule: '大成功/大失败优先', desc: '01-05永远大成功，96-100（视技能值）永远大失败，不受难度调整影响' },
        { rule: '难度等级优先于优势/劣势', desc: '先确定难度等级调整目标值，再应用奖励骰/惩罚骰' },
        { rule: '奖励骰与惩罚骰抵消', desc: '1个奖励骰+1个惩罚骰=无修正，2个奖励+1个惩罚=1个奖励' },
        { rule: '强制检定优先于免检', desc: '战斗中的攻击/闪避必须检定，即使有优势也不自动成功' },
        { rule: '叙事逻辑优先于机制', desc: '当规则冲突时，选择最符合叙事逻辑的结果' }
    ],

    GAME_DIFFICULTY: {
        investigator: {
            name: '调查员',
            description: '标准COC体验',
            sanMultiplier: 1.0,
            checkBonus: 0,
            horrorFrequency: 1.0,
            companionMorale: 1.0,
            luckReroll: false,
            autoStabilize: false
        },
        survivor: {
            name: '幸存者',
            description: '更宽容的体验',
            sanMultiplier: 0.7,
            checkBonus: 10,
            horrorFrequency: 0.7,
            companionMorale: 1.3,
            luckReroll: true,
            autoStabilize: true
        },
        nightmare: {
            name: '噩梦',
            description: '真正的恐怖',
            sanMultiplier: 1.3,
            checkBonus: -10,
            horrorFrequency: 1.5,
            companionMorale: 0.7,
            luckReroll: false,
            autoStabilize: false
        }
    },

    getDifficultyConfig(difficultyKey) {
        return this.GAME_DIFFICULTY[difficultyKey] || this.GAME_DIFFICULTY.investigator;
    },

    performCheckWithDifficulty(targetValue, skillName, difficultyKey, bonusDice, penaltyDice) {
        const config = this.getDifficultyConfig(difficultyKey);
        const adjustedTarget = Math.max(1, targetValue + config.checkBonus);
        const check = this.performCheck(adjustedTarget, skillName, bonusDice, penaltyDice);
        check.difficultyBonus = config.checkBonus;
        check.originalTarget = targetValue;
        return check;
    },

    init() {},

    rollSingleAttribute(attrKey) {
        const attr = this.ATTRIBUTES[attrKey];
        const { n, sides, mod } = attr.formula;
        const result = Utils.rollNDice(n, sides);
        return (result.total + mod) * 5;
    },

    generateAttributesMethod1() {
        const sets = [];
        for (let s = 0; s < 5; s++) {
            const set = {};
            for (const key of Object.keys(this.ATTRIBUTES)) {
                set[key] = this.rollSingleAttribute(key);
            }
            set.luck = Utils.rollNDice(3, 6).total * 5;
            sets.push(set);
        }
        return sets;
    },

    generateAttributesMethod2() {
        const set = {};
        for (const key of Object.keys(this.ATTRIBUTES)) {
            set[key] = this.rollSingleAttribute(key);
        }
        set.luck = Utils.rollNDice(3, 6).total * 5;
        return set;
    },

    generateAttributesMethod3() {
        const totalBudget = 460;
        const attrKeys = Object.keys(this.ATTRIBUTES);
        const mins = {};
        for (const key of attrKeys) {
            mins[key] = this.ATTRIBUTES[key].min;
        }
        const minTotal = Object.values(mins).reduce((a, b) => a + b, 0);
        const remaining = totalBudget - minTotal;
        const set = { ...mins };
        let pool = remaining;
        while (pool >= 5) {
            const key = attrKeys[Math.floor(Math.random() * attrKeys.length)];
            if (set[key] <= 85) {
                set[key] += 5;
                pool -= 5;
            } else {
                let allocated = false;
                for (const k of attrKeys) {
                    if (set[k] <= 85) {
                        set[k] += 5;
                        pool -= 5;
                        allocated = true;
                        break;
                    }
                }
                if (!allocated) break;
            }
        }
        set.luck = Utils.rollNDice(3, 6).total * 5;
        return set;
    },

    generateAttributesMethod4() {
        const set = {};
        for (const key of Object.keys(this.ATTRIBUTES)) {
            set[key] = this.ATTRIBUTES[key].min;
        }
        set.luck = Utils.rollNDice(3, 6).total * 5;
        return set;
    },

    generateAttributesMethod5() {
        const set = {};
        for (const key of Object.keys(this.ATTRIBUTES)) {
            set[key] = this.rollSingleAttribute(key);
        }
        set.luck = Utils.rollNDice(3, 6).total * 5;
        return set;
    },

    getAttributeTotal(attrs) {
        let total = 0;
        for (const key of Object.keys(this.ATTRIBUTES)) {
            total += attrs[key] || 0;
        }
        return total;
    },

    validateManualAttributes(attrs) {
        const errors = [];
        for (const key of Object.keys(this.ATTRIBUTES)) {
            const val = attrs[key];
            const attr = this.ATTRIBUTES[key];
            if (isNaN(val) || val === undefined || val === null) {
                errors.push(`${attr.name}(${attr.abbr})未填写`);
            } else if (val % 5 !== 0) {
                errors.push(`${attr.name}(${attr.abbr})=${val}，必须为5的倍数`);
            } else if (val < attr.min) {
                errors.push(`${attr.name}(${attr.abbr})=${val}，最低${attr.min}`);
            } else if (val > attr.max) {
                errors.push(`${attr.name}(${attr.abbr})=${val}，最高${attr.max}`);
            }
        }
        return errors;
    },

    validatePointBuy(attrs, budget = 460) {
        const total = this.getAttributeTotal(attrs);
        const errors = [];
        if (total > budget) {
            errors.push(`总点数${total}超出预算${budget}，超出${total - budget}点`);
        }
        for (const key of Object.keys(this.ATTRIBUTES)) {
            const val = attrs[key];
            if (val % 5 !== 0) {
                errors.push(`${this.ATTRIBUTES[key].name}必须为5的倍数`);
            }
            if (val < this.ATTRIBUTES[key].min) {
                errors.push(`${this.ATTRIBUTES[key].name}低于最低值`);
            }
            if (val > 90) {
                errors.push(`${this.ATTRIBUTES[key].name}超过90上限`);
            }
        }
        return errors;
    },

    calculateDerivedValues(attrs, cthulhuMythos) {
        const toNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };

        const con = toNum(attrs.con);
        const siz = toNum(attrs.siz);
        const pow = toNum(attrs.pow);
        const str = toNum(attrs.str);
        const dex = toNum(attrs.dex);

        const hp = Math.floor((con + siz) / 10);
        const mp = Math.floor(pow / 5);
        const san = pow;
        var cm = cthulhuMythos || 0;
        const sanMax = 99 - cm;

        const strSiz = str + siz;
        let db, build;
        if (strSiz <= 64) { db = -2; build = -2; }
        else if (strSiz <= 84) { db = -1; build = -1; }
        else if (strSiz <= 124) { db = 0; build = 0; }
        else if (strSiz <= 164) { db = '1D4'; build = 1; }
        else if (strSiz <= 204) { db = '1D6'; build = 2; }
        else if (strSiz <= 284) { db = '2D6'; build = 3; }
        else if (strSiz <= 364) { db = '3D6'; build = 4; }
        else if (strSiz <= 444) { db = '4D6'; build = 5; }
        else if (strSiz <= 524) { db = '5D6'; build = 6; }
        else { const extra = Math.floor((strSiz - 524) / 80) + 6; db = `${extra - 1}D6`; build = extra; }

        let mov;
        if (str < siz && dex < siz) mov = 7;
        else if (str > siz && dex > siz) mov = 9;
        else mov = 8;

        const age = toNum(attrs.age);
        if (age >= 80) mov -= 5;
        else if (age >= 70) mov -= 4;
        else if (age >= 60) mov -= 3;
        else if (age >= 50) mov -= 2;
        else if (age >= 40) mov -= 1;
        mov = Math.max(1, mov);

        return { hp, hpMax: hp, mp, mpMax: mp, san, sanMax, db, build, mov };
    },

    getSkillBaseValue(skillName, attrs) {
        if (skillName === '闪避') return Math.floor(attrs.dex / 2);
        if (skillName === '语言（母语）') return attrs.edu;
        return this.SKILL_BASE[skillName] || 0;
    },

    getSkillValue(character, skillName) {
        if (!character || !character.skills) return null;
        const val = character.skills[skillName];
        if (val !== undefined) return val;
        for (const key of Object.keys(character.skills)) {
            if (key.startsWith(skillName) || skillName.startsWith(key)) {
                return character.skills[key];
            }
        }

        var skillAliases = {
            '魅惑': ['外貌'],
            '话术': ['外貌', '心理学'],
            '说服': ['外貌', '心理学'],
            '恐吓': ['力量', '体型'],
            '潜行': ['敏捷'],
            '侦查': ['智力'],
            '聆听': ['智力'],
            '图书馆使用': ['教育'],
            '急救': ['体质', '教育'],
            '锁匠': ['敏捷'],
            '妙手': ['敏捷'],
            '乔装': ['外貌']
        };

        var attrNameToKey = {
            '力量': 'str', '体质': 'con', '体型': 'siz', '敏捷': 'dex',
            '外貌': 'app', '智力': 'int', '意志': 'pow', '教育': 'edu'
        };

        var aliases = skillAliases[skillName];
        if (aliases) {
            for (var ai = 0; ai < aliases.length; ai++) {
                var aliasSkill = aliases[ai];
                if (character.skills[aliasSkill] !== undefined) {
                    return character.skills[aliasSkill];
                }
                var attrKey = attrNameToKey[aliasSkill];
                if (attrKey && character[attrKey] !== undefined) {
                    return character[attrKey];
                }
            }
        }

        var baseValue = this.SKILL_BASE[skillName];
        if (baseValue !== undefined) return baseValue;

        return null;
    },

    calculateSkillPoints(attrs, occupationKey) {
        const occupation = this.OCCUPATIONS[occupationKey];
        if (!occupation) return { professionPoints: 0, hobbyPoints: 0 };

        const hobbyPoints = attrs.int * 2;
        let professionPoints = 0;
        const pk = occupation.pointKey || 'edu4';

        switch (pk) {
            case 'edu4':
                professionPoints = attrs.edu * 4;
                break;
            case 'edu2_dex2':
                professionPoints = attrs.edu * 2 + attrs.dex * 2;
                break;
            case 'edu2_str2':
                professionPoints = attrs.edu * 2 + attrs.str * 2;
                break;
            case 'edu2_app2':
                professionPoints = attrs.edu * 2 + attrs.app * 2;
                break;
            case 'edu2_pow2':
                professionPoints = attrs.edu * 2 + attrs.pow * 2;
                break;
            case 'edu2_str_or_dex2':
                professionPoints = attrs.edu * 2 + Math.max(attrs.str, attrs.dex) * 2;
                break;
            case 'edu2_app_or_dex2':
                professionPoints = attrs.edu * 2 + Math.max(attrs.app, attrs.dex) * 2;
                break;
            case 'edu2_app_or_pow2':
                professionPoints = attrs.edu * 2 + Math.max(attrs.app, attrs.pow) * 2;
                break;
            case 'edu2_dex_or_pow2':
                professionPoints = attrs.edu * 2 + Math.max(attrs.dex, attrs.pow) * 2;
                break;
            case 'edu2_dex_or_str2':
                professionPoints = attrs.edu * 2 + Math.max(attrs.dex, attrs.str) * 2;
                break;
            case 'edu2_dex_or_app2':
                professionPoints = attrs.edu * 2 + Math.max(attrs.dex, attrs.app) * 2;
                break;
            case 'edu2_app_or_dex_or_str2':
                professionPoints = attrs.edu * 2 + Math.max(attrs.app, attrs.dex, attrs.str) * 2;
                break;
            default:
                professionPoints = attrs.edu * 4;
        }

        return { professionPoints, hobbyPoints };
    },

    performCheck(targetValue, skillName = '', bonusDice = 0, penaltyDice = 0, difficulty = 'normal') {
        var netBonus = (bonusDice || 0) - (penaltyDice || 0);
        var effectiveBonus = Math.max(0, netBonus);
        var effectivePenalty = Math.max(0, -netBonus);

        const roll = Utils.rollWithBonusPenalty(effectiveBonus, effectivePenalty);

        var diffConfig = this.CHECK_DIFFICULTY[difficulty] || this.CHECK_DIFFICULTY.normal;
        var adjustedTarget = Math.max(1, Math.floor(targetValue * diffConfig.multiplier));

        let result;
        if (roll <= 5 && roll >= 1) {
            result = 'critical';
        } else if (targetValue < 50 && roll >= 96) {
            result = 'fumble';
        } else if (targetValue >= 50 && roll >= 99) {
            result = 'fumble';
        } else if (roll <= adjustedTarget) {
            result = 'success';
        } else {
            result = 'failure';
        }

        const hardTarget = Math.floor(adjustedTarget * 0.5);
        const extremeTarget = Math.floor(adjustedTarget * 0.2);

        let successLevel = 0;
        if (result === 'critical') successLevel = 4;
        else if (result === 'fumble') successLevel = -1;
        else if (roll <= extremeTarget) successLevel = 3;
        else if (roll <= hardTarget) successLevel = 2;
        else if (roll <= adjustedTarget) successLevel = 1;

        var category = 'skill';
        if (skillName === 'SAN') category = 'san';
        else if (['斗殴', '火器（手枪）', '火器（步枪/霰弹枪）', '火器（弓弩）', '闪避'].indexOf(skillName) !== -1) category = 'combat';
        else if (['话术', '说服', '恐吓', '魅惑', '心理学'].indexOf(skillName) !== -1) category = 'social';
        else if (['侦查', '聆听', '图书馆使用', '追踪'].indexOf(skillName) !== -1) category = 'investigation';

        var criticalEffect = null;
        if ((result === 'critical' || result === 'fumble') && this.CRITICAL_EFFECTS[category]) {
            criticalEffect = this.CRITICAL_EFFECTS[category][result];
        }

        return {
            roll,
            targetValue,
            adjustedTarget,
            skillName,
            result,
            successLevel,
            hardTarget,
            extremeTarget,
            bonusDice: effectiveBonus,
            penaltyDice: effectivePenalty,
            difficulty,
            category,
            criticalEffect
        };
    },

    performOpposedCheck(value1, value2, name1 = 'A', name2 = 'B') {
        const roll1 = Utils.rollD100();
        const roll2 = Utils.rollD100();

        const check1 = this.getCheckResult(roll1, value1);
        const check2 = this.getCheckResult(roll2, value2);

        let winner;
        if (check1.successLevel > check2.successLevel) winner = name1;
        else if (check2.successLevel > check1.successLevel) winner = name2;
        else if (roll1 <= value1 && roll2 > value2) winner = name1;
        else if (roll2 <= value2 && roll1 > value1) winner = name2;
        else if (roll1 < roll2) winner = name1;
        else if (roll2 < roll1) winner = name2;
        else winner = 'tie';

        return {
            [name1]: { roll: roll1, ...check1 },
            [name2]: { roll: roll2, ...check2 },
            winner
        };
    },

    getCheckResult(roll, targetValue) {
        let result, successLevel;
        if (roll <= 5 && roll >= 1) {
            result = 'critical'; successLevel = 4;
        } else if (targetValue < 50 && roll >= 96) {
            result = 'fumble'; successLevel = -1;
        } else if (targetValue >= 50 && roll >= 99) {
            result = 'fumble'; successLevel = -1;
        } else if (roll <= targetValue) {
            result = 'success';
            if (roll <= Math.floor(targetValue * 0.2)) successLevel = 3;
            else if (roll <= Math.floor(targetValue * 0.5)) successLevel = 2;
            else successLevel = 1;
        } else {
            result = 'failure'; successLevel = 0;
        }
        return { result, successLevel };
    },

    performSANCheck(currentSAN, maxSANLoss, sanLossFormula, characterINT) {
        const roll = Utils.rollD100();
        const passed = roll <= currentSAN;

        let loss;
        if (passed) {
            loss = typeof sanLossFormula === 'string' && sanLossFormula.includes('/') ?
                Utils.rollFormula(sanLossFormula.split('/')[0]).total :
                (typeof sanLossFormula === 'number' ? sanLossFormula : Utils.rollFormula(sanLossFormula).total);
        } else {
            loss = typeof sanLossFormula === 'string' && sanLossFormula.includes('/') ?
                Utils.rollFormula(sanLossFormula.split('/')[1]).total :
                (typeof sanLossFormula === 'number' ? sanLossFormula * 2 : Utils.rollFormula(sanLossFormula).total * 2);
        }

        const newSAN = Math.max(0, currentSAN - loss);
        const insanityTriggered = loss >= 5;
        var insanityType = '';

        if (insanityTriggered && characterINT) {
            var intRoll = Utils.rollD100();
            insanityType = intRoll <= characterINT ? 'brief' : 'indefinite';
        } else if (insanityTriggered) {
            insanityType = 'brief';
        }

        return {
            roll,
            passed,
            loss,
            newSAN,
            insanityTriggered,
            insanityType,
            wasINTCheck: insanityTriggered
        };
    },

    calculateDamage(weapon, db) {
        let weaponDamage;
        if (typeof weapon.damage === 'string') {
            weaponDamage = Utils.rollFormula(weapon.damage).total;
        } else {
            weaponDamage = weapon.damage;
        }

        let dbValue = 0;
        if (typeof db === 'string') {
            dbValue = Utils.rollFormula(db).total;
        } else {
            dbValue = db || 0;
        }

        if (weapon.addDB !== false) {
            return Math.max(1, weaponDamage + dbValue);
        }
        return Math.max(1, weaponDamage);
    },

    WEAPONS: {
        '徒手': { damage: '1D3', skill: '斗殴', addDB: true, range: '近战' },
        '匕首': { damage: '1D4', skill: '斗殴', addDB: true, range: '近战' },
        '警棍': { damage: '1D6', skill: '斗殴', addDB: true, range: '近战' },
        '斧头': { damage: '1D8', skill: '斗殴', addDB: true, range: '近战' },
        '.32手枪': { damage: '1D8', skill: '火器（手枪）', addDB: false, range: '15码', shots: 1 },
        '.38手枪': { damage: '1D8', skill: '火器（手枪）', addDB: false, range: '15码', shots: 1 },
        '.45手枪': { damage: '1D10+2', skill: '火器（手枪）', addDB: false, range: '15码', shots: 1 },
        '步枪': { damage: '2D6+4', skill: '火器（步枪/霰弹枪）', addDB: false, range: '110码', shots: 1 },
        '霰弹枪（近）': { damage: '4D6', skill: '火器（步枪/霰弹枪）', addDB: false, range: '10码', shots: 1 },
        '霰弹枪（远）': { damage: '2D6', skill: '火器（步枪/霰弹枪）', addDB: false, range: '50码', shots: 1 }
    },

    getCombatOrder(participants) {
        return [...participants].sort((a, b) => {
            if (b.dex !== a.dex) return b.dex - a.dex;
            return Utils.rollD100() - Utils.rollD100();
        });
    },

    applyAgeModifiers(attrs, age) {
        const modified = { ...attrs };

        // 把“合计减 total 点”自动平均分配到 keys 指定的属性上（CoC7 规则原为玩家分配，此处方案A自动平均）
        function reducePool(keys, total) {
            var i = 0, guard = 0;
            while (total > 0 && guard < 2000) {
                modified[keys[i % keys.length]] -= 1;
                total--; i++; guard++;
            }
        }

        // 教育改善检定次数
        var eduImprovementChecks = 0;
        if (age >= 70) eduImprovementChecks = 4;
        else if (age >= 60) eduImprovementChecks = 3;
        else if (age >= 50) eduImprovementChecks = 2;
        else if (age >= 40) eduImprovementChecks = 1;

        for (var i = 0; i < eduImprovementChecks; i++) {
            var roll = Utils.rollD100();
            if (roll > modified.edu) {
                var gain = Utils.rollNDice(1, 10).total;
                modified.edu = Math.min(99, modified.edu + gain);
            }
        }

        // 体力属性(STR/CON/DEX)按“合计”扣减 + APP 单独扣减（数值对齐 CoC7 官方/电子车卡）
        var phys = ['str', 'con', 'dex'];
        if (age >= 80) { reducePool(phys, 80); modified.app -= 25; }
        else if (age >= 70) { reducePool(phys, 40); modified.app -= 20; }
        else if (age >= 60) { reducePool(phys, 20); modified.app -= 15; }
        else if (age >= 50) { reducePool(phys, 10); modified.app -= 10; }
        else if (age >= 40) { reducePool(phys, 5); modified.app -= 5; }

        // 15-19 岁：STR+SIZ 合计 -5，EDU -5，幸运骰 2 次取高
        if (age < 20) {
            reducePool(['str', 'siz'], 5);
            modified.edu -= 5;
            if (modified.luck !== undefined) {
                modified.luck = Math.max(modified.luck, Utils.rollNDice(3, 6).total * 5);
            }
        }

        for (const key of Object.keys(this.ATTRIBUTES)) {
            modified[key] = Utils.clamp(modified[key], this.ATTRIBUTES[key].min, this.ATTRIBUTES[key].max);
        }
        return modified;
    },

    BRIEF_INSANITY_TABLE: [
        { range: [1, 2], name: '失忆', desc: '角色忘记自己的身份和近期事件，持续1D10轮。' },
        { range: [3, 4], name: '假性残疾', desc: '角色认为自己失明/失聪/瘫痪，持续1D10轮。' },
        { range: [5, 6], name: '暴力倾向', desc: '角色对周围一切产生暴力冲动，攻击最近的目标。' },
        { range: [7, 8], name: '偏执', desc: '角色认为所有人都在密谋对付自己，不信任任何人。' },
        { range: [9, 10], name: '重要之人执念', desc: '角色只在乎某个重要之人，必须保护或寻找对方。' },
        { range: [11, 12], name: '重要之地执念', desc: '角色必须前往某个重要之地，不顾一切赶路。' },
        { range: [13, 14], name: '恐惧症', desc: '角色对特定事物产生强烈恐惧，必须远离。' },
        { range: [15, 16], name: '狂躁', desc: '角色极度兴奋，无法安静，喋喋不休或疯狂行动。' },
        { range: [17, 18], name: '幻觉', desc: '角色看到不存在的事物，无法区分现实与幻觉。' },
        { range: [19, 20], name: '嗜睡', desc: '角色突然陷入昏睡，持续1D10轮。' }
    ],

    INDEFINITE_INSANITY_TABLE: [
        { range: [1, 2], name: '被压抑', desc: '角色拒绝承认发生了任何异常，否认一切超自然证据。' },
        { range: [3, 4], name: '否认', desc: '角色坚信一切都有合理的解释，拒绝面对真相。' },
        { range: [5, 6], name: '孤立', desc: '角色远离他人，不愿交流，自我封闭。' },
        { range: [7, 8], name: '回避', desc: '角色回避一切与事件相关的事物和地点。' },
        { range: [9, 10], name: '隐藏', desc: '角色试图隐藏所有证据，假装什么都没发生。' },
        { range: [11, 12], name: '负罪感', desc: '角色认为一切都是自己的错，不断自责。' },
        { range: [13, 14], name: '执念', desc: '角色对某个细节产生病态执念，反复研究。' },
        { range: [15, 16], name: '恐惧症', desc: '角色对特定事物产生持久恐惧，必须进行INT检定才能面对。' },
        { range: [17, 18], name: '妄想', desc: '角色产生系统性妄想，坚信某种不真实的信念。' },
        { range: [19, 20], name: '暴力倾向', desc: '角色在特定触发条件下产生暴力冲动。' }
    ],

    rollInsanity(type) {
        var table = type === 'brief' ? this.BRIEF_INSANITY_TABLE : this.INDEFINITE_INSANITY_TABLE;
        var roll = Utils.rollNDice(1, 20).total;
        for (var i = 0; i < table.length; i++) {
            if (roll >= table[i].range[0] && roll <= table[i].range[1]) {
                return { roll: roll, name: table[i].name, desc: table[i].desc, type: type };
            }
        }
        return { roll: roll, name: '未知疯狂', desc: '角色陷入某种精神异常。', type: type };
    },

    performDevelopmentChecks(skills, usedSkills) {
        var results = [];
        var skillList = usedSkills || Object.keys(skills);
        for (var i = 0; i < skillList.length; i++) {
            var skillName = skillList[i];
            var currentValue = skills[skillName];
            if (!currentValue || currentValue <= 0 || currentValue >= 99) continue;

            var roll = Utils.rollD100();
            if (roll > currentValue) {
                var gain = Utils.rollNDice(1, 10).total;
                var newValue = Math.min(99, currentValue + gain);
                results.push({
                    skill: skillName,
                    oldValue: currentValue,
                    roll: roll,
                    gain: gain,
                    newValue: newValue,
                    improved: true
                });
            } else {
                results.push({
                    skill: skillName,
                    oldValue: currentValue,
                    roll: roll,
                    gain: 0,
                    newValue: currentValue,
                    improved: false
                });
            }
        }
        return results;
    },

    castSpell(spellName, mpCost, cthulhuMythosSkill, currentMP) {
        var cost = mpCost || 1;
        if (currentMP < cost) {
            return {
                success: false,
                reason: 'mp_insufficient',
                message: '魔力不足！需要 ' + cost + ' MP，当前仅有 ' + currentMP + ' MP。'
            };
        }

        var roll = Utils.rollD100();
        var passed = roll <= cthulhuMythosSkill;
        var hardPassed = roll <= Math.floor(cthulhuMythosSkill * 0.5);

        var result = {
            spellName: spellName,
            roll: roll,
            targetValue: cthulhuMythosSkill,
            mpCost: cost,
            passed: passed,
            hardPassed: hardPassed,
            newMP: currentMP - cost,
            success: passed
        };

        if (passed) {
            var sanLoss = Math.max(1, Math.floor(cost / 2));
            result.sanLoss = sanLoss;
            result.message = '施法成功！消耗 ' + cost + ' MP，损失 ' + sanLoss + ' 点SAN。';
        } else {
            result.sanLoss = 0;
            result.message = '施法失败！消耗 ' + cost + ' MP但法术未能生效。';
        }

        return result;
    },

    validateCharacter(char) {
        const warnings = [];

        if (char.skills?.['克苏鲁神话'] > 0) {
            warnings.push('⚠ 克苏鲁神话技能 > 0：新手不宜，SAN上限将永久降低。');
        }

        if (char.skills?.['电子学'] > 1) {
            warnings.push('⚠ 电子学 > 1%：1920s时代不存在此技能，请确认时代设定。');
        }

        if (char.age && char.age < 15) {
            warnings.push('⚠ 年龄 < 15：COC调查员通常为成年人。');
        }

        if (char.age && char.age > 80) {
            warnings.push('⚠ 年龄 > 80：角色行动力将大幅受限。');
        }

        const occupation = this.OCCUPATIONS[char.occupation];
        if (occupation) {
            let profSkillCount = 0;
            for (const skill of occupation.skills) {
                if (char.skills?.[skill] > this.getSkillBaseValue(skill, char)) {
                    profSkillCount++;
                }
            }
            if (profSkillCount < 4) {
                warnings.push(`⚠ 职业技能覆盖不足：至少4项职业技能需分配点数（当前${profSkillCount}项）。`);
            }
        }

        if (char.san <= 0) {
            warnings.push('💀 SAN = 0：角色已永久疯狂，不可作为调查员。');
        }

        return warnings;
    },

    getDifficultyMultiplier(difficulty) {
        var config = this.CHECK_DIFFICULTY[difficulty];
        if (config) return config.multiplier;
        return this.DIFFICULTY_MULTIPLIERS[difficulty] || 1;
    },

    rollHiddenCheck(targetValue, skillName) {
        const check = this.performCheck(targetValue, skillName);
        check.isHidden = true;
        return check;
    },

    HIDDEN_SKILLS: ['心理学', '侦查', '潜行', '聆听', '乔装', '妙手'],

    NARRATIVE_TEMPLATES: {
        '心理学': {
            critical: '你几乎看穿了这个人的灵魂——每一个微表情、每一次呼吸的停顿都在告诉你真相。',
            success: '你觉得{target}的眼神在躲闪——但不确定是撒谎还是害怕。',
            failure: '你专注地观察{target}，但读不出特别信息。',
            fumble: '你太过专注于分析{target}的表情，反而错过了更重要的东西。'
        },
        '侦查': {
            critical: '你的目光捕捉到了常人绝不会注意的细节——一切都清晰得令人不安。',
            success: '你注意到了一些不对劲的地方，但具体是什么……还需要更仔细地看。',
            failure: '你仔细观察了四周，但没有发现什么异常。',
            fumble: '你太过专注于寻找线索，反而忽略了身后传来的声响。'
        },
        '潜行': {
            critical: '你像影子一样无声地移动，没有人会注意到你的存在。',
            success: '你小心翼翼地移动着，似乎没有引起注意。',
            failure: '你的脚步声在寂静中显得格外清晰。',
            fumble: '你踩到了什么——一声脆响在黑暗中炸开。'
        },
        '聆听': {
            critical: '你的耳朵捕捉到了极细微的声响——某种不该存在于这个世界上的声音。',
            success: '你隐约听到了什么，但无法确定来源。',
            failure: '你竖起耳朵仔细听，但只有沉默回应。',
            fumble: '你太过专注地倾听，以至于被突然响起的声音吓了一跳。'
        },
        '乔装': {
            critical: '你的伪装天衣无缝——连最亲近的人也认不出你。',
            success: '你的伪装看起来没有破绽，但需要小心不要露出马脚。',
            failure: '你的伪装有些地方不太自然，可能会引起怀疑。',
            fumble: '你的伪装出现了明显的破绽——假发歪了，或者口音露了馅。'
        },
        '妙手': {
            critical: '你的手指灵巧得不可思议——物品在你手中如同消失了一般。',
            success: '你小心翼翼地得手了，没有引起注意。',
            failure: '你的动作不够利落，差点被发现。',
            fumble: '你的手一滑——物品掉落在地，发出清脆的声响。'
        }
    },

    performHiddenCheck(character, skillName, context = '') {
        if (!this.HIDDEN_SKILLS.includes(skillName)) {
            return null;
        }

        const skillValue = this.getSkillValue(character, skillName);
        if (skillValue === null) return null;

        const check = this.rollHiddenCheck(skillValue, skillName);

        const templates = this.NARRATIVE_TEMPLATES[skillName];
        if (!templates) return check;

        let narrative = templates[check.result] || templates.failure;
        narrative = narrative.replace(/\{target\}/g, context || '对方');

        check.narrative = narrative;
        return check;
    },

    shouldTriggerHiddenCheck(playerInput) {
        const suggestions = this.suggestSkillChecks(playerInput);
        return suggestions.map(function(s) { return s.skill; });
    },

    suggestSkillChecks(playerInput) {
        const triggers = {
            '心理学': {
                pattern: /他.*撒谎|她.*撒谎|他.*说谎|她.*说谎|他.*隐瞒|她.*隐瞒|他.*隐藏|她.*隐藏|观察.*表情|分析.*心理|判断.*真假|是否.*诚实|信任.*吗|他.*骗我|她.*骗我|他.*在说|她.*在说|眼神.*闪|表情.*不自然/,
                reason: '玩家试图判断NPC是否在说谎或隐瞒信息',
                confidence: 'high',
                checkType: 'hidden'
            },
            '侦查': {
                pattern: /搜查|搜索|检查.*?(?:房间|书桌|柜子|抽屉|尸体|墙壁|地板|角落|箱子|书架|鞋印|脚印|痕迹|蜡筒|留声机|保险丝|铜线)|观察.*?(?:鞋印|脚印|痕迹|门廊|地面)|仔细看.*?(?:里面|背后|下面|之间|鞋印|脚印|痕迹)|翻找|有没有.*隐藏|有没有.*异常/,
                reason: '玩家正在搜索或检查特定区域/物品',
                confidence: 'high',
                checkType: 'context'
            },
            '潜行': {
                pattern: /潜行|偷偷摸摸|悄悄地(?:走|靠近|移动|绕开|进入|离开)|不发出声音(?:地)?(?:走|移动|靠近|进入|离开)|不被发现|悄悄溜|偷偷潜|躲起来|藏起来|躲到|藏到|隐蔽/,
                reason: '玩家试图隐蔽行动',
                confidence: 'high',
                checkType: 'hidden'
            },
            '聆听': {
                pattern: /仔细听|贴墙听|竖起耳朵|屏息.*听|聆听/,
                reason: '玩家试图聆听隐蔽的声音',
                confidence: 'high',
                checkType: 'context'
            },
            '乔装': {
                pattern: /伪装成|假装是|冒充|假扮|化装成|装作是|冒名/,
                reason: '玩家试图伪装身份',
                confidence: 'high',
                checkType: 'hidden'
            },
            '话术': {
                pattern: /撒谎|骗他|骗她|说谎|编造|忽悠|蒙骗|欺瞒|骗取/,
                reason: '玩家试图欺骗NPC',
                confidence: 'high',
                checkType: 'context'
            },
            '说服': {
                pattern: /说服|劝他|劝她|劝说|让他.*同意|让她.*同意|请求.*帮忙|恳求/,
                reason: '玩家试图说服NPC',
                confidence: 'medium',
                checkType: 'context'
            },
            '恐吓': {
                pattern: /恐吓|威胁|吓唬|警告.*否则|逼他|逼她|不(?:说|交代|配合|开门|让开|告诉|回答|照做).{0,8}就/,
                reason: '玩家试图恐吓NPC',
                confidence: 'medium',
                checkType: 'context'
            },
            '魅惑': {
                pattern: /魅惑|诱惑|勾引|迷住|吸引.*注意|施展.*魅力|魅力.*表情|魅力.*姿态|迷人.*微笑|展示.*魅力|展现.*魅力|挑逗|撩拨|放电|抛媚眼|卖弄风情|以.*魅力|用.*魅力|魅力.*搭话|魅力.*接近|魅力.*交谈|妩媚|风情万种|楚楚动人|含情脉脉/,
                reason: '玩家试图魅惑NPC',
                confidence: 'medium',
                checkType: 'context'
            },
            '妙手': {
                pattern: /偷.*?(?:钱包|东西|钥匙|文件|物品)|顺手牵羊|摸走|窃取|扒窃|偷走/,
                reason: '玩家试图偷窃',
                confidence: 'high',
                checkType: 'hidden'
            },
            '锁匠': {
                pattern: /撬锁|开锁|解锁|撬开.*锁/,
                reason: '玩家试图开锁',
                confidence: 'high',
                checkType: 'open'
            },
            '图书馆使用': {
                pattern: /查阅.*资料|查找.*文献|翻阅.*档案|搜索.*书籍|图书馆.*查/,
                reason: '玩家试图查阅资料',
                confidence: 'medium',
                checkType: 'open'
            }
        };

        const behaviorDisguisePattern = /假装在|装作在|假装去|装作去|假装找|装作找|假装看|装作看/;
        const isBehaviorDisguise = behaviorDisguisePattern.test(playerInput);
        const isIdentityDisguise = /伪装成|假装是|冒充|假扮|化装成|装作是|冒名/.test(playerInput);

        const results = [];
        for (const [skill, config] of Object.entries(triggers)) {
            if (config.pattern.test(playerInput)) {
                let confidence = config.confidence;
                let reason = config.reason;
                let shouldSuggest = true;

                if (isBehaviorDisguise && !isIdentityDisguise) {
                    if (skill === '乔装') {
                        shouldSuggest = false;
                    } else if (skill === '话术') {
                        confidence = 'low';
                        reason = '玩家假装做某事（行为伪装），可能需要话术检定来维持伪装，但KP应判断是否有NPC在观察';
                    }
                }

                if (shouldSuggest) {
                    results.push({
                        skill: skill,
                        reason: reason,
                        confidence: confidence,
                        checkType: config.checkType
                    });
                }
            }
        }

        return results;
    },

    shouldTriggerOpenCheck(playerInput) {
        var openTriggers = {
            '侦查': /搜查|搜索|检查.*?(?:房间|书桌|柜子|抽屉|尸体|墙壁|地板|角落|箱子|书架|物品|东西|鞋印|脚印|痕迹|蜡筒|留声机|保险丝|铜线)|观察.*?(?:鞋印|脚印|痕迹|门廊|地面)|仔细看.*?(?:里面|背后|下面|之间|鞋印|脚印|痕迹)|翻找|翻遍|彻底搜/,
            '聆听': /仔细听|贴墙听|竖起耳朵|屏息.*听|聆听|我要听/,
            '乔装': /伪装成|假装是|冒充|假扮|化装成|装作是|冒名/,
            '话术': /撒谎|骗他|骗她|说谎|编造|忽悠|蒙骗|欺瞒|骗取|糊弄|搪塞/,
            '说服': /说服|劝他|劝她|劝说|让他.*同意|让她.*同意|请求.*帮忙|恳求|央求|哀求/,
            '恐吓': /恐吓|威胁|吓唬|警告.*否则|逼他|逼她|不(?:说|交代|配合|开门|让开|告诉|回答|照做).{0,8}就/,
            '魅惑': /魅惑|诱惑|勾引|迷住|吸引.*注意|施展.*魅力|魅力.*表情|魅力.*姿态|迷人.*微笑|展示.*魅力|展现.*魅力|挑逗|撩拨|放电|抛媚眼|卖弄风情|以.*魅力|用.*魅力|魅力.*搭话|魅力.*接近|魅力.*交谈|妩媚|风情万种|楚楚动人|含情脉脉/,
            '妙手': /偷.*?(?:钱包|东西|钥匙|文件|物品)|顺手牵羊|摸走|窃取|扒窃|偷走/,
            '锁匠': /撬锁|开锁|解锁|撬开.*锁/
        };

        var results = [];
        for (var skill in openTriggers) {
            if (openTriggers[skill].test(playerInput)) {
                results.push(skill);
            }
        }
        return results;
    }
};
