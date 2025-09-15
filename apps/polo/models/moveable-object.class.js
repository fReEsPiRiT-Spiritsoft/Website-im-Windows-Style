/**
 * MoveableObject: Base class for all moveable objects in the game.
 * Handles movement, gravity, collision, hitbox, and animation logic.
 */
class MoveableObject extends DrawableObject {
    speed = 0.2;
    otherDirection = false;
    speedY = 0;
    acceleration = 1;
    energy = 100;
    lastHit = 0;
    groundContact = false;

    /**
     * Applies gravity to the object, updating its vertical position and speed.
     */
    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    /**
     * Checks if the object is above the ground.
     * @returns {boolean}
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            if (this.y >= 385) {
                this.groundContact = true;
            } else {
                this.groundContact = false;
            }
            return this.y < 390;
        } else {
            return this.y < 150;
        }
    }

    /**
     * Returns the hitbox of the object, considering custom hitbox settings.
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getHitBox() {
        let x = this.x;
        let y = this.y;
        let w = this.width;
        let h = this.height;
        if (this.hitbox) {
            if (this.hitbox.width) w = this.hitbox.width;
            if (this.hitbox.height) h = this.hitbox.height;
            if (this.hitbox.offsetX) x += this.hitbox.offsetX;
            if (this.hitbox.offsetY) y += this.hitbox.offsetY;
        }
        return { x, y, width: w, height: h };
    }

     /**
     * Checks if this object is colliding with another moveable object.
     * @param {MoveableObject} mo - The other moveable object.
     * @returns {boolean}
     */
    isColliding(mo) {
        const a = this.getHitBox();
        const b = (mo.getHitBox) ? mo.getHitBox() : {
            x: mo.x, y: mo.y, width: mo.width, height: mo.height
        };
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    /**
     * Draws the hitbox of the object for debugging purposes.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {string} [color='rgba(255,0,0,0.4)'] - The color to fill the hitbox.
     */
    drawHitBox(ctx, color = 'rgba(255,0,0,0.4)') {
        if (!ctx) return;
        const hb = this.getHitBox();
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
        ctx.restore();
    }

    /**
     * Handles the death of the object, sets energy to 0, plays death animation, and marks for removal.
     */
    death() {
        this.energy = 0;
        if (this.IMAGES_DEAD) {
            this.playAnimation(this.IMAGES_DEAD);
        }
        this.markedForRemoval = true;
    }

    /**
     * Checks if the object is dead (energy is 0).
     * @returns {boolean}
     */
    isDead() {
        return this.energy == 0;
    }

    /**
     * Reduces the object's energy and updates the last hit timestamp.
     */
    hit() {
        this.energy -= 5;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    /**
     * Checks if the object is currently hurt (recently hit).
     * @returns {boolean}
     */
    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 0.5;
    }

    /**
     * Moves the object to the right by its speed.
     */
    moveRight() {
        this.x += this.speed;

    }

    /**
     * Moves the object to the left by its speed.
     */
    moveLeft() {
        this.x -= this.speed;

    }

    /**
     * Makes the object jump by setting its vertical speed.
     * @param {number} j - The jump strength.
     */
    jump(j) {
        this.speedY = j;
    }

    /**
     * Plays an animation by cycling through the given images.
     * @param {string[]} images - Array of image paths for the animation.
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }
}