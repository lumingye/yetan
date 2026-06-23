const CampaignSystem = {
    currentCampaign: null,
    worldState: null,

    createCampaign(data) {
        return {
            id: data.id || Utils.generateId(),
            title: data.title || '新战役',
            era: data.era || '1920s',
            startDate: data.startDate || { year: 1925, month: 10, day: 1 },
            cases: data.cases || [],
            recurringNpcs: data.recurringNpcs || [],
            worldState: {
                sealsIntact: data.worldState?.sealsIntact || 4,
                cultActivity: data.worldState?.cultActivity || 'low',
                publicAwareness: data.worldState?.publicAwareness || 0,
                unresolvedThreats: data.worldState?.unresolvedThreats || []
            },
            timeline: data.timeline || [],
            completedCases: [],
            currentCaseIndex: 0
        };
    },

    loadCampaign(campaignId) {
        const saved = Utils.loadFromStorage(`coc_campaign_${campaignId}`);
        if (saved) {
            this.currentCampaign = saved;
            this.worldState = saved.worldState;
            return saved;
        }
        return null;
    },

    saveCampaign() {
        if (this.currentCampaign) {
            Utils.saveToStorage(`coc_campaign_${this.currentCampaign.id}`, this.currentCampaign);
        }
    },

    advanceToNextCase() {
        if (!this.currentCampaign) return null;

        const nextIndex = this.currentCampaign.currentCaseIndex + 1;
        if (nextIndex < this.currentCampaign.cases.length) {
            this.currentCampaign.currentCaseIndex = nextIndex;
            this.saveCampaign();
            return this.currentCampaign.cases[nextIndex];
        }

        return null;
    },

    applyCaseOutcome(outcome) {
        if (!this.currentCampaign || !outcome) return;

        if (outcome.worldChanges) {
            for (const [key, value] of Object.entries(outcome.worldChanges)) {
                if (typeof value === 'number') {
                    this.worldState[key] = (this.worldState[key] || 0) + value;
                } else {
                    this.worldState[key] = value;
                }
            }
        }

        if (outcome.npcChanges) {
            outcome.npcChanges.forEach(change => {
                const npc = this.currentCampaign.recurringNpcs.find(n => n.id === change.id);
                if (npc) {
                    Object.assign(npc, change.updates);
                }
            });
        }

        this.currentCampaign.completedCases.push({
            caseId: outcome.caseId,
            completedAt: new Date().toISOString(),
            result: outcome.result
        });

        this.saveCampaign();
    },

    getIntervalNarrative() {
        if (!this.currentCampaign) return '';

        const lastCase = this.currentCampaign.completedCases[this.currentCampaign.completedCases.length - 1];
        const nextCase = this.currentCampaign.cases[this.currentCampaign.currentCaseIndex + 1];

        let narrative = '时间流逝……\n\n';

        if (lastCase) {
            narrative += `上一次调查的余波仍在回响。`;
        }

        if (this.worldState.cultActivity === 'high') {
            narrative += '城市中的异常事件明显增多，报纸上开始出现奇怪的报道。';
        }

        if (nextCase) {
            narrative += `\n\n新的线索浮现，将你引向了下一个谜团。`;
        }

        return narrative;
    }
};
