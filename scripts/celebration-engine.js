

window.CelebrationEngine = window.CelebrationEngine = class CelebrationEngine {
    constructor(containerRoot) {
        this.root = containerRoot || document.body;
        this.createCanvas();
        this.options = {
            speed: 5,
            size: 20,
            duration: 5,
            density: 5,
            rainbow: true,
            customColor: '',
            customEmojis: '',
            opacity: 0.8
        };
        window.addEventListener('CS_TRIGGER_CELEBRATION', (e) => this.trigger(e.detail.type));
        window.addEventListener('CS_UPDATE_SETTINGS', (e) => {
            this.options = { ...this.options, ...e.detail };
        });
    }

    createCanvas() {
        this.container = document.createElement('div');
        this.container.id = 'cs-celebration-canvas';
        this.container.className = 'celebration-overlay';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100vw';
        this.container.style.height = '100vh';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '2147483646';
        this.root.appendChild(this.container);
    }

    trigger(type) {
        switch (type) {
            case 'confetti':
                this.runConfetti();
                break;
            case 'disco':
                this.runDiscoLights();
                break;
            case 'falling':
                this.runFallingEmojis();
                break;
            case 'lasers':
                this.runLasers();
                break;
            case 'fog':
                this.runFogMachine();
                break;
        }
    }

    getColors() {
        const colors = this.options.rainbow ?
            ['#FF8BA7', '#FFC4A3', '#FFEEAD', '#96CEB4', '#D4A5A5', '#FFD700', '#FF69B4', '#00CED1'] :
            ['#FF8BA7', '#D4A5A5'];

        if (this.options.customColor) {
            colors.unshift(this.options.customColor);
        }
        return colors;
    }

    runFogMachine() {
        const duration = this.options.duration * 1000;
        const count = 8 * this.options.density;
        for (let i = 0; i < count; i++) {
            this.addFogCloud(duration);
        }
    }

    addFogCloud(duration) {
        const cloud = document.createElement('div');
        cloud.className = 'fog-cloud';

        const baseSize = 250 * (this.options.size / 20);
        const size = Math.random() * baseSize + baseSize;
        cloud.style.width = size + 'px';
        cloud.style.height = (size * 0.7) + 'px';

        cloud.style.left = (Math.random() * 120 - 10) + 'vw';
        cloud.style.top = (Math.random() * 120 - 10) + 'vh';

        const colors = this.getColors();
        const color = this.options.customColor || '#ffffff';
        cloud.style.backgroundColor = color;
        cloud.style.opacity = this.options.opacity * 0.4;

        // Vary speed and delay
        cloud.style.animationDuration = (20 / this.options.speed) + 's';
        cloud.style.animationDelay = (Math.random() * 2) + 's';

        this.container.appendChild(cloud);
        setTimeout(() => cloud.remove(), duration + 5000);
    }

    runConfetti() {
        const colors = this.getColors();
        const count = 50 * this.options.density;
        const duration = this.options.duration * 1000;

        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.opacity = this.options.opacity;
            piece.style.animationDelay = Math.random() * (duration / 2000) + 's';
            piece.style.width = (Math.random() * 10 + 5) * (this.options.size / 20) + 'px';
            piece.style.height = piece.style.width;
            piece.style.animationDuration = (6 - this.options.speed / 2) + 's';
            this.container.appendChild(piece);

            setTimeout(() => piece.remove(), duration + 2000);
        }
    }

    runDiscoLights() {
        const duration = this.options.duration * 1000;
        const disco = document.createElement('div');
        disco.className = 'disco-overlay';
        disco.style.opacity = this.options.opacity * 0.4; // Soft base overlay
        this.container.appendChild(disco);

        setTimeout(() => disco.remove(), duration);

        const intensity = this.options.density;

        // Circular soft lights
        for (let i = 0; i < 4 * intensity; i++) {
            this.addCircularLight(duration);
        }

        // Flashing Disco Dots
        for (let i = 0; i < 15 * intensity; i++) {
            this.addDiscoDot(duration);
        }
    }

    addDiscoDot(duration) {
        const dot = document.createElement('div');
        dot.className = 'disco-dot';
        dot.style.left = Math.random() * 100 + 'vw';
        dot.style.top = Math.random() * 100 + 'vh';

        const colors = this.getColors();
        dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        dot.style.opacity = this.options.opacity;
        dot.style.animationDuration = (0.5 / this.options.speed) + 's';
        dot.style.animationDelay = Math.random() * 2 + 's';

        this.container.appendChild(dot);
        setTimeout(() => dot.remove(), duration);
    }

    addCircularLight(duration) {
        const light = document.createElement('div');
        light.className = 'circular-light';
        const baseSize = 300 * (this.options.size / 20); // Much larger for soft gradient look
        const size = Math.random() * baseSize + baseSize;
        light.style.width = size + 'px';
        light.style.height = size + 'px';
        light.style.left = (Math.random() * 100 - 20) + 'vw';
        light.style.top = (Math.random() * 100 - 20) + 'vh';

        const colors = this.getColors();
        const color = colors[Math.floor(Math.random() * colors.length)];
        light.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        light.style.opacity = this.options.opacity * 0.7;
        light.style.animationDuration = (15 - this.options.speed) + 's';

        this.container.appendChild(light);
        setTimeout(() => light.remove(), duration);
    }

    runLasers() {
        const count = 6 * this.options.density; // Increased density
        const duration = this.options.duration * 1000;
        for (let i = 0; i < count; i++) {
            this.addLaserBeam(duration);
        }
    }

    addLaserBeam(duration) {
        const beam = document.createElement('div');
        beam.className = 'laser-beam';
        const colors = this.getColors();
        const color = colors[Math.floor(Math.random() * colors.length)];
        beam.style.color = color; // For currentColor usage in CSS
        beam.style.opacity = this.options.opacity;

        // Randomize origin points for chaos
        const origins = ['-10% -10%', '110% -10%', '-10% 110%', '110% 110%', '50% 50%'];
        beam.style.transformOrigin = origins[Math.floor(Math.random() * origins.length)];

        beam.style.left = Math.random() * 100 + 'vw';
        beam.style.top = Math.random() * 100 + 'vh';
        beam.style.animationDuration = (1.5 / this.options.speed) + 's';
        beam.style.animationDelay = Math.random() * 0.5 + 's';

        this.container.appendChild(beam);
        setTimeout(() => beam.remove(), duration);
    }

    runFallingEmojis() {
        let emojis = ['🎈', '✨', '🕺', '🪩', '⭐', '🧁', '🌈', '🎉', '🎸', '🕹️'];
        if (this.options.customEmojis) {
            emojis = this.options.customEmojis.split(/[, ]+/).filter(e => e.trim());
        }

        const count = 10 * this.options.density;
        const duration = this.options.duration * 1000;

        for (let i = 0; i < count; i++) {
            const emoji = document.createElement('div');
            emoji.className = 'falling-emoji';
            emoji.style.opacity = this.options.opacity;
            emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * 90 + 'vw';
            emoji.style.animationDelay = Math.random() * (duration / 5000) + 's';
            emoji.style.fontSize = (this.options.size * 2) + 'px';
            emoji.style.animationDuration = (8 - this.options.speed / 2) + 's';
            this.container.appendChild(emoji);

            setTimeout(() => emoji.remove(), duration + 3000);
        }
    }
}

// Initialize engine logic is now handled by content.js inside init()
