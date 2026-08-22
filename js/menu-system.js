// 主菜单素材：几何徽记与 cthulhu 蜡笔涂鸦母题，取自设计稿。
const MENU_APP_VERSION = 'v2.0';

const MENU_CREST_SVG = '<svg class="m-crest" viewBox="0 0 64 64" fill="none" stroke-width="1.4" aria-hidden="true">'
    + '<circle class="ring" cx="32" cy="32" r="27" stroke="currentColor"/>'
    + '<rect class="dia-o" x="32" y="9" width="32.5" height="32.5" transform="rotate(45 32 9)" stroke="currentColor"/>'
    + '<rect class="dia-i" x="32" y="18" width="19.8" height="19.8" transform="rotate(45 32 18)"/>'
    + '<circle class="moon" cx="32" cy="32" r="4.5"/>'
    + '<path class="wing" d="M14 32c6-7 12-7 18 0M50 32c-6 7-12 7-18 0"/>'
    + '</svg>';

const MENU_CTHULHU_SCRAWL = '<svg class="m-cth" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" fill="none"> <defs> <radialGradient id="wetfill" cx="48%" cy="40%" r="62%"> <stop offset="0%" stop-color="#021712" stop-opacity=".66"></stop> <stop offset="55%" stop-color="#03190f" stop-opacity=".42"></stop> <stop offset="80%" stop-color="#010c08" stop-opacity=".6"></stop> <stop offset="100%" stop-color="#021712" stop-opacity="0"></stop> </radialGradient> <radialGradient id="biofill" cx="50%" cy="50%" r="60%"> <stop offset="0%" stop-color="#103a31" stop-opacity=".5"></stop> <stop offset="70%" stop-color="#0a241e" stop-opacity=".2"></stop> <stop offset="100%" stop-color="#0a241e" stop-opacity="0"></stop> </radialGradient> <filter id="wet" x="-35%" y="-35%" width="170%" height="170%"> <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" result="n"></feTurbulence> <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap> </filter> <filter id="crayon" x="-20%" y="-20%" width="140%" height="140%"> <feTurbulence type="fractalNoise" baseFrequency="0.03 0.034" numOctaves="2" seed="4" result="warp"></feTurbulence> <feDisplacementMap in="SourceGraphic" in2="warp" scale="5.5" xChannelSelector="R" yChannelSelector="G" result="wavy"></feDisplacementMap> <feTurbulence type="turbulence" baseFrequency="0.55 0.6" numOctaves="2" seed="7" result="tex"></feTurbulence> <feColorMatrix in="tex" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.35 1.04" result="texA"></feColorMatrix> <feComposite in="wavy" in2="texA" operator="in"></feComposite> </filter> </defs> <!-- WET STAINS · tide lines · drips --> <g filter="url(#wet)"> <ellipse cx="138" cy="152" rx="150" ry="116" fill="url(#wetfill)"></ellipse> <ellipse cx="138" cy="152" rx="130" ry="98" stroke="#010b07" stroke-opacity=".5" stroke-width="6"></ellipse> <ellipse cx="150" cy="508" rx="208" ry="156" fill="url(#wetfill)"></ellipse> <ellipse cx="150" cy="508" rx="182" ry="135" stroke="#010b07" stroke-opacity=".6" stroke-width="8"></ellipse> <ellipse cx="864" cy="118" rx="156" ry="126" fill="url(#wetfill)"></ellipse> <ellipse cx="864" cy="118" rx="132" ry="104" stroke="#010b07" stroke-opacity=".56" stroke-width="7"></ellipse> <ellipse cx="640" cy="566" rx="214" ry="122" fill="url(#biofill)"></ellipse> <ellipse cx="116" cy="610" rx="12" ry="90" fill="url(#wetfill)"></ellipse> <ellipse cx="196" cy="622" rx="9" ry="68" fill="url(#wetfill)"></ellipse> <ellipse cx="258" cy="594" rx="7" ry="52" fill="url(#wetfill)"></ellipse> <ellipse cx="296" cy="244" rx="8" ry="66" fill="url(#wetfill)"></ellipse> <ellipse cx="904" cy="258" rx="10" ry="84" fill="url(#wetfill)"></ellipse> <ellipse cx="820" cy="250" rx="7" ry="60" fill="url(#wetfill)"></ellipse> </g> <!-- HAND-DRAWN CRAYON DIARY --> <g filter="url(#crayon)" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".36"> <!-- the family — 妈妈 爸爸 我 …and the one who is gone --> <g transform="translate(2 20)"> <circle cx="80" cy="110" r="11"></circle> <path d="M80 121 V160 M61 133 Q80 141 99 131 M80 160 L66 186 M80 160 L94 186"></path> <circle cx="122" cy="112" r="10"></circle> <path d="M122 122 V158 M105 134 Q122 141 139 132 M122 158 L110 182 M122 158 L134 182"></path> <circle cx="158" cy="122" r="8"></circle> <path d="M158 130 V152 M146 138 Q158 144 170 137 M158 152 L149 172 M158 152 L167 172"></path> <g opacity=".45"> <circle cx="200" cy="116" r="10"></circle> <path d="M200 126 V160 M184 138 Q200 145 216 136 M200 160 L188 184 M200 160 L212 184"></path> </g> <!-- scribbled out, violently --> <path d="M180 100 L222 152 M222 100 L180 152 M178 124 L224 124 M201 96 L201 156 M184 106 Q212 120 216 142 Q218 158 188 150"></path> <!-- a frightened question --> <path d="M196 88 q3 -11 13 -7 q9 4 2 12 q-4 5 -8 7 M199 110 l0 1"></path> </g> <!-- counting the days — tally \'正\' style strokes --> <path d="M70 208 V232 M78 208 V232 M86 208 V232 M94 208 V232 M65 232 L99 208"></path> <path d="M114 208 V232 M122 208 V232 M130 208 V232 M138 208 V232 M109 232 L143 208"></path> <path d="M158 208 V232 M166 208 V232 M174 208 V232"></path> <!-- the house, drowning --> <path d="M58 470 V414 H162 V470 Z"></path> <path d="M48 414 L110 374 L172 414"></path> <path d="M96 470 V438 H122 V470"></path> <path d="M68 430 H90 V452 H68 Z M79 430 V452 M68 441 H90"></path> <circle cx="110" cy="362" r="6"></circle> <path d="M110 368 V382 M101 374 L95 362 M119 374 L125 362"></path> <path d="M34 452 q12 -7 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" opacity=".7"></path> <path d="M34 466 q12 -7 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" opacity=".7"></path> <path d="M34 480 q12 -7 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" opacity=".7"></path> <!-- someone is drowning --> <path d="M246 518 q14 -7 28 0 t28 0 t28 0 t28 0 t28 0 t28 0" opacity=".7"></path> <path d="M246 532 q14 -7 28 0 t28 0 t28 0 t28 0 t28 0 t28 0" opacity=".7"></path> <circle cx="272" cy="504" r="7"></circle> <path d="M262 510 L255 496 M282 510 L289 496"></path> <path d="M272 514 V532" opacity=".4"></path> <path d="M312 510 Q334 526 364 510 M312 510 H364 M338 510 V488 M338 490 L356 502 L338 502 Z"></path> <!-- the sun, but it is sad / wrong — nudged in toward center --> <g transform="translate(-95 44)"> <circle cx="832" cy="150" r="34"></circle> <path d="M832 104 V88 M832 196 V212 M878 150 H894 M786 150 H770 M865 117 L876 106 M799 183 L788 194 M865 183 L876 194 M799 117 L788 106"></path> <circle cx="820" cy="144" r="3.4"></circle> <circle cx="844" cy="144" r="3.4"></circle> <path d="M814 168 l7 7 l7 -7 l7 7 l7 -7"></path> </g> <!-- it is watching — a cluster of eyes --> <g> <path d="M844 316 Q862 302 880 316 Q862 330 844 316 Z"></path><circle cx="862" cy="316" r="5.4" fill="currentColor"></circle> <path d="M889 332 Q903 321 917 332 Q903 343 889 332 Z"></path><circle cx="903" cy="332" r="4.2" fill="currentColor"></circle> <path d="M831 354 Q846 342 861 354 Q846 366 831 354 Z"></path><circle cx="846" cy="354" r="4.6" fill="currentColor"></circle> <path d="M893 366 Q905 357 917 366 Q905 375 893 366 Z"></path><circle cx="905" cy="366" r="3.6" fill="currentColor"></circle> <path d="M864 340 Q874 333 884 340 Q874 347 864 340 Z"></path><circle cx="874" cy="340" r="3.2" fill="currentColor"></circle> </g> <!-- the thing that came up from the water --> <circle cx="812" cy="488" r="50"></circle> <circle cx="792" cy="474" r="7"></circle><circle cx="792" cy="475" r="2.4" fill="currentColor"></circle> <circle cx="830" cy="470" r="8"></circle><circle cx="830" cy="471" r="2.6" fill="currentColor"></circle> <circle cx="812" cy="498" r="6"></circle><circle cx="812" cy="499" r="2.2" fill="currentColor"></circle> <path d="M788 512 l8 9 l8 -9 l8 9 l8 -9 l8 9"></path> <path d="M796 442 L788 424 M828 442 L836 422"></path> <path d="M774 530 q-10 20 4 30 q14 8 2 28 M804 536 q6 20 -8 30 q-10 10 4 24 M836 532 q12 18 0 30 q-8 12 8 22 M854 518 q18 16 8 34"></path> <!-- a crooked arrow, pointing down to the water --> <path d="M150 252 q42 28 30 72 M178 312 l2 14 l11 -9" opacity=".5"></path> </g> </svg>';

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

    // 主菜单条目 —— 设计稿的「案卷目录」四条，加上项目自有的试玩入口。
    // meta 里的英文小标与设计稿一致；「继续」的 meta 走真实存档。
    getMenuEntries() {
        var savedChar = this.getSavedCharacter();
        var savedProgress = this.getSavedProgress();
        var hasSave = !!(savedChar && typeof Utils !== 'undefined' && Utils.loadFromStorage('scribe_autosave'));

        var continueMeta = '暂无存档';
        if (hasSave) {
            var bits = [];
            if (savedProgress && savedProgress.chapter) bits.push('第' + savedProgress.chapter + '章');
            if (savedProgress && savedProgress.modName) bits.push(savedProgress.modName);
            if (savedChar && savedChar.name) bits.push(savedChar.name);
            continueMeta = bits.length ? bits.join(' · ') : '回到上次进度';
        }

        return [
            { id: 'btn-tutorial-demo',      num: 'I',   name: '15分钟试玩', en: 'Demo Case',  meta: '独立试玩档 · 检定 · 线索 · 结局抉择' },
            { id: 'btn-new-game',           num: 'II',  name: '新的调查',   en: 'New Case',   meta: '拈起一桩崭新的卷宗', primary: true },
            { id: 'btn-continue',           num: 'III', name: '继续调查',   en: 'Continue',   meta: continueMeta, disabled: !hasSave },
            { id: 'btn-character-archive',  num: 'IV',  name: '角色档案',   en: 'Archives',   meta: '已封存的调查员与故事' },
            { id: 'btn-settings-menu',      num: 'V',   name: '设置',       en: 'Settings',   meta: '守秘人 · 外观 · 存档' }
        ];
    },

    renderMainScreen() {
        var currentTheme = document.documentElement.getAttribute('data-theme') || 'detective';
        var themes = [
            { key: 'detective', dot: '#8c2f28', title: '侦探事务所' },
            { key: 'deco',      dot: '#d8b65a', title: '装饰艺术' },
            { key: 'cthulhu',   dot: '#46c9a8', title: '深海' }
        ];

        // 氛围层：底色 / 晕影 / 主题纹理 + 胶片颗粒，位于 .menu 之下
        var html = '<div class="bgfx" aria-hidden="true"></div>';
        html += '<div class="grain" aria-hidden="true"></div>';
        html += '<div class="menu-screen menu">';

        // 主题切换（右上角三/四色点）
        html += '<div class="m-top"><div class="tsw" id="tsw">';
        themes.forEach(function(t) {
            html += '<button type="button" data-set="' + t.key + '" title="' + t.title + '"'
                 +  ' aria-pressed="' + (currentTheme === t.key ? 'true' : 'false') + '">'
                 +  '<i style="background:' + t.dot + '"></i></button>';
        });
        html += '</div></div>';

        // 每套主题的氛围母题
        html += '<div class="m-motif">' + MENU_CTHULHU_SCRAWL + '</div>';

        // 角标：cthulhu 走 CSS 角，deco 走鎏金角饰，detective 的边框已烤进背景板
        html += '<span class="m-corner tl"></span><span class="m-corner tr"></span>'
             +  '<span class="m-corner bl"></span><span class="m-corner br"></span>';
        html += '<span class="m-orn-corner tl" aria-hidden="true"></span><span class="m-orn-corner tr" aria-hidden="true"></span>'
             +  '<span class="m-orn-corner bl" aria-hidden="true"></span><span class="m-orn-corner br" aria-hidden="true"></span>';

        // 主题道具：detective 提灯 · cthulhu 湿痕 · deco 鎏金几何
        html += '<div class="m-lantern" aria-hidden="true"></div>';
        html += '<div class="m-stain s1" aria-hidden="true"></div><div class="m-stain s2" aria-hidden="true"></div>'
             +  '<div class="m-stain s3" aria-hidden="true"></div><div class="m-stain s4" aria-hidden="true"></div>';
        html += '<div class="m-geo left" aria-hidden="true"></div><div class="m-geo right" aria-hidden="true"></div>';

        html += '<div class="m-core">';
        html += '<div class="m-kicker">'
             +  '<span class="dd">\u25c6</span>'
             +  '<span class="t-det">阿卡姆 · 守秘人事务所 · 卷宗待启</span>'
             +  '<span class="t-deco">Le Bureau du Gardien · MCMXXI</span>'
             +  '<span class="t-cth">深 渊 来 信 · 不 可 名 状</span>'
             +  '<span class="dd">\u25c7</span>'
             +  '</div>';
        html += MENU_CREST_SVG;
        html += '<div class="m-crest-img" aria-hidden="true"></div>';
        html += '<h1 class="m-title">夜谭</h1>';
        html += '<div class="m-div"><i></i><span>\u25c8</span><i></i></div>';
        html += '<div class="m-sub">Night Tales</div>';
        html += '<div class="m-tag">单人克苏鲁文字跑团 · 守秘人为你执笔</div>';

        html += '<div class="m-plate">';
        html += '<div class="m-plate-tab">'
             +  '<span class="t-det">案 卷 目 录 · CASE INDEX</span>'
             +  '<span class="t-deco">Sommaire</span>'
             +  '<span class="t-cth">残 卷 索 引</span>'
             +  '</div>';
        html += '<nav class="m-entries">';
        this.getMenuEntries().forEach(function(e) {
            html += '<button type="button" class="m-entry' + (e.primary ? ' primary' : '') + '" id="' + e.id + '"'
                 +  (e.disabled ? ' disabled' : '') + '>'
                 +  '<span class="m-num"><i>' + e.num + '</i></span>'
                 +  '<span class="body"><span class="nm">' + e.name + '</span>'
                 +  '<span class="meta">' + e.en + ' · ' + e.meta + '</span></span>'
                 +  '<span class="go">\u2192</span>'
                 +  '</button>';
        });
        html += '</nav>';
        html += '</div>';   // .m-plate
        html += '</div>';   // .m-core

        html += '<div class="m-foot">';
        html += '<div class="m-ver"><span>夜谭 ' + MENU_APP_VERSION + '</span>'
             +  '<button type="button" class="m-about" id="btn-about">关于</button></div>';
        html += '<div class="keeper"><i></i>守秘人已就位</div>';
        html += '</div>';

        html += '</div>';   // .menu
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

        var html = '<div class="bgfx" aria-hidden="true"></div>'
            + '<div class="paperfx" aria-hidden="true"></div>'
            + '<div class="grain" aria-hidden="true"></div>';
        html += '<div class="menu-screen case-select-screen">';

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
        html += '<div class="footline"><span class="v">夜谭 ' + MENU_APP_VERSION + '</span>'
             +  '<span class="wave" aria-hidden="true"></span>'
             +  '<span class="v">Case Index</span></div>';
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

        var html = '<div class="bgfx" aria-hidden="true"></div>'
            + '<div class="paperfx" aria-hidden="true"></div>'
            + '<div class="grain" aria-hidden="true"></div>';
        html += '<div class="menu-screen case-preview">';
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
        html += '<div class="footline"><span class="v">夜谭 ' + MENU_APP_VERSION + '</span>'
             +  '<span class="wave" aria-hidden="true"></span>'
             +  '<span class="v">Case File</span></div>';
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

        document.querySelectorAll('#tsw button').forEach(function(dot) {
            dot.addEventListener('click', function() {
                var theme = dot.dataset.set;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('coc-theme', theme);
                document.querySelectorAll('#tsw button').forEach(function(d) {
                    d.setAttribute('aria-pressed', d === dot ? 'true' : 'false');
                });
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
