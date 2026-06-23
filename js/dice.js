const DiceSystem = {
    modalEl: null,
    isRolling: false,
    enabled: true,

    DIFFICULTY_MULTIPLIERS: {
        '普通': 1,
        '困难': 0.5,
        '极难': 0.2,
        '临界': 0.1,
        '???': 1
    },

    init() {
        this.modalEl = document.getElementById('dice-modal');
        const settingEl = document.getElementById('setting-dice-animation');
        if (settingEl) {
            this.enabled = settingEl.checked;
            settingEl.addEventListener('change', () => {
                this.enabled = settingEl.checked;
            });
        }
    },

    async requestOpenRoll(skillName, targetValue, difficulty = '普通', penaltyDice = 0, bonusDice = 0) {
        if (!this.enabled || !this.modalEl) {
            return this._instantRoll(skillName, targetValue, false, penaltyDice, bonusDice, difficulty);
        }
        return this._showDiceModal(skillName, targetValue, difficulty, false, penaltyDice, bonusDice);
    },

    async requestHiddenRoll(skillName, targetValue, penaltyDice = 0, bonusDice = 0) {
        if (!this.enabled || !this.modalEl) {
            return this._instantRoll(skillName, targetValue, true, penaltyDice, bonusDice, '???');
        }
        return this._showDiceModal(skillName, targetValue, '???', true, penaltyDice, bonusDice);
    },

    // SAN损失结算：含大成功(01→0损失)与大失败(100→失败公式取上限)房规，COC7e大失败为RAW
    _computeSANLoss(roll, currentSAN, sanLossFormula) {
        var passed = roll <= currentSAN;
        var crit = roll === 1;
        var fumble = roll === 100;
        var maxOf = function(formula) {
            if (typeof formula === 'number') return formula;
            var m = String(formula).match(/(\d+)D(\d+)([+-]\d+)?/i);
            if (!m) return parseInt(formula, 10) || 0;
            return parseInt(m[1]) * parseInt(m[2]) + (m[3] ? parseInt(m[3]) : 0);
        };
        var successPart = null, failPart = null;
        if (typeof sanLossFormula === 'string' && sanLossFormula.includes('/')) {
            successPart = sanLossFormula.split('/')[0];
            failPart = sanLossFormula.split('/')[1];
        }
        var loss;
        if (crit) {
            loss = 0;
        } else if (fumble) {
            loss = failPart !== null ? maxOf(failPart) :
                (typeof sanLossFormula === 'number' ? sanLossFormula * 2 : maxOf(sanLossFormula) * 2);
        } else if (passed) {
            loss = successPart !== null ? Utils.rollFormula(successPart).total :
                (typeof sanLossFormula === 'number' ? sanLossFormula : Utils.rollFormula(sanLossFormula).total);
        } else {
            loss = failPart !== null ? Utils.rollFormula(failPart).total :
                (typeof sanLossFormula === 'number' ? sanLossFormula * 2 : Utils.rollFormula(sanLossFormula).total * 2);
        }
        return { passed: passed || crit, crit: crit, fumble: fumble, loss: loss };
    },

    async requestSANRoll(currentSAN, sanLossFormula) {
        if (!this.enabled || !this.modalEl) {
            return this._instantSANRoll(currentSAN, sanLossFormula);
        }
        return this._showSANModal(currentSAN, sanLossFormula);
    },

    async requestDamageRoll(weaponName, damageFormula, db) {
        if (!this.enabled || !this.modalEl) {
            return this._instantDamageRoll(weaponName, damageFormula, db);
        }
        return this._showDamageModal(weaponName, damageFormula, db);
    },

    async _showDiceModal(skillName, targetValue, difficulty, isHidden, penaltyDice, bonusDice) {
        var pDice = penaltyDice || 0;
        var bDice = bonusDice || 0;
        var netDice = bDice - pDice;
        var effectiveBonus = Math.max(0, netDice);
        var effectivePenalty = Math.max(0, -netDice);
        var diffMultiplier = this.DIFFICULTY_MULTIPLIERS[difficulty] || 1;
        var adjustedTarget = Math.max(1, Math.floor(targetValue * diffMultiplier));
        var self = this;
        return new Promise(resolve => {
            const modal = this.modalEl;
            modal.classList.add('active');

            const titleEl = modal.querySelector('.dice-modal-title');
            const targetEl = modal.querySelector('.dice-target');
            const diffEl = modal.querySelector('.dice-difficulty');
            const resultEl = modal.querySelector('.dice-result-text');
            const rollBtn = modal.querySelector('.dice-roll-btn');
            const continueBtn = modal.querySelector('.dice-continue-btn');
            const resultSection = modal.querySelector('.dice-result-section');
            const rollSection = modal.querySelector('.dice-roll-section');
            const tableArea = modal.querySelector('.dice-table-area');
            const d100Pair = modal.querySelector('#d100Pair');
            const diceShadow = modal.querySelector('#diceShadow');
            const diceResultOverlay = modal.querySelector('#diceResultOverlay');
            const checkLabel = modal.querySelector('#checkLabel');
            const impactRing = modal.querySelector('#impactRing');

            titleEl.textContent = isHidden ? `🕵️ ${skillName}检定（暗骰）` : `🎲 ${skillName}检定`;
            titleEl.className = 'dice-modal-title' + (isHidden ? ' hidden' : '');

            targetEl.textContent = isHidden ? '目标值：???' : `目标值：${adjustedTarget}` + (diffMultiplier !== 1 ? `（原${targetValue}×${difficulty}）` : '') + (effectiveBonus > 0 ? `（奖励骰×${effectiveBonus}）` : '') + (effectivePenalty > 0 ? `（惩罚骰×${effectivePenalty}）` : '');
            diffEl.textContent = isHidden ? '难度：???' : `难度：${difficulty}`;

            resultSection.style.display = 'none';
            rollSection.style.display = 'block';
            rollBtn.style.display = 'block';
            rollBtn.disabled = false;
            rollBtn.textContent = '🎯 点击投掷';
            continueBtn.style.display = 'none';

            tableArea.classList.remove('rolling');
            d100Pair.classList.remove('visible');
            diceShadow.classList.remove('visible');
            diceResultOverlay.className = 'dice-result-overlay';
            checkLabel.className = 'check-label';
            impactRing.className = 'impact-ring';

            rollBtn.onclick = async () => {
                if (this.isRolling) return;
                this.isRolling = true;
                rollBtn.disabled = true;
                rollBtn.textContent = '投掷中...';

                const roll = Utils.rollWithBonusPenalty(effectiveBonus, effectivePenalty);
                const result = self._determineResult(roll, adjustedTarget, targetValue);

                await this._play3DRollAnimation(roll, isHidden);

                if (isHidden) {
                    diceResultOverlay.className = 'dice-result-overlay';
                    checkLabel.className = 'check-label';

                    resultSection.style.display = 'block';
                    resultEl.textContent = '检定完成';
                    resultEl.className = 'dice-result-text hidden-result';
                    targetEl.textContent = 'KP 已将结果融入叙事……';
                } else {
                    const levelNames = {
                        critical: '大成功！',
                        success: result.successLevel === 3 ? '极难成功' : result.successLevel === 2 ? '困难成功' : '普通成功',
                        failure: '失败',
                        fumble: '大失败！'
                    };

                    let labelClass;
                    if (result.result === 'critical') labelClass = 'critical-success';
                    else if (result.result === 'success') labelClass = 'success';
                    else if (result.result === 'fumble') labelClass = 'fumble';
                    else labelClass = 'failure';

                    setTimeout(() => {
                        checkLabel.textContent = levelNames[result.result];
                        checkLabel.className = `check-label ${labelClass} show`;
                    }, 300);

                    resultSection.style.display = 'block';
                    resultEl.textContent = levelNames[result.result];
                    resultEl.className = 'dice-result-text ' + result.result;
                    targetEl.textContent = `投出：${roll} / 目标：${adjustedTarget}` + (diffMultiplier !== 1 ? `（原${targetValue}）` : '');
                }

                rollBtn.style.display = 'none';
                continueBtn.style.display = 'block';

                continueBtn.onclick = () => {
                    modal.classList.remove('active');
                    self.isRolling = false;
                    resolve({
                        roll,
                        targetValue,
                        adjustedTarget,
                        skillName,
                        result: result.result,
                        successLevel: result.successLevel,
                        isHidden,
                        hardTarget: Math.floor(adjustedTarget * 0.5),
                        extremeTarget: Math.floor(adjustedTarget * 0.2),
                        bonusDice: effectiveBonus,
                        penaltyDice: effectivePenalty
                    });
                };
            };
        });
    },

    async _showSANModal(currentSAN, sanLossFormula) {
        var self = this;
        return new Promise(resolve => {
            const modal = this.modalEl;
            modal.classList.add('active');

            const titleEl = modal.querySelector('.dice-modal-title');
            const targetEl = modal.querySelector('.dice-target');
            const diffEl = modal.querySelector('.dice-difficulty');
            const resultEl = modal.querySelector('.dice-result-text');
            const rollBtn = modal.querySelector('.dice-roll-btn');
            const continueBtn = modal.querySelector('.dice-continue-btn');
            const resultSection = modal.querySelector('.dice-result-section');
            const rollSection = modal.querySelector('.dice-roll-section');
            const tableArea = modal.querySelector('.dice-table-area');
            const d100Pair = modal.querySelector('#d100Pair');
            const diceShadow = modal.querySelector('#diceShadow');
            const diceResultOverlay = modal.querySelector('#diceResultOverlay');
            const checkLabel = modal.querySelector('#checkLabel');
            const impactRing = modal.querySelector('#impactRing');

            titleEl.textContent = '💀 SAN检定';
            titleEl.className = 'dice-modal-title san';

            targetEl.textContent = `当前SAN：${currentSAN}`;
            diffEl.textContent = `损失公式：${sanLossFormula}`;

            resultSection.style.display = 'none';
            rollSection.style.display = 'block';
            rollBtn.style.display = 'block';
            rollBtn.disabled = false;
            rollBtn.textContent = '🎯 点击投掷';
            continueBtn.style.display = 'none';

            tableArea.classList.remove('rolling');
            d100Pair.classList.remove('visible');
            diceShadow.classList.remove('visible');
            diceResultOverlay.className = 'dice-result-overlay';
            checkLabel.className = 'check-label';
            impactRing.className = 'impact-ring';

            rollBtn.onclick = async () => {
                rollBtn.disabled = true;
                rollBtn.textContent = '投掷中...';

                const roll = Utils.rollD100();
                const sanOutcome = this._computeSANLoss(roll, currentSAN, sanLossFormula);
                const passed = sanOutcome.passed;
                const loss = sanOutcome.loss;

                const newSAN = Math.max(0, currentSAN - loss);
                const insanityTriggered = loss >= 5;
                var insanityType = '';

                if (insanityTriggered) {
                    var char = (typeof Main !== 'undefined' && Main.gameState && Main.gameState.character) ? Main.gameState.character : null;
                    if (char && char.int) {
                        var intRoll = Utils.rollD100();
                        var intPassed = intRoll <= char.int;
                        insanityType = intPassed ? 'brief' : 'indefinite';
                    } else {
                        insanityType = 'brief';
                    }
                }

                await this._play3DRollAnimation(roll, false);

                let labelClass = sanOutcome.crit ? 'critical' : (sanOutcome.fumble ? 'fumble' : (passed ? 'success' : 'failure'));
                setTimeout(() => {
                    checkLabel.textContent = sanOutcome.crit ? '大成功！' : (sanOutcome.fumble ? '大失败！' : (passed ? '检定通过' : '检定失败'));
                    checkLabel.className = `check-label ${labelClass} show`;
                }, 300);

                var insanityText = '';
                var madnessResult = null;
                var insanityDuration = null;
                if (insanityTriggered) {
                    if (typeof COCRules !== 'undefined' && COCRules.rollInsanity) {
                        madnessResult = COCRules.rollInsanity(insanityType);
                    }
                    if (insanityType === 'brief') {
                        insanityDuration = Utils.rollNDice(1, 10).total;
                        insanityText = ' ⚠ 短暂疯狂！（INT检定成功，持续' + insanityDuration + '轮）';
                    } else if (insanityType === 'indefinite') {
                        insanityDuration = Utils.rollNDice(1, 10).total;
                        insanityText = ' ⚠ 不定疯狂！（INT检定失败，持续' + insanityDuration + '小时）';
                    }
                    if (madnessResult) {
                        insanityText += ' 🎭' + madnessResult.name + '：' + madnessResult.desc;
                    }
                }

                resultSection.style.display = 'block';
                resultEl.textContent = sanOutcome.crit ? `大成功（${roll}）— 心神不动，损失 0 点SAN` :
                    (sanOutcome.fumble ? `大失败（${roll}）— 损失 ${loss} 点SAN（上限）` :
                    (passed ? `检定通过 — 损失 ${loss} 点SAN` : `检定失败 — 损失 ${loss} 点SAN`));
                resultEl.className = 'dice-result-text ' + (passed ? 'success' : 'failure');
                targetEl.textContent = `SAN：${currentSAN} → ${newSAN}${insanityText}`;

                rollBtn.style.display = 'none';
                continueBtn.style.display = 'block';

                continueBtn.onclick = () => {
                    modal.classList.remove('active');
                    self.isRolling = false;
                    resolve({
                        roll,
                        passed,
                        loss,
                        newSAN,
                        crit: sanOutcome.crit,
                        fumble: sanOutcome.fumble,
                        insanityTriggered,
                        insanityType,
                        insanityDuration,
                        madnessResult,
                        wasINTCheck: insanityTriggered
                    });
                };
            };
        });
    },

    async _showDamageModal(weaponName, damageFormula, db) {
        var self = this;
        return new Promise(resolve => {
            const modal = this.modalEl;
            modal.classList.add('active');

            const titleEl = modal.querySelector('.dice-modal-title');
            const targetEl = modal.querySelector('.dice-target');
            const diffEl = modal.querySelector('.dice-difficulty');
            const resultEl = modal.querySelector('.dice-result-text');
            const rollBtn = modal.querySelector('.dice-roll-btn');
            const continueBtn = modal.querySelector('.dice-continue-btn');
            const resultSection = modal.querySelector('.dice-result-section');
            const rollSection = modal.querySelector('.dice-roll-section');
            const tableArea = modal.querySelector('.dice-table-area');
            const d100Pair = modal.querySelector('#d100Pair');
            const diceShadow = modal.querySelector('#diceShadow');
            const diceResultOverlay = modal.querySelector('#diceResultOverlay');
            const checkLabel = modal.querySelector('#checkLabel');
            const impactRing = modal.querySelector('#impactRing');

            titleEl.textContent = `⚔️ ${weaponName} 伤害投掷`;
            titleEl.className = 'dice-modal-title damage';

            targetEl.textContent = `伤害：${damageFormula}`;
            diffEl.textContent = `DB：${db}`;

            resultSection.style.display = 'none';
            rollSection.style.display = 'block';
            rollBtn.style.display = 'block';
            rollBtn.disabled = false;
            rollBtn.textContent = '🎯 点击投掷';
            continueBtn.style.display = 'none';

            tableArea.classList.remove('rolling');
            d100Pair.classList.remove('visible');
            diceShadow.classList.remove('visible');
            diceResultOverlay.className = 'dice-result-overlay';
            checkLabel.className = 'check-label';
            impactRing.className = 'impact-ring';

            rollBtn.onclick = async () => {
                rollBtn.disabled = true;
                rollBtn.textContent = '投掷中...';

                const weaponDamage = Utils.rollFormula(damageFormula).total;
                let dbValue = 0;
                if (typeof db === 'string' && db !== '0') {
                    dbValue = Utils.rollFormula(db.replace('+', '')).total;
                } else {
                    dbValue = Number(db) || 0;
                }
                const totalDamage = Math.max(1, weaponDamage + dbValue);

                await this._play3DRollAnimation(totalDamage, false, true);

                setTimeout(() => {
                    checkLabel.textContent = `${totalDamage} 点伤害`;
                    checkLabel.className = 'check-label fumble show';
                }, 300);

                resultSection.style.display = 'block';
                resultEl.textContent = `造成 ${totalDamage} 点伤害`;
                resultEl.className = 'dice-result-text damage';
                targetEl.textContent = `武器：${weaponDamage} + DB：${dbValue} = ${totalDamage}`;

                rollBtn.style.display = 'none';
                continueBtn.style.display = 'block';

                continueBtn.onclick = () => {
                    modal.classList.remove('active');
                    self.isRolling = false;
                    resolve({
                        weaponDamage,
                        dbValue,
                        totalDamage,
                        formula: damageFormula,
                        weaponName
                    });
                };
            };
        });
    },

    _instantRoll(skillName, targetValue, isHidden, penaltyDice, bonusDice, difficulty) {
        var bDice = bonusDice || 0;
        var pDice = penaltyDice || 0;
        var netDice = bDice - pDice;
        var effectiveBonus = Math.max(0, netDice);
        var effectivePenalty = Math.max(0, -netDice);
        var diffMultiplier = this.DIFFICULTY_MULTIPLIERS[difficulty] || 1;
        var adjustedTarget = Math.max(1, Math.floor(targetValue * diffMultiplier));
        const roll = Utils.rollWithBonusPenalty(effectiveBonus, effectivePenalty);
        const result = this._determineResult(roll, adjustedTarget, targetValue);

        if (typeof Terminal !== 'undefined' && !isHidden) {
            Terminal.printCheckResult({
                roll,
                targetValue,
                adjustedTarget,
                skillName,
                result: result.result,
                successLevel: result.successLevel,
                bonusDice: effectiveBonus,
                penaltyDice: effectivePenalty
            });
        }

        return Promise.resolve({
            roll,
            targetValue,
            adjustedTarget,
            skillName,
            result: result.result,
            successLevel: result.successLevel,
            isHidden,
            hardTarget: Math.floor(adjustedTarget * 0.5),
            extremeTarget: Math.floor(adjustedTarget * 0.2),
            bonusDice: effectiveBonus,
            penaltyDice: effectivePenalty
        });
    },

    _instantSANRoll(currentSAN, sanLossFormula) {
        const roll = Utils.rollD100();
        const sanOutcome = this._computeSANLoss(roll, currentSAN, sanLossFormula);
        const passed = sanOutcome.passed;
        const loss = sanOutcome.loss;
        if (typeof Terminal !== 'undefined') {
            if (sanOutcome.crit) Terminal.printSystem('🌟 SAN检定大成功（' + roll + '）：心神不动，损失 0 点。');
            if (sanOutcome.fumble) Terminal.printSystem('💀 SAN检定大失败（100）：损失取上限。');
        }

        const newSAN = Math.max(0, currentSAN - loss);
        var insanityTriggered = loss >= 5;
        var insanityType = '';
        var insanityDuration = null;
        var madnessResult = null;

        if (insanityTriggered) {
            var char = (typeof Main !== 'undefined' && Main.gameState && Main.gameState.character) ? Main.gameState.character : null;
            if (char && char.int) {
                var intRoll = Utils.rollD100();
                var intPassed = intRoll <= char.int;
                if (intPassed) {
                    insanityType = 'brief';
                    insanityDuration = Utils.rollNDice(1, 10).total;
                    if (typeof Terminal !== 'undefined') {
                        Terminal.printSystem('🧠 INT检定 ' + intRoll + '/' + char.int + ' — 成功 → 短暂疯狂（' + insanityDuration + '轮）');
                    }
                } else {
                    insanityType = 'indefinite';
                    insanityDuration = Utils.rollNDice(1, 10).total;
                    if (typeof Terminal !== 'undefined') {
                        Terminal.printSystem('🧠 INT检定 ' + intRoll + '/' + char.int + ' — 失败 → 不定疯狂（' + insanityDuration + '小时）');
                    }
                }
            } else {
                insanityType = 'brief';
                insanityDuration = Utils.rollNDice(1, 10).total;
            }

            if (typeof COCRules !== 'undefined' && COCRules.rollInsanity) {
                madnessResult = COCRules.rollInsanity(insanityType);
                if (typeof Terminal !== 'undefined') {
                    Terminal.printSystem('🎭 疯狂发作表（' + madnessResult.roll + '）：' + madnessResult.name + ' — ' + madnessResult.desc);
                }
            }
        }

        var sanMax = 99;
        if (typeof Main !== 'undefined' && Main.gameState && Main.gameState.character) {
            var c = Main.gameState.character;
            sanMax = (c.derived && c.derived.sanMax) ? c.derived.sanMax : 99;
        }

        if (typeof Terminal !== 'undefined') {
            Terminal.printSANLoss(newSAN, sanMax, loss);
        }

        return Promise.resolve({
            roll,
            passed,
            loss,
            newSAN,
            crit: sanOutcome.crit,
            fumble: sanOutcome.fumble,
            insanityTriggered,
            insanityType,
            insanityDuration,
            madnessResult,
            wasINTCheck: insanityTriggered
        });
    },

    _instantDamageRoll(weaponName, damageFormula, db) {
        const weaponDamage = Utils.rollFormula(damageFormula).total;
        let dbValue = 0;
        if (typeof db === 'string' && db !== '0') {
            dbValue = Utils.rollFormula(db.replace('+', '')).total;
        } else {
            dbValue = Number(db) || 0;
        }
        const totalDamage = Math.max(1, weaponDamage + dbValue);

        if (typeof Terminal !== 'undefined') {
            Terminal.printSystem(`⚔️ ${weaponName}：${damageFormula}${db ? '+' + db : ''} = ${totalDamage} 点伤害`);
        }

        return Promise.resolve({
            weaponDamage,
            dbValue,
            totalDamage,
            formula: damageFormula,
            weaponName
        });
    },

    _determineResult(roll, adjustedTarget, originalTarget) {
        var origTarget = originalTarget !== undefined ? originalTarget : adjustedTarget;
        if (roll <= 5 && roll >= 1) {
            return { result: 'critical', successLevel: 4 };
        }
        if (origTarget < 50 && roll >= 96) {
            return { result: 'fumble', successLevel: -1 };
        }
        if (origTarget >= 50 && roll >= 99) {
            return { result: 'fumble', successLevel: -1 };
        }
        if (roll <= adjustedTarget) {
            if (roll <= Math.floor(adjustedTarget * 0.2)) return { result: 'success', successLevel: 3 };
            if (roll <= Math.floor(adjustedTarget * 0.5)) return { result: 'success', successLevel: 2 };
            return { result: 'success', successLevel: 1 };
        }
        return { result: 'failure', successLevel: 0 };
    },

    async _play3DRollAnimation(finalValue, isHidden, isDamage = false) {
        const modal = this.modalEl;
        const tableArea = modal.querySelector('.dice-table-area');
        const d100Pair = modal.querySelector('#d100Pair');
        const tensCube = modal.querySelector('#tensCube');
        const unitsCube = modal.querySelector('#unitsCube');
        const diceShadow = modal.querySelector('#diceShadow');
        const diceResultOverlay = modal.querySelector('#diceResultOverlay');
        const impactRing = modal.querySelector('#impactRing');

        const theme = document.documentElement.getAttribute('data-theme') || 'detective';

        if (isHidden) {
            d100Pair.classList.add('visible');
            tableArea.classList.add('rolling');
            diceShadow.classList.add('visible');

            if (typeof SoundSystem !== 'undefined') {
                SoundSystem.play('dice_roll');
            }

            const tensFaces = [0, 1, 2, 3, 4, 5];
            const unitsFaces = [0, 1, 2, 3, 4, 5];
            this._setDieFaces(tensCube, tensFaces);
            this._setDieFaces(unitsCube, unitsFaces);

            tensCube.style.transform = 'rotateX(720deg) rotateY(360deg)';
            unitsCube.style.transform = 'rotateX(720deg) rotateY(360deg)';

            await Utils.delay(1800);

            tensCube.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            unitsCube.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            tensCube.style.transform = 'rotateX(0deg) rotateY(0deg)';
            unitsCube.style.transform = 'rotateX(0deg) rotateY(0deg)';

            this._setDieFaces(tensCube, ['?', '?', '?', '?', '?', '?']);
            this._setDieFaces(unitsCube, ['?', '?', '?', '?', '?', '?']);

            await Utils.delay(500);

            tensCube.style.transition = '';
            unitsCube.style.transition = '';
            return;
        }

        const tens = Math.floor(finalValue / 10) % 10;
        const units = finalValue % 10;

        const tensFaceVals = [tens, (tens + 1) % 10, (tens + 2) % 10, (tens + 3) % 10, (tens + 4) % 10, (tens + 5) % 10];
        const unitsFaceVals = [units, (units + 1) % 10, (units + 2) % 10, (units + 3) % 10, (units + 4) % 10, (units + 5) % 10];

        this._setDieFaces(tensCube, tensFaceVals);
        this._setDieFaces(unitsCube, unitsFaceVals);

        tableArea.classList.add('rolling');
        d100Pair.classList.add('visible');
        diceShadow.classList.add('visible');
        diceResultOverlay.className = 'dice-result-overlay';
        impactRing.className = 'impact-ring';

        if (typeof SoundSystem !== 'undefined') {
            SoundSystem.play('dice_roll');
        }

        const duration = theme === 'detective' ? 1600 : theme === 'cthulhu' ? 2000 : 1800;
        const startTime = performance.now();

        await new Promise(resolveAnim => {
            const animate = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);

                let eased;
                if (progress < 0.7) {
                    eased = 1 - Math.pow(1 - progress / 0.7, 2);
                } else {
                    const bounceProgress = (progress - 0.7) / 0.3;
                    eased = 1 - Math.exp(-8 * bounceProgress) * Math.cos(bounceProgress * Math.PI * 3) * 0.15;
                }

                let tensRotX, tensRotY, tensRotZ, unitsRotX, unitsRotY, unitsRotZ;
                let translateY, translateX;

                if (theme === 'detective') {
                    translateX = 180 * (1 - eased);
                    const dropPhase = Math.min(progress / 0.4, 1);
                    const dropEased = 1 - Math.pow(1 - dropPhase, 2);
                    translateY = -100 * (1 - dropEased);

                    if (progress > 0.4) {
                        const bp = (progress - 0.4) / 0.6;
                        const bounce = Math.exp(-6 * bp) * Math.sin(bp * Math.PI * 5) * 30;
                        translateY += bounce;
                    }

                    const spinDecay = 1 - Math.pow(progress, 0.5);
                    tensRotX = 1080 * progress + 360 * spinDecay * Math.sin(progress * 8);
                    tensRotY = 720 * progress + 180 * spinDecay * Math.cos(progress * 6);
                    tensRotZ = 90 * Math.sin(progress * Math.PI * 4) * spinDecay;

                    unitsRotX = 900 * progress + 360 * spinDecay * Math.sin(progress * 7 + 1);
                    unitsRotY = 540 * progress + 180 * spinDecay * Math.cos(progress * 5 + 2);
                    unitsRotZ = 70 * Math.sin(progress * Math.PI * 3.5 + 1) * spinDecay;

                } else if (theme === 'cthulhu') {
                    const risePhase = Math.min(progress / 0.5, 1);
                    const riseEased = risePhase < 1 ? 1 - Math.pow(1 - risePhase, 3) : 1;
                    translateY = 120 * (1 - riseEased);

                    if (progress > 0.5) {
                        const wp = (progress - 0.5) / 0.5;
                        const wobble = Math.exp(-4 * wp) * Math.sin(wp * Math.PI * 4) * 15;
                        translateY += wobble;
                    }

                    translateX = Math.sin(progress * Math.PI * 5) * 25 * (1 - eased);

                    const chaosDecay = 1 - Math.pow(progress, 0.4);
                    tensRotX = 1440 * progress + 540 * chaosDecay * Math.sin(progress * 10);
                    tensRotY = 1080 * progress + 360 * chaosDecay * Math.cos(progress * 8);
                    tensRotZ = 720 * progress * chaosDecay;

                    unitsRotX = 1260 * progress + 540 * chaosDecay * Math.sin(progress * 9 + 2);
                    unitsRotY = 900 * progress + 360 * chaosDecay * Math.cos(progress * 7 + 1);
                    unitsRotZ = 540 * progress * chaosDecay;

                    if (progress < 0.85) {
                        const flicker = 0.6 + Math.random() * 0.4;
                        d100Pair.style.filter = `brightness(${flicker})`;
                    } else {
                        d100Pair.style.filter = '';
                    }

                } else {
                    const dropPhase = Math.min(progress / 0.45, 1);
                    const dropEased = dropPhase < 1 ? 1 - Math.pow(1 - dropPhase, 2.5) : 1;
                    translateY = -130 * (1 - dropEased);

                    if (progress > 0.45) {
                        const bp = (progress - 0.45) / 0.55;
                        const bounce = Math.exp(-5 * bp) * Math.sin(bp * Math.PI * 3) * 18;
                        translateY += bounce;
                    }

                    translateX = Math.sin(progress * Math.PI * 2.5) * 12 * (1 - eased);

                    const spinDecay = 1 - Math.pow(progress, 0.6);
                    tensRotX = 720 * progress + 180 * spinDecay * Math.sin(progress * 5);
                    tensRotY = 540 * progress + 90 * spinDecay * Math.cos(progress * 4);
                    tensRotZ = 45 * Math.sin(progress * Math.PI * 2) * spinDecay;

                    unitsRotX = 900 * progress + 180 * spinDecay * Math.sin(progress * 4 + 1);
                    unitsRotY = 720 * progress + 90 * spinDecay * Math.cos(progress * 3 + 2);
                    unitsRotZ = 35 * Math.sin(progress * Math.PI * 2.5 + 1) * spinDecay;
                }

                tensCube.style.transform = `translateX(${(translateX || 0) * 0.5}px) translateY(${(translateY || 0) * 0.8}px) rotateX(${tensRotX}deg) rotateY(${tensRotY}deg) rotateZ(${tensRotZ || 0}deg)`;
                unitsCube.style.transform = `translateX(${(translateX || 0) * 0.5 + 8}px) translateY(${(translateY || 0) * 0.8 + 5}px) rotateX(${unitsRotX}deg) rotateY(${unitsRotY}deg) rotateZ(${unitsRotZ || 0}deg)`;

                const heightFactor = Math.max(0, -(translateY || 0)) / 130;
                const shadowScale = 1 + heightFactor * 0.5;
                const shadowOpacity = 0.4 - heightFactor * 0.2;
                diceShadow.style.transform = `translate(-50%, 0) scaleX(${shadowScale}) scaleY(${1 + heightFactor * 0.3})`;
                diceShadow.style.opacity = Math.max(0, shadowOpacity);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    tensCube.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    unitsCube.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    tensCube.style.transform = 'rotateX(0deg) rotateY(0deg)';
                    unitsCube.style.transform = 'rotateX(0deg) rotateY(0deg)';

                    d100Pair.style.filter = '';
                    diceShadow.style.transform = 'translate(-50%, 0) scaleX(1) scaleY(1)';
                    diceShadow.style.opacity = '0.4';

                    setTimeout(() => {
                        tensCube.style.transition = '';
                        unitsCube.style.transition = '';

                        diceResultOverlay.textContent = finalValue;
                        diceResultOverlay.classList.add('show');

                        impactRing.classList.add('show');

                        if (typeof SoundSystem !== 'undefined') {
                            SoundSystem.play('dice_hit');
                        }

                        this._playThemeEffects(theme, finalValue, tableArea);

                        setTimeout(resolveAnim, 800);
                    }, 450);
                }
            };

            requestAnimationFrame(animate);
        });
    },

    _setDieFaces(cubeEl, values) {
        const faces = cubeEl.querySelectorAll('.d100-face');
        faces.forEach((face, i) => {
            face.textContent = values[i];
        });
    },

    _playThemeEffects(theme, result, tableArea) {
        if (theme === 'detective') {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const puff = document.createElement('div');
                    puff.className = 'smoke-puff show';
                    puff.style.left = (35 + Math.random() * 30) + '%';
                    puff.style.top = (35 + Math.random() * 30) + '%';
                    tableArea.appendChild(puff);
                    setTimeout(() => puff.remove(), 1500);
                }, i * 120);
            }
        } else if (theme === 'cthulhu') {
            const tentacle = document.createElement('div');
            tentacle.className = 'tentacle-effect show';
            tentacle.style.background = `radial-gradient(circle at center, rgba(0, 229, 160, 0.15), transparent 60%)`;
            tableArea.appendChild(tentacle);
            setTimeout(() => tentacle.remove(), 1200);

            if (result >= 96) {
                const d100Pair = tableArea.querySelector('#d100Pair');
                if (d100Pair) {
                    d100Pair.style.animation = 'shake 0.4s ease 2';
                    setTimeout(() => { d100Pair.style.animation = ''; }, 800);
                }
            }
        } else {
            if (result <= 70) {
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        const bubble = document.createElement('div');
                        bubble.className = 'bubble-effect show';
                        bubble.style.left = (25 + Math.random() * 50) + '%';
                        bubble.style.bottom = '15%';
                        bubble.style.width = (3 + Math.random() * 4) + 'px';
                        bubble.style.height = bubble.style.width;
                        bubble.style.animationDelay = (Math.random() * 0.4) + 's';
                        tableArea.appendChild(bubble);
                        setTimeout(() => bubble.remove(), 2200);
                    }, i * 70);
                }
            }

            if (result === 1) {
                tableArea.style.boxShadow = `inset 0 0 60px rgba(0,0,0,0.4), 0 0 50px rgba(212, 175, 55, 0.3)`;
                setTimeout(() => { tableArea.style.boxShadow = ''; }, 600);
            }
        }
    },

    async _playRollAnimation(faceEl, finalValue, isHidden) {
        if (isHidden) {
            faceEl.textContent = '🕵️';
            faceEl.style.color = '#00ccdd';
            faceEl.style.borderColor = '#00ccdd';
            await Utils.delay(1500);
            faceEl.textContent = '?';
            await Utils.delay(500);
        } else {
            const flickerCount = 12;
            for (let i = 0; i < flickerCount; i++) {
                faceEl.textContent = Math.floor(Math.random() * 100) + 1;
                await Utils.delay(80 + i * 15);
            }
            faceEl.textContent = finalValue;
        }
    },

    async playCheckAnimation(check) {
        if (!this.enabled) return;

        const container = document.getElementById('dice-animation');
        if (!container) return;

        container.classList.add('active');

        const face = container.querySelector('.dice-face') || document.createElement('div');
        face.className = 'dice-face';
        container.innerHTML = '';
        container.appendChild(face);

        await this._playRollAnimation(face, check.roll, check.isHidden);

        if (!check.isHidden) {
            const colorMap = {
                critical: '#00ccdd',
                success: '#00ff88',
                failure: '#ff3355',
                fumble: '#aa55ff'
            };
            const color = colorMap[check.result] || '#555570';
            face.style.borderColor = color;
            face.style.color = color;
            face.style.textShadow = `0 0 15px ${color}`;
            container.classList.add('active');
            await Utils.delay(600);
        }

        container.classList.remove('active');
    }
};
