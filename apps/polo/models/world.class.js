class World {
    paused = true;
    character = new Character();
    level = [];
    enemies = [];
    clouds = [];
    backgroundObjects = [];
    raindrops = [];
    lastRainSpawn = 0;
    ctx;
    canvas;
    keyboard;
    camera_x = 0;
    bossShiftActive = false;
    lastBossShiftActive = false;
    camTransitionActive = false;
    camTransitionStart = 0;
    camTransitionFrom = 0;
    camTransitionTo = 0;
    CAM_TRANSITION_DURATION = 450;
    CAM_LEFT_OFFSET = 100;
    CAM_RIGHT_OFFSET_EXTRA = 100;
    bossShiftMinHoldUntil = 2000;
    BOSS_SHIFT_MAX_DISTANCE = 1200;
    BOSS_SHIFT_ACTIVATE_DELTA = 60;
    BOSS_SHIFT_DEACTIVATE_DELTA = 20;
    BOSS_SHIFT_MIN_HOLD = 500;
    statusBar = new StatusBar();
    coinStatusBar = new CoinStatusBar();
    bottleStatusBar = new BottleStatusBar();
    throwableObjects = [];
    collectedBottles = 0;
    collectedCoins = 0;
    characterKnockbackActive = false;
    lastHurtSound = 0;
    triggeredFightSound = false;
    debugHitboxes = false;

    /**
     * Creates a new World instance.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @param {Keyboard} keyboard - The keyboard input handler.
     */
    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.level = level1;
        this.enemies = level1.enemies;
        this.clouds = level1.clouds;
        this.backgroundObjects = level1.backgroundObjects;

        this.collisionManager = new CollisionManager(this);
        this.draw();
        this.setWorld();
        this.collisionManager.update();
        this.run();

    }

    /**
     * Unpauses the game.
     */
    start() {
        this.paused = false;
    }

    /**
     * Sets the world reference for the character.
     */
    setWorld() {
        this.character.world = this;
    }

    /**
     * Starts the main game logic interval.
     */
    run() {
        this.locicInterval = setInterval(() => {
            this.collisionManager.update();
        }, 200);
    }

    /**
     * Updates the camera position and handles transitions.
     */
    updateCamera() {
        this.evaluateBossCamera();
        if (this.bossShiftActive !== this.lastBossShiftActive) {
            this.startCameraTransition();
        }
        if (this.camTransitionActive) {
            this.updateCameraTransition();
        } else {
            this.setCameraTarget();
        }
        this.camera_x = Math.round(this.camera_x);
    }

    /**
     * Plays the endboss fight sound once.
     */
    triggerFightSound() {
        if (this.character.x > 5600 && this.triggeredFightSound === false) {
            AudioHub.FIGHT_FOR_ENDBOSS.play();
            this.triggeredFightSound = true;
        }
    }

    /**
     * Starts the camera transition animation.
     */
    startCameraTransition() {
        this.lastBossShiftActive = this.bossShiftActive;
        const target = this.bossShiftActive
            ? (-this.character.x + this.canvas.width - this.character.width - this.CAM_RIGHT_OFFSET_EXTRA)
            : (-this.character.x + this.CAM_LEFT_OFFSET);
        this.camTransitionFrom = this.camera_x;
        this.camTransitionTo = target;
        this.camTransitionStart = performance.now();
        this.camTransitionActive = true;
    }

    /**
     * Updates the camera transition animation.
     */
    updateCameraTransition() {
        const now = performance.now();
        let t = (now - this.camTransitionStart) / this.CAM_TRANSITION_DURATION;
        if (t >= 1) {
            t = 1;
            this.camTransitionActive = false;
        }
        const eased = t * t * (3 - 2 * t);
        this.camera_x = this.camTransitionFrom + (this.camTransitionTo - this.camTransitionFrom) * eased;
    }

    /**
     * Sets the camera to the target position.
     */
    setCameraTarget() {
        this.camera_x = this.bossShiftActive
            ? (-this.character.x + this.canvas.width - this.character.width - this.CAM_RIGHT_OFFSET_EXTRA)
            : (-this.character.x + this.CAM_LEFT_OFFSET);
    }

    /**
     * Checks if the boss camera should be active.
     */
    evaluateBossCamera() {
        const boss = this.enemies.find(e => e instanceof ChickenEndboss && !e.isDead);
        if (!boss) {
            this.bossShiftActive = false;
            return;
        }
        this.updateBossShiftState(boss);
    }

    /**
     * Updates the boss shift state.
     * @param {ChickenEndboss} boss - The endboss instance.
     */
    updateBossShiftState(boss) {
        const now = performance.now();
        const dx = this.character.x - boss.x;
        const absDx = Math.abs(dx);
        if (this.shouldActivateBossShift(dx, absDx)) {
            this.activateBossShift(now);
            return;
        }
        if (this.bossShiftActive) {
            this.checkBossShiftDeactivate(dx, absDx, now);
        }
    }

    /**
     * Checks if boss shift should activate.
     * @param {number} dx - Distance between character and boss.
     * @param {number} absDx - Absolute distance between character and boss.
     */
    shouldActivateBossShift(dx, absDx) {
        return !this.bossShiftActive &&
            dx > this.BOSS_SHIFT_ACTIVATE_DELTA &&
            absDx < this.BOSS_SHIFT_MAX_DISTANCE;
    }

    /**
     * Activates boss shift.
     * @param {number} now - Current timestamp.
     */
    activateBossShift(now) {
        this.bossShiftActive = true;
        this.bossShiftMinHoldUntil = now + this.BOSS_SHIFT_MIN_HOLD;
    }

    /**
     * Checks if boss shift should deactivate.
     * @param {number} dx - Distance between character and boss.
     * @param {number} absDx - Absolute distance between character and boss.
     * @param {number} now - Current timestamp.
     */
    checkBossShiftDeactivate(dx, absDx, now) {
        const holdDone = now >= this.bossShiftMinHoldUntil;
        const bossNoLongerLeft = dx < this.BOSS_SHIFT_DEACTIVATE_DELTA;
        const tooFar = absDx >= this.BOSS_SHIFT_MAX_DISTANCE;
        if (holdDone && (bossNoLongerLeft || tooFar)) {
            this.bossShiftActive = false;
        }
    }

    /**
     * Handles bottle throwing.
     */
    checkThrowObjects() {
        if (this.canThrowBottle()) {
            const { startX, startY, facingLeft } = this.getBottleStartPosition();
            this.spawnThrowableBottle(startX, startY, facingLeft);
            this.handleBottleThrowEffects();
        }
    }

    /**
     * Checks if bottle can be thrown.
     * @returns {boolean}
     */
    canThrowBottle() {
        return this.keyboard.D && this.collectedBottles > 0 && !this.throwCooldown;
    }

    /**
     * Gets the bottle start position.
     * @returns {{startX: number, startY: number, facingLeft: boolean}}
     */
    getBottleStartPosition() {
        const facingLeft = this.character.otherDirection;
        const startX = facingLeft
            ? this.character.x - 30
            : this.character.x + this.character.width - 30;
        const startY = this.character.y + this.character.height * 0.45;
        return { startX, startY, facingLeft };
    }

    /**
     * Spawns a throwable bottle.
     * @param {number} startX - The x position to spawn the bottle.
     * @param {number} startY - The y position to spawn the bottle.
     * @param {boolean} facingLeft - Direction the bottle is thrown.
     */
    spawnThrowableBottle(startX, startY, facingLeft) {
        const bottle = new ThrowableObject(startX, startY, facingLeft);
        this.throwableObjects.push(bottle);
        this.collectedBottles--;
        this.bottleStatusBar.setPercentage(this.collectedBottles / 20 * 100);
        this.throwCooldown = true;
    }

    /**
     * Handles bottle throw effects.
     */
    handleBottleThrowEffects() {
        AudioHub.THROW.currentTime = 0;
        AudioHub.THROW.volume = 0.8;
        AudioHub.THROW.play();
        setTimeout(() => this.throwCooldown = false, 300);
    }

    /**
     * Draws camera and background.
     */
    drawCamAndBackground() {
        this.updateCamera();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.backgroundObjects.forEach(bg => {
            if (bg instanceof BackgroundObject) {
                bg.draw(this.ctx, this.camera_x);
            }
        });
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
    }

    /**
     * Draws all environment objects.
     */
    drawEnvoiment() {
        this.addObjectsToMap(this.clouds);
        this.addObjectsToMap(this.level.collectableObjects);
        this.addToMap(this.character);
        this.addObjectsToMap(this.enemies);
        this.addObjectsToMap(this.throwableObjects);
    }

    /**
     * Draws raindrops.
     */
    drawRaindrops() {
        const now = performance.now();
        if (this.enableRain) this.spawnRain(now);
        this.raindrops = this.raindrops.filter(r => r.update());
        this.raindrops.forEach(r => r.draw(this.ctx));
    }

    /**
     * Draws dark overlay for rain.
     */
    drawDarkOverlay() {
        if (!this.enableRain) return;
        this.ctx.save();
        this.ctx.globalAlpha = 0.25;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    /**
     * Draws all status bars.
     */
    drawStatusBars() {
        this.addToMap(this.statusBar);
        this.addToMap(this.coinStatusBar);
        this.addToMap(this.bottleStatusBar);
        this.bottleStatusBar.draw(this.ctx, this.collectedBottles);
    }

    /**
     * Draws the endboss status bar.
     */
    drawEnbossStatusBar() {
        this.enemies.forEach(enemy => {
            if (enemy instanceof ChickenEndboss && enemy.statusBar) {
                const worldX = enemy.x + enemy.width / 2 - enemy.statusBar.width / 2;
                const worldY = enemy.y - enemy.statusBar.height - 2 + 150;
                const screenX = worldX + this.camera_x;
                const screenY = worldY;
                enemy.statusBar.x = screenX;
                enemy.statusBar.y = screenY;
                enemy.statusBar.draw(this.ctx);
            }
        });
    }

    /**
     * Draws debug hitboxes.
     */
    drawHitBoxes() {
        if (!this.debugHitboxes) return;
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.character.drawHitBox(this.ctx, 'rgba(0,255,0,0.25)');
        this.enemies.forEach(e => e.drawHitBox && e.drawHitBox(this.ctx, 'rgba(255,0,0,0.25)'));
        this.throwableObjects.forEach(o => o.drawHitBox && o.drawHitBox(this.ctx, 'rgba(0,0,255,0.25)'));
        this.ctx.restore();
    }

    /**
     * Main draw loop.
     */
    draw() {
        this.drawCamAndBackground();
        this.drawEnvoiment();
        this.drawRaindrops();
        this.ctx.restore();
        this.drawDarkOverlay();
        this.drawStatusBars();
        this.drawHitBoxes();
        this.drawEnbossStatusBar()
        requestAnimationFrame(() => this.draw());
        EnemySounds.updateMiniChickenSound(this);
        EnemySounds.updateChickenSound(this);
        this.triggerFightSound();
    }

    /**
     * Adds multiple objects to the map.
     * @param {Array} objects - The objects to add.
     */
    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    /**
     * Adds a single object to the map.
     * @param {DrawableObject} mo - The object to add.
     */
    addToMap(mo) {
        if (mo instanceof BackgroundObject) return;
        if (mo.otherDirection) this.flipImage(mo);
        mo.draw(this.ctx);
        if (mo.otherDirection) this.flipImageBack(mo);
    }

    /**
     * Flips an image horizontally.
     * @param {DrawableObject} mo - The object to flip.
     */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /**
     * Restores image after flipping.
     * @param {DrawableObject} mo - The object to restore.
     */
    flipImageBack(mo) {
        this.ctx.restore();
        mo.x = mo.x * -1;
    }

    /**
     * Spawns new raindrops.
     * @param {number} now - Current timestamp.
     */
    spawnRain(now) {
        if (now - this.lastRainSpawn < 80) return;
        this.lastRainSpawn = now;
        if (!this.clouds || !this.clouds.length) return;
        const count = 8 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            const cloud = this.clouds[Math.floor(Math.random() * this.clouds.length)];
            this.raindrops.push(new Raindrop(cloud.x + 250, cloud.y + 80));
        }
    }
}