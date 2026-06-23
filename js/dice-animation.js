const DiceAnimation = {
    containerEl: null,
    isAnimating: false,

    init() {
        this.containerEl = document.getElementById('dice-animation');
    },

    async playRoll(finalValue, isHidden = false) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.containerEl.classList.add('active');

        const face = this.containerEl.querySelector('.dice-face') || document.createElement('div');
        face.className = 'dice-face';
        this.containerEl.innerHTML = '';
        this.containerEl.appendChild(face);

        if (isHidden) {
            face.textContent = '🕵️';
            face.style.color = '#00ccdd';
            face.style.borderColor = '#00ccdd';
            await Utils.delay(1500);
            face.textContent = '?';
            await Utils.delay(500);
        } else {
            const flickerCount = 12;
            for (let i = 0; i < flickerCount; i++) {
                face.textContent = Math.floor(Math.random() * 100) + 1;
                await Utils.delay(80 + i * 15);
            }
            face.textContent = finalValue;
        }

        await Utils.delay(800);
        this.containerEl.classList.remove('active');
        this.isAnimating = false;
    },

    async playCheckAnimation(check) {
        await this.playRoll(check.roll, check.isHidden);
        if (!check.isHidden) {
            let borderColor;
            switch (check.result) {
                case 'critical': borderColor = '#00ccdd'; break;
                case 'success': borderColor = '#00ff88'; break;
                case 'failure': borderColor = '#ff3355'; break;
                case 'fumble': borderColor = '#aa55ff'; break;
                default: borderColor = '#555570';
            }
            const face = this.containerEl.querySelector('.dice-face');
            if (face) {
                face.style.borderColor = borderColor;
                face.style.color = borderColor;
                face.style.textShadow = `0 0 15px ${borderColor}`;
                this.containerEl.classList.add('active');
                await Utils.delay(600);
                this.containerEl.classList.remove('active');
            }
        }
    }
};
