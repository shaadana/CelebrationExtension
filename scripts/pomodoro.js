window.PomodoroTimer = class PomodoroTimer {
    constructor(displayElement, startBtn) {
        this.display = displayElement;
        this.btn = startBtn;
        this.timeLeft = 25 * 60;
        this.isRunning = false;
        this.timerId = null;

        this.btn.addEventListener('click', () => this.toggle());
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        this.btn.innerText = 'Pause';
        this.btn.style.background = 'var(--disco-mint)';
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            if (this.timeLeft <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        this.btn.innerText = 'Start';
        this.btn.style.background = 'var(--disco-pink)';
        clearInterval(this.timerId);
    }

    complete() {
        this.pause();
        this.timeLeft = 25 * 60;
        this.updateDisplay();

        // Trigger celebration
        const event = new CustomEvent('CS_TRIGGER_CELEBRATION', { detail: { type: 'confetti' } });
        window.dispatchEvent(event);

        alert('Pomodoro Complete! Time to celebrate! 🎉');
    }

    updateDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// We'll initialize this in content.js since it needs DOM elements from the shadow root
window.PomodoroTimer = PomodoroTimer;
