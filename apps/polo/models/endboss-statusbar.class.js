/**
 * EndbossStatusBar: Displays the endboss health status bar in the game UI.
 * Inherits from DrawableObject.
 */
class EndbossStatusBar extends DrawableObject {
    percentage = 100;

    /**
     * Array of image paths for different endboss health levels.
     * @type {string[]}
     */
    IMAGES_HEALTH = [
        'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
        'img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
    ];

    /**
     * Constructor for EndbossStatusBar. Initializes images and sets default values.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_HEALTH);
        this.setPercentage(100);
        this.width = 180;
        this.height = 40;
    }

    /**
     * Sets the percentage value for the endboss health bar and updates the displayed image.
     * @param {number} percentage - The percentage of endboss health (0-100).
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES_HEALTH[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Resolves the image index based on the current percentage.
     * @returns {number} The index of the image to display.
     */
    resolveImageIndex() {
        if (this.percentage == 100) return 5;
        else if (this.percentage > 80) return 4;
        else if (this.percentage > 60) return 3;
        else if (this.percentage > 40) return 2;
        else if (this.percentage > 20) return 1;
        else return 0;
    }
}