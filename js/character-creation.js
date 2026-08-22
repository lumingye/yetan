const CC_APP_VERSION = 'v2.0';

const CharacterCreation = {
    currentStep: 0,
    totalSteps: 6,
    characterData: {},
    attrSets: [],

    NATIONALITIES: [
        { name: '中国', code: 'CN', language: '中文', era: '1920s' },
        { name: '美国', code: 'US', language: '英语', era: '1920s' },
        { name: '英国', code: 'GB', language: '英语', era: '1920s' },
        { name: '法国', code: 'FR', language: '法语', era: '1920s' },
        { name: '德国', code: 'DE', language: '德语', era: '1920s' },
        { name: '日本', code: 'JP', language: '日语', era: '1920s' },
        { name: '俄罗斯', code: 'RU', language: '俄语', era: '1920s' },
        { name: '意大利', code: 'IT', language: '意大利语', era: '1920s' },
        { name: '西班牙', code: 'ES', language: '西班牙语', era: '1920s' },
        { name: '印度', code: 'IN', language: '印地语', era: '1920s' },
        { name: '埃及', code: 'EG', language: '阿拉伯语', era: '1920s' },
        { name: '巴西', code: 'BR', language: '葡萄牙语', era: '1920s' },
        { name: '墨西哥', code: 'MX', language: '西班牙语', era: '1920s' },
        { name: '其他', code: 'XX', language: '其他', era: '1920s' }
    ],
    selectedAttrSet: null,
    selectedMethod: 'destiny',
    attrPointBudget: 460,
    manualAttrs: null,
    pointBuyAttrs: null,
    selectedOccupation: null,
    skillAllocations: {},
    profPointsRemaining: 0,
    hobbyPointsRemaining: 0,
    totalProfPoints: 0,
    totalHobbyPoints: 0,
    rollIndex: 0,
    rollResults: null,
    hasRolledThisAttr: false,
    destinyRolled: false,
    rollAttrAttempts: {},
    randomRollAttempts: 0,
    maxRollAttemptsPerAttr: 3,
    maxRandomRollAttempts: 3,
    formalMode: true,
    occFilterAttr: '',
    occSearchText: '',
    cachedLuck: null,
    customSlotSelections: {},
    customOccFormula: null,
    specifiedForeignLang: null,

    isSkillProfession(skillName, occSkills) {
        for (var i = 0; i < occSkills.length; i++) {
            var s = occSkills[i];
            if (skillName === s) return true;
            if (skillName.includes(s) || s.includes(skillName)) return true;
            if (s === '语言（外语）') {
                if (skillName === '语言（外语）') return true;
                if (this.specifiedForeignLang && skillName === this.specifiedForeignLang) return true;
            }
        }
        var customSlots = (COCRules.OCCUPATIONS[this.selectedOccupation] || {}).customSlots || [];
        var totalCustom = 0;
        customSlots.forEach(function(cs) { totalCustom += cs.count; });
        if (totalCustom > 0 && this.customSlotSelections) {
            for (var key in this.customSlotSelections) {
                if (this.customSlotSelections[key] === skillName) return true;
            }
        }
        return false;
    },

    stepNames: ['属性生成', '职业选择', '技能分配', '衍生值确认', '背景填写', '完成创建'],

    saveCurrentStepData() {
        if (this.currentStep === 4) {
            var nameEl = document.getElementById('char-name');
            var ageEl = document.getElementById('char-age');
            var genderEl = document.getElementById('char-gender');
            var nationalityEl = document.getElementById('char-nationality');
            var residenceEl = document.getElementById('char-residence');
            var appearanceEl = document.getElementById('char-appearance');
            var personalityEl = document.getElementById('char-personality');
            var belongingsEl = document.getElementById('char-belongings');
            var backgroundEl = document.getElementById('char-background');
            var cherishedEl = document.getElementById('char-cherished');
            var connectionsEl = document.getElementById('char-connections');
            var fearsEl = document.getElementById('char-fears');
            var modeEl = document.getElementById('char-creation-mode');
            if (nameEl) this.characterData.name = nameEl.value.trim();
            if (ageEl) this.characterData.age = parseInt(ageEl.value) || 25;
            if (genderEl) this.characterData.gender = genderEl.value;
            if (nationalityEl) this.characterData.nationality = nationalityEl.value;
            if (residenceEl) this.characterData.residence = residenceEl.value.trim();
            if (appearanceEl) this.characterData.appearance = appearanceEl.value.trim();
            if (personalityEl) this.characterData.personality = personalityEl.value.trim();
            if (belongingsEl) this.characterData.belongings = belongingsEl.value.trim();
            if (backgroundEl) this.characterData.background = backgroundEl.value.trim();
            if (cherishedEl) this.characterData.cherished = cherishedEl.value.trim();
            if (connectionsEl) this.characterData.connections = connectionsEl.value.trim();
            if (fearsEl) this.characterData.fears = fearsEl.value.trim();
            if (modeEl) this.characterData.creationMode = modeEl.value;
        }
    },

    open() {
        this.currentStep = 0;
        this.characterData = {};
        this.selectedAttrSet = null;
        this.selectedMethod = 'destiny';
        this.selectedOccupation = null;
        this.skillAllocations = {};
        this.profPointsRemaining = 0;
        this.hobbyPointsRemaining = 0;
        this.totalProfPoints = 0;
        this.totalHobbyPoints = 0;
        this.rollIndex = 0;
        this.rollResults = null;
        this.hasRolledThisAttr = false;
        this.destinyRolled = false;
        this.rollAttrAttempts = {};
        this.randomRollAttempts = 0;
        this.manualAttrs = null;
        this.pointBuyAttrs = null;
        this.attrSets = [];
        this.attrAdjustments = {};
        this.occFilterAttr = '';
        this.occSearchText = '';
        this.cachedLuck = null;
        this.customSlotSelections = {};
        this.customOccFormula = null;
        this.specifiedForeignLang = null;

        const overlay = document.getElementById('character-creation-overlay');
        overlay.classList.add('active');
        this.renderStep();
    },

    close() {
        document.getElementById('character-creation-overlay').classList.remove('active');
    },

    // 车卡外壳：设计稿的 .page / .topbar / .canvas / .footline。
    // 六步进度用 .tb-dots 的菱形序列表示（实心=已完成，描边=未到）。
    renderStep() {
        const container = document.getElementById('creation-container');
        const step = this.currentStep;

        const dots = this.stepNames.map((name, i) => {
            const cls = i < step ? 'done' : i === step ? 'now' : 'hollow';
            return `<i class="${cls}" title="${name}"></i>`;
        }).join('');

        let html = `<div class="bgfx" aria-hidden="true"></div>
            <div class="paperfx" aria-hidden="true"></div>
            <div class="grain" aria-hidden="true"></div>
            <div class="page">
            <header class="topbar">
                <button type="button" class="tb-back" id="btn-close-creation">‹ 退出车卡</button>
                <div class="tb-mid">
                    <div class="tb-dots">${dots}</div>
                    <div class="tb-app">Investigator Record</div>
                </div>
                <div class="tb-right"><span class="tb-step">Step ${String(step + 1).padStart(2, '0')} / ${String(this.totalSteps).padStart(2, '0')}</span></div>
            </header>
            <div class="canvas">`;

        if (step === this.totalSteps - 1) {
            // 第六步是三栏档案，自带版心，不套 .sheet
            html += this.renderCompleteStep();
        } else {
            html += `<section class="sheet ornframe">
                <span class="oc tl"></span><span class="oc tr"></span>
                <span class="oc bl"></span><span class="oc br"></span>
                <div class="sh-head">
                    <div class="sh-kicker">${this.stepNames[step]}</div>
                </div>
                <div class="sh-crest" aria-hidden="true"></div>`;
            switch (step) {
                case 0: html += this.renderAttrStep(); break;
                case 1: html += this.renderOccupationStep(); break;
                case 2: html += this.renderSkillStep(); break;
                case 3: html += this.renderDerivedStep(); break;
                case 4: html += this.renderBackgroundStep(); break;
            }
            html += this.renderNavigation();
            html += `</section>`;
        }

        html += `</div>
            <div class="footline">
                <span class="v">夜谭 ${CC_APP_VERSION}</span>
                <span class="wave" aria-hidden="true"></span>
                <span class="v">Case File · New</span>
            </div>
        </div>`;

        container.innerHTML = html;

        // 每步的标题/副标题由各自的 render 方法产出（含动态文案），
        // 这里统一提到 .sh-head，避免和外壳的标题重复。
        const head = container.querySelector('.sh-head');
        const stepEl = container.querySelector('.creation-step');
        if (head && stepEl) {
            const title = stepEl.querySelector(':scope > .cc-title');
            const sub = stepEl.querySelector(':scope > .cc-subtitle');
            if (title) { title.classList.add('sh-title'); head.appendChild(title); }
            if (sub) { sub.classList.add('sh-sub'); head.appendChild(sub); }
        }

        this.bindStepEvents();
    },

    renderAttrStep() {
        let html = `<div class="creation-step active">`;
        html += `<div class="cc-title">属性生成</div>`;
        html += `<div class="cc-subtitle">选择生成方式，决定调查员的基础能力</div>`;

        html += `<div class="cc-method-grid">`;
        const methods = [
            { key: 'destiny', name: '天命五选一', desc: '投掷5组，选一组' },
            { key: 'roll', name: '逐项投掷', desc: '每个属性单独投' },
            { key: 'pointbuy', name: '购点法(460)', desc: '460点自由分配' },
            { key: 'manual', name: '手动填写', desc: '自行输入' },
            { key: 'random', name: '一键随机', desc: '完全随机' }
        ];
        methods.forEach(m => {
            html += `<button class="cc-method-btn ${this.selectedMethod === m.key ? 'active' : ''}" data-method="${m.key}">${m.name}<small>${m.desc}</small></button>`;
        });
        html += `</div>`;

        if (this.selectedMethod === 'destiny') {
            html += this.renderDestinyMethod();
        } else if (this.selectedMethod === 'roll') {
            html += this.renderRollMethod();
        } else if (this.selectedMethod === 'pointbuy') {
            html += this.renderPointBuyMethod();
        } else if (this.selectedMethod === 'manual') {
            html += this.renderManualMethod();
        } else if (this.selectedMethod === 'random') {
            html += this.renderRandomMethod();
        }

        if (this.selectedAttrSet && typeof this.selectedAttrSet === 'object' && !Array.isArray(this.selectedAttrSet)) {
            html += this.renderAttrFineTune();
        }

        html += `</div>`;
        return html;
    },

    attrAdjustments: {},

    renderAttrFineTune() {
        if (!this.attrAdjustments || Object.keys(this.attrAdjustments).length === 0) {
            this.attrAdjustments = {};
            for (const key of Object.keys(COCRules.ATTRIBUTES)) {
                this.attrAdjustments[key] = 0;
            }
        }

        const attrs = this.selectedAttrSet;
        let totalAdjust = 0;
        for (const key of Object.keys(this.attrAdjustments)) {
            totalAdjust += this.attrAdjustments[key];
        }

        let html = `<div class="cc-finetune">
            <div class="cc-finetune-title">属性微调（混点）</div>
            <div class="cc-finetune-desc">可在±10范围内调整，总调整必须为0（守恒）</div>
            <div class="cc-finetune-balance ${totalAdjust === 0 ? 'ok' : 'bad'}">
                总调整：${totalAdjust > 0 ? '+' : ''}${totalAdjust} ${totalAdjust === 0 ? '✓ 守恒' : '✗ 不守恒'}
            </div>
            <div class="cc-finetune-grid">`;

        for (const key of Object.keys(COCRules.ATTRIBUTES)) {
            const attr = COCRules.ATTRIBUTES[key];
            const base = attrs[key];
            const adj = this.attrAdjustments[key] || 0;
            const final = base + adj;
            const adjColor = adj > 0 ? 'var(--accent-green)' : adj < 0 ? 'var(--accent-red)' : 'var(--text-dim)';

            html += `<div class="cc-finetune-cell">
                <div class="cc-attr-abbr">${attr.abbr}</div>
                <div class="cc-attr-val" style="color:${adjColor}">${final}</div>
                <div class="cc-finetune-adj">
                    <button class="cc-finetune-btn dec" data-attr="${key}">−</button>
                    <span style="font-size:10px;color:${adjColor};min-width:24px;">${adj > 0 ? '+' : ''}${adj}</span>
                    <button class="cc-finetune-btn inc" data-attr="${key}">+</button>
                </div>
            </div>`;
        }

        html += `</div></div>`;
        return html;
    },

    adjustAttrFine(attrKey, delta) {
        if (!this.attrAdjustments) this.attrAdjustments = {};
        if (this.attrAdjustments[attrKey] === undefined) this.attrAdjustments[attrKey] = 0;

        const newVal = this.attrAdjustments[attrKey] + delta;
        if (newVal < -10 || newVal > 10) return;

        const baseVal = this.getBaseAttrsWithoutAdjustments()[attrKey];
        if (baseVal + newVal < COCRules.ATTRIBUTES[attrKey].min) return;
        if (baseVal + newVal > COCRules.ATTRIBUTES[attrKey].max) return;

        this.attrAdjustments[attrKey] = newVal;
        this.renderStep();
    },

    applyAttrAdjustments() {
        if (!this.selectedAttrSet || !this.attrAdjustments) return true;

        let totalAdjust = 0;
        for (const key of Object.keys(this.attrAdjustments)) {
            totalAdjust += this.attrAdjustments[key];
        }

        if (totalAdjust !== 0) {
            return false;
        }

        if (typeof this.selectedAttrSet === 'number') {
            const set = this.attrSets[this.selectedAttrSet];
            if (!set) return false;
            this.selectedAttrSet = { ...set };
        } else if (typeof this.selectedAttrSet === 'object') {
            this.selectedAttrSet = { ...this.selectedAttrSet };
        }

        for (const key of Object.keys(this.attrAdjustments)) {
            this.selectedAttrSet[key] = (this.selectedAttrSet[key] || 0) + (this.attrAdjustments[key] || 0);
        }
        this.attrAdjustments = {};

        return true;
    },

    getRollAttrAttempts(attrKey) {
        return this.rollAttrAttempts[attrKey] || 0;
    },

    canRollCurrentAttribute(attrKey) {
        return this.getRollAttrAttempts(attrKey) < this.maxRollAttemptsPerAttr;
    },

    recordCurrentAttributeRoll(attrKey) {
        if (!this.canRollCurrentAttribute(attrKey)) return false;
        this.rollAttrAttempts[attrKey] = this.getRollAttrAttempts(attrKey) + 1;
        return true;
    },

    canRandomRoll() {
        return this.randomRollAttempts < this.maxRandomRollAttempts;
    },

    recordRandomRoll() {
        if (!this.canRandomRoll()) return false;
        this.randomRollAttempts++;
        return true;
    },

    getRandomRollsRemaining() {
        return Math.max(0, this.maxRandomRollAttempts - this.randomRollAttempts);
    },

    renderDestinyMethod() {
        const hasRolled = this.attrSets.length > 0;
        const disabled = this.destinyRolled || hasRolled;
        let html = `<button class="nav-btn primary" id="btn-roll-destiny" style="margin-bottom:8px;" ${disabled ? 'disabled title="天命五选一只允许投掷一次"' : ''}>🎲 投掷五组属性</button>`;
        html += `<div style="font-size:11px;color:#555570;margin-bottom:16px;">天命五选一只允许投掷一次。</div>`;

        if (this.attrSets.length > 0) {
            html += `<div class="cc-subtitle">点击选择一组属性</div>`;
            this.attrSets.forEach((set, idx) => {
                const isSelected = this.selectedAttrSet === idx;
                html += `<div class="cc-attr-row ${isSelected ? 'selected' : ''}" data-set-idx="${idx}">`;
                for (const key of Object.keys(COCRules.ATTRIBUTES)) {
                    const attr = COCRules.ATTRIBUTES[key];
                    html += `<div class="cc-attr-cell"><div class="cc-attr-abbr">${attr.abbr}</div><div class="cc-attr-num">${set[key]}</div></div>`;
                }
                html += `<div class="cc-attr-cell"><div class="cc-attr-abbr">幸运</div><div class="cc-attr-num">${set.luck}</div></div>`;
                html += `</div>`;
            });
        }

        return html;
    },

    renderRollMethod() {
        const attrKeys = Object.keys(COCRules.ATTRIBUTES);
        if (!this.rollResults) {
            this.rollResults = {};
            this.rollIndex = 0;
            attrKeys.forEach(k => { this.rollResults[k] = null; });
        }

        let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <p style="font-size:13px;color:#8888a0;margin:0;">逐项投掷：点击按钮依次掷出每个属性</p>
            <label style="font-size:11px;color:#555570;cursor:pointer;">
                <input type="checkbox" id="chk-formal-mode" ${this.formalMode ? 'checked' : ''} style="margin-right:4px;">正式模式（不可重骰）
            </label>
        </div>`;

        html += `<div class="attr-set" style="cursor:default;grid-template-columns:repeat(4,1fr);gap:10px;">`;
        attrKeys.forEach((key, idx) => {
            const attr = COCRules.ATTRIBUTES[key];
            const val = this.rollResults[key];
            const isCurrent = idx === this.rollIndex && val === null;
            const style = isCurrent ? 'color:#ffaa00;font-weight:700;' : (val !== null ? 'color:#00ff88;' : 'color:#555570;');
            html += `<div class="attr-cell" style="padding:8px;">
                <div class="attr-abbr" style="${style}">${attr.abbr}</div>
                <div class="attr-num" style="${style}">${val !== null ? val : (isCurrent ? '?' : '—')}</div>
            </div>`;
        });
        html += `</div>`;

        if (this.rollIndex < attrKeys.length) {
            const currentKey = attrKeys[this.rollIndex];
            const currentAttr = COCRules.ATTRIBUTES[currentKey];
            const attempts = this.getRollAttrAttempts(currentKey);
            const canRoll = this.canRollCurrentAttribute(currentKey);
            const hasValue = this.rollResults[currentKey] !== null;
            html += `<div style="text-align:center;margin-top:12px;">
                <p style="color:#ffaa00;margin-bottom:8px;">当前：${currentAttr.name}(${currentAttr.abbr}) — ${currentAttr.dice}</p>
                <p style="font-size:11px;color:#555570;margin-bottom:8px;">本项已投 ${attempts} / ${this.maxRollAttemptsPerAttr} 次</p>
                <button class="nav-btn primary" id="btn-roll-next" style="font-size:16px;padding:10px 24px;" ${canRoll ? '' : 'disabled title="该属性最多投3次"'}>🎲 掷${currentAttr.name}</button>
                ${hasValue ? '<button class="nav-btn" id="btn-keep-roll-attr" style="font-size:13px;padding:10px 18px;margin-left:8px;">保留，下一项</button>' : ''}
            </div>`;
        } else {
            this.rollResults.luck = Utils.rollNDice(3, 6).total * 5;
            html += `<div style="text-align:center;margin-top:12px;">
                <p style="color:#00ff88;">✓ 所有属性已投掷完成！幸运：${this.rollResults.luck}</p>
            </div>`;
            this.selectedAttrSet = { ...this.rollResults };
        }

        return html;
    },

    renderPointBuyMethod() {
        if (!this.pointBuyAttrs) {
            this.pointBuyAttrs = {};
            for (const key of Object.keys(COCRules.ATTRIBUTES)) {
                this.pointBuyAttrs[key] = COCRules.ATTRIBUTES[key].min;
            }
        }

        const total = COCRules.getAttributeTotal(this.pointBuyAttrs);
        const remaining = this.attrPointBudget - total;

        let html = `<div class="point-buy-remaining">
            <div class="remaining-label">剩余点数</div>
            <div class="remaining-value ${remaining < 0 ? 'over' : ''}">${remaining}</div>
            <div style="font-size:11px;color:#555570">总预算 ${this.attrPointBudget} / 已用 ${total}</div>
        </div>`;

        html += `<div class="attr-manual-grid">`;
        for (const key of Object.keys(COCRules.ATTRIBUTES)) {
            const attr = COCRules.ATTRIBUTES[key];
            html += `<div class="attr-manual-item">
                <div class="attr-label">${attr.name}(${attr.abbr})</div>
                <input type="number" class="pointbuy-input" data-attr="${key}" value="${this.pointBuyAttrs[key]}" min="${attr.min}" max="90" step="5">
                <div class="attr-dice-info">${attr.dice}</div>
            </div>`;
        }
        html += `</div>`;

        return html;
    },

    renderManualMethod() {
        if (!this.manualAttrs) {
            this.manualAttrs = {};
            for (const key of Object.keys(COCRules.ATTRIBUTES)) {
                this.manualAttrs[key] = COCRules.ATTRIBUTES[key].min;
            }
        }

        let html = `<p style="font-size:12px;color:#8888a0;margin-bottom:12px;">自行输入各项属性值（必须为5的倍数，需符合骰法范围）</p>`;
        html += `<div class="attr-manual-grid">`;
        for (const key of Object.keys(COCRules.ATTRIBUTES)) {
            const attr = COCRules.ATTRIBUTES[key];
            html += `<div class="attr-manual-item">
                <div class="attr-label">${attr.name}(${attr.abbr})</div>
                <input type="number" class="manual-input" data-attr="${key}" value="${this.manualAttrs[key]}" min="${attr.min}" max="${attr.max}" step="5">
                <div class="attr-dice-info">${attr.dice} (${attr.min}-${attr.max})</div>
            </div>`;
        }
        html += `</div>`;

        return html;
    },

    renderRandomMethod() {
        if (this.selectedMethod !== 'random' || !this.selectedAttrSet) {
            if (!this.recordRandomRoll()) {
                return `<div class="creation-step active"><div class="cc-title">随机属性次数已用完</div><div class="cc-subtitle">一键随机最多允许 ${this.maxRandomRollAttempts} 次。</div></div>`;
            }
            this.selectedAttrSet = COCRules.generateAttributesMethod5();
            this.selectedMethod = 'random';
        }

        const remaining = this.getRandomRollsRemaining();
        const disabled = remaining <= 0;
        const title = remaining <= 0 ? '一键随机最多3次' : '';
        let html = `<button class="nav-btn primary" id="btn-reroll-random" style="margin-bottom:8px;" ${disabled ? `disabled title="${title}"` : ''}>🎲 重新随机</button>`;
        html += `<div style="font-size:11px;color:#555570;margin-bottom:16px;">一键随机剩余 ${remaining} / ${this.maxRandomRollAttempts} 次</div>`;
        html += `<div class="attr-set selected" style="cursor:default;">`;
        for (const key of Object.keys(COCRules.ATTRIBUTES)) {
            const attr = COCRules.ATTRIBUTES[key];
            html += `<div class="attr-cell"><div class="attr-abbr">${attr.abbr}</div><div class="attr-num">${this.selectedAttrSet[key]}</div></div>`;
        }
        html += `<div class="attr-cell"><div class="attr-abbr">幸运</div><div class="attr-num">${this.selectedAttrSet.luck}</div></div>`;
        html += `</div>`;

        return html;
    },

    getOccupationPointInfo(occName, attrs) {
        const occ = COCRules.OCCUPATIONS[occName];
        if (!occ || !attrs) return { formula: '', points: 0, relevantAttrs: [] };

        const pk = occ.pointKey || 'edu4';
        const attrMap = {
            'edu4': { formula: 'EDU×4', attrs: ['edu'], points: attrs.edu * 4 },
            'edu2_dex2': { formula: 'EDU×2+DEX×2', attrs: ['edu', 'dex'], points: attrs.edu * 2 + attrs.dex * 2 },
            'edu2_str2': { formula: 'EDU×2+STR×2', attrs: ['edu', 'str'], points: attrs.edu * 2 + attrs.str * 2 },
            'edu2_app2': { formula: 'EDU×2+APP×2', attrs: ['edu', 'app'], points: attrs.edu * 2 + attrs.app * 2 },
            'edu2_pow2': { formula: 'EDU×2+POW×2', attrs: ['edu', 'pow'], points: attrs.edu * 2 + attrs.pow * 2 },
            'edu2_str_or_dex2': { formula: 'EDU×2+max(STR,DEX)×2', attrs: ['edu', 'str', 'dex'], points: attrs.edu * 2 + Math.max(attrs.str, attrs.dex) * 2 },
            'edu2_app_or_dex2': { formula: 'EDU×2+max(APP,DEX)×2', attrs: ['edu', 'app', 'dex'], points: attrs.edu * 2 + Math.max(attrs.app, attrs.dex) * 2 },
            'edu2_app_or_pow2': { formula: 'EDU×2+max(APP,POW)×2', attrs: ['edu', 'app', 'pow'], points: attrs.edu * 2 + Math.max(attrs.app, attrs.pow) * 2 },
            'edu2_dex_or_pow2': { formula: 'EDU×2+max(DEX,POW)×2', attrs: ['edu', 'dex', 'pow'], points: attrs.edu * 2 + Math.max(attrs.dex, attrs.pow) * 2 },
            'edu2_dex_or_str2': { formula: 'EDU×2+max(DEX,STR)×2', attrs: ['edu', 'dex', 'str'], points: attrs.edu * 2 + Math.max(attrs.dex, attrs.str) * 2 },
            'edu2_dex_or_app2': { formula: 'EDU×2+max(DEX,APP)×2', attrs: ['edu', 'dex', 'app'], points: attrs.edu * 2 + Math.max(attrs.dex, attrs.app) * 2 },
            'edu2_app_or_dex_or_str2': { formula: 'EDU×2+max(APP,DEX,STR)×2', attrs: ['edu', 'app', 'dex', 'str'], points: attrs.edu * 2 + Math.max(attrs.app, attrs.dex, attrs.str) * 2 },
        };

        return attrMap[pk] || attrMap['edu4'];
    },

    renderOccupationStep() {
        const attrs = this.getCurrentAttrs();
        let html = `<div class="creation-step active">`;
        html += `<div class="cc-title">职业选择</div>`;
        html += `<div class="cc-subtitle">共${Object.keys(COCRules.OCCUPATIONS).length}个职业 · 点击选择</div>`;

        html += `<div style="display:flex;gap:8px;margin-bottom:12px;">
            <input type="text" id="occ-search" placeholder="搜索职业..." value="${this.occSearchText || ''}" style="flex:1;padding:8px 12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary);font-family:var(--font-sans);font-size:13px;outline:none;">
            <select id="occ-attr-filter" style="padding:8px 12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:4px;color:var(--text-primary);font-family:var(--font-sans);font-size:13px;outline:none;">
                <option value="" ${!this.occFilterAttr ? 'selected' : ''}>全部属性</option>
                <option value="edu" ${this.occFilterAttr === 'edu' ? 'selected' : ''}>教育(EDU)</option>
                <option value="dex" ${this.occFilterAttr === 'dex' ? 'selected' : ''}>敏捷(DEX)</option>
                <option value="str" ${this.occFilterAttr === 'str' ? 'selected' : ''}>力量(STR)</option>
                <option value="app" ${this.occFilterAttr === 'app' ? 'selected' : ''}>外貌(APP)</option>
                <option value="pow" ${this.occFilterAttr === 'pow' ? 'selected' : ''}>意志(POW)</option>
            </select>
        </div>`;

        html += `<div class="cc-occ-grid" id="occupation-list">`;
        for (const [name, occ] of Object.entries(COCRules.OCCUPATIONS)) {
            if (this.occSearchText && !name.includes(this.occSearchText)) continue;
            if (this.occFilterAttr) {
                const info = this.getOccupationPointInfo(name, attrs || {});
                if (!info.attrs.includes(this.occFilterAttr)) continue;
            }

            const isSelected = this.selectedOccupation === name;
            const pointInfo = this.getOccupationPointInfo(name, attrs || {});
            const hobbyPts = attrs ? attrs.int * 2 : 0;

            html += `<div class="cc-occ-card ${isSelected ? 'selected' : ''}" data-occupation="${name}">
                <div class="cc-occ-name">${name}${occ.isCustom ? ' ⚙️' : ''}</div>
                <div class="cc-occ-skills">${occ.skillFormula || '教育×4'} | ${occ.isCustom ? '自选8项' : (occ.skills.slice(0, 3).join('、') + (occ.skills.length > 3 ? '...' : '') + ((occ.customSlots || []).reduce(function(a,cs){return a+cs.count;},0) > 0 ? '+' + (occ.customSlots || []).reduce(function(a,cs){return a+cs.count;},0) + '自选' : ''))}</div>
                <div class="cc-occ-meta">
                    <span class="cc-occ-credit">信用 ${occ.creditRange[0]}-${occ.creditRange[1]}</span>
                    ${attrs ? `<span class="cc-occ-points">职:${pointInfo.points} 兴:${hobbyPts}</span>` : ''}
                </div>
            </div>`;
        }
        html += `</div></div>`;
        return html;
    },

    initSkillAllocations() {
        const attrs = this.getCurrentAttrs();
        if (!attrs || !this.selectedOccupation) return;


        const { professionPoints, hobbyPoints } = COCRules.calculateSkillPoints(attrs, this.selectedOccupation);
        this.totalProfPoints = professionPoints;
        this.totalHobbyPoints = hobbyPoints;
        this.profPointsRemaining = professionPoints;
        this.hobbyPointsRemaining = hobbyPoints;
        this.skillAllocations = {};
        for (const skill of Object.keys(COCRules.SKILL_BASE)) {
            this.skillAllocations[skill] = { added: 0, base: COCRules.getSkillBaseValue(skill, attrs), profAllocated: 0, hobbyAllocated: 0 };
        }
        this.skillAllocations['闪避'] = { added: 0, base: Math.floor(attrs.dex / 2), profAllocated: 0, hobbyAllocated: 0 };
        this.skillAllocations['语言（母语）'] = { added: 0, base: attrs.edu, profAllocated: 0, hobbyAllocated: 0 };

        const occ = COCRules.OCCUPATIONS[this.selectedOccupation];
        if (occ && occ.creditRange) {
            const minCredit = occ.creditRange[0];
            const creditAlloc = this.skillAllocations['信用评级'];
            if (creditAlloc && creditAlloc.base < minCredit) {
                const needed = minCredit - creditAlloc.base;
                creditAlloc.added = needed;
                creditAlloc.profAllocated = needed;
                this.profPointsRemaining -= needed;
                if (this.profPointsRemaining < 0) {
                    this.hobbyPointsRemaining += this.profPointsRemaining;
                    this.profPointsRemaining = 0;
                }
            }
        }
    },

    addCustomLanguage() {
        const langName = prompt('请输入外语名称（如：法语、拉丁语）：');
        if (!langName || !langName.trim()) return;
        const fullName = `语言（${langName.trim()}）`;
        if (this.skillAllocations[fullName]) {
            alert('该语言已存在。');
            return;
        }
        this.skillAllocations[fullName] = { added: 0, base: 1, profAllocated: 0, hobbyAllocated: 0 };
        this.renderStep();
    },

    renderSkillStep() {
        if (!this.selectedOccupation) return `<div class="creation-step active"><div class="cc-title">请先选择职业</div></div>`;
        const attrs = this.getCurrentAttrs();
        if (!attrs) return `<div class="creation-step active"><div class="cc-title">请先完成属性生成</div></div>`;

        if (Object.keys(this.skillAllocations).length === 0) {
            this.initSkillAllocations();
        }

        var self = this;
        const occ = COCRules.OCCUPATIONS[this.selectedOccupation];

        let html = `<div class="creation-step active">`;
        html += `<div class="cc-title">技能分配</div>`;
        html += `<div class="cc-subtitle">职业：${this.selectedOccupation} · 公式：${occ.skillFormula || '教育×4'} · 兴趣点=INT×2</div>`;

        if (occ.isCustom) {
            var currentFormula = this.customOccFormula || 'edu4';
            html += `<div style="margin-bottom:8px;padding:6px;background:rgba(68,136,255,0.08);border:1px solid rgba(68,136,255,0.25);border-radius:4px;">
                <span style="font-size:11px;color:#4488ff;">⚙️ 自选职业公式：</span>
                <select id="custom-occ-formula" style="background:var(--bg-primary);border:1px solid rgba(68,136,255,0.3);border-radius:3px;color:var(--accent-green);font-size:11px;padding:2px 4px;">
                    <option value="edu4" ${currentFormula === 'edu4' ? 'selected' : ''}>教育×4</option>
                    <option value="edu2_dex2" ${currentFormula === 'edu2_dex2' ? 'selected' : ''}>教育×2+敏捷×2</option>
                    <option value="edu2_str2" ${currentFormula === 'edu2_str2' ? 'selected' : ''}>教育×2+力量×2</option>
                    <option value="edu2_app2" ${currentFormula === 'edu2_app2' ? 'selected' : ''}>教育×2+外貌×2</option>
                    <option value="edu2_pow2" ${currentFormula === 'edu2_pow2' ? 'selected' : ''}>教育×2+意志×2</option>
                    <option value="edu2_str_or_dex2" ${currentFormula === 'edu2_str_or_dex2' ? 'selected' : ''}>教育×2+力量或敏捷×2</option>
                    <option value="edu2_app_or_dex2" ${currentFormula === 'edu2_app_or_dex2' ? 'selected' : ''}>教育×2+外貌或敏捷×2</option>
                    <option value="edu2_app_or_pow2" ${currentFormula === 'edu2_app_or_pow2' ? 'selected' : ''}>教育×2+外貌或意志×2</option>
                </select>
            </div>`;
        }

        html += `<div class="cc-points-bar">
            <div>
                <span class="cc-points-prof">🔵 职业技能点：${this.profPointsRemaining}/${this.totalProfPoints}</span> &nbsp;
                <span class="cc-points-hobby">🟠 兴趣技能点：${this.hobbyPointsRemaining}/${this.totalHobbyPoints}</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="nav-btn" id="btn-auto-alloc" style="font-size:11px;padding:4px 10px;color:var(--accent-cyan);">⚡ 自动分配</button>
                <button class="nav-btn" id="btn-clear-alloc" style="font-size:11px;padding:4px 10px;">清空</button>
            </div>
        </div>`;

        html += `<div style="font-size:11px;color:#555570;margin-bottom:8px;">
            <span style="color:#4488ff;">●</span> 职业技能（蓝=职业点，橙=兴趣点）| 点击+用职业点，点击-退回 | 可直接输入数值
        </div>`;

        var customSlots = occ.customSlots || [];
        var totalCustomSlots = 0;
        customSlots.forEach(function(cs) { totalCustomSlots += cs.count; });
        if (totalCustomSlots > 0) {
            html += `<div class="custom-slots-section" style="margin-bottom:10px;padding:8px;background:rgba(68,136,255,0.08);border:1px solid rgba(68,136,255,0.25);border-radius:6px;">`;
            html += `<div style="font-size:11px;color:#4488ff;font-weight:700;margin-bottom:6px;">📋 自选本职技能槽</div>`;
            var slotIdx = 0;
            customSlots.forEach(function(cs) {
                html += `<div style="font-size:10px;color:#8888a0;margin-bottom:4px;">${cs.desc}（${cs.count}项）</div>`;
                for (var i = 0; i < cs.count; i++) {
                    var selectedSkill = self.customSlotSelections['slot_' + slotIdx] || '';
                    html += `<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;padding-left:8px;">
                        <span style="font-size:10px;color:#aaa;">槽位${slotIdx + 1}：</span>
                        <select class="custom-slot-select" data-slot-key="slot_${slotIdx}" style="flex:1;background:var(--bg-primary);border:1px solid rgba(68,136,255,0.3);border-radius:3px;color:var(--accent-green);font-size:11px;padding:2px 4px;max-width:200px;">
                            <option value="">-- 选择技能 --</option>`;
                    var allSkillNames = Object.keys(self.skillAllocations);
                    allSkillNames.forEach(function(sk) {
                        if (sk === '克苏鲁神话') return;
                        if (sk === '语言（母语）') return;
                        var alreadyUsed = false;
                        for (var k in self.customSlotSelections) {
                            if (k !== 'slot_' + slotIdx && self.customSlotSelections[k] === sk) {
                                alreadyUsed = true;
                                break;
                            }
                        }
                        var isFixedProf = self.isSkillProfession(sk, occ.skills) && occ.skills.indexOf(sk) >= 0;
                        var isSpecifiedLang = self.specifiedForeignLang && sk === self.specifiedForeignLang;
                        if (isFixedProf || isSpecifiedLang) return;
                        if (alreadyUsed) return;
                        var sel = selectedSkill === sk ? ' selected' : '';
                        html += `<option value="${sk}"${sel}>${sk}</option>`;
                    });
                    html += `</select></div>`;
                    slotIdx++;
                }
            });
            html += `</div>`;
        }

        html += `<div style="margin-bottom:10px;">
            <button class="nav-btn" id="btn-add-language" style="font-size:11px;padding:4px 10px;">+ 添加自定义外语</button>
        </div>`;

        html += `<div class="skill-allocation">`;

        const allSkills = Object.keys(this.skillAllocations).sort((a, b) => {
            const aIsProf = this.isSkillProfession(a, occ.skills);
            const bIsProf = this.isSkillProfession(b, occ.skills);
            if (aIsProf && !bIsProf) return -1;
            if (!aIsProf && bIsProf) return 1;
            return a.localeCompare(b);
        });

        for (const skillName of allSkills) {
            const alloc = this.skillAllocations[skillName];
            const isProf = this.isSkillProfession(skillName, occ.skills);
            const currentVal = alloc.base + alloc.added;
            const displayVal = isNaN(currentVal) ? alloc.base : currentVal;

            var displayName = skillName;
            if (skillName === '语言（母语）') {
                var nat = this.characterData.nationality || '中国';
                var natE = this.NATIONALITIES.find(function(n) { return n.name === nat; });
                var natLang = natE ? natE.language : '中文';
                displayName = '语言（母语-' + natLang + '）';
            }

            var langBtn = '';
            if (skillName === '语言（外语）') {
                langBtn = `<button class="nav-btn specify-lang-btn" data-skill="${skillName}" style="font-size:9px;padding:1px 6px;margin-left:2px;color:#4488ff;">指定语言</button>`;
            }

            const profAllocated = alloc.profAllocated || 0;
            const hobbyAllocated = alloc.hobbyAllocated || 0;
            const barProfWidth = Math.min(100, (profAllocated / 80) * 100);
            const barHobbyWidth = Math.min(100, (hobbyAllocated / 80) * 100);

            html += `<div class="skill-alloc-item ${isProf ? 'is-profession' : ''}" style="border-left:3px solid ${isProf ? '#4488ff' : '#ff8844'};">
                <span class="skill-alloc-name">${displayName}${langBtn}</span>
                <span class="skill-base">${alloc.base}%</span>
                <div style="display:flex;align-items:center;gap:2px;flex:0 0 auto;">
                    <div style="width:60px;height:6px;background:#1a1a2e;border-radius:3px;overflow:hidden;position:relative;">
                        <div style="position:absolute;left:0;top:0;height:100%;width:${barProfWidth}%;background:#4488ff;border-radius:3px 0 0 3px;"></div>
                        <div style="position:absolute;left:${barProfWidth}%;top:0;height:100%;width:${barHobbyWidth}%;background:#ff8844;border-radius:0 3px 3px 0;"></div>
                    </div>
                </div>
                <div class="skill-alloc-controls">
                    <button class="skill-dec-btn" data-skill="${skillName}">−</button>
                    <input type="text" class="skill-direct-input" data-skill="${skillName}" data-prof="${isProf}" value="${displayVal}" data-base="${alloc.base}" data-max="90" style="width:48px;text-align:center;background:var(--bg-primary);border:1px solid ${isProf ? '#4488ff' : '#ff8844'};border-radius:3px;color:var(--accent-green);font-family:var(--font-mono);font-size:12px;padding:2px;-moz-appearance:textfield;">
                    <button class="skill-inc-btn" data-skill="${skillName}" data-prof="${isProf}">+</button>
                </div>
                ${profAllocated > 0 ? `<span style="font-size:9px;color:#4488ff;">+${profAllocated}</span>` : ''}
                ${hobbyAllocated > 0 ? `<span style="font-size:9px;color:#ff8844;">+${hobbyAllocated}</span>` : ''}
            </div>`;
        }

        html += `</div></div>`;
        return html;
    },

    renderDerivedStep() {
        const attrs = this.getCurrentAttrs();
        if (!attrs) return `<div class="creation-step active"><div class="cc-title">无属性数据</div></div>`;

        const derived = COCRules.calculateDerivedValues(attrs);

        let html = `<div class="creation-step active">`;
        html += `<div class="cc-title">衍生值确认</div>`;
        html += `<div class="cc-subtitle">基于属性自动计算</div>`;

        html += `<div class="cc-attr-grid" style="margin-bottom:16px;">`;
        for (const key of Object.keys(COCRules.ATTRIBUTES)) {
            const attr = COCRules.ATTRIBUTES[key];
            html += `<div class="cc-attr-card"><div class="cc-attr-abbr">${attr.abbr}</div><div class="cc-attr-val">${attrs[key]}</div><div class="cc-attr-name">${attr.name}</div></div>`;
        }
        html += `</div>`;

        html += `<div class="cc-derived-grid">`;
        const derivedItems = [
            { label: 'HP', value: derived.hp },
            { label: 'MP', value: derived.mp },
            { label: 'SAN', value: derived.san },
            { label: 'DB', value: derived.db },
            { label: '体格', value: derived.build },
            { label: 'MOV', value: derived.mov },
            { label: 'SAN上限', value: derived.sanMax },
            { label: '幸运', value: attrs.luck },
            { label: '信用评级', value: this.skillAllocations?.['信用评级']?.base + this.skillAllocations?.['信用评级']?.added || 0 }
        ];
        derivedItems.forEach(item => {
            html += `<div class="cc-derived-card"><div class="cc-derived-label">${item.label}</div><div class="cc-derived-val">${item.value}</div></div>`;
        });
        html += `</div></div>`;
        return html;
    },

    getStoryRelevantNationality() {
        var text = '';
        if (typeof Story !== 'undefined' && Story.state) {
            text = [
                Story.state.currentLocation,
                Story.state.modName,
                Story.state.officialNotes,
                Story.state.chapter
            ].filter(Boolean).join(' ');
        }
        var rules = [
            { re: /阿卡姆|波士顿|纽约|美国|马萨诸塞|新英格兰/i, name: '美国' },
            { re: /伦敦|英国|英格兰|苏格兰|威尔士/i, name: '英国' },
            { re: /巴黎|法国/i, name: '法国' },
            { re: /柏林|德国/i, name: '德国' },
            { re: /东京|日本/i, name: '日本' },
            { re: /上海|北平|北京|中国|华国/i, name: '中国' },
            { re: /开罗|埃及/i, name: '埃及' },
            { re: /墨西哥/i, name: '墨西哥' },
            { re: /巴西|里约/i, name: '巴西' },
            { re: /印度|加尔各答/i, name: '印度' }
        ];
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].re.test(text)) return rules[i].name;
        }
        return this.characterData.nationality || '美国';
    },

    generateAutoProfile() {
        var occ = this.selectedOccupation || '调查员';
        var tpl = this.NARRATIVE_TEMPLATES[occ] || this.generateGenericBackground({ occupation: occ });
        var nationality = this.getStoryRelevantNationality();
        var residenceMap = {
            '美国': '阿卡姆',
            '英国': '伦敦',
            '法国': '巴黎',
            '德国': '柏林',
            '日本': '东京',
            '中国': '上海',
            '埃及': '开罗',
            '墨西哥': '墨西哥城',
            '巴西': '里约热内卢',
            '印度': '加尔各答'
        };
        var surnames = nationality === '中国' ? ['林', '沈', '周', '顾', '陆'] : ['Carter', 'Warren', 'Blackwood', 'Hale', 'Marsh'];
        var given = nationality === '中国' ? ['砚', '知行', '望舒', '明川', '静姝'] : ['Edwin', 'Clara', 'Victor', 'Eleanor', 'Samuel'];
        var name = surnames[Math.floor(Math.random() * surnames.length)] + (nationality === '中国' ? given[Math.floor(Math.random() * given.length)] : ' ' + given[Math.floor(Math.random() * given.length)]);
        var age = 24 + Math.floor(Math.random() * 22);
        var gender = ['男', '女', '其他'][Math.floor(Math.random() * 3)];
        var appearanceDetails = [
            '中等身高，常穿深色外套，袖口有长期伏案留下的磨损；眼神警觉，说话前会先观察对方的手。',
            '身形清瘦，头发梳理得一丝不乱，随身带着皮革笔记本；左手食指有墨水痕迹。',
            '肩背挺直，外套保养得很好但鞋跟磨损明显；看人时很少眨眼，像在记住每个细节。',
            '脸色略显疲惫，眼下有浅淡阴影；衣着朴素实用，口袋里总能摸出纸条、钥匙或铅笔。'
        ];
        return {
            name,
            age,
            gender,
            nationality,
            residence: residenceMap[nationality] || '阿卡姆',
            appearance: appearanceDetails[Math.floor(Math.random() * appearanceDetails.length)],
            personality: occ + '式的谨慎与好奇并存，遇到异常时会先寻找现实解释，但不会轻易放过矛盾细节。',
            belongings: tpl.belongings || '笔记本、钢笔、怀表、折叠小刀、几张写满地址的便笺',
            background: tpl.background,
            cherished: tpl.cherished,
            connections: tpl.connections,
            fears: tpl.fears
        };
    },

    renderBackgroundStep() {
        const occ = this.selectedOccupation || '';
        const template = this.NARRATIVE_TEMPLATES[occ] || this.generateGenericBackground({ occupation: occ });
        const mode = this.characterData.creationMode || 'quick';
        const showFull = mode === 'full';

        let html = `<div class="creation-step active">`;
        html += `<div class="cc-title">背景填写</div>`;
        html += `<div class="cc-subtitle">塑造调查员的身份与过去</div>`;
        html += `<div style="margin-bottom:12px;">
            <button class="nav-btn" id="btn-autofill-bg" style="font-size:11px;padding:4px 10px;color:var(--accent-cyan);">⚡ 一键填充</button>
            <span style="font-size:11px;color:var(--text-dim);margin-left:8px;">只填空白字段；快速模式不会填深层背景</span>
        </div>`;
        html += `
            <div class="cc-field">
                <label>创建模式</label>
                <select id="char-creation-mode">
                    <option value="quick" ${mode === 'quick' ? 'selected' : ''}>快速模式（深层背景稍后自动补齐）</option>
                    <option value="full" ${mode === 'full' ? 'selected' : ''}>完整模式（填写SAN相关背景）</option>
                </select>
                <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">若深层背景未填写，创建角色时会按职业与已填信息自动补齐，用于后续 SAN、恐惧与关系判定。</div>
            </div>
            <div class="cc-field">
                <label>姓名</label>
                <input type="text" id="char-name" value="${this.characterData.name || ''}" placeholder="角色姓名">
            </div>
            <div class="cc-field-row">
                <div class="cc-field">
                    <label>年龄</label>
                    <input type="number" id="char-age" value="${this.characterData.age || 25}" min="15" max="90">
                </div>
                <div class="cc-field">
                    <label>性别</label>
                    <select id="char-gender">
                        <option value="男" ${this.characterData.gender === '男' ? 'selected' : ''}>男</option>
                        <option value="女" ${this.characterData.gender === '女' ? 'selected' : ''}>女</option>
                        <option value="其他" ${this.characterData.gender === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
            </div>
            <div class="cc-field-row">
                <div class="cc-field">
                    <label>国籍</label>
                    <select id="char-nationality">
                        ${this.NATIONALITIES.map(n => `<option value="${n.name}" ${this.characterData.nationality === n.name ? 'selected' : ''}>${n.name}</option>`).join('')}
                    </select>
                </div>
                <div class="cc-field">
                    <label>居住地</label>
                    <input type="text" id="char-residence" value="${this.characterData.residence || ''}" placeholder="如：阿卡姆">
                </div>
            </div>
            <div class="cc-field">
                <label>外貌特征</label>
                <textarea id="char-appearance" rows="3" placeholder="身高、体型、发色、瞳色、穿着风格、显著特征...">${this.characterData.appearance || ''}</textarea>
            </div>
            <div class="cc-field">
                <label>性格特质</label>
                <textarea id="char-personality" rows="3" placeholder="核心性格、说话方式、习惯动作、价值观...">${this.characterData.personality || ''}</textarea>
            </div>
            <div id="cc-deep-background" style="${showFull ? '' : 'display:none;'}">
            <div class="cc-field">
                <label>随身物品</label>
                <textarea id="char-belongings" rows="2" placeholder="怀表、笔记本、手杖、左轮手枪...">${this.characterData.belongings || ''}</textarea>
            </div>
            <div class="cc-field">
                <label>背景故事</label>
                <textarea id="char-background" placeholder="角色的过去、经历和性格...">${this.characterData.background || ''}</textarea>
            </div>
            <div class="cc-field">
                <label>珍爱之物</label>
                <input type="text" id="char-cherished" value="${this.characterData.cherished || ''}" placeholder="最珍视的物品或事物" data-autofill="${template.cherished}">
            </div>
            <div class="cc-field">
                <label>关键连接</label>
                <textarea id="char-connections" placeholder="人物/物品/信念——与角色紧密相关的人或事" data-autofill="${template.connections}">${this.characterData.connections || ''}</textarea>
            </div>
            <div class="cc-field">
                <label>恐惧与创伤（选填）</label>
                <input type="text" id="char-fears" value="${this.characterData.fears || ''}" placeholder="害怕的事物或过去的创伤" data-autofill="${template.fears}">
            </div>
            </div>
        </div>`;
        return html;
    },

    renderCompleteStep() {
        const attrs = this.getCurrentAttrs();
        if (!attrs) {
            return `<section class="sheet"><div class="sh-head"><h2 class="sh-title">数据不完整</h2>
                <div class="sh-sub">请返回前面的步骤补齐属性</div></div>
                ${this.renderNavigation()}</section>`;
        }

        const esc = (v) => String(v == null ? '' : v)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

        const derived = COCRules.calculateDerivedValues(attrs);
        const d = this.characterData;
        const name = d.name || this.selectedOccupation || '调查员';
        const occ = this.selectedOccupation || '未定';
        const ageSummary = this.getAgeModifierSummary(attrs, d.age || 25);

        let html = `<div class="dband">
            <div class="sh-kicker">档案建立完成</div>
            <h2 class="sh-title">调查员 · ${esc(name)}</h2>
        </div>
        <div class="dossier">`;

        // —— 第一栏：立绘 ——
        html += `<div class="photo-col">
            <div class="photo-card">
                <div class="photo-slot" id="char-portrait-area">拖入 / 生成调查员立绘</div>
                <div class="photo-name">${esc(name)}</div>
            </div>
            <div class="photo-tags">
                <span class="ptag">${esc(occ)}</span>
                <span class="ptag">1920s${d.residence ? ' · ' + esc(d.residence) : ''}</span>
            </div>
            <button type="button" class="nav-btn" id="btn-gen-portrait" style="margin-top:14px;width:100%;">生成立绘</button>
        </div>`;

        // —— 第二栏：个人档案 + 背景速写 + 状态 ——
        const fields = [
            ['姓名', 'Name', name],
            ['性别', 'Gender', d.gender || '未知'],
            ['年龄', 'Age', d.age || 25],
            ['职业', 'Occupation', occ],
            ['国籍', 'Nationality', d.nationality || '未填'],
            ['居住地', 'Residence', d.residence || '未填']
        ];
        html += `<section class="panel ornframe">
            <span class="oc tl"></span><span class="oc tr"></span>
            <span class="oc bl"></span><span class="oc br"></span>
            <h3 class="panel-h"><b>个人档案</b>Profile</h3>
            <div class="flist">`;
        fields.forEach(([k, en, v]) => {
            html += `<div class="frow"><span class="fk">${k} · ${en}</span><span class="fv">${esc(v)}</span></div>`;
        });
        html += `</div>`;

        const sketch = [d.appearance, d.personality, d.background].filter(Boolean);
        if (sketch.length) {
            html += `<div class="bgsketch"><h3 class="panel-h"><b>背景速写</b>Backstory</h3>`;
            sketch.forEach(t => { html += `<p>${esc(t)}</p>`; });
            html += `</div>`;
        }

        html += `<div class="sec"><h3 class="panel-h"><b>状态</b>Vitals</h3><div class="vmini">`;
        [['hp', '生命', 'HP', derived.hp], ['san', '理智', 'SAN', derived.san], ['mp', '魔法', 'MP', derived.mp]]
            .forEach(([cls, zh, en, v]) => {
                html += `<div class="vrow ${cls}">
                    <div class="vh"><b>${zh} ${en}</b><span class="vv">${v} / ${v}</span></div>
                    <div class="vbar"><i style="width:100%"></i></div>
                </div>`;
            });
        html += `</div><div class="photo-tags" style="justify-content:flex-start;margin-top:14px;">
            <span class="ptag">幸运 ${attrs.luck}</span>
            <span class="ptag">移动 ${derived.mov}</span>
            <span class="ptag">体格 ${derived.db}</span>
        </div></div>`;

        if (ageSummary.length) {
            html += `<div class="agebox"><div class="agebox-h">年龄修正预告</div>`;
            ageSummary.forEach(line => { html += `<div>${esc(line)}</div>`; });
            html += `</div>`;
        }
        html += `</section>`;

        // —— 第三栏：八大属性 + 技能加点 ——
        html += `<section class="panel ornframe">
            <span class="oc tl"></span><span class="oc tr"></span>
            <span class="oc bl"></span><span class="oc br"></span>
            <h3 class="panel-h"><b>八大属性</b>Characteristics</h3>
            <div class="attrs">`;
        Object.keys(COCRules.ATTRIBUTES).forEach(key => {
            const a = COCRules.ATTRIBUTES[key];
            html += `<div class="ac"><div class="ak">${a.abbr}</div><div class="av">${attrs[key]}</div><div class="an">${a.name || ''}</div></div>`;
        });
        html += `</div>`;

        const skills = Object.entries(this.skillAllocations || {})
            .filter(([, a]) => a.added > 0)
            .map(([n, a]) => [n, a.base + a.added])
            .sort((x, y) => y[1] - x[1]);
        if (skills.length) {
            html += `<div class="sec"><h3 class="panel-h"><b>技能加点</b>Skills</h3><div class="skills">`;
            skills.slice(0, 12).forEach(([n, v]) => {
                html += `<div class="skrow"><span class="sn">${esc(n)}</span>
                    <span class="sval"><span class="smini"><i style="width:${Math.min(100, v)}%"></i></span>
                    <span class="snum">${v}</span></span></div>`;
            });
            html += `</div>`;
            const left = this.getRemainingSkillPoints ? this.getRemainingSkillPoints() : null;
            if (left != null) {
                html += `<div class="ptbar"><span class="pl">剩余技能点 · Points Left</span><span class="pv">${left}</span></div>`;
            }
            html += `</div>`;
        }
        html += `</section>`;
        html += `</div>`;   // .dossier

        // —— 页脚：封缄印 + 操作 ——
        html += `<div class="dfoot">
            <div class="seal"><div class="st">已就绪</div><div class="ss">Ready</div></div>
            ${this.renderNavigation()}
        </div>`;
        return html;
    },

    getAgeModifierSummary(attrs, age) {
        age = parseInt(age) || 25;
        var lines = [];
        if (age < 20) {
            lines.push('15-19岁：STR+SIZ 合计 -5，EDU -5；幸运会额外掷一次并取较高值。');
            return lines;
        }

        var physPenalty = 0;
        var appPenalty = 0;
        var eduChecks = 0;
        if (age >= 80) { physPenalty = 80; appPenalty = 25; eduChecks = 4; }
        else if (age >= 70) { physPenalty = 40; appPenalty = 20; eduChecks = 4; }
        else if (age >= 60) { physPenalty = 20; appPenalty = 15; eduChecks = 3; }
        else if (age >= 50) { physPenalty = 10; appPenalty = 10; eduChecks = 2; }
        else if (age >= 40) { physPenalty = 5; appPenalty = 5; eduChecks = 1; }

        if (physPenalty > 0) {
            lines.push(age + '岁：STR/CON/DEX 合计 -' + physPenalty + '，当前采用自动平均分配。');
            lines.push('APP -' + appPenalty + '。');
        }
        if (eduChecks > 0) {
            lines.push('EDU 改善检定 ' + eduChecks + ' 次：完成创建时逐次掷骰，成功时 EDU 增加 1D10，上限99。');
        }
        if (lines.length === 0) {
            lines.push('20-39岁：无年龄修正。');
        }
        return lines;
    },

    renderNavigation() {
        const last = this.currentStep === this.totalSteps - 1;
        let html = `<div class="cc-nav">`;
        html += `<button type="button" class="nav-btn" id="btn-prev" ${this.currentStep === 0 ? 'disabled' : ''}>← 上一步</button>`;
        html += `<span class="grow"></span>`;
        html += `<div class="cc-nav-actions">`;
        html += last
            ? `<button type="button" class="nav-btn primary" id="btn-finish">开始冒险 ›</button>`
            : `<button type="button" class="nav-btn primary" id="btn-next">下一步 →</button>`;
        html += `</div></div>`;
        return html;
    },

    bindStepEvents() {
        const self = this;

        document.getElementById('btn-close-creation')?.addEventListener('click', () => {
            self.close();
        });

        document.querySelectorAll('.cc-method-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const method = this.dataset.method;
                if (method !== self.selectedMethod) {
                    self.selectedMethod = method;
                    self.selectedAttrSet = null;
                    self.attrAdjustments = {};
                    self.rollResults = null;
                    self.rollIndex = 0;
                    self.cachedLuck = null;
                    self.renderStep();
                }
            });
        });

        document.getElementById('chk-formal-mode')?.addEventListener('change', function() {
            self.formalMode = this.checked;
        });

        document.getElementById('btn-roll-destiny')?.addEventListener('click', () => {
            if (self.destinyRolled || self.attrSets.length > 0) {
                Terminal.printWarning('天命五选一只允许投掷一次。');
                return;
            }
            self.destinyRolled = true;
            self.attrSets = [];
            for (let i = 0; i < 5; i++) {
                self.attrSets.push(COCRules.generateAttributesMethod5());
            }
            self.selectedAttrSet = null;
            self.attrAdjustments = {};
            self.renderStep();
        });

        document.querySelectorAll('.cc-attr-row[data-set-idx]').forEach(el => {
            el.addEventListener('click', function() {
                self.selectedAttrSet = parseInt(this.dataset.setIdx);
                self.attrAdjustments = {};
                for (const key of Object.keys(COCRules.ATTRIBUTES)) {
                    self.attrAdjustments[key] = 0;
                }
                self.renderStep();
            });
        });

        document.querySelectorAll('.cc-finetune-btn.inc').forEach(btn => {
            btn.addEventListener('click', function() {
                self.adjustAttrFine(this.dataset.attr, 5);
            });
        });

        document.querySelectorAll('.cc-finetune-btn.dec').forEach(btn => {
            btn.addEventListener('click', function() {
                self.adjustAttrFine(this.dataset.attr, -5);
            });
        });

        document.getElementById('btn-roll-next')?.addEventListener('click', () => {
            const attrKeys = Object.keys(COCRules.ATTRIBUTES);
            if (self.rollIndex < attrKeys.length) {
                const key = attrKeys[self.rollIndex];
                if (!self.recordCurrentAttributeRoll(key)) {
                    Terminal.printWarning('每项属性最多允许投掷3次。');
                    return;
                }
                const attr = COCRules.ATTRIBUTES[key];
                const formula = attr.formula;
                const result = Utils.rollNDice(formula.n, formula.sides);
                self.rollResults[key] = (result.total + formula.mod) * 5;
                self.renderStep();
            }
        });

        document.getElementById('btn-keep-roll-attr')?.addEventListener('click', () => {
            const attrKeys = Object.keys(COCRules.ATTRIBUTES);
            if (self.rollIndex < attrKeys.length && self.rollResults[attrKeys[self.rollIndex]] !== null) {
                self.rollIndex++;
                self.renderStep();
            }
        });

        document.getElementById('btn-reroll-random')?.addEventListener('click', () => {
            if (!self.recordRandomRoll()) {
                Terminal.printWarning('一键随机最多允许3次。');
                return;
            }
            self.selectedAttrSet = COCRules.generateAttributesMethod5();
            self.attrAdjustments = {};
            self.renderStep();
        });

        document.querySelectorAll('.pointbuy-input').forEach(input => {
            input.addEventListener('change', function() {
                const attr = this.dataset.attr;
                const val = parseInt(this.value);
                const attrConfig = COCRules.ATTRIBUTES[attr];
                const snapped = Math.round(val / 5) * 5;
                self.pointBuyAttrs[attr] = Utils.clamp(snapped, attrConfig.min, 90);
                self.renderStep();
            });
        });

        document.querySelectorAll('.manual-input').forEach(input => {
            input.addEventListener('change', function() {
                const attr = this.dataset.attr;
                const val = parseInt(this.value);
                const attrConfig = COCRules.ATTRIBUTES[attr];
                const snapped = Math.round(val / 5) * 5;
                self.manualAttrs[attr] = Utils.clamp(snapped, attrConfig.min, attrConfig.max);
                self.renderStep();
            });
        });

        document.getElementById('occ-search')?.addEventListener('input', function() {
            self.occSearchText = this.value.trim();
            const list = document.getElementById('occupation-list');
            if (!list) return;
            for (const card of list.children) {
                const name = card.dataset.occupation;
                const matchSearch = !self.occSearchText || name.includes(self.occSearchText);
                const occ = COCRules.OCCUPATIONS[name];
                const attrs = self.getCurrentAttrs();
                let matchAttr = true;
                if (self.occFilterAttr && attrs) {
                    const info = self.getOccupationPointInfo(name, attrs);
                    matchAttr = info.attrs.includes(self.occFilterAttr);
                }
                card.style.display = (matchSearch && matchAttr) ? '' : 'none';
            }
        });

        document.getElementById('occ-attr-filter')?.addEventListener('change', function() {
            self.occFilterAttr = this.value;
            self.renderStep();
        });

        document.querySelectorAll('.cc-occ-card').forEach(card => {
            card.addEventListener('click', function() {
                self.selectedOccupation = this.dataset.occupation;
                self.skillAllocations = {};
                self.customSlotSelections = {};
                self.specifiedForeignLang = null;
                self.totalProfPoints = 0;
                self.totalHobbyPoints = 0;
                self.profPointsRemaining = 0;
                self.hobbyPointsRemaining = 0;
                self.renderStep();
            });
        });

        document.querySelectorAll('.skill-inc-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const skill = this.dataset.skill;
                const isProf = this.dataset.prof === 'true';
                const alloc = self.skillAllocations[skill];
                if (!alloc) return;
                const maxAdd = 90 - alloc.base - alloc.added;
                if (maxAdd <= 0) return;

                if (isProf && self.profPointsRemaining > 0) {
                    alloc.added++;
                    self.profPointsRemaining--;
                } else if (self.hobbyPointsRemaining > 0) {
                    alloc.added++;
                    self.hobbyPointsRemaining--;
                }
                self.renderStep();
            });
        });

        document.querySelectorAll('.skill-dec-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const skill = this.dataset.skill;
                const alloc = self.skillAllocations[skill];
                if (!alloc || alloc.added <= 0) return;

                alloc.added--;
                const decOcc = COCRules.OCCUPATIONS[self.selectedOccupation];
                const isProf = self.isSkillProfession(skill, decOcc.skills);

                if (isProf && self.profPointsRemaining < self.totalProfPoints) {
                    self.profPointsRemaining++;
                } else if (self.hobbyPointsRemaining < self.totalHobbyPoints) {
                    self.hobbyPointsRemaining++;
                } else {
                    self.profPointsRemaining++;
                }
                self.renderStep();
            });
        });

        document.querySelectorAll('.skill-direct-input').forEach(input => {
            input.addEventListener('input', () => {
                input.value = input.value.replace(/[^0-9]/g, '');
            });
            input.addEventListener('change', () => {
                const skill = input.dataset.skill;
                const alloc = self.skillAllocations[skill];
                if (!alloc) return;
                const targetVal = parseInt(input.value);
                if (isNaN(targetVal) || targetVal < alloc.base) {
                    input.value = alloc.base + alloc.added;
                    return;
                }
                const clampedVal = Math.min(90, targetVal);
                const needed = clampedVal - alloc.base - alloc.added;
                if (needed <= 0) {
                    const excess = alloc.base + alloc.added - clampedVal;
                    alloc.added -= excess;
                    const inputOcc = COCRules.OCCUPATIONS[self.selectedOccupation];
                    const isProf = self.isSkillProfession(skill, inputOcc.skills);
                    if (isProf) {
                        self.profPointsRemaining += excess;
                    } else {
                        self.hobbyPointsRemaining += excess;
                    }
                    self.renderStep();
                    return;
                }

                const occ = COCRules.OCCUPATIONS[self.selectedOccupation];
                const isProfSkill = self.isSkillProfession(skill, occ.skills);

                let fromProf = 0;
                let fromHobby = 0;

                if (isProfSkill && self.profPointsRemaining > 0) {
                    fromProf = Math.min(needed, self.profPointsRemaining);
                }
                const remaining = needed - fromProf;
                if (remaining > 0 && self.hobbyPointsRemaining > 0) {
                    fromHobby = Math.min(remaining, self.hobbyPointsRemaining);
                }

                const actualAdded = fromProf + fromHobby;
                if (actualAdded > 0) {
                    alloc.added += actualAdded;
                    self.profPointsRemaining -= fromProf;
                    self.hobbyPointsRemaining -= fromHobby;
                }
                self.renderStep();
            });
        });

        document.getElementById('btn-auto-alloc')?.addEventListener('click', () => {
            self.randomAllocate();
        });

        document.getElementById('btn-clear-alloc')?.addEventListener('click', () => {
            self.clearAllocation();
        });

        document.getElementById('custom-occ-formula')?.addEventListener('change', function() {
            self.customOccFormula = this.value;
            var occ = COCRules.OCCUPATIONS[self.selectedOccupation];
            if (occ) {
                occ.pointKey = self.customOccFormula;
                var formulaMap = {
                    'edu4': '教育×4', 'edu2_dex2': '教育×2+敏捷×2',
                    'edu2_str2': '教育×2+力量×2', 'edu2_app2': '教育×2+外貌×2',
                    'edu2_pow2': '教育×2+意志×2', 'edu2_str_or_dex2': '教育×2+力量或敏捷×2',
                    'edu2_app_or_dex2': '教育×2+外貌或敏捷×2', 'edu2_app_or_pow2': '教育×2+外貌或意志×2'
                };
                occ.skillFormula = formulaMap[self.customOccFormula] || '教育×4';
            }
            self.skillAllocations = {};
            self.customSlotSelections = {};
            self.initSkillAllocations();
            self.renderStep();
        });

        document.getElementById('btn-add-language')?.addEventListener('click', () => {
            self.addCustomLanguage();
        });

        document.querySelectorAll('.custom-slot-select').forEach(sel => {
            sel.addEventListener('change', function() {
                var slotKey = this.dataset.slotKey;
                var skillName = this.value;
                var oldSkill = self.customSlotSelections[slotKey];
                if (oldSkill && self.skillAllocations[oldSkill]) {
                    var oldAlloc = self.skillAllocations[oldSkill];
                    if (oldAlloc.added > 0) {
                        var refund = oldAlloc.added;
                        oldAlloc.added = 0;
                        oldAlloc.profAllocated = 0;
                        oldAlloc.hobbyAllocated = 0;
                        var decOcc = COCRules.OCCUPATIONS[self.selectedOccupation];
                        if (self.isSkillProfession(oldSkill, decOcc.skills)) {
                            self.profPointsRemaining += refund;
                        } else {
                            self.hobbyPointsRemaining += refund;
                        }
                    }
                }
                if (skillName) {
                    self.customSlotSelections[slotKey] = skillName;
                } else {
                    delete self.customSlotSelections[slotKey];
                }
                self.renderStep();
            });
        });

        document.querySelectorAll('.specify-lang-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var skillKey = this.dataset.skill;
                var langName = prompt('请输入外语名称（如：法语、拉丁语）：');
                if (!langName || !langName.trim()) return;
                var newSkillName = '语言（' + langName.trim() + '）';
                if (self.skillAllocations[newSkillName]) {
                    alert('该语言已存在。');
                    return;
                }
                var oldAlloc = self.skillAllocations[skillKey];
                if (oldAlloc) {
                    self.skillAllocations[newSkillName] = {
                        added: oldAlloc.added,
                        base: oldAlloc.base,
                        profAllocated: oldAlloc.profAllocated,
                        hobbyAllocated: oldAlloc.hobbyAllocated
                    };
                    delete self.skillAllocations[skillKey];
                }
                self.specifiedForeignLang = newSkillName;
                self.renderStep();
            });
        });

        document.getElementById('btn-prev')?.addEventListener('click', () => {
            if (self.currentStep > 0) {
                self.saveCurrentStepData();
                self.currentStep--;
                self.renderStep();
            }
        });

        document.getElementById('btn-next')?.addEventListener('click', () => {
            if (self.validateCurrentStep()) {
                self.saveCurrentStepData();
                self.currentStep++;
                self.renderStep();
            }
        });

        document.getElementById('btn-finish')?.addEventListener('click', () => {
            self.saveCurrentStepData();
            self.finishCreation();
        });

        document.getElementById('btn-gen-portrait')?.addEventListener('click', () => {
            self.generatePortrait();
        });

        document.getElementById('btn-autofill-bg')?.addEventListener('click', () => {
            const profile = self.generateAutoProfile();
            const nameEl = document.getElementById('char-name');
            const ageEl = document.getElementById('char-age');
            const genderEl = document.getElementById('char-gender');
            const nationalityEl = document.getElementById('char-nationality');
            const residenceEl = document.getElementById('char-residence');
            const appearanceEl = document.getElementById('char-appearance');
            const personalityEl = document.getElementById('char-personality');
            const bgEl = document.getElementById('char-background');
            const belongingsEl = document.getElementById('char-belongings');
            const chEl = document.getElementById('char-cherished');
            const coEl = document.getElementById('char-connections');
            const feEl = document.getElementById('char-fears');
            const modeEl = document.getElementById('char-creation-mode');
            const isFull = modeEl && modeEl.value === 'full';

            if (nameEl && !nameEl.value.trim()) nameEl.value = profile.name;
            if (ageEl && !self.characterData.age && String(ageEl.value || '25') === '25') ageEl.value = profile.age;
            if (genderEl && !self.characterData.gender && genderEl.value === '男') genderEl.value = profile.gender;
            if (nationalityEl && !self.characterData.nationality && nationalityEl.value === '中国') nationalityEl.value = profile.nationality;
            if (residenceEl && !residenceEl.value.trim()) residenceEl.value = profile.residence;
            if (appearanceEl && !appearanceEl.value.trim()) appearanceEl.value = profile.appearance;
            if (personalityEl && !personalityEl.value.trim()) personalityEl.value = profile.personality;

            if (isFull) {
                if (belongingsEl && !belongingsEl.value.trim()) belongingsEl.value = profile.belongings;
                if (bgEl && !bgEl.value.trim()) bgEl.value = profile.background;
                if (chEl && !chEl.value.trim()) chEl.value = profile.cherished;
                if (coEl && !coEl.value.trim()) coEl.value = profile.connections;
                if (feEl && !feEl.value.trim()) feEl.value = profile.fears;
            }

            self.saveCurrentStepData();
            Terminal.printSystem('已根据职业自动填充空白字段，你可以手动修改。');
        });

        document.getElementById('char-creation-mode')?.addEventListener('change', function() {
            self.saveCurrentStepData();
            self.characterData.creationMode = this.value;
            self.renderStep();
        });
    },

    randomAllocate() {
        const attrs = this.getCurrentAttrs();
        if (!attrs || !this.selectedOccupation) return;

        for (const alloc of Object.values(this.skillAllocations)) {
            alloc.added = 0;
            alloc.profAllocated = 0;
            alloc.hobbyAllocated = 0;
        }
        const occ = COCRules.OCCUPATIONS[this.selectedOccupation];
        const { professionPoints, hobbyPoints } = COCRules.calculateSkillPoints(attrs, this.selectedOccupation);
        this.totalProfPoints = professionPoints;
        this.totalHobbyPoints = hobbyPoints;

        let profPool = professionPoints;
        let hobbyPool = hobbyPoints;

        if (occ.customSlots && occ.customSlots.length > 0) {
            var totalSlots = occ.customSlots.reduce(function(a, cs) { return a + cs.count; }, 0);
            var filledSlots = Object.keys(this.customSlotSelections).length;
            if (filledSlots < totalSlots) {
                var availableSkills = Object.keys(this.skillAllocations).filter(function(sk) {
                    return sk !== '克苏鲁神话' && sk !== '语言（母语）';
                });
                var slotIdx = 0;
                var self2 = this;
                occ.customSlots.forEach(function(cs) {
                    for (var i = 0; i < cs.count; i++) {
                        var key = 'slot_' + slotIdx;
                        if (!self2.customSlotSelections[key]) {
                            var remaining = availableSkills.filter(function(sk) {
                                for (var k in self2.customSlotSelections) {
                                    if (self2.customSlotSelections[k] === sk) return false;
                                }
                                return true;
                            });
                            if (remaining.length > 0) {
                                var pick = remaining[Math.floor(Math.random() * remaining.length)];
                                self2.customSlotSelections[key] = pick;
                            }
                        }
                        slotIdx++;
                    }
                });
            }
        }

        const profSkills = Object.entries(this.skillAllocations).filter(([name]) =>
            this.isSkillProfession(name, occ.skills)
        );

        const profCount = profSkills.length;
        const avgProfPoints = Math.floor(profPool / Math.max(1, profCount));

        for (const [name, alloc] of profSkills) {
            if (profPool <= 0) break;
            const maxAdd = 90 - alloc.base;
            const variance = Math.floor(avgProfPoints * 0.4);
            const base = avgProfPoints - variance;
            const add = Math.min(base + Math.floor(Math.random() * variance * 2), maxAdd, profPool);
            if (add > 0) {
                alloc.added = add;
                profPool -= add;
            }
        }

        let safetyCounter = 0;
        while (profPool > 0 && safetyCounter < 200) {
            safetyCounter++;
            const [name, alloc] = profSkills[Math.floor(Math.random() * profSkills.length)];
            const maxAdd = 90 - alloc.base - alloc.added;
            if (maxAdd <= 0) continue;
            const add = Math.min(Math.floor(Math.random() * 8) + 2, maxAdd, profPool);
            alloc.added += add;
            profPool -= add;
        }

        const coreHobbySkills = ['侦查', '聆听', '图书馆使用', '心理学', '潜行', '闪避'];
        const hobbySkills = Object.entries(this.skillAllocations).filter(([name]) =>
            !this.isSkillProfession(name, occ.skills)
        );

        const prioritizedHobby = hobbySkills.sort(([a], [b]) => {
            const aCore = coreHobbySkills.includes(a) ? 0 : 1;
            const bCore = coreHobbySkills.includes(b) ? 0 : 1;
            return aCore - bCore;
        });

        for (const [name, alloc] of prioritizedHobby) {
            if (hobbyPool <= 0) break;
            const maxAdd = 90 - alloc.base;
            const isCore = coreHobbySkills.includes(name);
            const addAmount = isCore ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 8) + 1;
            const add = Math.min(addAmount, maxAdd, hobbyPool);
            if (add > 0) {
                alloc.added = add;
                hobbyPool -= add;
            }
        }

        safetyCounter = 0;
        while (hobbyPool > 0 && safetyCounter < 200) {
            safetyCounter++;
            const [name, alloc] = prioritizedHobby[Math.floor(Math.random() * prioritizedHobby.length)];
            const maxAdd = 90 - alloc.base - alloc.added;
            if (maxAdd <= 0) continue;
            const add = Math.min(Math.floor(Math.random() * 5) + 1, maxAdd, hobbyPool);
            alloc.added += add;
            hobbyPool -= add;
        }

        this.profPointsRemaining = profPool;
        this.hobbyPointsRemaining = hobbyPool;

        this.enforceCreditRating();

        this.renderStep();
    },

    quickAllocate() {
        const attrs = this.getCurrentAttrs();
        if (!attrs || !this.selectedOccupation) return;

        for (const alloc of Object.values(this.skillAllocations)) {
            alloc.added = 0;
            alloc.profAllocated = 0;
            alloc.hobbyAllocated = 0;
        }
        const { professionPoints, hobbyPoints } = COCRules.calculateSkillPoints(attrs, this.selectedOccupation);
        this.totalProfPoints = professionPoints;
        this.totalHobbyPoints = hobbyPoints;

        let profPool = professionPoints;
        let hobbyPool = hobbyPoints;

        const occ = COCRules.OCCUPATIONS[this.selectedOccupation];

        if (occ.customSlots && occ.customSlots.length > 0) {
            var totalSlots = occ.customSlots.reduce(function(a, cs) { return a + cs.count; }, 0);
            var filledSlots = Object.keys(this.customSlotSelections).length;
            if (filledSlots < totalSlots) {
                var availableSkills = Object.keys(this.skillAllocations).filter(function(sk) {
                    return sk !== '克苏鲁神话' && sk !== '语言（母语）';
                });
                var slotIdx = 0;
                var self2 = this;
                occ.customSlots.forEach(function(cs) {
                    for (var i = 0; i < cs.count; i++) {
                        var key = 'slot_' + slotIdx;
                        if (!self2.customSlotSelections[key]) {
                            var remaining = availableSkills.filter(function(sk) {
                                for (var k in self2.customSlotSelections) {
                                    if (self2.customSlotSelections[k] === sk) return false;
                                }
                                return true;
                            });
                            if (remaining.length > 0) {
                                var pick = remaining[Math.floor(Math.random() * remaining.length)];
                                self2.customSlotSelections[key] = pick;
                            }
                        }
                        slotIdx++;
                    }
                });
            }
        }

        const profSkills = Object.entries(this.skillAllocations).filter(([name]) =>
            this.isSkillProfession(name, occ.skills)
        );

        for (const [name, alloc] of profSkills) {
            if (profPool <= 0) break;
            const maxAdd = 90 - alloc.base;
            const targetVal = Math.min(70, alloc.base + maxAdd);
            const needed = targetVal - alloc.base;
            const add = Math.min(needed, maxAdd, profPool);
            if (add > 0) {
                alloc.added = add;
                profPool -= add;
            }
        }

        const essentialHobby = ['侦查', '聆听', '心理学', '闪避', '图书馆使用'];
        for (const skillName of essentialHobby) {
            if (hobbyPool <= 0) break;
            const alloc = this.skillAllocations[skillName];
            if (!alloc) continue;
            if (this.isSkillProfession(skillName, occ.skills)) continue;
            const maxAdd = 90 - alloc.base;
            const targetVal = Math.min(50, alloc.base + maxAdd);
            const needed = targetVal - alloc.base;
            const add = Math.min(needed, maxAdd, hobbyPool);
            if (add > 0) {
                alloc.added = add;
                hobbyPool -= add;
            }
        }

        this.profPointsRemaining = profPool;
        this.hobbyPointsRemaining = hobbyPool;

        this.enforceCreditRating();

        this.renderStep();
    },

    enforceCreditRating() {
        if (!this.selectedOccupation) return;
        const occ = COCRules.OCCUPATIONS[this.selectedOccupation];
        if (!occ || !occ.creditRange) return;

        const minCredit = occ.creditRange[0];
        const maxCredit = occ.creditRange[1];
        const creditAlloc = this.skillAllocations['信用评级'];
        if (!creditAlloc) return;

        const currentCredit = creditAlloc.base + creditAlloc.added;

        if (currentCredit < minCredit) {
            const needed = minCredit - currentCredit;
            creditAlloc.added += needed;

            if (this.profPointsRemaining >= needed) {
                this.profPointsRemaining -= needed;
            } else {
                const fromProf = this.profPointsRemaining;
                const fromHobby = needed - fromProf;
                this.profPointsRemaining = 0;
                this.hobbyPointsRemaining -= fromHobby;
                if (this.hobbyPointsRemaining < 0) this.hobbyPointsRemaining = 0;
            }
        }

        if (currentCredit > maxCredit) {
            const excess = currentCredit - maxCredit;
            creditAlloc.added = Math.max(0, creditAlloc.added - excess);
            this.profPointsRemaining += excess;
        }
    },

    clearAllocation() {
        for (const alloc of Object.values(this.skillAllocations)) {
            alloc.added = 0;
            alloc.profAllocated = 0;
            alloc.hobbyAllocated = 0;
        }
        const attrs = this.getCurrentAttrs();
        if (attrs && this.selectedOccupation) {
            const { professionPoints, hobbyPoints } = COCRules.calculateSkillPoints(attrs, this.selectedOccupation);
            this.totalProfPoints = professionPoints;
            this.totalHobbyPoints = hobbyPoints;
            this.profPointsRemaining = professionPoints;
            this.hobbyPointsRemaining = hobbyPoints;
        }

        this.enforceCreditRating();

        this.renderStep();
    },

    getBaseAttrsWithoutAdjustments() {
        var baseAttrs = null;
        if (this.selectedMethod === 'pointbuy' && this.pointBuyAttrs) {
            baseAttrs = { ...this.pointBuyAttrs };
        } else if (this.selectedMethod === 'manual' && this.manualAttrs) {
            baseAttrs = { ...this.manualAttrs };
        } else if (this.selectedMethod === 'roll' && this.rollResults) {
            const attrKeys = Object.keys(COCRules.ATTRIBUTES);
            const allRolled = attrKeys.every(k => this.rollResults[k] !== null);
            if (allRolled) baseAttrs = { ...this.rollResults };
        }
        if (!baseAttrs && this.selectedAttrSet !== null && this.selectedAttrSet !== undefined) {
            if (typeof this.selectedAttrSet === 'number' && this.attrSets && this.attrSets.length > 0) {
                const set = this.attrSets[this.selectedAttrSet];
                if (set) baseAttrs = { ...set };
            }
            if (typeof this.selectedAttrSet === 'object') {
                baseAttrs = { ...this.selectedAttrSet };
            }
        }
        if (!baseAttrs) return null;
        return baseAttrs;
    },

    getCurrentAttrs() {
        var baseAttrs = this.getBaseAttrsWithoutAdjustments();
        if (!baseAttrs) return null;
        if (this.attrAdjustments) {
            for (const key of Object.keys(this.attrAdjustments)) {
                if (this.attrAdjustments[key] !== 0 && baseAttrs[key] !== undefined) {
                    baseAttrs[key] += this.attrAdjustments[key];
                }
            }
        }
        if (!baseAttrs.luck) {
            if (!this.cachedLuck) this.cachedLuck = Utils.rollNDice(3, 6).total * 5;
            baseAttrs.luck = this.cachedLuck;
        }
        return baseAttrs;
    },

    buildSkillMap() {
        const map = {};
        for (const [name, alloc] of Object.entries(this.skillAllocations)) {
            const val = alloc.base + alloc.added;
            if (val > 0) map[name] = val;
        }
        return map;
    },

    validateCurrentStep() {
        switch (this.currentStep) {
            case 0: {
                const attrs = this.getCurrentAttrs();
                if (!attrs) {
                    Terminal.printWarning('请先生成属性。');
                    return false;
                }
                if (this.selectedMethod === 'pointbuy') {
                    const errors = COCRules.validatePointBuy(this.pointBuyAttrs, this.attrPointBudget);
                    if (errors.length > 0) {
                        Terminal.printWarning(errors[0]);
                        return false;
                    }
                }
                if (this.selectedMethod === 'manual') {
                    const errors = COCRules.validateManualAttributes(this.manualAttrs);
                    if (errors.length > 0) {
                        Terminal.printWarning(errors[0]);
                        return false;
                    }
                }
                if (this.selectedMethod === 'roll') {
                    const attrKeys = Object.keys(COCRules.ATTRIBUTES);
                    const allRolled = attrKeys.every(k => this.rollResults && this.rollResults[k] !== null);
                    if (!allRolled) {
                        Terminal.printWarning('请完成所有属性的投掷。');
                        return false;
                    }
                }
                if (this.attrAdjustments) {
                    let totalAdjust = 0;
                    for (const key of Object.keys(this.attrAdjustments)) {
                        totalAdjust += this.attrAdjustments[key];
                    }
                    if (totalAdjust !== 0) {
                        Terminal.printWarning(`属性微调总调整值为${totalAdjust > 0 ? '+' : ''}${totalAdjust}，必须守恒（总和为0）才能继续。`);
                        return false;
                    }
                    for (const key of Object.keys(this.attrAdjustments)) {
                        const adj = this.attrAdjustments[key];
                        if (adj < -10 || adj > 10) {
                            Terminal.printWarning(`${COCRules.ATTRIBUTES[key].name}调整值${adj}超出±10范围。`);
                            return false;
                        }
                    }
                }
                return true;
            }
            case 1: {
                if (!this.selectedOccupation) {
                    Terminal.printWarning('请选择一个职业。');
                    return false;
                }
                return true;
            }
            case 2: {
                if (this.profPointsRemaining > 0) {
                    Terminal.printWarning(`还有 ${this.profPointsRemaining} 点职业技能点未分配。`);
                    return false;
                }
                const occ = COCRules.OCCUPATIONS[this.selectedOccupation];
                if (occ && occ.creditRange) {
                    const creditAlloc = this.skillAllocations['信用评级'];
                    const currentCredit = creditAlloc ? creditAlloc.base + creditAlloc.added : 0;
                    if (currentCredit < occ.creditRange[0]) {
                        Terminal.printWarning(`信用评级(${currentCredit})低于职业最低要求(${occ.creditRange[0]})。请分配更多点数到信用评级。`);
                        return false;
                    }
                    if (currentCredit > occ.creditRange[1]) {
                        Terminal.printWarning(`信用评级(${currentCredit})超过职业最高限制(${occ.creditRange[1]})。请减少信用评级的点数。`);
                        return false;
                    }
                }
                return true;
            }
            case 3: return true;
            case 4: {
                const name = document.getElementById('char-name')?.value?.trim();
                if (!name) {
                    Terminal.printWarning('请输入角色姓名。');
                    return false;
                }
                return true;
            }
            default: return true;
        }
    },

    finishCreation() {
        const attrs = this.getCurrentAttrs();
        if (!attrs) return;

        const toNum = (v) => { const n = Number(v); return isNaN(n) ? 0 : n; };

        for (const key of Object.keys(COCRules.ATTRIBUTES)) {
            attrs[key] = toNum(attrs[key]);
        }
        if (attrs.luck !== undefined) attrs.luck = toNum(attrs.luck);

        const derived = COCRules.calculateDerivedValues(attrs);
        const skills = this.buildSkillMap();

        const name = this.characterData.name || document.getElementById('char-name')?.value?.trim() || this.selectedOccupation || '调查员';
        const age = this.characterData.age || parseInt(document.getElementById('char-age')?.value) || 25;
        const gender = this.characterData.gender || document.getElementById('char-gender')?.value || '未知';
        const nationality = this.characterData.nationality || document.getElementById('char-nationality')?.value || '中国';
        const residence = this.characterData.residence || document.getElementById('char-residence')?.value || '';
        const appearance = this.characterData.appearance || document.getElementById('char-appearance')?.value || '';
        const personality = this.characterData.personality || document.getElementById('char-personality')?.value || '';
        const belongings = this.characterData.belongings || document.getElementById('char-belongings')?.value || '';
        const background = this.characterData.background || document.getElementById('char-background')?.value || '';
        const cherished = this.characterData.cherished || document.getElementById('char-cherished')?.value || '';
        const connections = this.characterData.connections || document.getElementById('char-connections')?.value || '';
        const fears = this.characterData.fears || document.getElementById('char-fears')?.value || '';
        const creationMode = this.characterData.creationMode || document.getElementById('char-creation-mode')?.value || 'full';

        const finalAttrs = COCRules.applyAgeModifiers(attrs, age);
        for (const key of Object.keys(COCRules.ATTRIBUTES)) {
            finalAttrs[key] = toNum(finalAttrs[key]);
        }
        if (finalAttrs.luck !== undefined) finalAttrs.luck = toNum(finalAttrs.luck);

        var cmValue = skills['克苏鲁神话'] || 0;
        const finalDerived = COCRules.calculateDerivedValues(finalAttrs, cmValue);

        const character = {
            id: Utils.generateId(),
            name, age, gender, nationality, residence,
            appearance, personality, belongings,
            occupation: this.selectedOccupation,
            background, cherished, connections, fears, creationMode,
            portraitSrc: this.characterData.portraitSrc || '',
            ageAdjustmentSummary: this.getAgeModifierSummary(attrs, age),
            ...finalAttrs,
            luck: toNum(finalAttrs.luck) || toNum(attrs.luck),
            ...finalDerived,
            creditRating: skills['信用评级'] || 0,
            skills,
            createdAt: new Date().toISOString()
        };

        var dodgeBase = Math.floor(toNum(finalAttrs.dex) / 2);
        var dodgeAllocated = skills['闪避'] ? skills['闪避'] - Math.floor(toNum(attrs.dex) / 2) : 0;
        character.skills['闪避'] = dodgeBase + Math.max(0, dodgeAllocated);

        var langBase = toNum(finalAttrs.edu);
        var langAllocated = skills['语言（母语）'] ? skills['语言（母语）'] - toNum(attrs.edu) : 0;
        var nativeLangValue = langBase + Math.max(0, langAllocated);

        var natEntry = this.NATIONALITIES.find(function(n) { return n.name === nationality; });
        var nativeLangName = natEntry ? natEntry.language : '中文';
        var nativeSkillKey = '语言（母语-' + nativeLangName + '）';

        delete character.skills['语言（母语）'];
        character.skills[nativeSkillKey] = nativeLangValue;
        character.nativeLanguage = nativeLangName;

        if (creationMode === 'quick' || !character.background) {
            this.autoFillNarrativeFields(character);
        }

        Character.current = character;
        Main.gameState.character = character;
        Character.save();
        Main.gameState.isIntroNarrative = true;
        Main.updateSidebar();
        Main.updateStatusBar();

        this.close();

        Terminal.printSuccess(`角色 ${name} 创建完成！`);
        Terminal.printCharacterCard(character);

        if (creationMode === 'quick') {
            Terminal.printSystem('快速模式：已根据职业自动生成背景信息。');
        }

        var hasModuleNarrative = typeof Story !== 'undefined'
            && Story.state
            && (Story.state.introNarrative || (Story.state.modData && (Story.state.modData.openingNarrative || Story.state.modData.introNarrative)));

        if (hasModuleNarrative) {
            var narrative = Story.state.introNarrative || Story.state.modData.openingNarrative || Story.state.modData.introNarrative;
            Terminal.printSystem('━━━ 剧本开场 ━━━');
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
            if (typeof Main !== 'undefined') {
                Main.gameState.isIntroNarrative = false;
                Main.autoSave();
            }
            Terminal.printSystem('冒险已经开始。输入你的行动吧。');
        } else {
            Terminal.printSystem('正在生成导入叙事...');
            Terminal.printSystem('你可以直接输入行动，或等待守秘人完成开场叙事。');

            if (typeof Main !== 'undefined' && Main.generateIntroNarrative) {
                Main.generateIntroNarrative();
            }
        }
    },

    NARRATIVE_TEMPLATES: {
        '会计师': { cherished: '一枚祖父留下的金怀表', background: '在伦敦一家老牌会计师事务所工作，每天与数字和账簿为伴', fears: '害怕失控，害怕账目对不上的那种不安', connections: '事务所合伙人、几个长期客户' },
        '杂技演员': { cherished: '一副磨得发亮的空中飞人把手', background: '在巡回马戏团表演空中飞人，走南闯北见惯了世面', fears: '害怕坠落，害怕那一次失手', connections: '马戏团团长、搭档表演者' },
        '演员': { cherished: '一张首演的戏票存根', background: '在西区剧院演出，沉浸于角色之中有时分不清戏与现实', fears: '害怕被遗忘，害怕谢幕后空荡荡的剧场', connections: '剧团导演、同台演员' },
        '古物学者': { cherished: '一枚刻有未知符文的古币', background: '在大英博物馆从事古物鉴定工作，对古代文明有着近乎偏执的热情', fears: '害怕某些古物上铭刻的符号并非人类所造', connections: '博物馆馆长、古董商同行' },
        '古董商': { cherished: '一面据称属于伊丽莎白时代的银镜', background: '在旧城区经营一家古董店，货源渠道鱼龙混杂', fears: '害怕某些古物会引来不该来的东西', connections: '拍卖行联络人、几个收藏家常客' },
        '考古学家': { cherished: '一把在美索不达米亚发掘的青铜匕首', background: '曾在中东和北非进行田野考古，对失落文明有第一手经验', fears: '害怕发掘出的不只是人类的历史', connections: '大学考古系同事、当地向导' },
        '建筑师': { cherished: '父亲留下的制图工具套装', background: '在一家建筑事务所工作，擅长哥特复兴风格设计', fears: '害怕某些古老建筑的几何比例中隐藏着非人的意图', connections: '事务所合伙人、几个老客户' },
        '艺术家': { cherished: '一幅未完成的自画像', background: '在蒙帕纳斯租了一间画室，靠卖画和插图维生', fears: '害怕灵感枯竭，害怕画中出现的不是自己画的东西', connections: '画廊老板、几个同侪画家' },
        '精神病院看护': { cherished: '一本记录病人故事的笔记本', background: '在阿卡姆精神病院工作多年，见过太多无法解释的精神崩溃', fears: '害怕某些病人的呓语并非疯狂而是真相', connections: '主治医师、几个长期病患' },
        '运动员': { cherished: '一面大学运动会金牌', background: '曾是大学田径队的明星选手，退役后靠教练工作维生', fears: '害怕身体衰退，害怕失去力量', connections: '前教练、体育俱乐部成员' },
        '作家': { cherished: '一台老式打字机', background: '靠写恐怖小说和杂志专栏维生，常在深夜独自写作', fears: '害怕写出的故事并非虚构', connections: '出版商编辑、几个笔友' },
        '酒保': { cherished: '一只从老主顾那里继承的威士忌酒杯', background: '在码头区的酒吧工作，听惯了水手们的奇闻异事', fears: '害怕某些酒客讲的不是醉话', connections: '酒吧老板、几个常客' },
        '猎人': { cherished: '祖父的猎枪', background: '在乡间以狩猎和向导为生，对森林了如指掌', fears: '害怕森林深处有不该存在的东西', connections: '当地护林员、镇上猎友' },
        '书商': { cherished: '一本手抄的罕见诗集', background: '在旧城区经营一家小书店，专门收集珍稀版本和绝版书', fears: '害怕某些书页间夹着不该被阅读的文字', connections: '藏书家圈子、几个供应商' },
        '赏金猎人': { cherished: '一枚警徽——前搭档留下的', background: '靠追踪逃犯和寻找失踪者维生，游走在法律边缘', fears: '害怕追捕的目标并非人类', connections: '警局线人、几个同行' },
        '拳击手': { cherished: '一条冠军腰带的老照片', background: '曾在地下拳场打拳，靠拳头和胆量在贫民区生存', fears: '害怕拳头打不到的东西', connections: '拳击教练、赌注经纪人' },
        '管家/仆人': { cherished: '一封主人手写的推荐信', background: '在贵族家庭服务多年，对主人家族的秘密了如指掌', fears: '害怕宅邸深夜的异响', connections: '主人一家、其他仆人' },
        '神职人员': { cherished: '一本翻旧的祈祷书', background: '在教区教堂服务多年，是信众信赖的精神导师', fears: '害怕某些古老的经文并非指向光明', connections: '主教、教区信众' },
        '工匠': { cherished: '一套祖传的木工工具', background: '在镇上经营一家手工作坊，手艺精湛远近闻名', fears: '害怕某些委托的图案不该被制造出来', connections: '行会成员、老主顾' },
        '罪犯-窃贼': { cherished: '一根开锁用的细铁丝', background: '在地下世界混迹多年，靠一双巧手和灵敏的耳朵吃饭', fears: '害怕打开不该打开的东西', connections: '销赃人、地下圈子同伙' },
        '罪犯-欺诈师': { cherished: '一套做工精良的假身份证明', background: '以伪装和话术为生，游走于上流社会骗取信任', fears: '害怕骗到不该骗的人', connections: '几个搭档、地下钱庄' },
        '罪犯-打手': { cherished: '一双指关节磨出老茧的拳头', background: '在黑帮中靠暴力吃饭，头脑简单但忠诚可靠', fears: '害怕暴力解决不了的东西', connections: '老大、几个兄弟' },
        '罪犯-走私者': { cherished: '一个暗格旅行箱', background: '在港口从事走私活动，对暗道和秘密路线了如指掌', fears: '害怕某些货物不该被运输', connections: '码头工头、海外买家' },
        '教团首领': { cherished: '一枚刻有星形图案的徽章', background: '领导一个隐秘教团，掌握着不为人知的仪式知识', fears: '害怕召唤来的东西超出掌控', connections: '教团核心成员、几个资助者' },
        '设计师': { cherished: '一本设计草图集', background: '在时尚界工作，为上流社会设计服装和装饰', fears: '害怕某些图案会引来注视', connections: '时尚杂志编辑、几个贵妇客户' },
        '潜水员': { cherished: '一枚从海底打捞的铜币', background: '从事水下打捞和勘探工作，见过海底不该存在的遗迹', fears: '害怕深水之下有古老的东西在等待', connections: '打捞公司老板、几个船员' },
        '医生': { cherished: '一台祖传的听诊器', background: '在镇上开诊所行医多年，见过太多无法解释的症状', fears: '害怕某些疾病并非来自自然', connections: '医院同事、几个老病患' },
        '流浪者': { cherished: '一条破旧但温暖的围巾', background: '漂泊无定所，在各地流浪谋生，见多识广却无处为家', fears: '害怕永远找不到归处', connections: '收容所管理者、路上结识的旅伴' },
        '私人司机': { cherished: '一枚老爷车钥匙', background: '为富裕家庭担任私人司机，见惯了主人的秘密', fears: '害怕深夜送主人去的那些地方', connections: '主人一家、车行老板' },
        '出租车司机': { cherished: '一张城市地图——上面标着只有自己懂的记号', background: '在城里开出租车多年，对每条街巷了如指掌', fears: '害怕某些乘客要去的地方不在地图上', connections: '出租车行老板、几个同行' },
        '编辑': { cherished: '一支红色编辑笔', background: '在报社担任编辑，每天审阅大量来稿和新闻', fears: '害怕某些投稿不是人类写的', connections: '主编、几个记者' },
        '政府官员': { cherished: '一枚部门徽章', background: '在政府部门任职，处理各种行政事务和机密文件', fears: '害怕某些档案不该被阅读', connections: '上司、几个同僚' },
        '工程师': { cherished: '一把精密的卡尺', background: '在工程公司从事设计和建造工作，擅长机械和结构', fears: '害怕某些结构的几何比例不符合人类工程学', connections: '项目经理、几个技术员' },
        '艺人': { cherished: '一把磨损的乐器', background: '在酒馆和剧院演出为生，用音乐和表演打动人心', fears: '害怕某些旋律不是自己演奏的', connections: '经纪人、几个同行' },
        '探险家': { cherished: '一张标注了未知区域的地图', background: '曾深入亚马逊和撒哈拉探险，对未知之地有着不可遏制的渴望', fears: '害怕某些未知不该被探索', connections: '地理学会成员、几个探险搭档' },
        '农民': { cherished: '一袋祖传的种子', background: '世代务农，对土地和季节有着本能的感知', fears: '害怕土地下埋着不该被翻出来的东西', connections: '邻居农户、镇上商人' },
        '联邦探员': { cherished: '一枚联邦调查局徽章', background: '在联邦调查局工作，负责调查跨州犯罪和可疑组织', fears: '害怕某些组织的势力超出想象', connections: '上级主管、几个线人' },
        '消防员': { cherished: '一顶被烟火熏黑的头盔', background: '在消防队工作多年，见过各种火灾和救援现场', fears: '害怕某些火焰不是自然产生的', connections: '消防队长、几个队友' },
        '驻外记者': { cherished: '一台战地相机', background: '曾在欧洲和远东担任战地记者，见过太多动荡与死亡', fears: '害怕某些真相写出来也没人相信', connections: '报社主编、几个当地联络人' },
        '法医': { cherished: '一把手术刀', background: '在法医鉴定中心工作，与死亡和真相打交道', fears: '害怕某些死因无法用科学解释', connections: '警探搭档、实验室同事' },
        '赌徒': { cherished: '一枚幸运骰子', background: '在赌场和地下牌局谋生，靠运气和读心术吃饭', fears: '害怕运气终有用尽的一天', connections: '赌场荷官、几个赌友' },
        '黑帮老大': { cherished: '一枚金戒指', background: '掌控着城市的地下世界，靠暴力和人脉维持势力', fears: '害怕失去控制，害怕暗处的敌人', connections: '几个头目、警察内线' },
        '绅士/淑女': { cherished: '一枚家族徽章戒指', background: '出身名门望族，拥有丰厚家产和广泛人脉', fears: '害怕家族的荣耀背后隐藏着不可告人的秘密', connections: '家族成员、社交圈名流' },
        '勤杂护工': { cherished: '一双耐磨的工作手套', background: '在医院做勤杂工作，打扫、搬运、照料杂务', fears: '害怕深夜值班时太平间的异响', connections: '护士长、几个同事' },
        '调查记者': { cherished: '一本加密的采访笔记', background: '专门调查社会黑暗面和不公事件，以揭露真相为使命', fears: '害怕追查到某些真相后无法回头', connections: '线人网络、编辑' },
        '法官': { cherished: '一把法槌', background: '在法院任职多年，以公正严明著称', fears: '害怕某些案件背后有超越法律的势力', connections: '律师同行、检察官' },
        '实验室助理': { cherished: '一本实验记录簿', background: '在大学实验室工作，协助教授进行各种实验', fears: '害怕某些实验结果不该被记录', connections: '指导教授、几个研究生' },
        '非熟练工人': { cherished: '一双磨破的工作靴', background: '在工厂和建筑工地做体力活，靠双手养家', fears: '害怕受伤后无法再工作', connections: '工头、几个工友' },
        '律师': { cherished: '一本法律典籍', background: '在律师事务所执业，擅长刑事辩护', fears: '害怕为某些客户辩护会引火烧身', connections: '法官、几个客户' },
        '图书管理员': { cherished: '一本家传的初版《鲁拜集》', background: '在阿卡姆公立图书馆工作，负责古籍整理和编目', fears: '害怕被遗忘，害怕某些禁书区不该被打开', connections: '图书馆馆长、常来借书的大学教授' },
        '技师': { cherished: '一把多功能扳手', background: '在修理厂工作，擅长维修各种机械设备', fears: '害怕某些机器的运转方式不符合物理定律', connections: '修理厂老板、几个客户' },
        '军官': { cherished: '一枚军功勋章', background: '从军多年，经历过战火洗礼，以服从命令为天职', fears: '害怕战场上的某些东西比敌人更可怕', connections: '老战友、上级军官' },
        '传教士': { cherished: '一本翻旧的圣经', background: '在偏远地区传教，为信众带去信仰和希望', fears: '害怕某些地方的黑暗连信仰也无法驱散', connections: '教会总部、当地信众' },
        '登山家': { cherished: '一面插在峰顶的旗帜', background: '征服过多座高峰，对极限环境有着丰富经验', fears: '害怕山巅之上存在不属于这个世界的东西', connections: '登山俱乐部、几个攀登搭档' },
        '博物馆管理员': { cherished: '一把展柜钥匙', background: '在博物馆负责展品管理和安保工作', fears: '害怕某些展品在夜间会自行移动', connections: '博物馆馆长、保安同事' },
        '音乐家': { cherished: '一把调音精准的小提琴', background: '在交响乐团演奏，对音乐有着近乎虔诚的热爱', fears: '害怕某些和声会引来不该来的听众', connections: '指挥家、乐团同事' },
        '护士': { cherished: '一枚南丁格尔誓言胸针', background: '在医院工作多年，照料过无数病患', fears: '害怕某些病患的症状不是医学能解释的', connections: '主治医生、几个护士同事' },
        '神秘学家': { cherished: '一本手抄的仪轨笔记', background: '毕生研究神秘学和超自然现象，掌握着常人不知的知识', fears: '害怕知道得太多', connections: '秘密学会成员、几个同好' },
        '药剂师': { cherished: '一台精密的天平', background: '在药房工作，精通各种药物和化学制剂', fears: '害怕某些配方不该被配制', connections: '供货商、几个老主顾' },
        '摄影师': { cherished: '一台老式折叠相机', background: '以摄影为业，擅长拍摄建筑和人物肖像', fears: '害怕某些照片中出现了镜头前不存在的东西', connections: '报社图片编辑、几个客户' },
        '飞行员': { cherished: '一副飞行员护目镜', background: '曾在空军服役，退役后从事民用航空', fears: '害怕在高空中遇到不该出现的东西', connections: '航空公司同事、几个老战友' },
        '警探': { cherished: '一枚警徽', background: '在警局重案组工作，以敏锐的直觉和执着著称', fears: '害怕某些案件没有凶手——或者凶手不是人类', connections: '搭档、线人网络' },
        '巡警': { cherished: '一支警棍', background: '在辖区巡逻多年，对每条街巷的异常都了然于胸', fears: '害怕深夜巡逻时遇到无法解释的事', connections: '警长、辖区居民' },
        '私家侦探': { cherished: '父亲留下的放大镜', background: '退役军人转行做私家侦探，靠接离婚案和失踪案维生', fears: '害怕黑暗中的枪声，战场创伤后遗症', connections: '警局里的老相识、几个常客' },
        '教授': { cherished: '一本注满批注的学术著作', background: '在大学任教多年，是本领域的权威学者', fears: '害怕某些学术发现会颠覆已知的世界观', connections: '系主任、几个研究生' },
        '精神病学家': { cherished: '一本弗洛伊德《梦的解析》初版', background: '在精神病院从事临床研究和治疗工作', fears: '害怕某些病人的潜意识中存在非人的东西', connections: '医院院长、几个同行' },
        '研究员': { cherished: '一沓研究笔记', background: '在研究所从事专题研究，对细节有着偏执的追求', fears: '害怕某些研究数据指向不可能的结论', connections: '导师、研究团队' },
        '海员': { cherished: '一个航海罗盘', background: '在远洋货轮上工作多年，见过大海的各种面目', fears: '害怕某些海域不该被航行', connections: '船长、几个老船员' },
        '推销员': { cherished: '一本客户名册', background: '走街串巷推销各种商品，练就了一副好口才', fears: '害怕推销到不该去的地方', connections: '公司经理、几个大客户' },
        '科学家': { cherished: '一台显微镜', background: '在实验室从事科学研究，以理性和实证为信仰', fears: '害怕某些实验结果动摇理性的根基', connections: '学术期刊编辑、几个合作者' },
        '秘书': { cherished: '一本速记本', background: '在大型企业担任秘书，处理各种文件和日程', fears: '害怕某些文件中的内容不该被看到', connections: '上司、办公室同事' },
        '士兵': { cherished: '一条军牌', background: '在军队服役，经历过实战，以服从和勇气为信条', fears: '害怕战场上的某些东西比敌军更可怕', connections: '班长、几个战友' },
        '间谍': { cherished: '一枚伪装用的假护照', background: '为情报机构工作，以各种身份潜伏收集情报', fears: '害怕身份暴露，害怕发现不该知道的秘密', connections: '联络人、几个情报源' },
        '学生': { cherished: '一支钢笔', background: '在大学求学，对知识有着饥渴般的好奇心', fears: '害怕学到的某些知识会改变自己', connections: '导师、几个同学' },
        '替身演员': { cherished: '一副护膝', background: '在电影片场做替身，靠身体和胆量吃饭', fears: '害怕某次特技会弄假成真', connections: '动作指导、几个同行' },
        '部落成员': { cherished: '一根图腾柱上的羽毛', background: '在偏远部落长大，对自然和灵界有着本能的敬畏', fears: '害怕森林深处的禁忌之地', connections: '部落长老、几个族人' },
        '殡葬师': { cherished: '一枚银质领带夹', background: '经营殡葬业务多年，与死亡朝夕相处', fears: '害怕某些遗体在夜间并不安详', connections: '教堂牧师、几个供应商' },
        '服务生': { cherished: '一枚客人留下的小费硬币', background: '在餐厅当服务生，靠微薄的收入和客人的小费维生', fears: '害怕某些客人的眼神', connections: '餐厅老板、几个同事' }
    },

    autoFillNarrativeFields(character) {
        const occ = character.occupation;
        const template = this.NARRATIVE_TEMPLATES[occ] || this.generateGenericBackground(character);

        if (!character.cherished) character.cherished = template.cherished;
        if (!character.background) character.background = template.background;
        if (!character.fears) character.fears = template.fears;
        if (!character.connections) character.connections = template.connections;
        if (!character.appearance) character.appearance = template.appearance || '';
        if (!character.personality) character.personality = template.personality || '';
        if (!character.belongings) character.belongings = template.belongings || '';
    },

    generateGenericBackground(character) {
        const occ = character.occupation || '调查员';
        return {
            cherished: '一件随身携带的旧物',
            background: `以${occ}的身份在这个世界上生存，见过太多常人不会遇到的事`,
            fears: '害怕未知，害怕自己知道得太多',
            connections: '几个可以信赖的朋友'
        };
    },

    generatePortrait() {
        var self = this;
        var name = this.characterData.name || document.getElementById('char-name')?.value?.trim() || '调查员';
        var gender = this.characterData.gender || document.getElementById('char-gender')?.value || '男';
        var age = this.characterData.age || document.getElementById('char-age')?.value || '25';
        var appearance = this.characterData.appearance || document.getElementById('char-appearance')?.value || '';
        var occupation = this.selectedOccupation || '调查员';
        var nationality = this.characterData.nationality || document.getElementById('char-nationality')?.value || '';

        if (typeof ImageGenerator === 'undefined') {
            Terminal.printWarning('图像生成模块未加载，无法生成立绘。');
            return;
        }

        var config = Settings.currentConfig ? Settings.currentConfig.image_api : null;
        if (!config) {
            Terminal.printWarning('请先在设置中配置图像生成API。');
            return;
        }

        var portraitArea = document.getElementById('char-portrait-area');
        if (portraitArea) {
            portraitArea.innerHTML = '<span style="font-size:11px;color:var(--text-secondary);">生成中...</span>';
        }

        var prompt = 'COC克苏鲁的呼唤1920年代风格角色立绘，';
        prompt += gender + '性，';
        prompt += age + '岁，';
        if (nationality && nationality !== '未知') prompt += nationality + '人，';
        prompt += occupation + '职业，';
        if (appearance) prompt += appearance + '，';
        prompt += '暗色调，哥特风格，半身像，高清细节，油画质感';

        var mode = config.mode || 'api';

        function onPortraitSuccess(record) {
            if (record.images && record.images.length > 0) {
                var src = ImageGenerator.getImageSrc(record.images[0]);
                if (src && portraitArea) {
                    portraitArea.innerHTML = '';
                    var img = document.createElement('img');
                    img.src = src;
                    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:6px;';
                    img.alt = name + '立绘';
                    portraitArea.appendChild(img);
                    if (src.startsWith('data:')) {
                        self.characterData.portraitSrc = src;
                    } else {
                        ImageGenerator.convertUrlToBase64(src).then(function (b64) {
                            self.characterData.portraitSrc = b64;
                        }).catch(function () {
                            self.characterData.portraitSrc = src;
                        });
                    }
                }
                Terminal.printSuccess('角色立绘生成完成！');
            } else {
                if (portraitArea) portraitArea.innerHTML = '<span style="font-size:11px;color:var(--accent-red);">生成失败，点击重试</span>';
                if (typeof Terminal !== 'undefined' && Terminal.printError) Terminal.printError('立绘生成返回空结果，请重试。');
            }
        }

        function onPortraitError(e) {
            if (portraitArea) {
                portraitArea.innerHTML = '<span style="font-size:11px;color:var(--accent-red);">生成失败</span>';
            }
            Terminal.printError('立绘生成失败: ' + e.message);
        }

        if (mode === 'curl' && config.curl_command) {
            ImageGenerator.generateFromCurl(config.curl_command, { prompt: prompt, size: '512x768' })
                .then(onPortraitSuccess)
                .catch(onPortraitError);
        } else {
            ImageGenerator.generateFromAPI(prompt, { size: '512x768', quality: 'standard', n: 1 })
                .then(onPortraitSuccess)
                .catch(onPortraitError);
        }
    }
};
