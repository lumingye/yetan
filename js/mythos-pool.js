const MYTHOS_POOL = {
    deities: [
        '克苏鲁', '犹格·索托斯', '奈亚拉托提普', '莎布·尼古拉丝',
        '大衮', '海德拉', '阿撒托斯', '伊格', '修格斯之主',
        '黄衣之王', '诺登斯', '巴斯特', '倪克斯',
        '扎特瓜', '阿伯霍斯', '格赫罗斯', '亚弗戈蒙',
        '道罗斯', '乌鲍', '撒托古亚', '伊德雅',
        '姆希·库什', '鲁利姆·夏伊科罗斯', '贝赫尔德',
        '乌尔塔尔', '亚迪斯', '格扎兰', '伊格纳'
    ],

    creatures: [
        '深潜者', '修格斯', '食尸鬼', '米·戈', '古老者',
        '星际吸血鬼', '夜魇', '巨蠕虫', '夏塔克鸟',
        '廷达洛斯猎犬', '恐怖猎手', '无形之子', '空鬼',
        '妖鬼', '古革巨人', '伊斯之伟大种族', '飞天水螅',
        '拜亚基', '星之精', '火焰吸血鬼', '冷境生物',
        '诺弗刻', '佐斯·奥莫格', '加塔诺托亚',
        '伊格之眷族', '蛇人', '月兽', '达贡之裔'
    ],

    tomes: [
        '《死灵书》', '《无名祭祀书》', '《伊波恩之书》',
        '《格拉基启示录》', '《黄衣之王》剧本', '《拉莱耶文本》',
        '《塞拉诺断章》', '《水神克塔亚特》', '《巨噬蠕虫赞歌》',
        '《德基安之书》', '《伊欧德之书》', '《纳克特抄本》',
        '《蠕虫之秘》', '《食尸鬼教团》', '《撒托古亚的沉眠》',
        '《波纳罗蒂的手稿》', '《卡达瑟尔的天使》', '《七秘经》',
        '《鲁鲁之门》', '《远古者的遗言》'
    ],

    locations: [
        '海边渔村', '古老教堂', '废弃灯塔', '地下洞穴',
        '偏远孤岛', '精神病院', '大学图书馆', '古老墓地',
        '沼泽地', '山顶废墟', '废弃矿场', '海底遗迹',
        '维多利亚式宅邸', '火车站', '码头仓库', '丛林深处',
        '极地科考站', '沙漠古城', '地下墓穴', '废弃医院'
    ],

    cults: [
        '深星教', '黄衣之印兄弟会', '银色暮光', '克苏鲁教团',
        '大衮秘教', '黑法老兄弟会', '食尸鬼教团', '星之智慧教派',
        '古老者修会', '血潮会', '苍白真理教团', '暗潮兄弟会',
        '蛇人秘社', '伊斯传承者', '黄铜之眼', '梦之使徒'
    ],

    rituals: [
        '召唤仪式', '献祭仪式', '新月之潮', '灵魂转移',
        '梦境入侵', '时空裂隙', '死者复活', '星辰归位',
        '血月契约', '深渊低语', '永恒沉眠', '维度折叠',
        '意识融合', '古神降诞', '记忆吞噬', '虚空凝视'
    ]
};

class MythosSelector {
    constructor() {
        this.recentlyUsed = [];
        this.cooldownSize = 5;
        this.history = [];
        this.currentCombo = null;
    }

    pickFromCategory(category, count = 1) {
        const pool = MYTHOS_POOL[category];
        if (!pool) return [];

        const available = pool.filter(item => !this.recentlyUsed.includes(item));

        const source = available.length >= count ? available :
            [...available, ...pool.filter(item => this.recentlyUsed.includes(item)).slice(0, count - available.length)];

        const shuffled = [...source];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const picked = shuffled.slice(0, count);

        picked.forEach(item => {
            this.recentlyUsed.push(item);
            if (this.recentlyUsed.length > this.cooldownSize * 3) {
                this.recentlyUsed.shift();
            }
        });

        while (this.recentlyUsed.length > this.cooldownSize * 3) {
            this.recentlyUsed.shift();
        }

        this.history.push(...picked);

        return picked;
    }

    generateMythosCombo() {
        const allCategories = Object.keys(MYTHOS_POOL);
        const numCategories = 2 + Math.floor(Math.random() * 3);
        const shuffledCategories = [...allCategories].sort(() => Math.random() - 0.5);
        const selectedCategories = shuffledCategories.slice(0, numCategories);

        const combo = {};
        selectedCategories.forEach(cat => {
            combo[cat] = this.pickFromCategory(cat, 1)[0];
        });

        this.currentCombo = combo;
        return combo;
    }

    generateWithAntiRepeat() {
        this.load();

        const lastComboItems = this.history.length >= 3 ? this.history.slice(-3) : [];

        let combo;
        let attempts = 0;
        const maxAttempts = 20;

        do {
            combo = this.generateMythosCombo();
            attempts++;

            const overlap = Object.values(combo).filter(item => lastComboItems.includes(item)).length;

            if (overlap <= 1 || attempts >= maxAttempts) break;
        } while (true);

        this.save();
        return combo;
    }

    resetCooldown() {
        this.recentlyUsed = [];
        this.currentCombo = null;
    }

    getCurrentCombo() {
        return this.currentCombo;
    }

    formatComboForPrompt(combo) {
        if (!combo) return '';

        const categoryNames = {
            deities: '核心神话存在',
            creatures: '主要神话生物',
            tomes: '涉及神话典籍',
            locations: '关键地点类型',
            cults: '邪教组织',
            rituals: '事件类型'
        };

        let text = '## 本轮神话元素\n\n';
        text += '以下元素已随机抽取，作为本轮冒险的核心主题。请在叙事中自然融入这些元素，不要一次性全部暴露。\n\n';

        for (const [cat, value] of Object.entries(combo)) {
            const label = categoryNames[cat] || cat;
            text += `### ${label}\n${value}\n\n`;
        }

        text += `## 元素使用规则
1. 上述元素是冒险的核心，但应逐步揭示，而非一开始就全部出现。
2. 元素之间应产生有机联系（如邪教组织崇拜某个神祇，在某地点进行某种仪式）。
3. 禁止在开场导入中直接暴露神话存在或生物的真实面貌。
4. 如果某类元素本轮未抽取（如未抽取典籍），则不要强行加入典籍相关线索。
5. 元素的真实名称不应在NPC对话中轻易出现，应以代号、别名、传闻形式呈现。`;

        return text;
    }

    save() {
        if (typeof Utils !== 'undefined') {
            Utils.saveToStorage('mythos_selector', {
                recentlyUsed: this.recentlyUsed,
                history: this.history,
                currentCombo: this.currentCombo
            });
        }
    }

    load() {
        if (typeof Utils !== 'undefined') {
            const data = Utils.loadFromStorage('mythos_selector');
            if (data) {
                this.recentlyUsed = data.recentlyUsed || [];
                this.history = data.history || [];
                this.currentCombo = data.currentCombo || null;
            }
        }
    }
}

const MythosPool = {
    selector: null,

    init() {
        this.selector = new MythosSelector();
        this.selector.load();
    },

    generate() {
        if (!this.selector) this.init();
        return this.selector ? this.selector.generateWithAntiRepeat() : null;
    },

    getCurrentCombo() {
        if (!this.selector) this.init();
        return this.selector ? this.selector.getCurrentCombo() : null;
    },

    formatForPrompt(combo) {
        if (!this.selector) {
            this.init();
        }
        if (!this.selector) return '';
        return this.selector.formatComboForPrompt(combo || this.selector.getCurrentCombo());
    },

    reset() {
        if (!this.selector) this.init();
        if (this.selector) {
            this.selector.resetCooldown();
            this.selector.save();
        }
    }
};
