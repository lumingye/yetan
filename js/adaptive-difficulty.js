const AdaptiveDifficulty = {
    monitors: {
        consecutiveFailures: 0,
        lastSanValue: null,
        caseProgress: 0,
        playerEngagement: 100,
        timeSinceLastAction: null
    },

    thresholds: {
        consecutiveFailures: 3,
        lowSan: 30,
        lowEngagement: 50,
        behindSchedule: 0.3
    },

    update(metric, value) {
        switch (metric) {
            case 'checkResult':
                if (value === 'failure' || value === 'fumble') {
                    this.monitors.consecutiveFailures++;
                } else {
                    this.monitors.consecutiveFailures = 0;
                }
                break;

            case 'sanChange':
                this.monitors.lastSanValue = value;
                break;

            case 'playerAction':
                this.monitors.timeSinceLastAction = Date.now();
                this.monitors.playerEngagement = Math.min(100, this.monitors.playerEngagement + 5);
                break;

            case 'caseProgress':
                this.monitors.caseProgress = value;
                break;
        }

        this.evaluateAndAdjust();
    },

    evaluateAndAdjust() {
        const adjustments = [];

        if (this.monitors.consecutiveFailures >= this.thresholds.consecutiveFailures) {
            adjustments.push({
                type: 'hint',
                reason: '连续失败',
                action: '通过环境或NPC自然释放线索'
            });
        }

        if (this.monitors.lastSanValue !== null && this.monitors.lastSanValue < this.thresholds.lowSan) {
            adjustments.push({
                type: 'sanProtection',
                reason: 'SAN过低',
                action: '减少SAN损失频率，增加恢复机会'
            });
        }

        if (this.monitors.playerEngagement < this.thresholds.lowEngagement) {
            adjustments.push({
                type: 'pacing',
                reason: '玩家活跃度低',
                action: '触发突发事件推动节奏'
            });
        }

        return adjustments;
    },

    getDifficultyModifier() {
        let modifier = 1.0;

        if (this.monitors.consecutiveFailures >= 2) {
            modifier *= 0.9;
        }

        if (this.monitors.lastSanValue !== null && this.monitors.lastSanValue < 40) {
            modifier *= 0.95;
        }

        return modifier;
    },

    shouldProvideHint() {
        return this.monitors.consecutiveFailures >= 2;
    },

    shouldTriggerEvent() {
        const timeSinceAction = Date.now() - (this.monitors.timeSinceLastAction || Date.now());
        return timeSinceAction > 60000;
    },

    reset() {
        this.monitors = {
            consecutiveFailures: 0,
            lastSanValue: null,
            caseProgress: 0,
            playerEngagement: 100,
            timeSinceLastAction: null
        };
    }
};
