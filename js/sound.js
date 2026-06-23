const SoundSystem = {
    audioCtx: null,
    enabled: false,
    volume: 0.5,
    ambientSource: null,
    ambientGain: null,
    currentAmbient: null,

    SOUNDS: {
        typewriter: { type: 'noise', duration: 0.03, frequency: 3000, gain: 0.08 },
        dice_roll: { type: 'percussion', duration: 0.4, frequency: 200, decay: 0.3 },
        dice_hit: { type: 'percussion', duration: 0.15, frequency: 800, decay: 0.1 },
        check_success: { type: 'tone', duration: 0.3, frequency: 880, sweep: 1320 },
        check_failure: { type: 'tone', duration: 0.4, frequency: 440, sweep: 220 },
        check_critical: { type: 'arpeggio', notes: [523, 659, 784, 1047], duration: 0.5 },
        check_fumble: { type: 'dissonant', duration: 0.6, frequency: 150 },
        san_loss: { type: 'dissonant', duration: 0.8, frequency: 200 },
        horror_reveal: { type: 'drone', duration: 2.0, frequency: 80 },
        combat_start: { type: 'percussion', duration: 0.6, frequency: 150, decay: 0.4 },
        page_turn: { type: 'noise', duration: 0.15, frequency: 2000, gain: 0.1 },
        menu_click: { type: 'tone', duration: 0.05, frequency: 1200, sweep: 1400 },
        notification: { type: 'arpeggio', notes: [660, 880], duration: 0.3 },
        save: { type: 'arpeggio', notes: [440, 554, 659], duration: 0.4 },
        load: { type: 'arpeggio', notes: [659, 554, 440], duration: 0.4 }
    },

    AMBIENT_PRESETS: {
        silence: null,
        rain: { type: 'noise', filterFreq: 2000, gain: 0.06, lfo: { freq: 0.5, depth: 0.02 } },
        wind: { type: 'noise', filterFreq: 500, gain: 0.04, lfo: { freq: 0.2, depth: 0.03 } },
        ocean: { type: 'noise', filterFreq: 800, gain: 0.05, lfo: { freq: 0.15, depth: 0.04 } },
        forest: { type: 'noise', filterFreq: 3000, gain: 0.03, lfo: { freq: 2, depth: 0.01 } },
        dungeon: { type: 'drone', frequency: 60, gain: 0.04, lfo: { freq: 0.1, depth: 0.02 } },
        temple: { type: 'drone', frequency: 110, gain: 0.03, lfo: { freq: 0.05, depth: 0.015 } }
    },

    init() {
        const saved = Utils.loadFromStorage('scribe_sound');
        if (saved) {
            this.enabled = saved.enabled || false;
            this.volume = saved.volume !== undefined ? saved.volume : 0.5;
        }
        this.updateSoundIcon();
    },

    ensureContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    },

    play(soundName) {
        if (!this.enabled) return;
        const config = this.SOUNDS[soundName];
        if (!config) return;

        try {
            const ctx = this.ensureContext();
            switch (config.type) {
                case 'noise': this._playNoise(ctx, config); break;
                case 'percussion': this._playPercussion(ctx, config); break;
                case 'tone': this._playTone(ctx, config); break;
                case 'arpeggio': this._playArpeggio(ctx, config); break;
                case 'dissonant': this._playDissonant(ctx, config); break;
                case 'drone': this._playDroneShort(ctx, config); break;
            }
        } catch (e) {
            // Silently fail - audio is not critical
        }
    },

    _playNoise(ctx, config) {
        const bufferSize = ctx.sampleRate * config.duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = config.frequency;
        filter.Q.value = 1;

        const gain = ctx.createGain();
        gain.gain.value = (config.gain || 0.1) * this.volume;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    },

    _playPercussion(ctx, config) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = config.frequency;
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + config.duration);

        const gain = ctx.createGain();
        gain.gain.value = 0.3 * this.volume;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.decay);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + config.duration);

        const noiseSize = ctx.sampleRate * config.decay;
        const noiseBuffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseSize; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.15 * this.volume;
        noiseSource.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseSource.start();
    },

    _playTone(ctx, config) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = config.frequency;
        if (config.sweep) {
            osc.frequency.exponentialRampToValueAtTime(config.sweep, ctx.currentTime + config.duration);
        }

        const gain = ctx.createGain();
        gain.gain.value = 0.2 * this.volume;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + config.duration);
    },

    _playArpeggio(ctx, config) {
        const noteDuration = config.duration / config.notes.length;
        config.notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const gain = ctx.createGain();
            const startTime = ctx.currentTime + i * noteDuration;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2 * this.volume, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + noteDuration);
        });
    },

    _playDissonant(ctx, config) {
        const baseFreq = config.frequency;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();

        osc1.type = 'sawtooth';
        osc1.frequency.value = baseFreq;
        osc2.type = 'sawtooth';
        osc2.frequency.value = baseFreq * 1.05;
        osc3.type = 'sawtooth';
        osc3.frequency.value = baseFreq * 2.01;

        const gain = ctx.createGain();
        gain.gain.value = 0.12 * this.volume;
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc3.start();
        osc1.stop(ctx.currentTime + config.duration);
        osc2.stop(ctx.currentTime + config.duration);
        osc3.stop(ctx.currentTime + config.duration);
    },

    _playDroneShort(ctx, config) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = config.frequency;

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 3;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15 * this.volume, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        lfo.start();
        osc.start();
        osc.stop(ctx.currentTime + config.duration);
        lfo.stop(ctx.currentTime + config.duration);
    },

    startAmbient(presetName) {
        this.stopAmbient();
        const preset = this.AMBIENT_PRESETS[presetName];
        if (!preset) return;

        try {
            const ctx = this.ensureContext();
            this.currentAmbient = presetName;

            if (preset.type === 'noise') {
                const bufferSize = ctx.sampleRate * 4;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }

                this.ambientSource = ctx.createBufferSource();
                this.ambientSource.buffer = buffer;
                this.ambientSource.loop = true;

                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = preset.filterFreq;

                this.ambientGain = ctx.createGain();
                this.ambientGain.gain.value = preset.gain * this.volume;

                if (preset.lfo) {
                    const lfo = ctx.createOscillator();
                    lfo.type = 'sine';
                    lfo.frequency.value = preset.lfo.freq;
                    const lfoGain = ctx.createGain();
                    lfoGain.gain.value = preset.lfo.depth;
                    lfo.connect(lfoGain);
                    lfoGain.connect(this.ambientGain.gain);
                    lfo.start();
                    this._ambientLfo = lfo;
                }

                this.ambientSource.connect(filter);
                filter.connect(this.ambientGain);
                this.ambientGain.connect(ctx.destination);
                this.ambientSource.start();
            } else if (preset.type === 'drone') {
                this.ambientSource = ctx.createOscillator();
                this.ambientSource.type = 'sine';
                this.ambientSource.frequency.value = preset.frequency;

                this.ambientGain = ctx.createGain();
                this.ambientGain.gain.value = preset.gain * this.volume;

                if (preset.lfo) {
                    const lfo = ctx.createOscillator();
                    lfo.type = 'sine';
                    lfo.frequency.value = preset.lfo.freq;
                    const lfoGain = ctx.createGain();
                    lfoGain.gain.value = preset.lfo.depth;
                    lfo.connect(lfoGain);
                    lfoGain.connect(this.ambientGain.gain);
                    lfo.start();
                    this._ambientLfo = lfo;
                }

                this.ambientSource.connect(this.ambientGain);
                this.ambientGain.connect(ctx.destination);
                this.ambientSource.start();
            }
        } catch (e) {
            // Silently fail
        }
    },

    stopAmbient() {
        try {
            if (this.ambientSource) {
                this.ambientSource.stop();
                this.ambientSource = null;
            }
            if (this._ambientLfo) {
                this._ambientLfo.stop();
                this._ambientLfo = null;
            }
            this.ambientGain = null;
            this.currentAmbient = null;
        } catch (e) {
            // Silently fail
        }
    },

    setVolume(vol) {
        this.volume = Utils.clamp(vol, 0, 1);
        if (this.ambientGain) {
            const preset = this.AMBIENT_PRESETS[this.currentAmbient];
            if (preset) {
                this.ambientGain.gain.value = preset.gain * this.volume;
            }
        }
        this.save();
    },

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopAmbient();
        }
        this.updateSoundIcon();
        this.save();
    },

    updateSoundIcon() {
        const el = document.getElementById('status-sound');
        if (el) {
            const icon = el.querySelector('.status-icon');
            const label = el.querySelector('.status-label');
            if (icon && label) {
                icon.textContent = 'SND';
                label.textContent = this.enabled ? '开' : '关';
                el.classList.toggle('is-muted', !this.enabled);
            } else {
                el.textContent = this.enabled ? '音效开' : '音效关';
            }
        }
    },

    playCheckResult(result) {
        if (!this.enabled) return;
        switch (result) {
            case 'critical': this.play('check_critical'); break;
            case 'success': this.play('check_success'); break;
            case 'failure': this.play('check_failure'); break;
            case 'fumble': this.play('check_fumble'); break;
        }
    },

    save() {
        Utils.saveToStorage('scribe_sound', {
            enabled: this.enabled,
            volume: this.volume
        });
    }
};
