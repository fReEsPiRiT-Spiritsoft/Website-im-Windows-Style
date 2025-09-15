/**
 * Character: Main player character class with movement, animation, and sound logic.
 */
class Character extends MoveableObject {

    height = 300;
    y = 0;
    speed = 6;
    energy = 100
    lastAction = 0;
    longIdleDelay = 5000;
    wasAboveGround = false;
    jumpAnimationInterval = null;
    jumpFrameIndex = 0;


    IMAGES_IDLE = [
        'img/2_character_pepe/1_idle/idle/i-1.png',
        'img/2_character_pepe/1_idle/idle/i-2.png',
        'img/2_character_pepe/1_idle/idle/i-3.png',
        'img/2_character_pepe/1_idle/idle/i-4.png',
        'img/2_character_pepe/1_idle/idle/i-5.png',
        'img/2_character_pepe/1_idle/idle/i-6.png',
        'img/2_character_pepe/1_idle/idle/i-7.png',
        'img/2_character_pepe/1_idle/idle/i-8.png',
        'img/2_character_pepe/1_idle/idle/i-9.png',
        'img/2_character_pepe/1_idle/idle/i-10.png'
    ];

    IMAGES_LONG_IDLE = [
        'img/2_character_pepe/1_idle/long_idle/i-11.png',
        'img/2_character_pepe/1_idle/long_idle/i-12.png',
        'img/2_character_pepe/1_idle/long_idle/i-13.png',
        'img/2_character_pepe/1_idle/long_idle/i-14.png',
        'img/2_character_pepe/1_idle/long_idle/i-15.png',
        'img/2_character_pepe/1_idle/long_idle/i-16.png',
        'img/2_character_pepe/1_idle/long_idle/i-17.png',
        'img/2_character_pepe/1_idle/long_idle/i-18.png',
        'img/2_character_pepe/1_idle/long_idle/i-19.png',
        'img/2_character_pepe/1_idle/long_idle/i-20.png'
    ];

    IMAGES_WALKING = [
        'img/2_character_pepe/2_walk/w-21.png',
        'img/2_character_pepe/2_walk/w-22.png',
        'img/2_character_pepe/2_walk/w-23.png',
        'img/2_character_pepe/2_walk/w-24.png',
        'img/2_character_pepe/2_walk/w-26.png',
        'img/2_character_pepe/2_walk/w-25.png'

    ];

    IMAGES_JUMPING = [
        'img/2_character_pepe/3_jump/j-31.png',
        'img/2_character_pepe/3_jump/j-32.png',
        'img/2_character_pepe/3_jump/j-33.png',
        'img/2_character_pepe/3_jump/j-34.png',
        'img/2_character_pepe/3_jump/j-35.png',
        'img/2_character_pepe/3_jump/j-36.png',
        'img/2_character_pepe/3_jump/j-37.png',
        'img/2_character_pepe/3_jump/j-38.png',
        'img/2_character_pepe/3_jump/j-39.png'
    ];

    IMAGES_HURT = [
        'img/2_character_pepe/4_hurt/h-41.png',
        'img/2_character_pepe/4_hurt/h-42.png',
        'img/2_character_pepe/4_hurt/h-43.png'

    ];

    IMAGES_DEAD = [
        'img/2_character_pepe/5_dead/d-51.png',
        'img/2_character_pepe/5_dead/d-52.png',
        'img/2_character_pepe/5_dead/d-53.png',
        'img/2_character_pepe/5_dead/d-54.png',
        'img/2_character_pepe/5_dead/d-55.png',
        'img/2_character_pepe/5_dead/d-56.png',
        'img/2_character_pepe/5_dead/d-57.png'
    ];

    world;

    constructor() {
        super();
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.applyGravity();
        this.lastAction = performance.now();
        this.animate();
        this.hitbox = {
            offsetX: 15,
            offsetY: 120,
            width: this.width - 30,
            height: this.height - 120
        };
    }

    /**
     * markAction: Updates the last action timestamp for idle detection.
     */
    markAction() {
        this.lastAction = performance.now();
    }

    /**
     * isLongIdle: Checks if the character has been idle long enough for long idle animation.
     * @returns {boolean}
     */
    isLongIdle() {
        return (performance.now() - this.lastAction) >= this.longIdleDelay;
    }

    /**
     * animate: Starts movement and animation loops for the character.
     */
    animate() {
        this.startMovementLoop();
        this.startAnimationLoop();
    }

    /**
     * startMovementLoop: Starts the interval for movement updates.
     */
    startMovementLoop() {
        this.moveInterval = setInterval(() => this.updateMovement(), 1000 / 60);
    }

    /**
     * updateMovement: Handles character movement, sounds, and camera position.
     */
    updateMovement() {
        if (!this.isEndbossAlive()) return this.handleEndbossDead();
        let moved = this.handleMovement();
        this.handleWalkSound(moved);
        this.handleLandingSound();
        this.world.camera_x = -this.x + 100;
    }

    /**
     * handleEndbossDead: Stops animations and walking sound when endboss is dead.
     */
    handleEndbossDead() {
        if (this.animations) clearInterval(this.animations);
        AudioHub.PEPE_WALK.pause();
    }

    /**
     * handleMovement: Handles left/right movement and jumping, returns if moved.
     * @returns {boolean}
     */
    handleMovement() {
        let moved = false;
        moved = this.handleHorizontalMovement() || moved;
        moved = this.handleJump() || moved;
        if (moved) this.markAction();
        return moved;
    }

    /**
     * Handles left and right movement.
     * @returns {boolean} true if moved horizontally
     */
    handleHorizontalMovement() {
        let moved = false;
        if (this.canMoveRight()) {
            this.moveRight();
            this.otherDirection = false;
            moved = true;
        }
        if (this.canMoveLeft()) {
            this.moveLeft();
            this.otherDirection = true;
            moved = true;
        }
        return moved;
    }

    /**
     * Handles jumping logic.
     * @returns {boolean} true if jump was performed
     */
    handleJump() {
        if (this.canJump()) {
            this.jump(20);
            this.startJumpAnimation();
            AudioHub.PEPE_JUMP.currentTime = 0;
            AudioHub.PEPE_JUMP.play();
            return true;
        }
        return false;
    }

    /**
     * handleWalkSound: Plays or pauses the walking sound based on movement.
     * @param {boolean} moved
     */
    handleWalkSound(moved) {
        if (moved) {
            if (AudioHub.PEPE_WALK.paused) {
                AudioHub.PEPE_WALK.currentTime = 0;
                AudioHub.PEPE_WALK.loop = true;
                AudioHub.PEPE_WALK.play();
            }
        } else {
            if (!AudioHub.PEPE_WALK.paused) {
                AudioHub.PEPE_WALK.pause();
                AudioHub.PEPE_WALK.currentTime = 0;
            }
        }
    }

    /**
     * handleLandingSound: Plays landing sound when character lands on the ground.
     */
    handleLandingSound() {
        if (this.wasAboveGround && !this.isAboveGround()) {
            AudioHub.PEPE_LAND.currentTime = 0;
            AudioHub.PEPE_LAND.play();
        }
        this.wasAboveGround = this.isAboveGround();
    }

    /**
     * isEndbossAlive: Checks if the endboss is still alive.
     * @returns {boolean}
     */
    isEndbossAlive() {
        return this.world?.enemies?.some(e => e instanceof ChickenEndboss && !e.isDead) ?? true;
    }

    /**
     * canMoveRight: Checks if the character can move right.
     * @returns {boolean}
     */
    canMoveRight() {
        return this.world.keyboard.RIGHT && this.x < 7200 && !this.isDead() && !this.characterKnockbackActive;
    }

    /**
     * canMoveLeft: Checks if the character can move left.
     * @returns {boolean}
     */
    canMoveLeft() {
        return this.world.keyboard.LEFT && this.x > 100 && !this.isDead() && !this.characterKnockbackActive;
    }

    /**
     * canJump: Checks if the character can jump.
     * @returns {boolean}
     */
    canJump() {
        return this.world.keyboard.SPACE && !this.isAboveGround() && !this.isDead();
    }

    /**
     * startAnimationLoop: Starts the interval for animation frame updates.
     */
    startAnimationLoop() {
        this.animations = setInterval(() => this.updateAnimationFrame(), 100);
    }

    /**
     * updateAnimationFrame: Updates the character's animation frame based on state.
     */
    updateAnimationFrame() {
        if (!this.isLongIdle() && !AudioHub.PEPE_SLEEP.paused) {
            AudioHub.PEPE_SLEEP.pause();
            AudioHub.PEPE_SLEEP.currentTime = 0;
        }
        if (this.isHurt()) return this.playAnimation(this.IMAGES_HURT);
        if (this.isDead()) return this.playDeathSequence();
        this.updateMovementAndIdleAnimation();
    }

    /**
    * updateMovementAndIdleAnimation: Handles jump, walk, idle and long idle animations.
    * Shows the last jump frame while in the air, resets jump frame index on landing,
     * and plays the appropriate animation based on the character's state.
    */
    updateMovementAndIdleAnimation() {
        if (this.jumpAnimationInterval) return;
        if (this.isAboveGround()) {
            this.img = this.imageCache[this.IMAGES_JUMPING[this.IMAGES_JUMPING.length - 1]];
            return;
        } else if (this.jumpFrameIndex !== 0) {
            this.jumpFrameIndex = 0;
        }
        if (this.isWalking()) return this.playAnimation(this.IMAGES_WALKING);
        if (this.isLongIdle()) return this.handleLongIdle();
        this.handleIdle();
    }

    /**
     * startJumpAnimation: Starts the jump animation interval.
     */
    startJumpAnimation() {
        if (this.jumpAnimationInterval) {
            clearInterval(this.jumpAnimationInterval);
            this.jumpAnimationInterval = null;
        }
        this.jumpFrameIndex = 0;
        this.img = this.imageCache[this.IMAGES_JUMPING[0]];
        this.jumpAnimationInterval = setInterval(() => {
            if (this.jumpFrameIndex < this.IMAGES_JUMPING.length - 1) {
                this.jumpFrameIndex++;
                this.img = this.imageCache[this.IMAGES_JUMPING[this.jumpFrameIndex]];
            } else {
                clearInterval(this.jumpAnimationInterval);
                this.jumpAnimationInterval = null;
            }
        }, 200);
    }

    /**
     * isWalking: Checks if the character is currently walking.
     * @returns {boolean}
     */
    isWalking() {
        return this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    }

    /**
     * handleLongIdle: Plays long idle animation and sleep sound.
     */
    handleLongIdle() {
        if (AudioHub.PEPE_SLEEP.paused) {
            AudioHub.PEPE_SLEEP.currentTime = 0;
            AudioHub.PEPE_SLEEP.volume = 0.2;
            AudioHub.PEPE_SLEEP.play();
        }
        return this.playAnimation(this.IMAGES_LONG_IDLE);
    }

    /**
     * handleIdle: Plays idle animation and stops sleep sound.
     */
    handleIdle() {
        if (!AudioHub.PEPE_SLEEP.paused) {
            AudioHub.PEPE_SLEEP.pause();
            AudioHub.PEPE_SLEEP.currentTime = 0;
        }
        this.playAnimation(this.IMAGES_IDLE);
    }

    /**
     * playDeathSequence: Plays death animation and shows coffin after delay.
     */
    playDeathSequence() {
        this.playAnimation(this.IMAGES_DEAD);
        setTimeout(() => {
            clearInterval(this.animations);
            this.showSarg();
        }, 500);
    }

    /**
     * showEndscreen: Displays the end screen and pauses the world.
     */
    showEndscreen() {
        setTimeout(() => {
            const es = document.getElementById('endscreen');
            if (es) es.classList.remove('hidden');
            if (this.world) this.world.paused = true;
        }, 800);
    }

    /**
     * showSarg: Shows the coffin image and triggers end screen and lose sound.
     */
    showSarg() {
        if (this.sargShown) return;
        this.sargShown = true;
        if (this.animations) clearInterval(this.animations);
        this.animations = null;
        this.loadImage('img/2_character_pepe/5_dead/d-58.png');
        this.y = 320;
        this.height = 200;
        this.width = 300;
        this.showEndscreen();
        this.y = 320;
        this.playLoseSound();
    }

    /**
     * playLoseSound: Plays the lose sound effect.
     */
    playLoseSound() {
        AudioHub.LOOSER.currentTime = 0;
        AudioHub.LOOSER.volume = 0.3;
        AudioHub.LOOSER.play();
    }
}