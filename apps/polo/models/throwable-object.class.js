isSplashing = false;

/**
 * ThrowableObject: Represents a throwable bottle in the game.
 */
class ThrowableObject extends MoveableObject {

    IMAGES_ROTATE_BOTTLE = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'

    ];

    BOTTLE_SPLASH = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'

    ];

    /**
     * Creates a new ThrowableObject.
     * @param {number} x - The x position.
     * @param {number} y - The y position.
     * @param {boolean} [facingLeft=false] - Direction of the throw.
     */
    constructor(x, y, facingLeft = false) {
        super().loadImage('img/6_salsa_bottle/salsa_bottle.png')
        this.loadImages(this.IMAGES_ROTATE_BOTTLE);
        this.loadImages(this.BOTTLE_SPLASH);
        this.x = x;
        this.y = y;
        this.height = 80;
        this.width = 60;
        this.direction = facingLeft ? -1 : 1;
        this.throw();

    }

    /**
     * Starts the throw movement and animation.
     */
    throw() {
        this.speedY = 12;
        this.applyGravity();
        this.throwAnimation();
        this.moveInterval = setInterval(() => {
            if (!this.groundContact) {
                this.x += 10 * this.direction;
            } else {
                clearInterval(this.moveInterval);
            }
        }, 25);
    }

    /**
     * Handles the throw and splash animation.
     */
    throwAnimation() {
        let splashStarted = false;
        let splashSoundPlayed = false;
        let animationInterval = setInterval(() => {
            if (!this.groundContact) {
                this.playAnimation(this.IMAGES_ROTATE_BOTTLE);
            } else {
                if (!splashStarted) {
                    this.currentImage = 0;
                    splashStarted = true;
                    this.startSplash();
                }
                this.playAnimation(this.BOTTLE_SPLASH);
                if (this.currentImage >= this.BOTTLE_SPLASH.length) {
                    clearInterval(animationInterval);
                }
            }
        }, 100);
    }

    /**
     * Starts the splash animation and removal.
     */
    startSplash() {
        if (this.isSplashing) return;
        this.isSplashing = true;
        this.currentImage = 0;
        let splashInterval = setInterval(() => {
            this.playAnimation(this.BOTTLE_SPLASH);
            this.currentImage++;
            if (this.currentImage >= this.BOTTLE_SPLASH.length) {
                clearInterval(splashInterval);
                this.markedForRemoval = true;
            }
        }, 100);
        this.splashSound();
    }

    /**
     * Plays the splash sound effect.
     */
    splashSound(){
        AudioHub.BOTTLE_SPLASH.volume = 0.15;
        AudioHub.BOTTLE_SPLASH.currentTime = 0;
        AudioHub.BOTTLE_SPLASH.play();
    }
}