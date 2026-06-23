const CaseSystem = {
    currentCase: null,
    caseHistory: [],

    init() {
        const savedCase = Utils.loadFromStorage('scribe_current_case');
        if (savedCase) {
            this.currentCase = savedCase;
        }
    },

    CASE_DIFFICULTY: {
        amateur: { name: '业余侦探', multiplier: 0.8, hintFrequency: 0.4 },
        investigator: { name: '调查员', multiplier: 1.0, hintFrequency: 0.2 },
        unspeakable: { name: '不可名状', multiplier: 1.3, hintFrequency: 0.1 }
    },

    CASE_TEMPLATES: {
        eras: ['1920s', '维多利亚', '现代'],
        atmospheres: ['密室推理', '乡村怪谈', '都市传说', '考古探险', '深海恐怖', '学院谜案'],
        entities: ['深潜者', '米·戈', '廷达洛斯猎犬', '奈亚拉托提普', '克苏鲁眷族', '原创实体']
    },

    OCCUPATION_RECOMMENDATIONS: {
        '私家侦探': { skills: ['侦查', '心理学'], bonus: '信息搜集能力强', npcAffinity: ['记者', '警察'] },
        '记者': { skills: ['图书馆', '说服'], bonus: '人脉广泛', npcAffinity: ['私家侦探', '医生'] },
        '医生': { skills: ['急救', '医学'], bonus: '法医知识', npcAffinity: ['护士', '药剂师'] },
        '考古教授': { skills: ['考古学', '神秘学'], bonus: '符文解读', npcAffinity: ['图书管理员', '古董商'] },
        '建筑师': { skills: ['建筑学', '机械维修'], bonus: '结构直觉', npcAffinity: ['工程师', '工匠'] },
        '艺术家': { skills: ['艺术', '灵感'], bonus: '灵感敏锐', npcAffinity: ['作家', '音乐家'] },
        '神秘学家': { skills: ['神秘学', '心理学'], bonus: '超自然感知', npcAffinity: ['图书管理员', '古董商'] },
        '警察': { skills: ['侦查', '格斗'], bonus: '执法权限', npcAffinity: ['私家侦探', '记者'] }
    },

    createCase(data) {
        const caseData = {
            id: data.id || Utils.generateId(),
            meta: {
                title: data.meta?.title || '未命名案件',
                era: data.meta?.era || '1920s',
                location: data.meta?.location || '未知地点',
                difficulty: data.meta?.difficulty || 2,
                duration: data.meta?.duration || '2-3次',
                tags: data.meta?.tags || [],
                minMythos: data.meta?.minMythos || 0,
                maxMythos: data.meta?.maxMythos || 15
            },
            opening: {
                hook: data.opening?.hook || '',
                arrival: data.opening?.arrival || '',
                keyImpressions: data.opening?.keyImpressions || []
            },
            npcs: data.npcs || [],
            locations: data.locations || [],
            clues: data.clues || [],
            chekhovGuns: data.chekhovGuns || [],
            monsters: data.monsters || [],
            timeline: data.timeline || [],
            endings: data.endings || [],
            aiKpNotes: data.aiKpNotes || {}
        };

        return caseData;
    },

    loadCase(caseId) {
        const saved = Utils.loadFromStorage(`coc_case_${caseId}`);
        if (saved) {
            this.currentCase = saved;
            return saved;
        }
        return null;
    },

    saveCase() {
        if (this.currentCase) {
            Utils.saveToStorage(`coc_case_${this.currentCase.id}`, this.currentCase);
        }
    },

    validateCase(caseData) {
        const errors = [];
        const warnings = [];

        if (!caseData.meta?.title) {
            errors.push({ field: 'meta.title', message: '案件标题缺失', level: 'fatal' });
        }

        if (!caseData.opening?.hook) {
            errors.push({ field: 'opening.hook', message: '开场钩子缺失', level: 'fatal' });
        }

        if (!caseData.npcs || caseData.npcs.length === 0) {
            errors.push({ field: 'npcs', message: '至少需要一个NPC', level: 'fatal' });
        }

        if (!caseData.clues || caseData.clues.length === 0) {
            errors.push({ field: 'clues', message: '至少需要一条线索', level: 'fatal' });
        }

        if (!caseData.endings || caseData.endings.length === 0) {
            errors.push({ field: 'endings', message: '至少需要一个结局', level: 'fatal' });
        }

        if (caseData.chekhovGuns && caseData.chekhovGuns.length > 0) {
            caseData.chekhovGuns.forEach((gun, index) => {
                if (!gun.payoff) {
                    warnings.push({ field: `chekhovGuns[${index}]`, message: `契诃夫之枪"${gun.plant}"缺少回收`, level: 'warning' });
                }
            });
        }

        if (caseData.monsters && caseData.monsters.length > 0) {
            caseData.monsters.forEach((monster, index) => {
                if (monster.stats?.POW && monster.stats.POW > 25) {
                    warnings.push({ field: `monsters[${index}]`, message: `怪物"${monster.id}"POW过高，单人难以应对`, level: 'warning' });
                }
            });
        }

        return { valid: errors.length === 0, errors, warnings };
    },

    generateCaseFromTemplate(options = {}) {
        const era = options.era || this.CASE_TEMPLATES.eras[Math.floor(Math.random() * this.CASE_TEMPLATES.eras.length)];
        const atmosphere = options.atmosphere || this.CASE_TEMPLATES.atmospheres[Math.floor(Math.random() * this.CASE_TEMPLATES.atmospheres.length)];
        const entity = options.entity || this.CASE_TEMPLATES.entities[Math.floor(Math.random() * this.CASE_TEMPLATES.entities.length)];
        const difficulty = options.difficulty || 2;

        const template = {
            id: `generated_${Date.now()}`,
            meta: {
                title: `${atmosphere}之谜`,
                era: era,
                location: this.generateLocation(era),
                difficulty: difficulty,
                tags: [atmosphere, entity],
                minMythos: difficulty === 1 ? 0 : difficulty === 2 ? 5 : 15,
                maxMythos: difficulty === 1 ? 10 : difficulty === 2 ? 20 : 40
            },
            opening: {
                hook: this.generateHook(atmosphere, era),
                keyImpressions: []
            },
            npcs: this.generateNPCs(3 + Math.floor(Math.random() * 3), era),
            locations: this.generateLocations(4 + Math.floor(Math.random() * 4)),
            clues: [],
            chekhovGuns: [],
            monsters: [],
            timeline: [],
            endings: [
                { id: 'success', condition: '成功解决案件', consequences: { sanReward: '+1D6' } },
                { id: 'partial', condition: '部分成功', consequences: { sanLoss: '1D3' } },
                { id: 'failure', condition: '失败', consequences: { sanLoss: '1D6' } }
            ],
            aiKpNotes: {
                atmosphere: atmosphere,
                entity: entity,
                generatedAt: new Date().toISOString()
            }
        };

        return template;
    },

    generateLocation(era) {
        const locations = {
            '1920s': ['阿卡姆', '印斯茅斯', '金斯波特', '纽约', '波士顿'],
            '维多利亚': ['伦敦', '爱丁堡', '曼彻斯特', '利物浦'],
            '现代': ['纽约', '洛杉矶', '芝加哥', '西雅图']
        };
        const list = locations[era] || locations['1920s'];
        return list[Math.floor(Math.random() * list.length)];
    },

    generateHook(atmosphere, era) {
        const hooks = {
            '密室推理': '一封神秘的邀请函将你引向了一个不可能犯罪现场。',
            '乡村怪谈': '村民们谈论着山那边传来的奇怪声音，没人敢靠近。',
            '都市传说': '城市角落里流传着一个不该被提起的名字。',
            '考古探险': '一件出土文物带来了不该被唤醒的东西。',
            '深海恐怖': '海边小镇的渔民最近都不出海了，他们说海里有什么东西。',
            '学院谜案': '大学图书馆的禁书区最近有人影出没。'
        };
        return hooks[atmosphere] || '一个不寻常的事件引起了你的注意。';
    },

    generateNPCs(count, era) {
        const names = {
            '1920s': ['约翰·卡特', '玛格丽特·索恩', '埃德蒙·布莱克伍德', '莉莉安·韦恩', '哈罗德·克罗斯'],
            '维多利亚': ['威廉·斯特林', '伊丽莎白·格雷', '查尔斯·温特沃斯', '玛丽·安斯沃思'],
            '现代': ['迈克尔·陈', '莎拉·约翰逊', '大卫·威廉姆斯', '艾米丽·布朗']
        };
        const list = names[era] || names['1920s'];
        const npcs = [];

        for (let i = 0; i < count; i++) {
            npcs.push({
                id: `npc_${i}`,
                name: list[i % list.length],
                role: ['证人', '嫌疑人', '受害者家属', '当地居民', '专家'][i % 5],
                trust: { base: 3 + Math.floor(Math.random() * 3) },
                secrets: [],
                dialogueAnchors: []
            });
        }

        return npcs;
    },

    generateLocations(count) {
        const locationTypes = ['书房', '客厅', '地下室', '阁楼', '花园', '厨房', '卧室', '走廊'];
        const locations = [];

        for (let i = 0; i < count; i++) {
            locations.push({
                id: `loc_${i}`,
                name: locationTypes[i % locationTypes.length],
                description: '',
                clues: [],
                connections: []
            });
        }

        return locations;
    },

    getRecommendedOccupations(caseData) {
        if (!caseData) return [];

        const recommendations = [];
        const tags = caseData.meta?.tags || [];
        const npcs = caseData.npcs || [];

        for (const [occ, data] of Object.entries(this.OCCUPATION_RECOMMENDATIONS)) {
            let score = 0;
            let reasons = [];

            if (tags.includes('密室推理') && ['私家侦探', '建筑师'].includes(occ)) {
                score += 2;
                reasons.push('适合推理分析');
            }

            if (tags.includes('考古探险') && occ === '考古教授') {
                score += 3;
                reasons.push('专业知识匹配');
            }

            if (tags.includes('深海恐怖') && occ === '医生') {
                score += 1;
                reasons.push('可能遇到伤亡');
            }

            npcs.forEach(npc => {
                if (data.npcAffinity.some(aff => npc.role?.includes(aff))) {
                    score += 1;
                    reasons.push(`与${npc.name}有天然联系`);
                }
            });

            if (score > 0) {
                recommendations.push({
                    occupation: occ,
                    score: score,
                    reasons: reasons,
                    skills: data.skills,
                    bonus: data.bonus
                });
            }
        }

        return recommendations.sort((a, b) => b.score - a.score).slice(0, 4);
    },

    importCaseFromYAML(yamlContent) {
        try {
            const data = this.parseSimpleYAML(yamlContent);
            const caseData = this.createCase(data);
            const validation = this.validateCase(caseData);

            if (!validation.valid) {
                return { success: false, errors: validation.errors, warnings: validation.warnings };
            }

            return { success: true, caseData: caseData, warnings: validation.warnings };
        } catch (e) {
            return { success: false, errors: [{ message: `解析错误: ${e.message}`, level: 'fatal' }] };
        }
    },

    importCaseFromJSON(jsonContent) {
        try {
            const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
            const caseData = this.createCase(data);
            const validation = this.validateCase(caseData);

            if (!validation.valid) {
                return { success: false, errors: validation.errors, warnings: validation.warnings };
            }

            return { success: true, caseData: caseData, warnings: validation.warnings };
        } catch (e) {
            return { success: false, errors: [{ message: `JSON解析错误: ${e.message}`, level: 'fatal' }] };
        }
    },

    parseSimpleYAML(yaml) {
        const result = {};
        const lines = yaml.split('\n');
        let currentPath = [];
        let currentObj = result;

        for (const line of lines) {
            const trimmed = line.trimEnd();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const indent = line.search(/\S/);
            const keyMatch = trimmed.match(/^(\s*)([^:]+):\s*(.*)$/);

            if (keyMatch) {
                const key = keyMatch[2].trim();
                const value = keyMatch[3].trim();

                if (value === '' || value.startsWith('\n')) {
                    currentObj[key] = {};
                } else if (value.startsWith('[') && value.endsWith(']')) {
                    currentObj[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
                } else if (!isNaN(value)) {
                    currentObj[key] = Number(value);
                } else {
                    currentObj[key] = value.replace(/['"]/g, '');
                }
            }
        }

        return result;
    },

    exportCaseToJSON(caseData) {
        return JSON.stringify(caseData, null, 2);
    },

    getCaseSummary(caseData) {
        if (!caseData) return null;

        return {
            title: caseData.meta?.title,
            era: caseData.meta?.era,
            location: caseData.meta?.location,
            difficulty: caseData.meta?.difficulty,
            tags: caseData.meta?.tags,
            hook: caseData.opening?.hook,
            npcCount: caseData.npcs?.length || 0,
            clueCount: caseData.clues?.length || 0,
            endingCount: caseData.endings?.length || 0
        };
    }
};
