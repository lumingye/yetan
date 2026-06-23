const Settings = {
    overlayEl: null,
    backdropEl: null,
    isOpen: false,
    toggleStates: {},

    STORAGE_KEY: 'abyss_config',

    TEXT_PROVIDERS: {
        'OpenAI': { url: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
        'Anthropic': { url: 'https://api.anthropic.com/v1', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] },
        '智谱GLM': { url: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-plus', 'glm-4', 'glm-4-air', 'glm-4-flash', 'glm-3-turbo'] },
        'DeepSeek': { url: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'] },
        'Groq': { url: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
        'Moonshot': { url: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] },
        '其他': { url: '', models: [] }
    },

    IMAGE_PROVIDERS: {
        'OpenAI（DALL-E）': { url: 'https://api.openai.com/v1', models: ['dall-e-3', 'dall-e-2'] },
        'Stability AI': { url: 'https://api.stability.ai/v1', models: ['stable-diffusion-xl-1024-v1-0', 'stable-diffusion-v1-6', 'stable-diffusion-3'] },
        '智谱（CogView）': { url: 'https://open.bigmodel.cn/api/paas/v4', models: ['cogview-4-250304', 'cogview-4', 'cogview-3-flash', 'cogview-3-plus', 'cogview-3'] },
        '百度（文心一格）': { url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop', models: ['ernie-vilg-v2'] },
        'Midjourney API': { url: '', models: ['midjourney-v6', 'midjourney-v5.2'] },
        '其他': { url: '', models: [] }
    },

    DEFAULT_CONFIG: {
        text_api: {
            provider: '',
            base_url: '',
            api_key: '',
            model: '',
            parameters: {
                temperature: 0.7,
                top_p: 1.0,
                max_tokens: 4096,
                frequency_penalty: 0,
                presence_penalty: 0
            }
        },
        image_api: {
            provider: '',
            base_url: '',
            api_key: '',
            model: '',
            image_size: '1024x1024',
            image_quality: 'standard',
            image_count: 1,
            auto_gen_portrait: true,
            auto_gen_cg: false,
            auto_gen_npc: false
        }
    },

    currentConfig: null,

    init() {
        this.overlayEl = document.getElementById('settings-overlay');
        this.backdropEl = document.getElementById('settings-overlay-backdrop');
        this.loadToggleStates();
        this.currentConfig = this.loadConfig();
        try { this.bindEvents(); } catch (e) { console.error('Settings.bindEvents error:', e); }
        try { this.loadConfigToUI(); } catch (e) { console.error('Settings.loadConfigToUI error:', e); }
        try { this.initComboBoxes(); } catch (e) { console.error('Settings.initComboBoxes error:', e); }
        try { this.initParams(); } catch (e) { console.error('Settings.initParams error:', e); }
        try { this.initPasswordToggles(); } catch (e) { console.error('Settings.initPasswordToggles error:', e); }
        try { this.initGameSettings(); } catch (e) { console.error('Settings.initGameSettings error:', e); }
        try { this.initCurlMode(); } catch (e) { console.error('Settings.initCurlMode error:', e); }
    },

    loadConfig() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) return this.deepMerge(this.DEFAULT_CONFIG, JSON.parse(stored));
        } catch (e) {
            console.warn('配置加载失败，使用默认配置', e);
        }
        return JSON.parse(JSON.stringify(this.DEFAULT_CONFIG));
    },

    deepMerge(target, source) {
        const result = JSON.parse(JSON.stringify(target));
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    },

    saveConfigToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentConfig));
            if (typeof API !== 'undefined') {
                API.reloadConfig();
            }
            this.showToast('配置已保存', 'success');
        } catch (e) {
            this.showToast('保存失败: ' + e.message, 'error');
        }
    },

    getParamDefaults() {
        return JSON.parse(JSON.stringify(this.DEFAULT_CONFIG.text_api.parameters));
    },

    loadToggleStates() {
        let saved = Utils.loadFromStorage('scribe_settings_toggles');
        // coc_* → scribe_* 迁移已由 Main._migrateStorageKeys() 统一处理
        if (saved) this.toggleStates = saved;
    },

    saveToggleStates() {
        Utils.saveToStorage('scribe_settings_toggles', this.toggleStates);
    },

    getToggle(key, defaultVal) {
        if (this.toggleStates[key] !== undefined) return this.toggleStates[key];
        return defaultVal;
    },

    setToggle(key, value) {
        this.toggleStates[key] = value;
        this.saveToggleStates();
    },

    showToast(msg, type) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast ' + (type || 'info');
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 3000);
    },

    setStatus(elId, msg, type) {
        var el = document.getElementById(elId);
        if (!el) return;
        el.textContent = msg;
        el.className = 'status-msg ' + (type || '');
        if (type === 'success' || type === 'error') {
            setTimeout(function () { el.textContent = ''; el.className = 'status-msg'; }, 4000);
        }
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        if (this.isOpen) return;
        try { this.currentConfig = this.loadConfig(); } catch (e) { console.error('open.loadConfig error:', e); }
        try { this.loadConfigToUI(); } catch (e) { console.error('open.loadConfigToUI error:', e); }
        if (this.overlayEl) this.overlayEl.classList.add('active');
        if (this.backdropEl) this.backdropEl.classList.add('active');
        this.isOpen = true;
        try { this.renderSaveSlots(); } catch (e) { console.error('open.renderSaveSlots error:', e); }
        try { this.refreshGameSettings(); } catch (e) { console.error('open.refreshGameSettings error:', e); }
    },

    close() {
        if (!this.isOpen) return;
        if (this.overlayEl) this.overlayEl.classList.remove('active');
        if (this.backdropEl) this.backdropEl.classList.remove('active');
        this.isOpen = false;
    },

    buildModelProvider(providers) {
        var result = {};
        for (var name in providers) {
            var models = providers[name].models || [];
            models.forEach(function (m) { result[m] = m; });
        }
        return result;
    },

    loadModelsForProvider(modelInputId, dropdownId, models) {
        var modelInput = document.getElementById(modelInputId);
        if (modelInput && models && models.length > 0) {
            modelInput.value = models[0];
        }
        var dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.innerHTML = '';
            (models || []).forEach(function (m) {
                var li = document.createElement('li');
                li.textContent = m;
                li.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    modelInput.value = m;
                    dropdown.classList.remove('show');
                });
                dropdown.appendChild(li);
            });
        }
    },

    populateInitialModels() {
        var tp = this.currentConfig.text_api;
        if (tp.provider && this.TEXT_PROVIDERS[tp.provider]) {
            var models = this.TEXT_PROVIDERS[tp.provider].models || [];
            this.loadModelsForProvider('textModel', 'textModelDropdown', models);
        }
        var ip = this.currentConfig.image_api;
        if (ip.provider && this.IMAGE_PROVIDERS[ip.provider]) {
            var imgModels = this.IMAGE_PROVIDERS[ip.provider].models || [];
            this.loadModelsForProvider('imageModel', 'imageModelDropdown', imgModels);
        }
    },

    initComboBox(config) {
        var self = this;
        var comboEl = document.getElementById(config.comboId);
        var inputEl = document.getElementById(config.inputId);
        var toggleEl = document.getElementById(config.toggleId);
        var dropdownEl = document.getElementById(config.dropdownId);
        var providers = config.providers || {};

        if (!comboEl || !inputEl || !toggleEl || !dropdownEl) return;

        function renderDropdown(filterText) {
            dropdownEl.innerHTML = '';
            var keys = Object.keys(providers);
            var filtered = filterText ? keys.filter(function (k) {
                return k.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
            }) : keys;
            if (filtered.length === 0) {
                var li = document.createElement('li');
                li.textContent = '自定义: "' + filterText + '"';
                li.style.fontStyle = 'italic';
                li.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    inputEl.value = filterText;
                    dropdownEl.classList.remove('show');
                    if (config.onChange) config.onChange(filterText);
                });
                dropdownEl.appendChild(li);
            } else {
                filtered.forEach(function (key) {
                    var li = document.createElement('li');
                    li.textContent = key;
                    if (key === inputEl.value) li.classList.add('selected');
                    li.addEventListener('mousedown', function (e) {
                        e.preventDefault();
                        inputEl.value = key;
                        dropdownEl.classList.remove('show');
                        if (config.onChange) config.onChange(key);
                    });
                    dropdownEl.appendChild(li);
                });
            }
        }

        inputEl.addEventListener('focus', function () {
            renderDropdown(inputEl.value);
            dropdownEl.classList.add('show');
        });

        inputEl.addEventListener('input', function () {
            renderDropdown(inputEl.value);
            dropdownEl.classList.add('show');
        });

        toggleEl.addEventListener('click', function () {
            if (dropdownEl.classList.contains('show')) {
                dropdownEl.classList.remove('show');
            } else {
                renderDropdown(inputEl.value);
                dropdownEl.classList.add('show');
            }
        });

        inputEl.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') dropdownEl.classList.remove('show');
            if (e.key === 'Enter') dropdownEl.classList.remove('show');
        });

        document.addEventListener('click', function (e) {
            if (!comboEl.contains(e.target)) dropdownEl.classList.remove('show');
        });
    },

    initComboBoxes() {
        var self = this;

        this.initComboBox({
            comboId: 'textProviderCombo',
            inputId: 'textProvider',
            toggleId: 'textProviderToggle',
            dropdownId: 'textProviderDropdown',
            providers: this.TEXT_PROVIDERS,
            onChange: function (key) {
                var info = self.TEXT_PROVIDERS[key];
                if (info) {
                    if (info.url) document.getElementById('textBaseUrl').value = info.url;
                    self.currentConfig.text_api.provider = key;
                    self.loadModelsForProvider('textModel', 'textModelDropdown', info.models);
                }
            }
        });

        this.initComboBox({
            comboId: 'textModelCombo',
            inputId: 'textModel',
            toggleId: 'textModelToggle',
            dropdownId: 'textModelDropdown',
            providers: this.buildModelProvider(this.TEXT_PROVIDERS),
            onChange: function (key) {
                self.currentConfig.text_api.model = key;
            }
        });

        this.initComboBox({
            comboId: 'imageProviderCombo',
            inputId: 'imageProvider',
            toggleId: 'imageProviderToggle',
            dropdownId: 'imageProviderDropdown',
            providers: this.IMAGE_PROVIDERS,
            onChange: function (key) {
                var info = self.IMAGE_PROVIDERS[key];
                if (info) {
                    if (info.url) document.getElementById('imageBaseUrl').value = info.url;
                    self.currentConfig.image_api.provider = key;
                    self.loadModelsForProvider('imageModel', 'imageModelDropdown', info.models);
                }
            }
        });

        this.initComboBox({
            comboId: 'imageModelCombo',
            inputId: 'imageModel',
            toggleId: 'imageModelToggle',
            dropdownId: 'imageModelDropdown',
            providers: this.buildModelProvider(this.IMAGE_PROVIDERS),
            onChange: function (key) {
                self.currentConfig.image_api.model = key;
            }
        });

        this.populateInitialModels();
    },

    initPasswordToggles() {
        var self = this;

        this.initPasswordToggle('toggleTextApiKey', 'textApiKey');
        this.initPasswordToggle('toggleImageApiKey', 'imageApiKey');
    },

    initPasswordToggle(toggleId, inputId) {
        var toggleBtn = document.getElementById(toggleId);
        var inputEl = document.getElementById(inputId);
        if (!toggleBtn || !inputEl) return;

        toggleBtn.addEventListener('click', function () {
            var isPassword = inputEl.type === 'password';
            inputEl.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = isPassword
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        });
    },

    initParams() {
        var self = this;
        var params = [
            { slider: 'temperature', num: 'temperatureNum', val: 'temperatureVal', key: 'temperature' },
            { slider: 'topP', num: 'topPNum', val: 'topPVal', key: 'top_p' },
            { slider: 'maxTokens', num: 'maxTokensNum', val: 'maxTokensVal', key: 'max_tokens' },
            { slider: 'freqPenalty', num: 'freqPenaltyNum', val: 'freqPenaltyVal', key: 'frequency_penalty' },
            { slider: 'presPenalty', num: 'presPenaltyNum', val: 'presPenaltyVal', key: 'presence_penalty' }
        ];

        params.forEach(function (p) {
            var slider = document.getElementById(p.slider);
            var num = document.getElementById(p.num);
            var valEl = document.getElementById(p.val);

            if (!slider || !num) return;

            function syncToNum() {
                var v = parseFloat(slider.value);
                num.value = v;
                if (valEl) valEl.textContent = v;
                self.currentConfig.text_api.parameters[p.key] = v;
            }

            slider.addEventListener('input', syncToNum);

            num.addEventListener('input', function () {
                var v = parseFloat(num.value);
                if (isNaN(v)) return;
                v = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), v));
                slider.value = v;
                if (valEl) valEl.textContent = v;
                self.currentConfig.text_api.parameters[p.key] = v;
            });

            num.addEventListener('change', function () {
                var v = parseFloat(num.value);
                if (isNaN(v)) { num.value = slider.value; return; }
                v = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), v));
                num.value = v;
                slider.value = v;
                if (valEl) valEl.textContent = v;
                self.currentConfig.text_api.parameters[p.key] = v;
            });
        });

        var imgCountSlider = document.getElementById('imageCount');
        var imgCountVal = document.getElementById('imageCountVal');
        if (imgCountSlider && imgCountVal) {
            imgCountSlider.addEventListener('input', function () {
                imgCountVal.textContent = imgCountSlider.value;
                self.currentConfig.image_api.image_count = parseInt(imgCountSlider.value);
            });
        }
    },

    initGameSettings() {
        var self = this;

        var modeDisplayEl = document.getElementById('setting-mode-display');
        if (modeDisplayEl) {
            modeDisplayEl.textContent = Terminal.quickMode ? '快速模式' : '正常模式';
        }

        var diffEl = document.getElementById('setting-difficulty');
        if (diffEl) {
            var currentDiff = typeof Main !== 'undefined' ? Main.gameState.difficulty : 'investigator';
            diffEl.value = currentDiff;
            diffEl.addEventListener('change', function () {
                if (typeof Main !== 'undefined') {
                    Main.gameState.difficulty = this.value;
                    Main.autoSave();
                    Main.updateStatusBar();
                }
                var diffNames = { investigator: '调查员', survivor: '幸存者', nightmare: '噩梦' };
                Terminal.printSystem('难度已切换为：' + (diffNames[this.value] || this.value));
            });
        }

        var twEl = document.getElementById('setting-typewriter');
        if (twEl) {
            twEl.value = String(Terminal.typewriterSpeed);
            twEl.addEventListener('change', function () {
                Terminal.typewriterSpeed = parseInt(this.value);
            });
        }

        var soundEl = document.getElementById('setting-sound');
        if (soundEl) {
            var soundEnabled = typeof SoundSystem !== 'undefined' ? SoundSystem.enabled : false;
            soundEl.checked = soundEnabled;
            soundEl.addEventListener('change', function () {
                if (typeof SoundSystem !== 'undefined') {
                    SoundSystem.enabled = this.checked;
                    SoundSystem.save();
                    SoundSystem.updateSoundIcon();
                    if (!this.checked) SoundSystem.stopAmbient();
                }
            });
        }

        var soundVolEl = document.getElementById('setting-sound-volume');
        var soundVolVal = document.getElementById('setting-sound-volume-val');
        if (soundVolEl) {
            var currentVol = typeof SoundSystem !== 'undefined' ? Math.round(SoundSystem.volume * 100) : 50;
            soundVolEl.value = currentVol;
            if (soundVolVal) soundVolVal.textContent = currentVol + '%';
            soundVolEl.addEventListener('input', function () {
                var vol = parseInt(this.value);
                if (soundVolVal) soundVolVal.textContent = vol + '%';
                if (typeof SoundSystem !== 'undefined') {
                    SoundSystem.setVolume(vol / 100);
                }
            });
        }

        var ambientEl = document.getElementById('setting-ambient');
        if (ambientEl) {
            var currentAmbient = typeof SoundSystem !== 'undefined' ? SoundSystem.currentAmbient : 'silence';
            ambientEl.value = currentAmbient || 'silence';
            ambientEl.addEventListener('change', function () {
                if (typeof SoundSystem !== 'undefined' && SoundSystem.enabled) {
                    SoundSystem.startAmbient(this.value);
                }
            });
        }

        var autoSaveEl = document.getElementById('setting-auto-save');
        if (autoSaveEl) {
            autoSaveEl.checked = this.getToggle('autoSave', true);
            autoSaveEl.addEventListener('change', function () {
                self.setToggle('autoSave', this.checked);
            });
        }

        var diceEl = document.getElementById('setting-dice-animation');
        if (diceEl) {
            diceEl.checked = this.getToggle('diceAnimation', true);
            diceEl.addEventListener('change', function () {
                self.setToggle('diceAnimation', this.checked);
            });
        }

        var tokenUsageEl = document.getElementById('setting-token-usage');
        if (tokenUsageEl) {
            tokenUsageEl.checked = this.getToggle('showTokenUsage', false);
            tokenUsageEl.addEventListener('change', function () {
                self.setToggle('showTokenUsage', this.checked);
                if (typeof Main !== 'undefined') Main.updateStatusBar();
            });
        }

        var debugLogEl = document.getElementById('setting-debug-log');
        if (debugLogEl) {
            debugLogEl.checked = this.getToggle('debugLog', false);
            if (typeof API !== 'undefined') API._debugLogEnabled = debugLogEl.checked;
            debugLogEl.addEventListener('change', function () {
                self.setToggle('debugLog', this.checked);
                if (typeof API !== 'undefined') API._debugLogEnabled = this.checked;
            });
        }

        var debugExportBtn = document.getElementById('btn-debug-export');
        if (debugExportBtn) {
            debugExportBtn.addEventListener('click', function () {
                if (typeof API !== 'undefined') API.exportDebugLog();
            });
        }

        var debugClearBtn = document.getElementById('btn-debug-clear');
        if (debugClearBtn) {
            debugClearBtn.addEventListener('click', function () {
                if (typeof API !== 'undefined') API.clearDebugLog();
            });
        }

        this.renderSaveSlots();

        var exportBtn = document.getElementById('btn-export-save');
        if (exportBtn) {
            exportBtn.addEventListener('click', function () {
                if (typeof Main !== 'undefined') {
                    Main.exportSaveAsJSON();
                    self.showToast('存档已导出', 'success');
                }
            });
        }

        var importBtn = document.getElementById('btn-import-save');
        if (importBtn) {
            importBtn.addEventListener('click', function () {
                var fileInput = document.getElementById('importFileInput');
                if (!fileInput) return;
                fileInput.onchange = async function (e) {
                    var file = e.target.files[0];
                    if (!file) return;
                    fileInput.value = '';
                    if (typeof Main !== 'undefined') {
                        try {
                            await Main.importSaveFromJSON(file);
                            self.showToast('存档已导入', 'success');
                            Main.updateSidebar();
                            Main.updateStatusBar();
                            self.renderSaveSlots();
                        } catch (err) {
                            self.showToast('导入失败：' + err.message, 'error');
                        }
                    }
                };
                fileInput.click();
            });
        }

        var clearBtn = document.getElementById('btn-clear-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (confirm('确定要清除所有游戏数据吗？此操作不可恢复。')) {
                    Settings.clearProjectData();
                    self.showToast('所有数据已清除，页面将刷新', 'info');
                    setTimeout(function () { location.reload(); }, 1500);
                }
            });
        }

        var saveGameBtn = document.getElementById('btnSaveGame');
        if (saveGameBtn) {
            saveGameBtn.addEventListener('click', function () {
                self.setToggle('autoSave', autoSaveEl ? autoSaveEl.checked : true);
                self.setToggle('diceAnimation', diceEl ? diceEl.checked : true);
                self.setToggle('showTokenUsage', tokenUsageEl ? tokenUsageEl.checked : false);
                self.setToggle('debugLog', debugLogEl ? debugLogEl.checked : false);
                self.setToggle('sound', soundEl ? soundEl.checked : false);
                self.showToast('游戏设置已保存', 'success');
            });
        }
    },

    clearProjectData() {
        var exactKeys = {
            'abyss_config': true,
            'coc-theme': true,
            'mythos_selector': true
        };
        var prefixes = ['coc_', 'scribe_'];
        var keys = [];

        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (!key) continue;
            if (exactKeys[key] || prefixes.some(function (prefix) { return key.indexOf(prefix) === 0; })) {
                keys.push(key);
            }
        }

        keys.forEach(function (key) {
            localStorage.removeItem(key);
        });
    },

    renderSaveSlots() {
        var container = document.getElementById('save-slots-container');
        if (!container) return;
        container.innerHTML = '';

        var slots = typeof Main !== 'undefined' ? Main.getSaveSlots() : [];
        slots.forEach(function (s) {
            var label = s.isAuto ? '自动存档' : '存档 ' + s.slot;
            var diffNames = { investigator: '调查员', survivor: '幸存者', nightmare: '噩梦' };

            var slotEl = document.createElement('div');
            slotEl.className = 'save-slot-row';

            if (s.empty) {
                slotEl.innerHTML = '<span class="save-slot-empty">' + label + '：空</span>' +
                    '<button class="btn btn-outline btn-save-slot" data-save-slot="' + s.slot + '">保存</button>';
            } else {
                slotEl.innerHTML = '<div class="save-slot-info">' +
                    '<div class="save-slot-title">' + label + '：' + s.characterName + '</div>' +
                    '<div class="save-slot-meta">' + s.chapter + ' · ' + (diffNames[s.difficulty] || '调查员') + ' · ' + (s.timestamp ? new Date(s.timestamp).toLocaleString() : '') + '</div>' +
                    '</div>' +
                    '<div class="save-slot-actions">' +
                    '<button class="btn btn-outline btn-save-slot" data-load-slot="' + s.slot + '">加载</button>' +
                    '<button class="btn btn-outline btn-save-slot" data-save-slot="' + s.slot + '">覆盖</button>' +
                    '<button class="btn btn-danger btn-save-slot" data-delete-slot="' + s.slot + '">删除</button>' +
                    '</div>';
            }

            container.appendChild(slotEl);
        });

        container.querySelectorAll('[data-save-slot]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var slot = parseInt(this.dataset.saveSlot);
                if (typeof Main !== 'undefined' && Main.manualSave(slot)) {
                    Settings.showToast('已保存到存档 ' + slot, 'success');
                    Settings.renderSaveSlots();
                    if (typeof SoundSystem !== 'undefined') SoundSystem.play('save');
                }
            });
        });

        container.querySelectorAll('[data-load-slot]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var slot = parseInt(this.dataset.loadSlot);
                if (typeof Main !== 'undefined' && Main.manualLoad(slot)) {
                    Settings.showToast('已加载存档 ' + slot, 'success');
                    Main.updateSidebar();
                    Main.updateStatusBar();
                    if (typeof SoundSystem !== 'undefined') SoundSystem.play('load');
                }
            });
        });

        container.querySelectorAll('[data-delete-slot]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var slot = parseInt(this.dataset.deleteSlot);
                if (confirm('确定删除存档 ' + slot + '？')) {
                    if (typeof Main !== 'undefined') {
                        Main.deleteSaveSlot(slot);
                        Settings.showToast('存档 ' + slot + ' 已删除', 'info');
                        Settings.renderSaveSlots();
                    }
                }
            });
        });
    },

    refreshGameSettings() {
        var modeDisplayEl = document.getElementById('setting-mode-display');
        if (modeDisplayEl) {
            modeDisplayEl.textContent = Terminal.quickMode ? '快速模式' : '正常模式';
        }
        var diffEl = document.getElementById('setting-difficulty');
        if (diffEl && typeof Main !== 'undefined') {
            diffEl.value = Main.gameState.difficulty || 'investigator';
        }
        var soundEl = document.getElementById('setting-sound');
        if (soundEl && typeof SoundSystem !== 'undefined') {
            soundEl.checked = SoundSystem.enabled;
        }
        var soundVolEl = document.getElementById('setting-sound-volume');
        var soundVolVal = document.getElementById('setting-sound-volume-val');
        if (soundVolEl && typeof SoundSystem !== 'undefined') {
            var vol = Math.round(SoundSystem.volume * 100);
            soundVolEl.value = vol;
            if (soundVolVal) soundVolVal.textContent = vol + '%';
        }
        var ambientEl = document.getElementById('setting-ambient');
        if (ambientEl && typeof SoundSystem !== 'undefined') {
            ambientEl.value = SoundSystem.currentAmbient || 'silence';
        }
    },

    testConnection(type) {
        var self = this;
        var config = type === 'image' ? this.currentConfig.image_api : this.currentConfig.text_api;
        var statusId = type === 'image' ? 'imageStatus' : 'textStatus';

        if (type === 'image' && config.mode === 'curl') {
            this.testCurlConnection();
            return;
        }

        if (!config.base_url || !config.api_key) {
            this.setStatus(statusId, '请先填写 API Base URL 和 API Key', 'error');
            return;
        }

        if (!config.model) {
            this.setStatus(statusId, '请先填写模型名称', 'error');
            return;
        }

        this.setStatus(statusId, '正在测试连接...', 'loading');

        if (type === 'image') {
            this.testImageConnection(config, statusId);
            return;
        }

        var testUrl = config.base_url.replace(/\/+$/, '');
        if (!testUrl.includes('/chat/completions') && !testUrl.includes('/messages')) {
            testUrl += '/chat/completions';
        }

        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 20000);

        fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config.api_key
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 5
            }),
            signal: controller.signal
        })
        .then(function (res) {
            clearTimeout(timeoutId);
            if (res.ok) {
                self.setStatus(statusId, '✓ 连接成功，模型 "' + config.model + '" 可用', 'success');
                self.showToast('API 连接测试成功', 'success');
                return;
            }
            return res.json().catch(function () { return {}; }).then(function (errorData) {
                var serverMsg = errorData.error?.message || '';
                if (res.status === 401 || res.status === 403) {
                    self.setStatus(statusId, '✗ 认证失败，请检查 API Key', 'error');
                    self.showToast('认证失败，请检查 API Key', 'error');
                } else if (res.status === 404) {
                    if (serverMsg.toLowerCase().includes('model') || serverMsg.includes('模型')) {
                        self.setStatus(statusId, '✗ 模型 "' + config.model + '" 不存在，请检查模型名称', 'error');
                        self.showToast('模型名称错误，请检查模型名称', 'error');
                    } else {
                        self.setStatus(statusId, '✗ API 地址错误 (HTTP 404)', 'error');
                        self.showToast('API 地址可能不正确', 'error');
                    }
                } else if (res.status === 429) {
                    self.setStatus(statusId, '⚠ 连接成功但请求频率超限 (HTTP 429)', 'loading');
                    self.showToast('API Key 有效但频率受限，请稍后重试', 'info');
                } else if (res.status === 400) {
                    if (serverMsg.toLowerCase().includes('model') || serverMsg.includes('模型') || serverMsg.toLowerCase().includes('does not exist') || serverMsg.toLowerCase().includes('not found')) {
                        self.setStatus(statusId, '✗ 模型 "' + config.model + '" 无效: ' + serverMsg, 'error');
                        self.showToast('模型名称错误，请检查模型名称', 'error');
                    } else {
                        self.setStatus(statusId, '✗ 请求参数错误: ' + (serverMsg || 'HTTP ' + res.status), 'error');
                        self.showToast('请求参数错误: ' + (serverMsg || 'HTTP ' + res.status), 'error');
                    }
                } else if (res.status === 500 || res.status === 502 || res.status === 503) {
                    self.setStatus(statusId, '✗ 服务器错误 (HTTP ' + res.status + ')，请稍后重试', 'error');
                    self.showToast('服务器暂时不可用', 'error');
                } else {
                    self.setStatus(statusId, '✗ 请求失败: ' + (serverMsg || 'HTTP ' + res.status), 'error');
                    self.showToast('请求失败: ' + (serverMsg || 'HTTP ' + res.status), 'error');
                }
            });
        })
        .catch(function (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                self.setStatus(statusId, '✗ 连接超时（20秒），请检查网络和API地址', 'error');
                self.showToast('连接超时，请检查网络和API地址', 'error');
            } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('TypeError')) {
                self.setStatus(statusId, '✗ 网络错误: 无法连接到服务器，请检查API地址或CORS设置', 'error');
                self.showToast('网络错误，可能是 URL 不正确或存在CORS限制', 'error');
            } else {
                self.setStatus(statusId, '✗ 连接失败: ' + err.message, 'error');
                self.showToast('连接失败: ' + err.message, 'error');
            }
        });
    },

    testImageConnection(config, statusId) {
        var self = this;
        var testUrl = config.base_url.replace(/\/+$/, '');
        if (!testUrl.includes('/images/generations') && !testUrl.includes('/generations')) {
            testUrl += '/images/generations';
        }

        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 30000);

        var body = {
            model: config.model,
            prompt: 'A simple test image: a blue circle on white background',
            n: 1,
            size: config.image_size || '256x256'
        };

        fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + config.api_key
            },
            body: JSON.stringify(body),
            signal: controller.signal
        })
        .then(function (res) {
            clearTimeout(timeoutId);
            if (res.ok) {
                self.setStatus(statusId, '✓ 连接成功，模型 "' + config.model + '" 可用', 'success');
                self.showToast('文生图API连接测试成功', 'success');
                return;
            }
            return res.json().catch(function () { return {}; }).then(function (errorData) {
                var serverMsg = errorData.error?.message || '';
                if (res.status === 401 || res.status === 403) {
                    self.setStatus(statusId, '✗ 认证失败，请检查 API Key', 'error');
                } else if (res.status === 404) {
                    self.setStatus(statusId, '✗ API地址错误或模型不存在 (HTTP 404)，请检查Base URL和模型名称', 'error');
                } else if (res.status === 429) {
                    self.setStatus(statusId, '⚠ 连接成功但请求频率超限 (HTTP 429)', 'loading');
                } else if (res.status === 400) {
                    self.setStatus(statusId, '✗ 请求参数错误: ' + (serverMsg || 'HTTP 400，请检查模型名称和图片尺寸是否匹配'), 'error');
                } else {
                    self.setStatus(statusId, '✗ 请求失败: ' + (serverMsg || 'HTTP ' + res.status), 'error');
                }
            });
        })
        .catch(function (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                self.setStatus(statusId, '✗ 连接超时（30秒），请检查网络和API地址', 'error');
            } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('TypeError')) {
                self.setStatus(statusId, '✗ 网络错误: 无法连接到服务器。请检查：1) Base URL是否正确 2) 是否存在CORS限制 3) API服务是否可用', 'error');
            } else {
                self.setStatus(statusId, '✗ 连接失败: ' + err.message, 'error');
            }
        });
    },

    loadConfigToUI() {
        var tp = this.currentConfig.text_api;
        var el;

        el = document.getElementById('textProvider');
        if (el) el.value = tp.provider || '';
        el = document.getElementById('textBaseUrl');
        if (el) el.value = tp.base_url || '';
        el = document.getElementById('textApiKey');
        if (el) el.value = tp.api_key || '';
        el = document.getElementById('textModel');
        if (el) el.value = tp.model || '';

        var params = tp.parameters;
        var paramMap = [
            { slider: 'temperature', num: 'temperatureNum', val: 'temperatureVal', key: 'temperature' },
            { slider: 'topP', num: 'topPNum', val: 'topPVal', key: 'top_p' },
            { slider: 'maxTokens', num: 'maxTokensNum', val: 'maxTokensVal', key: 'max_tokens' },
            { slider: 'freqPenalty', num: 'freqPenaltyNum', val: 'freqPenaltyVal', key: 'frequency_penalty' },
            { slider: 'presPenalty', num: 'presPenaltyNum', val: 'presPenaltyVal', key: 'presence_penalty' }
        ];

        paramMap.forEach(function (p) {
            var v = params[p.key];
            var slider = document.getElementById(p.slider);
            var num = document.getElementById(p.num);
            var valEl = document.getElementById(p.val);
            if (slider) slider.value = v;
            if (num) num.value = v;
            if (valEl) valEl.textContent = v;
        });

        var ip = this.currentConfig.image_api;
        el = document.getElementById('imageProvider');
        if (el) el.value = ip.provider || '';
        el = document.getElementById('imageBaseUrl');
        if (el) el.value = ip.base_url || '';
        el = document.getElementById('imageApiKey');
        if (el) el.value = ip.api_key || '';
        el = document.getElementById('imageModel');
        if (el) el.value = ip.model || '';
        el = document.getElementById('imageSize');
        if (el) el.value = ip.image_size || '1024x1024';
        el = document.getElementById('imageQuality');
        if (el) el.value = ip.image_quality || 'standard';
        el = document.getElementById('imageCount');
        if (el) el.value = ip.image_count || 1;
        el = document.getElementById('imageCountVal');
        if (el) el.textContent = ip.image_count || 1;
        el = document.getElementById('curlCommandInput');
        if (el) el.value = ip.curl_command || '';
        el = document.getElementById('autoGenPortrait');
        if (el) el.checked = ip.auto_gen_portrait !== false;
        el = document.getElementById('autoGenCG');
        if (el) el.checked = !!ip.auto_gen_cg;
        el = document.getElementById('autoGenNPC');
        if (el) el.checked = !!ip.auto_gen_npc;
    },

    collectTextConfig() {
        this.currentConfig.text_api.provider = (document.getElementById('textProvider')?.value || '').trim();
        this.currentConfig.text_api.base_url = (document.getElementById('textBaseUrl')?.value || '').trim();
        this.currentConfig.text_api.api_key = (document.getElementById('textApiKey')?.value || '').trim();
        this.currentConfig.text_api.model = (document.getElementById('textModel')?.value || '').trim();
    },

    collectImageConfig() {
        this.currentConfig.image_api.provider = (document.getElementById('imageProvider')?.value || '').trim();
        this.currentConfig.image_api.base_url = (document.getElementById('imageBaseUrl')?.value || '').trim();
        this.currentConfig.image_api.api_key = (document.getElementById('imageApiKey')?.value || '').trim();
        this.currentConfig.image_api.model = (document.getElementById('imageModel')?.value || '').trim();
        this.currentConfig.image_api.image_size = document.getElementById('imageSize')?.value || '1024x1024';
        this.currentConfig.image_api.image_quality = document.getElementById('imageQuality')?.value || 'standard';
        var countEl = document.getElementById('imageCount');
        this.currentConfig.image_api.image_count = countEl ? parseInt(countEl.value) : 1;
        this.currentConfig.image_api.curl_command = (document.getElementById('curlCommandInput')?.value || '').trim();
        this.currentConfig.image_api.mode = document.getElementById('imgModeCurl')?.classList.contains('active') ? 'curl' : 'api';
        this.currentConfig.image_api.auto_gen_portrait = document.getElementById('autoGenPortrait')?.checked !== false;
        this.currentConfig.image_api.auto_gen_cg = !!document.getElementById('autoGenCG')?.checked;
        this.currentConfig.image_api.auto_gen_npc = !!document.getElementById('autoGenNPC')?.checked;
    },

    exportConfig() {
        this.collectTextConfig();
        this.collectImageConfig();
        var blob = new Blob([JSON.stringify(this.currentConfig, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'abyss_config_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('配置已导出', 'success');
    },

    importConfig(file) {
        var self = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var imported = JSON.parse(e.target.result);
                self.currentConfig = self.deepMerge(self.DEFAULT_CONFIG, imported);
                self.saveConfigToStorage();
                self.loadConfigToUI();
                self.showToast('配置导入成功', 'success');
            } catch (err) {
                self.showToast('配置文件格式错误: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    },

    bindEvents() {
        var self = this;

        document.getElementById('btn-close-settings')?.addEventListener('click', function () { self.close(); });
        this.backdropEl?.addEventListener('click', function () { self.close(); });

        document.getElementById('btnExport')?.addEventListener('click', function () { self.exportConfig(); });

        document.getElementById('btnImport')?.addEventListener('click', function () {
            document.getElementById('importFileInput')?.click();
        });

        document.getElementById('importFileInput')?.addEventListener('change', function (e) {
            if (e.target.files && e.target.files[0]) {
                self.importConfig(e.target.files[0]);
                e.target.value = '';
            }
        });

        var tabBtns = document.querySelectorAll('.tab-btn:not(.disabled)');
        var panels = document.querySelectorAll('.tab-content .tab-panel');

        tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tabName = btn.getAttribute('data-tab');
                tabBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                panels.forEach(function (p) { p.classList.remove('active'); });
                var panel = document.getElementById('panel-' + tabName);
                if (panel) panel.classList.add('active');
            });
        });

        document.getElementById('btnSaveText')?.addEventListener('click', function () {
            self.collectTextConfig();
            self.saveConfigToStorage();
            self.setStatus('textStatus', '✓ 文本API配置已保存', 'success');
        });

        document.getElementById('btnSaveImage')?.addEventListener('click', function () {
            self.collectImageConfig();
            self.saveConfigToStorage();
            self.setStatus('imageStatus', '✓ 文生图API配置已保存', 'success');
        });

        document.getElementById('btnSaveAutoGen')?.addEventListener('click', function () {
            self.collectImageConfig();
            self.saveConfigToStorage();
            self.setStatus('autoGenStatus', '✓ 场景设置已保存', 'success');
        });

        document.getElementById('btnSaveParams')?.addEventListener('click', function () {
            self.saveConfigToStorage();
            self.setStatus('paramsStatus', '✓ 模型参数已保存', 'success');
        });

        document.getElementById('btnResetParams')?.addEventListener('click', function () {
            self.currentConfig.text_api.parameters = self.getParamDefaults();
            self.loadConfigToUI();
            self.setStatus('paramsStatus', '✓ 已恢复默认参数', 'success');
        });

        document.getElementById('btnTestText')?.addEventListener('click', function () {
            self.collectTextConfig();
            self.testConnection('text');
        });

        document.getElementById('btnTestImage')?.addEventListener('click', function () {
            self.collectImageConfig();
            self.testConnection('image');
        });

        ['textBaseUrl', 'imageBaseUrl'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', function () {
                    if (id === 'textBaseUrl') self.currentConfig.text_api.base_url = el.value.trim();
                    else self.currentConfig.image_api.base_url = el.value.trim();
                    self.saveConfigToStorage();
                });
            }
        });

        var imgSizeEl = document.getElementById('imageSize');
        var imgQualityEl = document.getElementById('imageQuality');
        if (imgSizeEl) {
            imgSizeEl.addEventListener('change', function () {
                self.currentConfig.image_api.image_size = imgSizeEl.value;
                self.saveConfigToStorage();
            });
        }
        if (imgQualityEl) {
            imgQualityEl.addEventListener('change', function () {
                self.currentConfig.image_api.image_quality = imgQualityEl.value;
                self.saveConfigToStorage();
            });
        }
    },

    initCurlMode() {
        var self = this;
        var apiSection = document.getElementById('imageApiSection');
        var curlSection = document.getElementById('imageCurlSection');
        var modeApiBtn = document.getElementById('imgModeApi');
        var modeCurlBtn = document.getElementById('imgModeCurl');

        if (!apiSection || !curlSection) return;

        function switchMode(mode) {
            if (mode === 'curl') {
                apiSection.style.display = 'none';
                curlSection.style.display = 'block';
                modeApiBtn.classList.remove('active');
                modeCurlBtn.classList.add('active');
            } else {
                apiSection.style.display = 'block';
                curlSection.style.display = 'none';
                modeApiBtn.classList.add('active');
                modeCurlBtn.classList.remove('active');
            }
            self.currentConfig.image_api.mode = mode;
        }

        modeApiBtn.addEventListener('click', function () { switchMode('api'); });
        modeCurlBtn.addEventListener('click', function () { switchMode('curl'); });

        var savedMode = this.currentConfig.image_api.mode || 'api';
        switchMode(savedMode);

        var templateSelect = document.getElementById('curlTemplateSelect');
        if (templateSelect && typeof CurlParser !== 'undefined') {
            var templates = CurlParser.TEMPLATES;
            for (var key in templates) {
                if (templates.hasOwnProperty(key)) {
                    var opt = document.createElement('option');
                    opt.value = key;
                    opt.textContent = templates[key].name + ' - ' + templates[key].description;
                    templateSelect.appendChild(opt);
                }
            }

            templateSelect.addEventListener('change', function () {
                var tmplKey = this.value;
                if (tmplKey && templates[tmplKey]) {
                    var input = document.getElementById('curlCommandInput');
                    if (input) {
                        input.value = templates[tmplKey].curl;
                        self.validateCurlCommand();
                    }
                }
            });
        }

        var savedCurl = this.currentConfig.image_api.curl_command || '';
        var curlInput = document.getElementById('curlCommandInput');
        if (curlInput && savedCurl) {
            curlInput.value = savedCurl;
        }

        var validateBtn = document.getElementById('btnValidateCurl');
        if (validateBtn) {
            validateBtn.addEventListener('click', function () {
                self.validateCurlCommand();
            });
        }

        var formatBtn = document.getElementById('btnFormatCurl');
        if (formatBtn) {
            formatBtn.addEventListener('click', function () {
                self.formatCurlCommand();
            });
        }

        var copyBtn = document.getElementById('btnCopyCurl');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                var input = document.getElementById('curlCommandInput');
                if (input && input.value) {
                    navigator.clipboard.writeText(input.value).then(function () {
                        self.showToast('curl命令已复制到剪贴板', 'success');
                    }).catch(function () {
                        input.select();
                        document.execCommand('copy');
                        self.showToast('curl命令已复制', 'success');
                    });
                }
            });
        }

        if (curlInput) {
            curlInput.addEventListener('input', function () {
                self.currentConfig.image_api.curl_command = this.value;
            });
        }
    },

    validateCurlCommand() {
        var input = document.getElementById('curlCommandInput');
        var preview = document.getElementById('curlPreview');
        if (!input || !preview) return;

        var cmd = input.value.trim();
        if (!cmd) {
            preview.style.display = 'none';
            return;
        }

        if (typeof CurlParser === 'undefined') {
            this.showToast('curl解析器未加载', 'error');
            return;
        }

        var parsed = CurlParser.parse(cmd);
        preview.style.display = 'block';

        if (parsed.error) {
            preview.innerHTML = '<div class="preview-label">解析结果</div>' +
                '<div class="preview-item"><span class="preview-error">✗ ' + parsed.error + '</span></div>';
            return;
        }

        var html = '<div class="preview-label">✓ 命令解析成功</div>';
        html += '<div class="preview-item"><span class="preview-key">请求方法</span><span class="preview-val">' + parsed.method + '</span></div>';
        html += '<div class="preview-item"><span class="preview-key">URL</span><span class="preview-val">' + parsed.url + '</span></div>';

        var headerKeys = Object.keys(parsed.headers);
        if (headerKeys.length > 0) {
            html += '<div class="preview-item"><span class="preview-key">Headers</span></div>';
            headerKeys.forEach(function (key) {
                var val = parsed.headers[key];
                if (key.toLowerCase() === 'authorization') {
                    val = val.replace(/(Bearer\s+).{8}/, '$1••••••••');
                }
                html += '<div class="preview-item preview-item-nested"><span class="preview-key preview-key-sm">' + key + '</span><span class="preview-val">' + val + '</span></div>';
            });
        }

        if (parsed.body) {
            var bodyStr = typeof parsed.body === 'string' ? parsed.body : JSON.stringify(parsed.body, null, 2);
            if (bodyStr.length > 200) bodyStr = bodyStr.substring(0, 200) + '...';
            html += '<div class="preview-item"><span class="preview-key">Body</span><span class="preview-val preview-val-code">' + bodyStr + '</span></div>';
        }

        preview.innerHTML = html;
    },

    formatCurlCommand() {
        var input = document.getElementById('curlCommandInput');
        if (!input || !input.value.trim()) return;

        if (typeof CurlParser === 'undefined') return;

        var parsed = CurlParser.parse(input.value.trim());
        if (parsed.error) {
            this.showToast('无法格式化: ' + parsed.error, 'error');
            return;
        }

        var formatted = CurlParser.generateCurl({
            method: parsed.method,
            url: parsed.url,
            headers: parsed.headers,
            body: parsed.body
        });

        input.value = formatted;
        this.currentConfig.image_api.curl_command = formatted;
        this.validateCurlCommand();
        this.showToast('curl命令已格式化', 'success');
    },

    testCurlConnection() {
        var self = this;
        var curlInput = document.getElementById('curlCommandInput');
        var statusId = 'imageStatus';

        if (!curlInput || !curlInput.value.trim()) {
            this.setStatus(statusId, '请先输入curl命令', 'error');
            return;
        }

        if (typeof CurlParser === 'undefined') {
            this.setStatus(statusId, 'curl解析器未加载', 'error');
            return;
        }

        var parsed = CurlParser.parse(curlInput.value.trim());
        if (parsed.error) {
            this.setStatus(statusId, '✗ 命令解析失败: ' + parsed.error, 'error');
            return;
        }

        this.setStatus(statusId, '正在测试curl连接...', 'loading');

        var fetchOptions = CurlParser.toFetchOptions(parsed);
        if (!fetchOptions) {
            this.setStatus(statusId, '✗ 无法转换为可执行请求', 'error');
            return;
        }

        var controller = new AbortController();
        var timeoutId = setTimeout(function () { controller.abort(); }, 20000);
        fetchOptions.signal = controller.signal;

        if (parsed.body && typeof parsed.body === 'object') {
            var testBody = JSON.parse(JSON.stringify(parsed.body));
            if (testBody.prompt) testBody.prompt = 'test';
            if (testBody.n) testBody.n = 1;
            if (testBody.size) testBody.size = '256x256';
            fetchOptions.body = JSON.stringify(testBody);
        }

        fetch(parsed.url, fetchOptions)
        .then(function (res) {
            clearTimeout(timeoutId);
            if (res.ok) {
                self.setStatus(statusId, '✓ curl连接测试成功', 'success');
                self.showToast('curl连接测试成功', 'success');
                return;
            }
            return res.json().catch(function () { return {}; }).then(function (errorData) {
                var msg = errorData.error?.message || 'HTTP ' + res.status;
                if (res.status === 401 || res.status === 403) msg = '认证失败，请检查API Key';
                else if (res.status === 404) msg = 'API地址错误 (HTTP 404)';
                else if (res.status === 429) msg = '请求频率超限 (HTTP 429)';
                self.setStatus(statusId, '✗ ' + msg, 'error');
                self.showToast('curl连接测试失败', 'error');
            });
        })
        .catch(function (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') {
                self.setStatus(statusId, '✗ 连接超时（20秒）', 'error');
            } else if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
                self.setStatus(statusId, '✗ 网络连接失败，请检查URL或CORS设置', 'error');
            } else {
                self.setStatus(statusId, '✗ 连接失败: ' + e.message, 'error');
            }
            self.showToast('curl连接测试失败', 'error');
        });
    }
};
