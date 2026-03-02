/**
 * @file models/myst.class.js
 */
/**
 * Bewegte Nebel-Ebene im Hintergrund.
 */
class Myst extends MovableObject {
    static MIN_X = -720;
    static MAX_X = 720 * 5;

    /**
     * @param {number} [x=0] Startposition auf der X-Achse.
     * @param {{
     *   imagePath?: string,
     *   y?: number,
     *   width?: number,
     *   height?: number,
     *   speed?: number,
     *   minLoopX?: number,
     *   maxLoopX?: number
     * }} [options={}] Konfigurationsoptionen.
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
     * Erstellt Nebelobjekte Ã¼ber einen horizontalen Bereich.
     *
     * @param {number} [minX=-720] Linke Grenze.
     * @param {number} [maxX=720 * 5] Rechte Grenze.
     * @param {number} [step=720] Abstand zwischen Nebelobjekten.
     * @param {object} [options={}] Konfigurationsoptionen.
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
     * Startet die Nebelbewegung.
     *
     * @returns {void}
     */
    animate() {
        this.moveLeft();
    }

    /**
     * Verschiebt den Nebel kontinuierlich nach links und loope ihn am Rand.
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



