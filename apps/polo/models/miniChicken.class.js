/**
 * MiniChicken: Represents a small chicken enemy that moves left and can be killed.
 * Inherits from MoveableObject.
 */
class MiniChicken extends MoveableObject {

    y = 350;
    height = 50;
    width = 50;
    speed = 0.15 + Math.random() * 0.45;

    /**
     * Array of image paths for the walking animation.
     * @type {string[]}
     */
    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png',
    ];

    /**
     * Array of image paths for the dead animation.
     * @type {string[]}
     */
    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png',
        'img/3_enemies_chicken/chicken_small/2_dead/boom.png'
    ];

    /**
     * Constructor for MiniChicken.
     * Initializes position, size, speed, and loads images.
     */
    constructor() {
        super().loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png')
        this.x = 400 + Math.random() * (9200 - 400);
        this.y = 120 + Math.random() * (400 - 120);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
        this.speed;
        this.animate();
        this.animateWalk();
    }

    /**
     * animate: Moves the mini chicken left and plays the dead animation if energy is 0.
     */
    animate() {
        setInterval(() => {
            this.moveLeft();
            if (this.energy === 0) {
                this.playAnimation(this.IMAGES_DEAD);
            }
        }, 1000 / 60);

    }

    /**
     * animateWalk: Plays the walking animation for the mini chicken.
     */
    animateWalk() {
        this.walkInterval = setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 150);
    }

    /**
     * animateDeath: Stops the walking animation and plays the dead animation.
     */
    animateDeath() {
        clearInterval(this.walkInterval);
        this.playAnimation(this.IMAGES_DEAD);
        this.speed = 0;

    }
}