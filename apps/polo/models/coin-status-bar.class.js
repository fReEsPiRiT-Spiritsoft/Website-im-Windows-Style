/**
 * CoinStatusBar: Displays the coin status bar in the game UI, showing the number of collected coins.
 * Inherits from DrawableObject.
 */
class CoinStatusBar extends DrawableObject {

    percentage = 0;

    /**
     * Array of image paths for different coin status levels.
     * @type {string[]}
     */
    IMAGES = [
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
        'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
    ];

    /**
     * Constructor for CoinStatusBar. Initializes position, size, and loads images.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES)
        this.setPercentage(0);
        this.x = 50;
        this.y = 40;
        this.width = 150;
        this.height = 50
    }

    /**
     * Sets the percentage value for the coin status bar and updates the displayed image.
     * @param {number} percentage - The percentage of coins collected (0-100).
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()]
        this.img = this.imageCache[path];
    }

    /**
     * Resolves the image index based on the current percentage.
     * @returns {number} The index of the image to display.
     */
    resolveImageIndex() {
        if (this.percentage >= 100) return 5;
        if (this.percentage > 80) return 4;
        if (this.percentage > 60) return 3;
        if (this.percentage > 40) return 2;
        if (this.percentage > 20) return 1;
        return 0;
    }
}