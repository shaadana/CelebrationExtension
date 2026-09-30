// content.js
(function () {
    console.log('Celebration Station: Content Script Loading...');
    if (window.hasCelebrationStationInjected) return;
    window.hasCelebrationStationInjected = true;

    const init = () => {
        try {
            if (!document.body) {
                console.log('Celebration Station: No body found, waiting...');
                setTimeout(init, 100);
                return;
            }
            console.log('Celebration Station: Initializing Widget...');

            const root = document.createElement('div');
            root.id = 'celebration-station-container';
            root.className = 'celebration-station-root';

            // Shadow DOM for style isolation
            const shadow = root.attachShadow({ mode: 'open' });

            // Load styles into Shadow DOM
            const styles = ['theme.css', 'widget.css', 'celebrations.css'];
            styles.forEach(s => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = chrome.runtime.getURL(`styles/${s}`);
                shadow.appendChild(link);
            });

            const widget = document.createElement('div');
            widget.id = 'cs-widget';
            widget.className = 'retro-card';
            widget.innerHTML = `
    <div class="widget-header" id="cs-drag-handle">
      <span>Celebration Station</span>
      <button id="cs-toggle-btn">➖</button>
    </div>
    <div class="widget-content">
      <div class="pomodoro-timer">
        <span id="cs-timer-display">25:00</span>
        <button id="cs-timer-btn" class="retro-button small">Start</button>
      </div>
      
      <div class="celebration-buttons">
        <button data-type="confetti" class="retro-button small" title="Confetti">🎉</button>
        <button data-type="disco" class="retro-button small" title="Disco">🪩</button>
        <button data-type="falling" class="retro-button small" title="Balloons">🎈</button>
        <button data-type="lasers" class="retro-button small" title="Lasers">⚡</button>
        <button data-type="fog" class="retro-button small" title="Fog Machine">🌫️</button>
      </div>

      <div class="customization-panel">
        <div class="slider-group">
          <label>Speed <span id="val-speed">5</span></label>
          <input type="range" id="cs-speed-slider" min="1" max="10" value="5">
        </div>
        <div class="slider-group">
          <label>Size <span id="val-size">20</span></label>
          <input type="range" id="cs-size-slider" min="5" max="100" value="20">
        </div>
        <div class="slider-group">
          <label>Duration (s) <span id="val-duration">5</span></label>
          <input type="range" id="cs-duration-slider" min="1" max="20" value="5">
        </div>
        <div class="slider-group">
          <label>Density <span id="val-density">5</span></label>
          <input type="range" id="cs-density-slider" min="1" max="10" value="5">
        </div>
        <div class="slider-group">
          <label>Opacity <span id="val-opacity">0.8</span></label>
          <input type="range" id="cs-opacity-slider" min="0.1" max="1" step="0.1" value="0.8">
        </div>
        <div class="toggle-group">
          <input type="checkbox" id="cs-rainbow-toggle" checked>
          <label for="cs-rainbow-toggle">Rainbow Mode</label>
        </div>
        <div class="custom-settings">
          <div class="input-group">
            <label>Primary Color</label>
            <input type="color" id="cs-color-input" value="#FFB7CE">
          </div>
          <div class="input-group">
            <label>Custom Emojis</label>
            <input type="text" id="cs-emoji-input" placeholder="🎈,✨,🕺">
          </div>
        </div>
      </div>
    </div>
  `;

            shadow.appendChild(widget);
            document.body.appendChild(root);

            // Initialize engine
            if (window.CelebrationEngine) {
                window.csEngine = new window.CelebrationEngine(shadow);
                console.log('Celebration Station: CelebrationEngine initialized in Shadow DOM');
            } else {
                console.error('Celebration Station: CelebrationEngine class not found!');
            }

            // Initialize Pomodoro
            console.log('Celebration Station: Checking PomodoroTimer...', !!window.PomodoroTimer);
            if (window.PomodoroTimer) {
                const timerDisplay = shadow.querySelector('#cs-timer-display');
                const timerBtn = shadow.querySelector('#cs-timer-btn');
                new window.PomodoroTimer(timerDisplay, timerBtn);
            }

            // Toggle Collapse
            const toggleBtn = shadow.querySelector('#cs-toggle-btn');
            toggleBtn.addEventListener('click', () => {
                widget.classList.toggle('widget-collapsed');
                toggleBtn.innerText = widget.classList.contains('widget-collapsed') ? '➕' : '➖';
            });

            // Customization Logic
            const speedSlider = shadow.querySelector('#cs-speed-slider');
            const sizeSlider = shadow.querySelector('#cs-size-slider');
            const durationSlider = shadow.querySelector('#cs-duration-slider');
            const densitySlider = shadow.querySelector('#cs-density-slider');
            const opacitySlider = shadow.querySelector('#cs-opacity-slider');
            const rainbowToggle = shadow.querySelector('#cs-rainbow-toggle');
            const colorInput = shadow.querySelector('#cs-color-input');
            const emojiInput = shadow.querySelector('#cs-emoji-input');

            const updateSetting = (key, val) => {
                const display = shadow.querySelector(`#val-${key}`);
                if (display) display.innerText = val;
                window.dispatchEvent(new CustomEvent('CS_UPDATE_SETTINGS', { detail: { [key]: val } }));
            };

            speedSlider.addEventListener('input', (e) => updateSetting('speed', e.target.value));
            sizeSlider.addEventListener('input', (e) => updateSetting('size', e.target.value));
            durationSlider.addEventListener('input', (e) => updateSetting('duration', e.target.value));
            densitySlider.addEventListener('input', (e) => updateSetting('density', e.target.value));
            opacitySlider.addEventListener('input', (e) => updateSetting('opacity', e.target.value));
            rainbowToggle.addEventListener('change', (e) => updateSetting('rainbow', e.target.checked));
            colorInput.addEventListener('input', (e) => updateSetting('customColor', e.target.value));
            emojiInput.addEventListener('input', (e) => updateSetting('customEmojis', e.target.value));

            // Dragging logic refined to use top/left to avoid transform conflicts
            let isDragging = false;
            let startX, startY;
            let startLeft, startTop;

            const dragHandle = shadow.querySelector('#cs-drag-handle');

            dragHandle.addEventListener('mousedown', (e) => {
                if (e.target === toggleBtn) return;

                isDragging = true;
                const rect = widget.getBoundingClientRect();

                // Lock the current position into style properties
                widget.style.top = rect.top + 'px';
                widget.style.left = rect.left + 'px';
                widget.style.right = 'auto';
                widget.style.bottom = 'auto';

                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseInt(widget.style.left, 10) || rect.left;
                startTop = parseInt(widget.style.top, 10) || rect.top;

                widget.style.transition = 'none'; // Snappy drag
                widget.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                widget.style.left = (startLeft + deltaX) + 'px';
                widget.style.top = (startTop + deltaY) + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    widget.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    widget.style.cursor = 'default';
                }
            });

            // Keyword Listening Logic
            const keywords = {
                'happy': 'confetti',
                'yay': 'confetti',
                'disco': 'disco',
                'party': 'disco',
                'done': 'confetti',
                'finished': 'confetti',
                'celebrate': 'disco'
            };

            let inputBuffer = '';
            document.addEventListener('keydown', (e) => {
                if (e.key.length === 1) {
                    inputBuffer += e.key.toLowerCase();
                    if (inputBuffer.length > 20) inputBuffer = inputBuffer.slice(-20);

                    for (const [key, type] of Object.entries(keywords)) {
                        if (inputBuffer.endsWith(key)) {
                            triggerCelebration(type);
                            inputBuffer = '';
                        }
                    }
                } else if (e.key === ' ') {
                    inputBuffer = '';
                }
            });

            function triggerCelebration(type) {
                console.log(`Triggering ${type} celebration!`);
                const event = new CustomEvent('CS_TRIGGER_CELEBRATION', { detail: { type } });
                window.dispatchEvent(event);
            }

            // Handle manual clicks
            shadow.querySelectorAll('.celebration-buttons button').forEach(btn => {
                btn.addEventListener('click', () => {
                    triggerCelebration(btn.dataset.type);
                });
            });

        } catch (e) {
            console.error('Celebration Station: Critical initialization error:', e);
        }
    };

    console.log(`Celebration Station: Script initialized on ${location.href} (Frame: ${window !== window.top})`);
    console.log('Celebration Station: Global status:', {
        engine: !!window.CelebrationEngine,
        timer: !!window.PomodoroTimer
    });


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
