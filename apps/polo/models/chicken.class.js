/**
 * Chicken: Represents a normal chicken enemy that moves left and can be killed.
 */
class Chicken extends MoveableObject {

    y = 350;
    height = 100;
    speed = 0.15 + Math.random() * (1.2 - 0.15);



    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'

    ];


    IMAGES_DEAD = [
        'img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
    ];

    constructor() {
        super().loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png')
        this.x = 400 + Math.random() * (6200 - 400);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
        this.speed;
        this.animate();
        this.animateWalk();
    }

     /**
     * animate: Moves the chicken left and plays the dead animation if energy is 0.
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
     * animateWalk: Plays the walking animation for the chicken.
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