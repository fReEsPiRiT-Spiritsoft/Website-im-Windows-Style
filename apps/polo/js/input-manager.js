class InputManager {
    /**
     * Handles all input events (keyboard, touch, UI) for the game.
     * @param {Keyboard} keyboard - The keyboard input object.
     * @param {World} world - The game world instance.
     */
    constructor(keyboard, world) {
        this.keyboard = keyboard;
        this.world = world;
        this.lastThrowTime = 0;
        this.setupAll();
    }

    setWorld(world) {
        this.world = world;
    }

    /**
     * Sets up all input event listeners.
     */
    setupAll() {
        this.setupTouchControls();
        this.setupKeyboardControls();
        this.setupUIClicks();
    }

    /**
     * Sets up touch controls for mobile buttons.
     */
    setupTouchControls() {
        this.bindTouchButton('btnLeft', 'LEFT');
        this.bindTouchButton('btnRight', 'RIGHT');
        this.bindTouchButton('btnJump', 'SPACE');
        this.bindTouchButton('btnThrow', 'D');
    }

    /**
     * Binds a touch button to a keyboard key.
     * @param {string} elementId - The button element ID.
     * @param {string} key - The keyboard key to simulate.
     */
    bindTouchButton(elementId, key) {
        const btn = document.getElementById(elementId);
        if (!btn) return;
        btn.addEventListener('touchstart', e => this.handleTouchStart(e, key));
        btn.addEventListener('touchend', e => this.handleTouchEnd(e, key));
        btn.addEventListener('touchcancel', e => this.handleTouchEnd(e, key));
    }

    /**
     * Handles touch start event.
     * @param {TouchEvent} e
     * @param {string} key
     */
    handleTouchStart(e, key) {
        e.preventDefault();
        this.keyboard[key] = true;
        if (key === 'D') this.handleThrowOnTouch();
    }

    /**
     * Handles touch end event.
     * @param {TouchEvent} e
     * @param {string} key
     */
    handleTouchEnd(e, key) {
        e.preventDefault();
        this.keyboard[key] = false;
    }

    /**
     * Handles bottle throw on touch.
     */
    handleThrowOnTouch() {
        const now = performance.now();
        if (now - this.lastThrowTime > 750 && this.world) {
            this.world.checkThrowObjects();
            this.lastThrowTime = now;
        }
    }

    /**
     * Sets up keyboard event listeners.
     */
    setupKeyboardControls() {
        window.addEventListener('keydown', e => this.handleKeyDown(e));
        window.addEventListener('keyup', e => this.handleKeyUp(e));
    }

    /**
     * Handles keydown events.
     * @param {KeyboardEvent} event
     */
    handleKeyDown(event) {
        if (event.keyCode == 39) this.keyboard.RIGHT = true;
        if (event.keyCode == 37) this.keyboard.LEFT = true;
        if (event.keyCode == 38) this.keyboard.UP = true;
        if (event.keyCode == 40) this.keyboard.DOWN = true;
        if (event.keyCode == 32) this.keyboard.SPACE = true;
        if (event.keyCode == 68) {
            const now = performance.now();
            if (now - this.lastThrowTime > 750) {
                this.keyboard.D = true;
                if (this.world) this.world.checkThrowObjects();
                this.lastThrowTime = now;
            }
        }
        if (event.keyCode == 72 && this.world) {
            this.world.debugHitboxes = !this.world.debugHitboxes;
        }
    }

    /**
     * Handles keyup events.
     * @param {KeyboardEvent} event
     */
    handleKeyUp(event) {
        if (event.keyCode == 39) this.keyboard.RIGHT = false;
        if (event.keyCode == 37) this.keyboard.LEFT = false;
        if (event.keyCode == 38) this.keyboard.UP = false;
        if (event.keyCode == 40) this.keyboard.DOWN = false;
        if (event.keyCode == 32) this.keyboard.SPACE = false;
        if (event.keyCode == 68) this.keyboard.D = false;
    }

    /**
     * Sets up UI click events (e.g. menu close on outside click).
     */
    setupUIClicks() {
        document.addEventListener('click', (e) => {
            const ui = document.getElementById('ui');
            const toggle = document.getElementById('menuToggle');
            if (!ui || !toggle) return;
            if (window.innerWidth > 900) return;
            if (!ui.contains(e.target) && e.target !== toggle) {
                ui.classList.remove('open');
            }
        });
    }
}