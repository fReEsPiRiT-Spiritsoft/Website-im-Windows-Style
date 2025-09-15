/**
 * @class BottleStatusBar
 * @classdesc Displays the bottle status bar in the game UI, showing the number of collected bottles.
 * Inherits from DrawableObject.
 */
class BottleStatusBar extends DrawableObject {

    /**
     * @type {string[]}
     * Array of image paths for different bottle status levels.
     */
    IMAGES = [
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png',
        'img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png'
    ];

    /**
     * Creates a new BottleStatusBar and initializes its position and images.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.setPercentage(0);
        this.x = 50;
        this.y = 80;
        this.width = 150;
        this.height = 50;
    }

    /**
     * Sets the percentage value for the bottle status bar and updates the displayed image.
     * @param {number} percentage - The percentage of bottles collected (0-100).
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Resolves the image index based on the current percentage.
     * @returns {number} The index of the image to display.
     */
    resolveImageIndex() {
        if (this.percentage <= 0) return 0;
        if (this.percentage > 0 && this.percentage <= 20) return 1;
        if (this.percentage > 20 && this.percentage <= 40) return 2;
        if (this.percentage > 40 && this.percentage <= 60) return 3;
        if (this.percentage > 60 && this.percentage <= 80) return 4;
        if (this.percentage > 80) return 5;
    }

    /**
     * Draws the bottle status bar and, if at least one bottle is collected,
     * displays the number of collected bottles in red text on top of the bar.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} [collectedBottles=0] - The current number of collected bottles.
     */
    draw(ctx, collectedBottles = 0) {
        super.draw(ctx); 
        if (collectedBottles > 0) {
            ctx.save();
            ctx.font = "bold 15px Rye";
            ctx.fillStyle = "bc8352";
            ctx.textAlign = "center";
            ctx.fillText(
                collectedBottles,
                this.x + this.width / 2,
                this.y + this.height / 1.3
            );
            ctx.restore();
        }
    }
}