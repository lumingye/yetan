Object.assign(Main, {
    updateSidebar() {
        const char = this.gameState.character;
        if (!char) return;

        this.checkCharacterStatus();

        const headerEl = document.getElementById('sidebar-char-header');
        if (headerEl) {
            const occ = char.occupation ? ` · ${char.occupation}` : '';
            var condStr = '';
            if (char.conditions && char.conditions.length > 0) {
                condStr = ' [' + char.conditions.join(',') + ']';
            }
            headerEl.textContent = `${char.name || char.occupation || '调查员'}${occ}${condStr}`;
        }

        var portraitEl = document.getElementById('sidebar-char-portrait');
        if (portraitEl) {
            if (char.portraitSrc) {
                var portraitName = Utils.escapeHtml(char.name || '角色');
                portraitEl.innerHTML = '<div class="sidebar-portrait-frame">' +
                    '<img src="' + Utils.escapeHtml(char.portraitSrc) + '" alt="' + portraitName + '">' +
                    '<div class="sidebar-portrait-caption">' + portraitName + '</div>' +
                    '</div>';
                portraitEl.style.display = 'block';
            } else {
                portraitEl.innerHTML = '<button type="button" class="sidebar-portrait-generate" title="点击生成立绘"><span>IMG</span><span>生成立绘</span></button>';
                portraitEl.style.display = 'block';
                portraitEl.querySelector('button').addEventListener('click', function () {
                    Terminal.handleImageCommand(['--portrait']);
                });
            }
        }

        const hpPct = (char.hp / char.hpMax) * 100;
        const sanPct = (char.san / char.sanMax) * 100;
        const mpPct = (char.mp / char.mpMax) * 100;

        document.getElementById('sidebar-hp').textContent = `${char.hp}/${char.hpMax}`;
        const hpBar = document.getElementById('sidebar-hp-bar');
        hpBar.style.width = `${hpPct}%`;
        hpBar.className = 'bar-fill' + (hpPct <= 25 ? ' critical' : hpPct <= 50 ? ' warning' : '');

        document.getElementById('sidebar-san').textContent = `${char.san}/${char.sanMax}`;
        const sanBar = document.getElementById('sidebar-san-bar');
        sanBar.style.width = `${sanPct}%`;
        sanBar.className = 'bar-fill' + (sanPct <= 20 ? ' critical' : sanPct <= 40 ? ' warning' : '');

        document.getElementById('sidebar-mp').textContent = `${char.mp}/${char.mpMax}`;
        const mpBar = document.getElementById('sidebar-mp-bar');
        mpBar.style.width = `${mpPct}%`;
        mpBar.className = 'bar-fill' + (mpPct <= 20 ? ' critical' : mpPct <= 40 ? ' warning' : '');

        const attrGrid = document.getElementById('sidebar-attributes');
        if (attrGrid) {
            attrGrid.innerHTML = [
                ['STR', char.str], ['CON', char.con], ['SIZ', char.siz], ['DEX', char.dex],
                ['APP', char.app], ['INT', char.int], ['POW', char.pow], ['EDU', char.edu],
                ['幸运', char.luck], ['DB', char.db], ['体格', char.build], ['MOV', char.mov]
            ].map(([label, value]) => {
                let valueClass = 'stat-value';
                if (typeof value === 'number') {
                    if (value < 40) valueClass += ' low';
                    else if (value < 50) valueClass += ' warning';
                    else if (value >= 80) valueClass += ' high';
                }
                return `
                    <div class="stat-item">
                        <span class="stat-label">${label}</span>
                        <span class="${valueClass}">${value}</span>
                    </div>
                `;
            }).join('');
        }

        const skillList = document.getElementById('sidebar-skills');
        if (skillList && char.skills) {
            const sorted = Object.entries(char.skills)
                .filter(([_, v]) => v > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20);
            skillList.innerHTML = sorted.map(([name, value]) => {
                let valueClass = 'skill-value';
                if (value >= 70) valueClass += ' high';
                else if (value < 30) valueClass += ' low';
                return `
                    <div class="skill-item">
                        <span class="skill-name">${Utils.escapeHtml(name)}</span>
                        <span class="${valueClass}">${value}%</span>
                    </div>
                `;
            }).join('');
        }

        const cluesEl = document.getElementById('sidebar-clues');
        if (cluesEl) {
            // Story.state.clues 是权威数据源
            var clues = (typeof Story !== 'undefined' && Story.state.clues) ? Story.state.clues : (this.gameState.story.clues || []);
            if (clues.length === 0) {
                cluesEl.innerHTML = '<p class="sidebar-empty">尚无线索</p>';
            } else {
                cluesEl.innerHTML = clues.map(c => `
                    <div class="clue-item">${Utils.escapeHtml(c)}</div>
                `).join('');
            }
        }

        const officialNotesEl = document.getElementById('sidebar-official-notes');
        if (officialNotesEl) {
            officialNotesEl.textContent = this.gameState.story.officialNotes || '尚无摘要。';
        }

        const goalEl = document.getElementById('sidebar-current-goal');
        if (goalEl) {
            goalEl.textContent = this.gameState.story.currentGoal || '—';
        }

        // 空间拓扑：当前地点与可达地点
        var locationEl = document.getElementById('sidebar-location-info');
        if (locationEl && typeof Story !== 'undefined') {
            var currentLoc = Story.state.currentLocation || '';
            var adjacent = Story.getAdjacentLocations ? Story.getAdjacentLocations() : [];
            var discovered = Story.state.discoveredLocations || [];
            if (currentLoc) {
                var html = '<div class="location-current">' + Utils.escapeHtml(currentLoc) + '</div>';
                if (adjacent.length > 0) {
                    html += '<div class="location-adjacent"><span class="location-label">可达：</span>' + adjacent.map(function(n) {
                        var isVisited = discovered.indexOf(n) !== -1;
                        return '<span class="location-node' + (isVisited ? ' visited' : '') + '">' + Utils.escapeHtml(n) + '</span>';
                    }).join('<span class="location-sep">→</span>') + '</div>';
                }
                locationEl.innerHTML = html;
            } else {
                locationEl.innerHTML = '<p class="sidebar-empty">未进入任何地点</p>';
            }
        }

        const playerNotesEl = document.getElementById('sidebar-player-notes');
        if (playerNotesEl && this.gameState.story.playerNotes !== undefined) {
            playerNotesEl.value = this.gameState.story.playerNotes;
        }

        this._renderProgressStages();

        if (typeof NPCManager !== 'undefined') {
            NPCManager.updateSidebar();
        }
    },

    _renderProgressStages() {
        var el = document.getElementById('sidebar-progress-stages');
        if (!el) return;

        if (typeof Story === 'undefined' || !Story.state.progressStages || Story.state.progressStages.length === 0) {
            el.innerHTML = '<p class="sidebar-empty">无进度追踪</p>';
            return;
        }

        var stages = Story.state.progressStages;
        var currentIdx = Story.state.currentStageIndex || 0;
        var progress = Story.getStageProgress();
        var html = '';

        html += '<div class="progress-stages-track">';
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i];
            var isCurrent = i === currentIdx;
            var isPast = i < currentIdx;
            var statusClass = isPast ? 'completed' : isCurrent ? 'current' : 'locked';

            html += '<div class="progress-stage-item ' + statusClass + '">';
            html += '<div class="stage-indicator">';
            html += isPast ? 'OK' : isCurrent ? 'NOW' : '--';
            html += '</div>';
            html += '<div class="stage-info">';
            if (isPast || isCurrent) {
                html += '<div class="stage-name">' + stage.name + '</div>';
            } else {
                html += '<div class="stage-name is-obscured">' + stage.name + '</div>';
            }

            if (isCurrent && progress && progress.conditionDetails) {
                for (var j = 0; j < progress.conditionDetails.length; j++) {
                    var cond = progress.conditionDetails[j];
                    html += '<div class="stage-condition ' + (cond.met ? 'met' : 'unmet') + '">';
                    if (cond.met) {
                        html += '<span class="condition-mark">OK</span> ' + cond.description;
                    } else {
                        html += '<span class="condition-mark">--</span> <span class="is-obscured">' + cond.description + '</span>';
                    }
                    html += '</div>';
                }
            }

            html += '</div></div>';

            if (i < stages.length - 1) {
                html += '<div class="stage-connector ' + (isPast ? 'completed' : '') + '"></div>';
            }
        }
        html += '</div>';

        if (Story.state.doomsdayClocks && Story.state.doomsdayClocks.length > 0) {
            html += '<div class="doomsday-clocks">';
            html += '<div class="doomsday-title">CLOCK 末日钟</div>';
            for (var k = 0; k < Story.state.doomsdayClocks.length; k++) {
                var clock = Story.state.doomsdayClocks[k];
                var clockStatus = clock.triggered ? 'triggered' : 'active';
                html += '<div class="doomsday-clock ' + clockStatus + '">';
                html += '<span class="clock-name">' + (clock.name || '末日钟') + '</span>';
                html += '<span class="clock-status">' + (clock.triggered ? '已触发' : '倒计时中') + '</span>';
                html += '</div>';
            }
            html += '</div>';
        }

        el.innerHTML = html;
    },

    updateStatusBar() {
        const char = this.gameState.character;
        const story = this.gameState.story;

        const nameEl = document.getElementById('status-char-name');
        if (nameEl) {
            nameEl.textContent = char ? char.name || '无名调查员' : '无名调查员';
        }

        var scenarioEl = document.getElementById('status-scenario');
        if (scenarioEl) {
            if (story.modName) {
                scenarioEl.textContent = '📜 ' + story.modName;
                scenarioEl.style.display = '';
            } else {
                scenarioEl.style.display = 'none';
            }
        }

        const timeEl = document.getElementById('status-time');
        if (timeEl) {
            timeEl.textContent = story.gameTime ? Utils.formatTime(story.gameTime) : '--:--';
        }

        const chapterEl = document.getElementById('status-chapter');
        if (chapterEl) {
            const newChapter = story.chapter || '未开始';
            if (this._lastChapter && this._lastChapter !== newChapter && newChapter !== '序章') {
                if (typeof GrieferDetector !== 'undefined') {
                    GrieferDetector.resetOnNewChapter();
                }
            }
            this._lastChapter = newChapter;
            var phaseName = '';
            if (story.phase && story.phase !== 'prologue') {
                var phaseMap = { investigation: '调查', approaching_truth: '接近真相', climax: '终局' };
                phaseName = phaseMap[story.phase] ? ' · ' + phaseMap[story.phase] : '';
            }
            chapterEl.textContent = newChapter + phaseName;
        }

        var tokenEl = document.getElementById('status-token-usage');
        if (tokenEl) {
            var showUsage = typeof Settings !== 'undefined' && Settings.getToggle
                ? Settings.getToggle('showTokenUsage', false)
                : false;
            if (showUsage && typeof API !== 'undefined' && API.getUsageSummary) {
                var usage = API.getUsageSummary();
                tokenEl.style.display = '';
                tokenEl.textContent = 'API ' + usage.calls + ' · Tok ' + usage.totalTokens;
                tokenEl.title = '输入 ' + usage.inputTokens + ' / 输出 ' + usage.outputTokens
                    + '；裁定 ' + usage.judgeCalls + '次 ' + usage.judgeTokens
                    + '；主KP ' + usage.mainCalls + '次 ' + usage.mainTokens;
            } else {
                tokenEl.style.display = 'none';
                tokenEl.title = '';
            }
        }

        const modeEl = document.getElementById('status-mode');
        if (modeEl) {
            var modeLabel = modeEl.querySelector('.status-label');
            if (modeLabel) modeLabel.textContent = Terminal.quickMode ? '快速模式' : '正常模式';
        }
        var modeDisplayEl = document.getElementById('setting-mode-display');
        if (modeDisplayEl) {
            modeDisplayEl.textContent = Terminal.quickMode ? '快速模式' : '正常模式';
        }
    },
});
