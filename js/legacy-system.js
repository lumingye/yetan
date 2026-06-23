const LegacySystem = {
    createLegacy(investigator, exitReason) {
        return {
            fromInvestigator: investigator.name,
            exitReason: exitReason,
            exitDate: new Date().toISOString(),
            inheritedKnowledge: this.extractKnowledge(investigator),
            inheritedWorldState: CampaignSystem.worldState ? { ...CampaignSystem.worldState } : null,
            inheritedWarnings: this.extractWarnings(investigator),
            inheritedItems: investigator.inventory || [],
            inheritedContacts: this.extractContacts(investigator)
        };
    },

    extractKnowledge(investigator) {
        const knowledge = [];

        if (investigator.mythosKnowledge > 0) {
            knowledge.push({
                type: '神话知识',
                value: investigator.mythosKnowledge,
                effect: '新调查员神话知识起点+' + Math.floor(investigator.mythosKnowledge / 2)
            });
        }

        if (investigator.tomesRead && investigator.tomesRead.length > 0) {
            investigator.tomesRead.forEach(tome => {
                knowledge.push({
                    type: '典籍',
                    content: tome,
                    effect: '可阅读，获得神话知识但损失SAN'
                });
            });
        }

        if (investigator.notes && investigator.notes.length > 0) {
            investigator.notes.forEach(note => {
                knowledge.push({
                    type: '笔记',
                    content: note,
                    effect: '新调查员在相关检定+10%'
                });
            });
        }

        return knowledge;
    },

    extractWarnings(investigator) {
        const warnings = [];

        if (investigator.conditions?.phobias) {
            investigator.conditions.phobias.forEach(phobia => {
                warnings.push(`小心${phobia}——前调查员因此付出了代价`);
            });
        }

        if (investigator.conditions?.scars) {
            investigator.conditions.scars.forEach(scar => {
                warnings.push(scar);
            });
        }

        return warnings;
    },

    extractContacts(investigator) {
        const contacts = [];

        if (investigator.npcsMet && investigator.npcsMet.length > 0) {
            investigator.npcsMet.forEach(npc => {
                if (npc.trust && npc.trust >= 4) {
                    contacts.push({
                        name: npc.name,
                        relationship: npc.relationship,
                        effect: '新调查员初始信任度+2'
                    });
                }
            });
        }

        return contacts;
    },

    applyLegacyToNewCharacter(newInvestigator, legacy) {
        if (!legacy) return;

        legacy.inheritedKnowledge.forEach(k => {
            if (k.type === '神话知识') {
                newInvestigator.mythosKnowledge = (newInvestigator.mythosKnowledge || 0) + Math.floor(k.value / 2);
                newInvestigator.sanMax = 99 - newInvestigator.mythosKnowledge;
            }
        });

        if (legacy.inheritedContacts) {
            newInvestigator.inheritedContacts = legacy.inheritedContacts;
        }

        if (legacy.inheritedItems) {
            newInvestigator.inventory = [...(newInvestigator.inventory || []), ...legacy.inheritedItems];
        }

        return newInvestigator;
    },

    saveLegacy(legacy) {
        const legacies = Utils.loadFromStorage('scribe_legacies') || [];
        legacies.push(legacy);
        Utils.saveToStorage('scribe_legacies', legacies);
    },

    loadLegacies() {
        return Utils.loadFromStorage('scribe_legacies') || [];
    }
};
