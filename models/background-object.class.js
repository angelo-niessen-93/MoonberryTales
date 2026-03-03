/**
 * @file models/background-object.class.js
 */
/**
 * Represents a static background element.
 */
class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    /**
     * @param {string} imagePath Path to the background image.
     * @param {number} x X position.
     * @param {number} y Y position.
     * @param {{width?: number, height?: number}} [config={}] Optional size adjustment.
     */
    constructor(imagePath, x, y, config = {}) {
        super().loadImage(imagePath);
        this.y = y;
        this.x = x;
        this.width = config.width ?? this.width;
        this.height = config.height ?? this.height;
    }

    static LAYER_PATHS = [
        'img/Background/back_ruin_spots.png',
        'img/Background/ruins_closer.png',
        'img/Background/ruins_low1.png',
        'img/Background/ruins_main.png',
        'img/Background/chains.png',
        'img/Background/floor_ruins.png',
    ];

    /**
     * Creates background objects for a full level area.
     *
     * @param {number} [minX=-720] Left boundary.
     * @param {number} [maxX=720 * 5] Right boundary.
     * @param {number} [step=720] Spacing between segments.
     * @param {number} [y=0] Shared Y position.
     * @param {{layerPaths?: string[], width?: number, height?: number}} [options={}] Creation options.
     * @returns {BackgroundObject[]}
     */
    static createForArea(minX = -720, maxX = 720 * 5, step = 720, y = 0, options = {}) {
        const objects = [];
        const layerPaths = options.layerPaths ?? BackgroundObject.LAYER_PATHS;

        for (let x = minX; x <= maxX; x += step) {
            layerPaths.forEach((path) => {
                objects.push(new BackgroundObject(path, x, y, options));
            });
        }

        return objects;
    }
}





