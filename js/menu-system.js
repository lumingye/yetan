const MenuSystem = {
    currentScreen: 'main',
    selectedCase: null,
    selectedDifficulty: 'investigator',
    selectedOccupation: null,
    carouselIndex: 0,
    carouselAnimating: false,
    _touchStartX: 0,
    _touchStartY: 0,
    _keyHandler: null,
    _transitioning: false,

    SCREENS: {
        MAIN: 'main',
        CASE_SELECT: 'caseSelect',
        CASE_PREVIEW: 'casePreview'
    },

    init() {
        var container = document.getElementById('menu-container');
        if (container) {
            container.classList.add('active');
        }
        this.render();
    },

    render() {
        var container = document.getElementById('menu-container');
        if (!container) return;

        if (this._transitioning) return;

        var prevScreen = container.getAttribute('data-screen') || '';
        var nextScreen = this.currentScreen;

        if (prevScreen && prevScreen !== nextScreen) {
            this._transitionScreen(container, prevScreen, nextScreen);
        } else {
            this._renderImmediate(container, nextScreen);
        }

        container.setAttribute('data-screen', nextScreen);
    },

    _renderImmediate(container, screen) {
        switch (screen) {
            case this.SCREENS.MAIN:
                container.innerHTML = this.renderMainScreen();
                break;
            case this.SCREENS.CASE_SELECT:
                container.innerHTML = this.renderCaseSelectScreen();
                break;
            case this.SCREENS.CASE_PREVIEW:
                container.innerHTML = this.renderCasePreviewScreen();
                break;
            default:
                container.innerHTML = this.renderMainScreen();
        }
        this.bindEvents();
    },

    _transitionScreen(container, from, to) {
        this._transitioning = true;

        var direction = this._getTransitionDirection(from, to);
        var oldContent = container.querySelector('.menu-screen');
        if (oldContent) {
            oldContent.classList.add('screen-exit-' + direction);
        }

        var self = this;
        setTimeout(function() {
            self._renderImmediate(container, to);
            var newContent = container.querySelector('.menu-screen');
            if (newContent) {
                newContent.classList.add('screen-enter-' + direction);
                setTimeout(function() {
                    newContent.classList.remove('screen-enter-' + direction);
                }, 500);
            }
            self._transitioning = false;
        }, 280);
    },

    _getTransitionDirection(from, to) {
        var order = [this.SCREENS.MAIN, this.SCREENS.CASE_SELECT, this.SCREENS.CASE_PREVIEW];
        var fromIdx = order.indexOf(from);
        var toIdx = order.indexOf(to);
        return toIdx > fromIdx ? 'left' : 'right';
    },

    renderMainScreen() {
        var savedChar = this.getSavedCharacter();
        var savedProgress = this.getSavedProgress();
        var currentTheme = document.documentElement.getAttribute('data-theme') || 'detective';
        var hasSave = savedChar && (typeof Utils !== 'undefined' && Utils.loadFromStorage('scribe_autosave'));

        var html = '<div class="menu-screen main-menu">';

        html += '<div class="main-menu-bg">';
        html += '<div class="bg-particle p1"></div>';
        html += '<div class="bg-particle p2"></div>';
        html += '<div class="bg-particle p3"></div>';
        html += '<div class="bg-particle p4"></div>';
        html += '<div class="bg-particle p5"></div>';
        html += '</div>';

        html += '<div class="main-menu-content">';
        html += '<div class="menu-title-area">';
        html += '<div class="title-emblem">◈</div>';
        html += '<h1 class="game-title-main">夜谭</h1>';
        html += '<p class="game-subtitle">YE TAN</p>';
        html += '<div class="title-divider"><span class="divider-line"></span><span class="divider-icon">☽</span><span class="divider-line"></span></div>';
        html += '<p class="game-tagline">Call of Cthulhu · AI驱动的叙事终端</p>';
        html += '</div>';

        html += '<div class="main-menu-actions">';
        html += '<button class="main-action-btn tutorial-action" id="btn-tutorial-demo">';
        html += '<span class="action-icon">DEMO</span>';
        html += '<div class="action-info"><span class="action-text">15分钟试玩</span><span class="action-desc">独立试玩档，可新开或读档继续；体验检定、线索、NPC与结局抉择</span></div>';
        html += '<span class="action-arrow">›</span>';
        html += '</button>';

        html += '<button class="main-action-btn primary-action" id="btn-new-game">';
        html += '<span class="action-icon">NEW</span>';
        html += '<div class="action-info"><span class="action-text">新的调查</span><span class="action-desc">选择剧本，创建角色，开始冒险</span></div>';
        html += '<span class="action-arrow">›</span>';
        html += '</button>';

        html += '<button class="main-action-btn ' + (hasSave ? '' : 'disabled') + '" id="btn-continue" ' + (hasSave ? '' : 'disabled') + '>';
        html += '<span class="action-icon">LOAD</span>';
        html += '<div class="action-info"><span class="action-text">继续调查</span><span class="action-desc">' + (hasSave ? '回到上次进度' : '暂无存档') + '</span></div>';
        html += '<span class="action-arrow">' + (hasSave ? '›' : '') + '</span>';
        html += '</button>';
        html += '</div>';

        if (savedChar) {
            html += '<div class="saved-progress-card">';
            html += '<div class="progress-card-header"><span class="progress-label">当前调查员</span><span class="progress-badge">进行中</span></div>';
            html += '<div class="progress-card-body">';
            html += '<div class="progress-avatar">' + (savedChar.name ? savedChar.name.charAt(0) : '?') + '</div>';
            html += '<div class="progress-info">';
            html += '<div class="progress-name">' + (savedChar.name || '无名调查员') + '</div>';
            html += '<div class="progress-occ">' + (savedChar.occupation || '未知职业') + '</div>';
            html += '<div class="progress-stats-row">';
            html += '<span class="pstat hp">HP ' + (savedChar.hp || '?') + '</span>';
            html += '<span class="pstat san">SAN ' + (savedChar.san || '?') + '</span>';
            html += '<span class="pstat mythos">神话 ' + (savedChar.mythosKnowledge || 0) + '</span>';
            html += '</div>';
            if (savedProgress) {
                html += '<div class="progress-location">章节 ' + (savedProgress.chapter || '未知') + '</div>';
            }
            html += '</div></div></div>';
        }

        html += '<div class="main-menu-secondary">';
        html += '<button class="secondary-action" id="btn-character-archive"><span class="sec-icon">ID</span><span class="sec-text">角色档案</span></button>';
        html += '<button class="secondary-action" id="btn-settings-menu"><span class="sec-icon">CFG</span><span class="sec-text">设置</span></button>';
        html += '<button class="secondary-action" id="btn-about"><span class="sec-icon">?</span><span class="sec-text">关于</span></button>';
        html += '</div>';

        html += '<div class="theme-switcher-inline">';
        html += '<span class="theme-label">主题</span>';
        html += '<button class="theme-chip ' + (currentTheme === 'detective' ? 'active' : '') + '" data-theme="detective">事务所</button>';
        html += '<button class="theme-chip ' + (currentTheme === 'deco' ? 'active' : '') + '" data-theme="deco">✦ Deco</button>';
        html += '<button class="theme-chip ' + (currentTheme === 'cthulhu' ? 'active' : '') + '" data-theme="cthulhu">密教</button>';
        html += '<button class="theme-chip ' + (currentTheme === 'abyss' ? 'active' : '') + '" data-theme="abyss">◈ 深渊</button>';
        html += '</div>';

        html += '</div>';
        html += '</div>';

        return html;
    },

    renderCaseSelectScreen() {
        var presetCases = this.getPresetCases();
        this.carouselIndex = 0;

        var carouselCards = '';
        for (var i = 0; i < presetCases.length; i++) {
            var c = presetCases[i];
            carouselCards += this.renderCarouselCard(c, i);
        }

        var dots = '';
        for (var d = 0; d < presetCases.length; d++) {
            dots += '<span class="carousel-dot ' + (d === 0 ? 'active' : '') + '" data-index="' + d + '"></span>';
        }

        var html = '<div class="menu-screen case-select-screen">';

        html += '<div class="screen-header">';
        html += '<button class="back-btn" id="btn-back-main">← 返回</button>';
        html += '<h2>选择剧本</h2>';
        html += '</div>';

        html += '<div class="case-mode-tabs">';
        html += '<button class="mode-tab active" data-mode="carousel">剧本浏览</button>';
        html += '<button class="mode-tab" data-mode="random">AI创造</button>';
        html += '<button class="mode-tab" data-mode="import">导入剧本</button>';
        html += '</div>';

        html += '<div class="case-mode-panels">';

        html += '<div class="mode-panel active" id="mode-carousel">';
        html += '<div class="carousel-container" id="carousel-container">';
        html += '<button class="carousel-arrow carousel-prev" id="carousel-prev">‹</button>';
        html += '<div class="carousel-viewport">';
        html += '<div class="carousel-track" id="carousel-track">';
        html += carouselCards;
        html += '</div>';
        html += '</div>';
        html += '<button class="carousel-arrow carousel-next" id="carousel-next">›</button>';
        html += '</div>';
        html += '<div class="carousel-dots" id="carousel-dots">' + dots + '</div>';
        html += '<div class="carousel-counter" id="carousel-counter">1 / ' + presetCases.length + '</div>';
        html += '</div>';

        html += '<div class="mode-panel" id="mode-random">';
        html += '<div class="random-panel">';
        html += '<div class="random-orb-wrapper">';
        html += '<div class="random-orb-ring ring-outer"></div>';
        html += '<div class="random-orb-ring ring-inner"></div>';
        html += '<div class="random-orb" id="random-orb">';
        html += '<div class="orb-inner">?</div>';
        html += '</div>';
        html += '</div>';
        html += '<p class="random-hint">从神话池中抽取元素，由AI守秘人创造独一无二的模组</p>';
        html += '<div class="random-elements-display" id="random-elements-display"></div>';
        html += '<div class="random-options">';
        html += '<div class="random-option-group">';
        html += '<label class="random-option-label">时代</label>';
        html += '<select class="random-option-select" id="random-era">';
        html += '<option value="random">随机</option>';
        html += '<option value="1920s">1920年代</option>';
        html += '<option value="victorian">维多利亚</option>';
        html += '<option value="modern">现代</option>';
        html += '</select>';
        html += '</div>';
        html += '<div class="random-option-group">';
        html += '<label class="random-option-label">结构</label>';
        html += '<select class="random-option-select" id="random-structure">';
        html += '<option value="random">随机</option>';
        html += '<option value="密室推理">密室推理</option>';
        html += '<option value="失踪调查">失踪调查</option>';
        html += '<option value="封闭机构">封闭机构</option>';
        html += '<option value="遗产争夺">遗产争夺</option>';
        html += '</select>';
        html += '</div>';
        html += '</div>';
        html += '<button class="menu-btn primary" id="btn-random-case">🎲 抽取元素·创造模组</button>';
        html += '</div>';
        html += '</div>';

        html += '<div class="mode-panel" id="mode-import">';
        html += '<div class="import-panel">';
        html += '<div class="import-drop-zone" id="import-drop-zone">';
        html += '<div class="drop-zone-icon">📄</div>';
        html += '<p class="drop-zone-text">拖拽文件到此处</p>';
        html += '<p class="drop-zone-sub">或点击选择文件（支持 .yaml .yml .json .md）</p>';
        html += '<input type="file" id="import-file" accept=".yaml,.yml,.json,.md" style="display:none">';
        html += '</div>';
        html += '<div class="import-paste-section">';
        html += '<p class="import-paste-label">或粘贴剧本内容</p>';
        html += '<textarea id="import-content" placeholder="粘贴 YAML / JSON / Markdown 剧本内容..."></textarea>';
        html += '</div>';
        html += '<button class="menu-btn primary" id="btn-import-case">导入并校验</button>';
        html += '</div>';
        html += '</div>';

        html += '</div>';
        html += '</div>';

        return html;
    },

    renderCarouselCard(caseData, index) {
        var difficultyStars = '★'.repeat(caseData.difficulty || 2) + '☆'.repeat(3 - (caseData.difficulty || 2));
        var tags = caseData.tags || [];
        var tagsHtml = '';
        for (var t = 0; t < tags.length; t++) {
            tagsHtml += '<span class="carousel-tag">' + tags[t] + '</span>';
        }

        var html = '<div class="carousel-card" data-index="' + index + '" data-case-id="' + caseData.id + '">';
        html += '<div class="carousel-card-bg"></div>';
        html += '<div class="carousel-card-atmosphere"></div>';
        html += '<div class="carousel-card-content">';
        html += '<div class="carousel-card-top">';
        html += '<span class="carousel-era">' + (caseData.era || '1920s') + '</span>';
        html += '<span class="carousel-difficulty">' + difficultyStars + '</span>';
        html += '</div>';
        html += '<h3 class="carousel-title">' + caseData.title + '</h3>';
        html += '<p class="carousel-location">地点 ' + (caseData.location || '未知地点') + '</p>';
        html += '<p class="carousel-hook">"' + (caseData.hook || '一个不寻常的案件...') + '"</p>';
        html += '<div class="carousel-tags">' + tagsHtml + '</div>';
        html += '<div class="carousel-meta">';
        html += '<span class="carousel-duration">⏱ ' + (caseData.duration || '2-3次') + '</span>';
        html += '</div>';
        html += '<button class="carousel-select-btn" data-case-id="' + caseData.id + '">选择此剧本</button>';
        html += '</div>';
        html += '</div>';

        return html;
    },

    renderCasePreviewScreen() {
        if (!this.selectedCase) return this.renderCaseSelectScreen();

        var caseData = this.selectedCase;
        var recommendations = typeof CaseSystem !== 'undefined' ? CaseSystem.getRecommendedOccupations(caseData) : [];

        var occHtml = '';
        for (var i = 0; i < recommendations.length; i++) {
            var r = recommendations[i];
            var reasonsHtml = '';
            for (var j = 0; j < r.reasons.length; j++) {
                reasonsHtml += '<span class="reason">' + r.reasons[j] + '</span>';
            }
            occHtml += '<div class="occ-card ' + (this.selectedOccupation === r.occupation ? 'selected' : '') + '" data-occ="' + r.occupation + '">';
            occHtml += '<span class="occ-name">' + r.occupation + '</span>';
            occHtml += '<span class="occ-bonus">' + r.bonus + '</span>';
            occHtml += '<div class="occ-reasons">' + reasonsHtml + '</div>';
            occHtml += '</div>';
        }

        var html = '<div class="menu-screen case-preview">';
        html += '<div class="screen-header">';
        html += '<button class="back-btn" id="btn-back-cases">← 返回</button>';
        html += '<h2>' + caseData.title + '</h2>';
        html += '</div>';

        html += '<div class="preview-content">';
        html += '<div class="preview-synopsis">';
        html += '<h3>剧本梗概</h3>';
        html += '<p class="synopsis-text">' + (caseData.hook || '一个神秘的案件等待调查...') + '</p>';
        if (caseData.opening && caseData.opening.arrival) {
            html += '<p class="synopsis-arrival">' + caseData.opening.arrival + '</p>';
        }
        html += '</div>';

        if (caseData.isGenerated && caseData.mythosElementSummary) {
            html += '<div class="preview-mythos-elements">';
            html += '<h3>神话元素</h3>';
            html += '<p class="mythos-summary">' + caseData.mythosElementSummary + '</p>';
            html += '<p class="mythos-note">本模组由AI从神话池抽取元素创造，守秘人将根据这些元素编织独一无二的故事</p>';
            html += '</div>';
        }

        html += '<div class="preview-meta">';
        html += '<div class="meta-item"><span class="meta-label">时代</span><span class="meta-value">' + (caseData.era || '1920s') + '</span></div>';
        html += '<div class="meta-item"><span class="meta-label">地点</span><span class="meta-value">' + (caseData.location || '未知') + '</span></div>';
        html += '<div class="meta-item"><span class="meta-label">背景语言</span><span class="meta-value">' + (caseData.fullData?.settingLanguage || '未指定') + '</span></div>';
        html += '<div class="meta-item"><span class="meta-label">预计时长</span><span class="meta-value">' + (caseData.duration || '2-3次') + '</span></div>';
        html += '</div>';

        html += '<div class="difficulty-select">';
        html += '<h3>难度选择</h3>';
        html += '<div class="difficulty-options">';
        html += '<button class="diff-btn ' + (this.selectedDifficulty === 'amateur' ? 'active' : '') + '" data-diff="amateur"><span class="diff-name">业余侦探</span><span class="diff-desc">更多提示，适合新手</span></button>';
        html += '<button class="diff-btn ' + (this.selectedDifficulty === 'investigator' ? 'active' : '') + '" data-diff="investigator"><span class="diff-name">调查员</span><span class="diff-desc">标准难度 ★推荐</span></button>';
        html += '<button class="diff-btn ' + (this.selectedDifficulty === 'unspeakable' ? 'active' : '') + '" data-diff="unspeakable"><span class="diff-name">不可名状</span><span class="diff-desc">极限挑战，少有怜悯</span></button>';
        html += '</div></div>';

        html += '<div class="occupation-recommendations">';
        html += '<h3>推荐职业</h3>';
        html += '<div class="occ-grid">';
        html += occHtml;
        html += '<div class="occ-card custom" data-occ="custom"><span class="occ-name">自定义</span><span class="occ-bonus">自由分配</span></div>';
        html += '</div></div>';

        html += '<div class="preview-actions">';
        html += '<button class="menu-btn primary large" id="btn-start-case">创建角色并开始</button>';
        html += '</div>';

        html += '</div>';
        html += '</div>';

        return html;
    },

    getPresetCases() {
        if (typeof StoryGenerator !== 'undefined' && StoryGenerator.PRESET_MODULES) {
            return StoryGenerator.PRESET_MODULES.map(function(m) {
                return {
                    id: m.id,
                    title: m.title,
                    era: m.era === '1920s' ? '1920s' : m.era === 'victorian' ? '维多利亚' : '现代',
                    location: m.location,
                    difficulty: m.difficulty,
                    tags: m.tags,
                    hook: m.hook,
                    duration: m.duration,
                    structure: m.structure,
                    layers: m.layers,
                    npcs: m.npcs,
                    entity: m.entity,
                    entityData: m.entityData,
                    subEntity: m.subEntity,
                    chekhovGuns: m.chekhovGuns,
                    endings: m.endings,
                    recommendedOccupations: m.recommendedOccupations,
                    openingNarrative: m.openingNarrative,
                    kpNotes: m.kpNotes
                };
            });
        }

        return [
            {
                id: 'tidehouse-requiem',
                title: '潮汐房间的安魂曲',
                era: '1920s',
                location: '阿卡姆北郊·潮汐庄园',
                difficulty: 3,
                tags: ['密室推理', '深海', '封印', '单人'],
                hook: '潮水退去时，那栋房子会露出不该存在的第十二个房间。',
                duration: '2.5-3.5小时'
            },
            {
                id: 'senbonji-lost',
                title: '千本路迷失',
                era: '1920s',
                location: '京都·东山·千本路',
                difficulty: 3,
                tags: ['失踪调查', '古代文书', '异界入口', '单人'],
                hook: '研究古代祭祀的学者在京都消失，他走进了一扇"不该存在的门"。',
                duration: '2-3小时'
            },
            {
                id: 'old-peking-tales',
                title: '旧京怪谈',
                era: '1920s',
                location: '北京·西四砖塔胡同',
                difficulty: 3,
                tags: ['遗产争夺', '古董', '封印', '单人'],
                hook: '前清遗族宅邸中的一场"闹鬼"，牵扯出一桩六十年前的封印与一件不该存在于人间的东西。',
                duration: '2-3小时'
            },
            {
                id: 'plateau-mask',
                title: '高原假面',
                era: '1920s',
                location: '锡金·达吉岭高山疗养院',
                difficulty: 3,
                tags: ['封闭机构', '地质异常', '古老存在', '单人'],
                hook: '喜马拉雅山脚下的疗养院里，一场"流感"吞噬着生命——但死去的人或许并未真正离开。',
                duration: '2-3小时'
            },
            {
                id: 'night-whisper',
                title: '暗夜呢喃',
                era: '1920s',
                location: '阿卡姆·海岸',
                difficulty: 3,
                tags: ['失踪调查', '深海', '邪教', '经典'],
                hook: '阿卡姆大学教授失踪三天，他的女儿递给你一把书房钥匙——窗外，雨忽然下得更大了。',
                duration: '3-4小时'
            }
        ];
    },

    getSavedCharacter() {
        if (typeof Main !== 'undefined' && Main.gameState && Main.gameState.character) {
            return Main.gameState.character;
        }
        return typeof Utils !== 'undefined' ? Utils.loadFromStorage('scribe_character') : null;
    },

    getSavedProgress() {
        if (typeof Story !== 'undefined' && Story.state) {
            return {
                chapter: Story.state.chapter,
                modName: Story.state.modName
            };
        }
        return null;
    },

    navigateCarousel(direction) {
        if (this.carouselAnimating) return;
        var cases = this.getPresetCases();
        var total = cases.length;
        if (total === 0) return;

        this.carouselAnimating = true;

        var newIndex = this.carouselIndex + direction;
        if (newIndex < 0) newIndex = total - 1;
        if (newIndex >= total) newIndex = 0;

        this._animateCarouselTo(newIndex, direction);
    },

    goToCarouselSlide(index) {
        if (this.carouselAnimating) return;
        if (index === this.carouselIndex) return;
        var cases = this.getPresetCases();
        var total = cases.length;
        if (index < 0 || index >= total) return;

        this.carouselAnimating = true;
        var direction = index > this.carouselIndex ? 1 : -1;
        this._animateCarouselTo(index, direction);
    },

    _animateCarouselTo(newIndex, direction) {
        var track = document.getElementById('carousel-track');
        if (!track) { this.carouselAnimating = false; return; }

        var viewport = track.parentElement;
        var cardWidth = viewport.offsetWidth;

        var cards = track.querySelectorAll('.carousel-card');
        var totalCards = cards.length;
        var oldCard = cards[this.carouselIndex];
        var newCard = cards[newIndex];

        if (oldCard) {
            oldCard.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
            oldCard.style.transform = 'translateX(' + (-direction * 30) + 'px) scale(0.92)';
            oldCard.style.opacity = '0.3';
        }

        track.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
        track.style.transform = 'translateX(-' + (newIndex * cardWidth) + 'px)';

        if (newCard) {
            newCard.style.transition = 'none';
            newCard.style.transform = 'translateX(' + (direction * 30) + 'px) scale(0.92)';
            newCard.style.opacity = '0.3';
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    newCard.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
                    newCard.style.transform = 'translateX(0) scale(1)';
                    newCard.style.opacity = '1';
                });
            });
        }

        this.carouselIndex = newIndex;

        var dots = document.querySelectorAll('.carousel-dot');
        for (var i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('active', i === newIndex);
        }

        var counter = document.getElementById('carousel-counter');
        if (counter) counter.textContent = (newIndex + 1) + ' / ' + totalCards;

        var self = this;
        setTimeout(function() {
            if (oldCard) {
                oldCard.style.transition = '';
                oldCard.style.transform = '';
                oldCard.style.opacity = '';
            }
            if (newCard) {
                newCard.style.transition = '';
                newCard.style.transform = '';
                newCard.style.opacity = '';
            }
            self.carouselAnimating = false;
        }, 580);
    },

    selectRandomCase() {
        var orb = document.getElementById('random-orb');
        var wrapper = document.querySelector('.random-orb-wrapper');
        var displayEl = document.getElementById('random-elements-display');
        if (orb) {
            orb.classList.add('spinning');
        }
        if (wrapper) {
            wrapper.classList.add('active');
        }

        var self = this;

        var eraSelect = document.getElementById('random-era');
        var structureSelect = document.getElementById('random-structure');
        var options = {};
        if (eraSelect && eraSelect.value !== 'random') options.era = eraSelect.value;
        if (structureSelect && structureSelect.value !== 'random') options.structure = structureSelect.value;

        var mythosCombo = null;
        if (typeof MythosPool !== 'undefined') {
            MythosPool.init();
            mythosCombo = MythosPool.generate();
        }

        var categoryLabels = {
            deities: '神祇',
            creatures: '生物',
            tomes: '典籍',
            locations: '地点',
            cults: '邪教',
            rituals: '仪式'
        };
        var categoryIcons = {
            deities: 'GOD',
            creatures: 'ENT',
            tomes: 'TXT',
            locations: 'LOC',
            cults: 'CLT',
            rituals: 'RIT'
        };

        var elements = [];
        if (mythosCombo) {
            for (var cat in mythosCombo) {
                elements.push({
                    category: cat,
                    label: categoryLabels[cat] || cat,
                    icon: categoryIcons[cat] || '?',
                    value: mythosCombo[cat]
                });
            }
        }

        var shuffleCount = 0;
        var maxShuffles = elements.length;
        var revealIndex = 0;

        if (displayEl) {
            displayEl.innerHTML = '';
        }

        if (elements.length === 0) {
            if (displayEl) {
                displayEl.innerHTML = '<div class="random-element-tag"><span class="element-icon">✦</span><span class="element-value">随机生成中...</span></div>';
            }
        }

        function revealNext() {
            if (revealIndex >= elements.length) {
                if (orb) orb.classList.remove('spinning');
                if (wrapper) wrapper.classList.remove('active');

                setTimeout(function() {
                    var generatedModule = null;
                    if (typeof StoryGenerator !== 'undefined' && StoryGenerator.generateRandomStory) {
                        generatedModule = StoryGenerator.generateRandomStory(options, mythosCombo);
                    }

                    if (generatedModule) {
                        self.selectedCase = {
                            id: generatedModule.id,
                            title: generatedModule.title,
                            era: generatedModule.era,
                            location: generatedModule.location,
                            difficulty: generatedModule.difficulty,
                            tags: generatedModule.tags,
                            hook: generatedModule.hook,
                            duration: generatedModule.duration,
                            structure: generatedModule.structure,
                            layers: generatedModule.layers,
                            npcs: generatedModule.npcs,
                            entity: generatedModule.entity,
                            entityData: generatedModule.entityData,
                            endings: generatedModule.endings,
                            recommendedOccupations: generatedModule.recommendedOccupations,
                            openingNarrative: generatedModule.openingNarrative || '',
                            kpNotes: generatedModule.kpNotes,
                            fullData: generatedModule,
                            isGenerated: true
                        };
                        self.currentScreen = self.SCREENS.CASE_PREVIEW;
                        self.render();
                    }
                }, 600);
                return;
            }

            var el = elements[revealIndex];
            var orbInner = orb ? orb.querySelector('.orb-inner') : null;

            if (orbInner) {
                orbInner.textContent = el.icon;
                orbInner.style.transform = 'scale(1.3)';
                setTimeout(function() {
                    if (orbInner) orbInner.style.transform = 'scale(1)';
                }, 200);
            }

            if (displayEl) {
                var tag = document.createElement('div');
                tag.className = 'random-element-tag';
                tag.innerHTML = '<span class="element-icon">' + el.icon + '</span><span class="element-label">' + el.label + '</span><span class="element-value">' + el.value + '</span>';
                tag.style.opacity = '0';
                tag.style.transform = 'translateY(10px)';
                displayEl.appendChild(tag);
                requestAnimationFrame(function() {
                    tag.style.transition = 'opacity 0.4s, transform 0.4s';
                    tag.style.opacity = '1';
                    tag.style.transform = 'translateY(0)';
                });
            }

            revealIndex++;
            setTimeout(revealNext, 350);
        }

        setTimeout(revealNext, 400);
    },

    handleImportFile(file) {
        if (!file) return;
        var reader = new FileReader();
        var self = this;
        reader.onload = function(event) {
            var contentEl = document.getElementById('import-content');
            if (contentEl) contentEl.value = event.target.result;
            var dropZone = document.getElementById('import-drop-zone');
            if (dropZone) {
                var nameEl = dropZone.querySelector('.drop-zone-text');
                if (nameEl) nameEl.textContent = file.name;
                var subEl = dropZone.querySelector('.drop-zone-sub');
                if (subEl) subEl.textContent = '文件已加载（' + (file.size / 1024).toFixed(1) + ' KB），点击可重新选择';
                dropZone.classList.add('file-loaded');
            }
        };
        reader.readAsText(file);
    },

    processImport() {
        var contentEl = document.getElementById('import-content');
        var content = contentEl ? contentEl.value : '';
        if (!content) {
            this.showImportError('请先选择文件或粘贴内容');
            return;
        }

        var result;
        if (typeof StoryGenerator !== 'undefined') {
            if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                result = StoryGenerator.importStoryFromJSON(content);
            } else {
                result = StoryGenerator.importStoryFromMarkdown(content);
            }

            if (result.success) {
                var story = result.story;
                this.selectedCase = {
                    id: story.id,
                    title: story.title,
                    era: story.era,
                    location: story.location,
                    difficulty: story.difficulty,
                    tags: story.tags,
                    hook: story.hook,
                    duration: story.duration,
                    structure: story.structure,
                    layers: story.layers,
                    npcs: story.npcs,
                    entity: story.entity,
                    endings: story.endings,
                    fullData: story
                };
                this.showImportSuccess('剧本「' + story.title + '」校验通过');
                var self = this;
                setTimeout(function() {
                    self.currentScreen = self.SCREENS.CASE_PREVIEW;
                    self.render();
                }, 1200);
            } else {
                var errorMsgs = [];
                for (var e = 0; e < result.errors.length; e++) {
                    errorMsgs.push(result.errors[e].message);
                }
                this.showImportError(errorMsgs.join('\n'));
            }
        } else {
            this.showImportError('故事生成器未加载，无法校验剧本');
        }
    },

    showImportError(msg) {
        var importPanel = document.querySelector('.import-panel');
        if (!importPanel) { alert(msg); return; }

        var existing = importPanel.querySelector('.import-feedback');
        if (existing) existing.remove();

        var errorEl = document.createElement('div');
        errorEl.className = 'import-feedback import-error';
        errorEl.innerHTML = '<span class="feedback-icon">✗</span><span class="feedback-text">' + msg + '</span>';
        importPanel.appendChild(errorEl);

        setTimeout(function() {
            if (errorEl.parentNode) errorEl.remove();
        }, 5000);
    },

    showImportSuccess(msg) {
        var importPanel = document.querySelector('.import-panel');
        if (!importPanel) return;

        var existing = importPanel.querySelector('.import-feedback');
        if (existing) existing.remove();

        var successEl = document.createElement('div');
        successEl.className = 'import-feedback import-success';
        successEl.innerHTML = '<span class="feedback-icon">✓</span><span class="feedback-text">' + msg + '</span>';
        importPanel.appendChild(successEl);

        setTimeout(function() {
            if (successEl.parentNode) successEl.remove();
        }, 4000);
    },

    bindEvents() {
        var self = this;

        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }

        document.getElementById('btn-new-game')?.addEventListener('click', function() {
            self.currentScreen = self.SCREENS.CASE_SELECT;
            self.render();
        });

        document.getElementById('btn-tutorial-demo')?.addEventListener('click', function() {
            if (typeof TutorialDemo !== 'undefined') {
                TutorialDemo.openSetup();
            }
        });

        document.getElementById('btn-continue')?.addEventListener('click', function() {
            if (typeof Main !== 'undefined' && Main.gameState) {
                var gs = Main.gameState;
                var hasActiveGame = gs.character && gs.conversationHistory && gs.conversationHistory.length > 0;
                if (!hasActiveGame) {
                    var autoData = typeof Utils !== 'undefined' ? Utils.loadFromStorage('scribe_autosave') : null;
                    if (autoData) {
                        Main.loadSaveData(autoData, { rebuildChat: true });
                    }
                }
            }
            self.closeMenu();
        });

        document.getElementById('btn-back-main')?.addEventListener('click', function() {
            self.currentScreen = self.SCREENS.MAIN;
            self.render();
        });

        document.getElementById('btn-back-cases')?.addEventListener('click', function() {
            self.currentScreen = self.SCREENS.CASE_SELECT;
            self.render();
        });

        document.querySelectorAll('.mode-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.mode-tab').forEach(function(t) { t.classList.remove('active'); });
                document.querySelectorAll('.mode-panel').forEach(function(p) { p.classList.remove('active'); });
                tab.classList.add('active');
                var panel = document.getElementById('mode-' + tab.dataset.mode);
                if (panel) panel.classList.add('active');
            });
        });

        document.getElementById('carousel-prev')?.addEventListener('click', function() {
            self.navigateCarousel(-1);
        });

        document.getElementById('carousel-next')?.addEventListener('click', function() {
            self.navigateCarousel(1);
        });

        document.querySelectorAll('.carousel-dot').forEach(function(dot) {
            dot.addEventListener('click', function() {
                self.goToCarouselSlide(parseInt(dot.dataset.index));
            });
        });

        document.querySelectorAll('.carousel-select-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var caseId = btn.dataset.caseId;
                var cases = self.getPresetCases();
                self.selectedCase = cases.find(function(c) { return c.id === caseId; });
                self.currentScreen = self.SCREENS.CASE_PREVIEW;
                self.render();
            });
        });

        var carouselContainer = document.getElementById('carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('touchstart', function(e) {
                self._touchStartX = e.touches[0].clientX;
                self._touchStartY = e.touches[0].clientY;
            }, { passive: true });

            carouselContainer.addEventListener('touchend', function(e) {
                var dx = e.changedTouches[0].clientX - self._touchStartX;
                var dy = e.changedTouches[0].clientY - self._touchStartY;
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                    if (dx > 0) self.navigateCarousel(-1);
                    else self.navigateCarousel(1);
                }
            }, { passive: true });
        }

        document.getElementById('btn-random-case')?.addEventListener('click', function() {
            self.selectRandomCase();
        });

        var randomOrb = document.getElementById('random-orb');
        if (randomOrb) {
            randomOrb.addEventListener('click', function() {
                self.selectRandomCase();
            });
        }

        var dropZone = document.getElementById('import-drop-zone');
        if (dropZone) {
            dropZone.addEventListener('click', function() {
                var fileInput = document.getElementById('import-file');
                if (fileInput) fileInput.click();
            });

            dropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
                var files = e.dataTransfer.files;
                if (files.length > 0) {
                    self.handleImportFile(files[0]);
                }
            });
        }

        document.getElementById('import-file')?.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                self.handleImportFile(e.target.files[0]);
            }
        });

        document.getElementById('btn-import-case')?.addEventListener('click', function() {
            self.processImport();
        });

        document.querySelectorAll('.diff-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.diff-btn').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                self.selectedDifficulty = btn.dataset.diff;
            });
        });

        document.querySelectorAll('.occ-card').forEach(function(card) {
            card.addEventListener('click', function() {
                document.querySelectorAll('.occ-card').forEach(function(c) { c.classList.remove('selected'); });
                card.classList.add('selected');
                self.selectedOccupation = card.dataset.occ;
            });
        });

        document.getElementById('btn-start-case')?.addEventListener('click', function() {
            if (typeof Terminal !== 'undefined') {
                Terminal.clear();
                Terminal._chatLog = [];
                Terminal._saveChatLog();
            }
            if (typeof API !== 'undefined') {
                if (API.clearHistory) {
                    API.clearHistory();
                } else {
                    API.conversationHistory = [];
                    if (API.resetUsageStats) API.resetUsageStats();
                }
            }
            if (typeof NPCManager !== 'undefined') {
                NPCManager.companions = [];
                NPCManager.contacts = [];
                NPCManager.allNPCs = {};
                NPCManager.save();
            }
            if (typeof Character !== 'undefined') {
                Character.current = null;
            }
            if (typeof MemorySystem !== 'undefined' && self.selectedCase) {
                MemorySystem.initScenario(self.selectedCase);
            }
            if (typeof Story !== 'undefined' && self.selectedCase) {
                var modData = self.selectedCase.fullData || self.selectedCase;
                if (modData) {
                    Story.startMod(modData, { silent: true });
                    if (typeof Main !== 'undefined') {
                        Main.gameState.character = null;
                        Main.gameState.story = Story.state;
                        Main.gameState.conversationHistory = [];
                        Main.gameState.npcs = { companions: [], contacts: [], allNPCs: {}, combatPower: '无' };
                        Main.gameState.grieferLevel = 0;
                        Main.gameState.grieferHistory = [];
                        Main.gameState.usedSkills = [];
                        Main.gameState.bonusDice = 0;
                        Main.gameState.hiddenBonusDice = 0;
                        Main.gameState.hiddenBonusThisChapter = 0;
                        Main.gameState.hiddenBonusTotal = 0;
                        Main.gameState.isTutorialDemo = false;
                        Main.gameState.tutorialId = null;
                        Main.gameState.combat = { active: false, round: 0, enemies: [], turnOrder: [], currentTurn: 0 };
                        if (typeof GrieferDetector !== 'undefined') {
                            GrieferDetector.level = 0;
                            GrieferDetector.history = [];
                        }
                        Main.updateStatusBar();
                        Main.updateSidebar();
                    }
                }
            }
            self.closeMenu();
            if (typeof CharacterCreation !== 'undefined') {
                CharacterCreation.preselectedOccupation = self.selectedOccupation !== 'custom' ? self.selectedOccupation : null;
                CharacterCreation.open();
            }
        });

        document.querySelectorAll('.theme-chip').forEach(function(chip) {
            chip.addEventListener('click', function() {
                var theme = chip.dataset.theme;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('coc-theme', theme);
                document.querySelectorAll('.theme-chip').forEach(function(c) { c.classList.remove('active'); });
                chip.classList.add('active');
            });
        });

        document.getElementById('btn-settings-menu')?.addEventListener('click', function() {
            self.closeMenu();
            if (typeof Settings !== 'undefined') {
                Settings.open();
            }
        });

        document.getElementById('btn-character-archive')?.addEventListener('click', function() {
            self.closeMenu();
        });

        document.getElementById('btn-about')?.addEventListener('click', function() {
            alert('夜谭 v2.0\n\nCall of Cthulhu AI叙事终端\n由AI驱动的克苏鲁跑团体验');
        });

        this._keyHandler = function(e) {
            if (!document.getElementById('menu-container')?.classList.contains('active')) return;
            if (self.currentScreen !== self.SCREENS.CASE_SELECT) return;
            var activePanel = document.querySelector('.mode-panel.active');
            if (activePanel && activePanel.id === 'mode-carousel') {
                if (e.key === 'ArrowLeft') { e.preventDefault(); self.navigateCarousel(-1); }
                if (e.key === 'ArrowRight') { e.preventDefault(); self.navigateCarousel(1); }
            }
        };
        document.addEventListener('keydown', this._keyHandler);

        var track = document.getElementById('carousel-track');
        if (track) {
            track.style.transform = 'translateX(0px)';
        }
    },

    closeMenu() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        var container = document.getElementById('menu-container');
        if (container) {
            var screen = container.querySelector('.menu-screen');
            if (screen) {
                screen.classList.add('screen-exit-left');
                var self = this;
                setTimeout(function() {
                    container.classList.remove('active');
                    container.innerHTML = '';
                    container.removeAttribute('data-screen');
                }, 280);
            } else {
                container.classList.remove('active');
                container.innerHTML = '';
                container.removeAttribute('data-screen');
            }
        }
        if (typeof Terminal !== 'undefined' && Terminal.inputEl) {
            Terminal.inputEl.focus();
        }
    },

    openMenu() {
        var container = document.getElementById('menu-container');
        if (container) {
            container.classList.add('active');
            this.currentScreen = this.SCREENS.MAIN;
            this.render();
        }
    },

    toggle() {
        var container = document.getElementById('menu-container');
        if (container && container.classList.contains('active')) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
};
