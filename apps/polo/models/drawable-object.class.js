/**
 * DrawableObject: Base class for all drawable objects in the game.
 * Handles image loading, fallback image, and drawing on the canvas.
 */
class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    height = 150;
    width = 100;
    x = 120;
    y = 250;
    debugMode = true;
    fallbackCreated = false;

    /**
     * Loads a single image and sets it as the object's image.
     * @param {string} path - The path to the image file.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Loads multiple images and stores them in the image cache.
     * @param {string[]} arr - Array of image paths to load.
     */
    loadImages(arr) {
        arr.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * Ensures a fallback image is set if no image is loaded.
     */
    ensureFallback() {
        if (this.img || this.fallbackCreated) return;
        const c = document.createElement('canvas');
        c.width = c.height = 2;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0,0,2,2);
        this.img = c;
        this.fallbackCreated = true;
    }

    /**
     * Draws the object's image on the canvas at its current position and size.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        this.ensureFallback();
        if (!this.img) return;
        if (this.img instanceof HTMLImageElement && !this.img.complete) return;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Draws a blue rectangle frame around the object for debugging purposes.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    drawFrame(ctx) {
        if (!this.debugMode) return;
        if (this instanceof Character || this instanceof Chicken || this instanceof ChickenEndboss || this instanceof ThrowableObject) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'blue';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }
}