/**
 * @file models/myst.class.js
 */
/**
 * Represents an animated mist layer in the background.
 */
class Myst extends MovableObject {
    static MIN_X = -720;
    static MAX_X = 720 * 5;

    /**
     * @param {number} [x=0] Start position on the X axis.
     * @param {{
     *   imagePath?: string,
     *   y?: number,
     *   width?: number,
     *   height?: number,
     *   speed?: number,
     *   minLoopX?: number,
     *   maxLoopX?: number
     * }} [options={}] Configuration options.
     */
    constructor(x = 0, options = {}) {
        super().loadImage(options.imagePath ?? 'img/Background/myst.png');

        this.x = x;
        this.y = options.y ?? 20;
        this.width = options.width ?? 720;
        this.height = options.height ?? 480;
        this.speed = options.speed ?? 0.35;

        this.minLoopX = options.minLoopX ?? Myst.MIN_X;
        this.maxLoopX = options.maxLoopX ?? Myst.MAX_X;

        this.animate();
    }

    /**
     * Creates mist objects over a horizontal area.
     *
     * @param {number} [minX=-720] Left boundary.
     * @param {number} [maxX=720 * 5] Right boundary.
     * @param {number} [step=720] Spacing between mist objects.
     * @param {object} [options={}] Configuration options.
     * @returns {Myst[]}
     */
    static createForArea(minX = -720, maxX = 720 * 5, step = 720, options = {}) {
        const objects = [];

        for (let x = minX; x <= maxX; x += step) {
            objects.push(new Myst(x, options));
        }

        return objects;
    }

    /**
     * Starts mist movement.
     *
     * @returns {void}
     */
    animate() {
        this.moveLeft();
    }

    /**
     * Moves the mist continuously to the left and loops it at the edge.
     *
     * @returns {void}
     */
    moveLeft() {
        setInterval(() => {
            if (window.__moonberryPaused) {
                return;
            }
            this.x -= this.speed;

            if (this.x <= this.minLoopX - this.width) {
                this.x = this.maxLoopX;
            }
        }, 1000 / 60);
    }

}





