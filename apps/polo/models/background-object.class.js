/**
 * @class BackgroundObject
 * @classdesc Represents a background image object with parallax effect for the game world.
 * Inherits from MoveableObject.
 */
class BackgroundObject extends MoveableObject {
    width = 720;
    height = 480;
    parallax = 1;

    /**
     * Creates a new BackgroundObject.
     * @param {string} imagePath - Path to the background image.
     * @param {number} x - X position of the background object.
     * @param {number} [parallax=1] - Parallax factor for this object.
     */
    constructor(imagePath, x, parallax = 1) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
        this.parallax = parallax;
    }

    /**
     * Draws the background object on the canvas context, applying parallax effect.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} [camera_x=0] - The camera's x offset (negative value).
     */
    draw(ctx, camera_x = 0) {
        const drawX = this.x + camera_x * this.parallax;
        ctx.drawImage(this.img, drawX, this.y, this.width, this.height);
    }
}