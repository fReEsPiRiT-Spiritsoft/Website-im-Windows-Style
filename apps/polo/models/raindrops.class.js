/**
 * Raindrop: Represents a single animated raindrop for the rain effect in the game.
 */
class Raindrop {

    /**
     * Creates a new Raindrop at the given position with random horizontal offset and speed.
     * @param {number} x - The initial x position of the raindrop.
     * @param {number} y - The initial y position of the raindrop.
     */
    constructor(x, y) {
        this.x = x + (Math.random() * 120 - 60);
        this.y = y + 40;
        this.speedY = 6 + Math.random() * 3;
        this.alpha = 0.9;
        this.width = 3;
        this.height = 12;
    }

    /**
     * Updates the position and transparency of the raindrop.
     * @returns {boolean} True if the raindrop is still active, false if it should be removed.
     */
    update() {
        this.y += this.speedY;
        this.alpha -= 0.01;
        return this.alpha > 0 && this.y < 480;
    }

    /**
     * Draws the raindrop on the canvas with a blue gradient and current transparency.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        g.addColorStop(0, '#7ec8ff');
        g.addColorStop(1, '#1d6fa8');
        ctx.fillStyle = g;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}