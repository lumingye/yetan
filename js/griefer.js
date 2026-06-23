const GrieferDetector = {
    level: 0,
    history: [],
    normalRoundCount: 0,

    VIOLENCE_KEYWORDS: ['杀', '砍', '射', '捅', '炸', '烧', '打', '揍', '折磨', '虐待', '强奸', '性侵', '下毒', '投毒', '勒死', '掐死', '溺死', '毒死'],
    DESTRUCTION_KEYWORDS: ['摧毁', '破坏', '烧毁', '炸毁', '拆', '砸'],
    META_KEYWORDS: ['跳过', '快进', '直接结局', '给我看真相'],

    NEGATION_WORDS: ['不', '没', '别', '不要', '不想', '避免', '拒绝', '不会', '不可能', '岂能'],
    QUOTATION_MARKERS: ['\u201c', '\u201d', '\u2018', '\u2019', '\u300c', '\u300d', '"', "'"],
    REPORTED_SPEECH_MARKERS: ['他说', '她说', '写道', '信上写着', '提到', '说：', '问：', '写着：', '记载'],
    QUESTION_ENDING: ['吗', '呢', '？', '?'],

    NOBLE_OCCUPATIONS: ['贵族', '贵族(继承)', '绅士', '贵妇', '富豪', '继承人', '世家子弟', '地主'],
    SERVANT_KEYWORDS: ['管家', '仆人', '佣人', '侍从', '女仆', '男仆', '侍女', '随从', '下人', '仆役'],

    OCCUPATION_BEHAVIORS: {
        '士兵': { allowedKeywords: ['杀', '射', '打', '揍', '砍', '捅'], reason: '军人的职业本能' },
        '军官': { allowedKeywords: ['杀', '射', '打', '揍', '砍', '捅'], reason: '军官的职业本能' },
        '雇佣兵': { allowedKeywords: ['杀', '射', '打', '揍', '砍', '捅', '炸', '烧'], reason: '佣兵的职业方式' },
        '警察': { allowedKeywords: ['打', '揍', '射'], reason: '执法人员的职业需求' },
        '侦探': { allowedKeywords: ['打', '揍'], reason: '侦探在必要时会使用武力' },
        '罪犯': { allowedKeywords: ['杀', '射', '打', '揍', '捅', '偷', '抢', '砸', '拆'], reason: '罪犯的行事风格' },
        '黑帮': { allowedKeywords: ['杀', '射', '打', '揍', '捅', '砸', '拆', '烧'], reason: '黑帮成员的职业行为' },
        '贵族': { allowedKeywords: ['杀', '打', '揍'], reason: '贵族可能出于荣誉决斗' },
        '猎人': { allowedKeywords: ['杀', '射', '砍'], reason: '猎人的职业本能' },
        '拳击手': { allowedKeywords: ['打', '揍'], reason: '拳击手的职业本能' },
        '演员': { allowedKeywords: ['骗', '偷'], reason: '演员擅长伪装和表演' },
        '骗子': { allowedKeywords: ['骗', '偷', '抢'], reason: '骗子的职业手段' },
        '间谍': { allowedKeywords: ['骗', '偷', '杀', '射'], reason: '间谍的职业行为' },
        '走私者': { allowedKeywords: ['偷', '抢', '骗'], reason: '走私者的职业手段' },
        '艺术家': { allowedKeywords: ['骗'], reason: '艺术家擅长伪装和表演' }
    },

    DISGUISE_CONTEXT_PATTERN: /伪装成|假装是|冒充|假扮|化装成|装作是|装成|扮演/,

    AUTHORITY_CONTEXTS: {
        noble_servant: {
            pattern: /(?:让|叫|命令|吩咐|指示|要求)(?:管家|仆人|佣人|侍从|女仆|男仆|侍女|随从|下人|仆役)/,
            actions: ['拆', '打开', '取', '拿', '搬', '整理', '收拾', '清理', '检查', '查看', '读', '念', '送', '传'],
            reason: '贵族对仆从的合理指令'
        },
        professional_duty: {
            pattern: /(?:作为|身为|以)(?:医生|律师|警察|侦探|记者|教授)/,
            actions: ['检查', '调查', '询问', '搜查', '检验', '审问', '盘问'],
            reason: '职业职责范围内的行为'
        }
    },

    init() {
        const saved = Utils.loadFromStorage('scribe_griefer');
        if (saved) {
            this.level = saved.level || 0;
            this.history = saved.history || [];
            this.normalRoundCount = saved.normalRoundCount || 0;
        }
    },

    save() {
        Utils.saveToStorage('scribe_griefer', {
            level: this.level,
            history: this.history,
            normalRoundCount: this.normalRoundCount
        });
    },

    getCharacterIdentity(char) {
        if (!char || !char.occupation) return { tier: 'common', isNoble: false };
        const occ = char.occupation;
        const isNoble = this.NOBLE_OCCUPATIONS.some(n => occ.includes(n));
        const creditRating = char.skills?.['信用评级'] || 0;

        let tier = 'common';
        if (isNoble || creditRating >= 80) tier = 'upper';
        else if (creditRating >= 50) tier = 'middle';
        else if (creditRating >= 20) tier = 'lower_middle';

        return { tier, isNoble, creditRating, occupation: occ };
    },

    isNegated(input, keyword) {
        const idx = input.indexOf(keyword);
        if (idx <= 0) return false;
        const before = input.substring(0, idx);
        const charBefore = before.charAt(before.length - 1);
        if (charBefore === '不' || charBefore === '没' || charBefore === '别') return true;
        for (const nw of this.NEGATION_WORDS) {
            if (before.endsWith(nw)) return true;
        }
        return false;
    },

    isQuotedContext(input, keyword) {
        const idx = input.indexOf(keyword);
        if (idx < 0) return false;

        const before = input.substring(0, idx);
        for (const marker of this.REPORTED_SPEECH_MARKERS) {
            const markerIdx = before.lastIndexOf(marker);
            if (markerIdx >= 0) {
                const between = before.substring(markerIdx + marker.length);
                if (between.length < 30 && !between.includes(keyword)) return true;
            }
        }

        const quoteOpen = before.match(/[\u201c\u300c"\u2018'][^]*$/);
        if (quoteOpen) return true;

        return false;
    },

    isQuestionContext(input) {
        for (const q of this.QUESTION_ENDING) {
            if (input.endsWith(q)) return true;
        }
        return /^(?:怎么|如何|为什么|能|可以|是否|有没有|什么时候)/.test(input);
    },

    hasKeywordWithContext(input, keywordList) {
        for (const kw of keywordList) {
            const idx = input.indexOf(kw);
            if (idx < 0) continue;

            if (this.isNegated(input, kw)) continue;
            if (this.isQuotedContext(input, kw)) continue;

            const isQuestion = this.isQuestionContext(input);
            if (isQuestion) {
                return { found: true, keyword: kw, weight: 0.5 };
            }

            return { found: true, keyword: kw, weight: 1 };
        }
        return { found: false };
    },

    getOccupationBehavior(char) {
        if (!char || !char.occupation) return null;
        const occ = char.occupation;
        for (const [key, data] of Object.entries(this.OCCUPATION_BEHAVIORS)) {
            if (occ.includes(key)) return data;
        }
        return null;
    },

    isOccupationReasonable(char, keyword) {
        const behavior = this.getOccupationBehavior(char);
        if (!behavior) return false;
        return behavior.allowedKeywords.some(k => keyword.includes(k) || k.includes(keyword));
    },

    hasNarrativeContext(gameState) {
        if (!gameState.story) return false;
        const recentEvents = gameState.story.triggeredEvents || [];
        if (recentEvents.length === 0) return false;
        const narrativeTriggers = ['死亡', '袭击', '背叛', '尸体', '恐怖', '尖叫', '血腥', '失踪', '诅咒', '怪物'];
        return recentEvents.slice(-3).some(e =>
            narrativeTriggers.some(t => e.includes(t))
        );
    },

    isAuthorityAction(input, char) {
        const identity = this.getCharacterIdentity(char);

        for (const [key, ctx] of Object.entries(this.AUTHORITY_CONTEXTS)) {
            if (ctx.pattern.test(input)) {
                const hasMatchingAction = ctx.actions.some(a => input.includes(a));
                if (hasMatchingAction) {
                    if (key === 'noble_servant' && (identity.isNoble || identity.creditRating >= 50)) {
                        return { isAuthority: true, reason: ctx.reason };
                    }
                    if (key === 'professional_duty') {
                        const occMatch = ctx.pattern.test(input) && input.includes(char?.occupation || '');
                        if (occMatch) return { isAuthority: true, reason: ctx.reason };
                    }
                }
            }
        }

        if (identity.isNoble || identity.tier === 'upper') {
            const servantRef = this.SERVANT_KEYWORDS.some(s => input.includes(s));
            const mildAction = /拆|打开|取|拿|搬|整理|收拾|清理|检查|查看|读|念|送|传|安排|吩咐/.test(input);
            if (servantRef && mildAction) {
                return { isAuthority: true, reason: '上流社会对下属的合理指令' };
            }
        }

        return { isAuthority: false };
    },

    evaluate(playerInput, gameState) {
        const input = playerInput.toLowerCase();
        const char = gameState.character;

        if (gameState._isQuickOption) {
            gameState._isQuickOption = false;
            return { triggered: false };
        }

        const authCheck = this.isAuthorityAction(input, char);
        if (authCheck.isAuthority) {
            return { triggered: false, authorityContext: authCheck.reason };
        }

        const isDisguiseContext = this.DISGUISE_CONTEXT_PATTERN.test(input);

        const violenceResult = this.hasKeywordWithContext(input, this.VIOLENCE_KEYWORDS);
        const destructionResult = this.hasKeywordWithContext(input, this.DESTRUCTION_KEYWORDS);
        const metaResult = this.hasKeywordWithContext(input, this.META_KEYWORDS);

        if (!violenceResult.found && !destructionResult.found && !metaResult.found) {
            this.normalRoundCount++;
            if (this.normalRoundCount >= 10) {
                this.normalRoundCount = 0;
                this.level = Math.max(0, this.level - 1);
                this.save();
            }
            return { triggered: false };
        }

        if (isDisguiseContext && !violenceResult.found && !destructionResult.found) {
            this.normalRoundCount++;
            return { triggered: false, disguiseContext: '伪装行为，不触发刁民检测' };
        }

        let suspicionScore = 0;
        let isHostileTarget = false;
        let violenceIdx = -1;

        if (violenceResult.found) {
            const isCombatContext = /正在.*战斗|战斗中|被.*攻击|被.*追|被.*围攻|怪物.*攻击|深潜者.*冲|邪教徒.*冲来|敌人.*逼近|交战中|混战中/.test(input);
            const isSelfDefense = /反击|自卫|保护|逃跑|防御|抵挡|回击/.test(input);
            violenceIdx = input.indexOf(violenceResult.keyword);
            const afterViolence = violenceIdx >= 0 ? input.substring(violenceIdx) : input;
            isHostileTarget = /怪物|深潜者|邪教徒|敌人|追击者|袭击者|凶手|恶棍|暴徒|黑帮|杀手/.test(afterViolence);
            const occupationReasonable = this.isOccupationReasonable(char, violenceResult.keyword);

            if (isCombatContext || isSelfDefense) {
                this.normalRoundCount++;
                return { triggered: false };
            }

            if (occupationReasonable) {
                suspicionScore += 1;
            } else {
                const isInnocentTarget = /平民|路人|孩子|老人|老太太|老头|老妇|幼|无辜|酒保|酒吧.*人|店员|服务员|npc|村民|市民|邻居|陌生人|女士|先生|小姐|夫人|太太|少女|少年|儿童|婴儿|孕妇|残疾人|病人|伤员|牧师|神父|修女/.test(input);
                const hasSpecificTarget = /他|她|它|那个|这个|那人|这人|对方/.test(input);
                const isMassViolence = /整条街|整栋|整个|全部|所有人|所有人|一群|全部杀|全杀|屠|屠杀|灭绝|灭口|大屠杀/.test(input);

                if (isMassViolence && char && char.san > 30) {
                    suspicionScore += 6;
                } else if (isInnocentTarget && char && char.san > 30) {
                    suspicionScore += 4;
                } else if (isHostileTarget && char && char.san > 30) {
                    suspicionScore += 1;
                } else if (isInnocentTarget && char && char.san <= 30) {
                    suspicionScore += 1;
                } else if (hasSpecificTarget && char && char.san > 30) {
                    suspicionScore += 4;
                } else if (char && char.san <= 10) {
                    suspicionScore += 0;
                } else {
                    suspicionScore += 2;
                }
            }

            suspicionScore *= violenceResult.weight;
        }

        if (destructionResult.found) {
            const isMeaningfulDestruction = /仪式|祭坛|封印|邪教/.test(input);
            const identity = this.getCharacterIdentity(char);
            const isServantDirected = this.SERVANT_KEYWORDS.some(s => input.includes(s));
            const isMildAction = /拆|打开|收拾|整理/.test(input);

            if (isServantDirected && isMildAction && (identity.isNoble || identity.creditRating >= 50)) {
                return { triggered: false, authorityContext: '贵族对仆从的合理指令' };
            }

            if (!isMeaningfulDestruction) {
                suspicionScore += 2 * destructionResult.weight;
            }
        }

        if (isDisguiseContext && violenceResult.found) {
            const afterViolence2 = violenceIdx >= 0 ? input.substring(violenceIdx) : '';
            const hostileAfterViolence = /怪物|深潜者|邪教徒|敌人|追击者|袭击者|凶手|恶棍|暴徒|黑帮|杀手/.test(afterViolence2);
            const innocentAfterViolence = /平民|路人|孩子|老人|老太太|老头|老妇|无辜|酒保|店员|服务员|村民|市民|邻居|陌生人|女士|先生|小姐|夫人|太太|少女|少年|儿童|婴儿|孕妇|牧师|神父|修女/.test(afterViolence2);
            const hostileInContext = /怪物|深潜者|邪教徒|敌人|追击者|袭击者|凶手|恶棍|暴徒|黑帮|杀手/.test(input);
            if ((hostileAfterViolence || hostileInContext) && !innocentAfterViolence) {
                suspicionScore = Math.max(0, suspicionScore - 2);
            }
        }

        if (metaResult.found) {
            const recentMeta = this.history.filter(h =>
                h.action && this.META_KEYWORDS.some(kw => h.action.includes(kw))
            ).length;
            suspicionScore += (recentMeta >= 1 ? 6 : 4);
        }

        if (char && char.san <= 30) {
            suspicionScore = Math.max(0, suspicionScore - 1);
        }

        if (char && char.san <= 10) {
            suspicionScore = Math.max(0, suspicionScore - 2);
        }

        if (this.hasNarrativeContext(gameState)) {
            suspicionScore = Math.max(0, suspicionScore - 1);
        }

        if (suspicionScore < 4) {
            this.normalRoundCount++;
            if (this.normalRoundCount >= 10) {
                this.normalRoundCount = 0;
                this.level = Math.max(0, this.level - 1);
                this.save();
            }
            return { triggered: false };
        }

        let determinedLevel;
        if (suspicionScore >= 8) {
            determinedLevel = 3;
        } else if (suspicionScore >= 6) {
            determinedLevel = 2;
        } else {
            determinedLevel = 1;
        }

        if (char && char.san <= 0) {
            return { triggered: false };
        }

        const messages = {
            1: '',
            2: '',
            3: '守秘人沉默了片刻，缓缓开口：\n\n"……你确定要这么做？在这个世界里，每一个选择都有代价。你的调查员或许正站在一个无法回头的岔路口。"\n\n【你可以继续执行这个行动，但请做好承担后果的准备。】'
        };

        this.normalRoundCount = 0;
        this.level = Math.max(this.level || 0, determinedLevel);
        this.history.push({
            action: playerInput,
            level: determinedLevel,
            suspicionScore,
            timestamp: new Date().toISOString()
        });
        this.save();

        return {
            triggered: true,
            level: determinedLevel,
            message: messages[determinedLevel] || '',
            action: playerInput,
            suspicionScore,
            softInject: determinedLevel <= 2,
            hardBlock: determinedLevel >= 3
        };
    },

    reset() {
        this.level = 0;
        this.history = [];
        this.normalRoundCount = 0;
        this.save();
    },

    decayLevel() {
        this.level = Math.max(0, this.level - 1);
        this.save();
    },

    resetOnNewChapter() {
        this.level = 0;
        this.history = [];
        this.normalRoundCount = 0;
        this.save();
    }
};
