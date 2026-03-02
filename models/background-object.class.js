/**
 * @file models/background-object.class.js
 */
/**
 * ReprÃ¤sentiert ein statisches Hintergrundelement.
 */
class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    /**
     * @param {string} imagePath Pfad zum Hintergrundbild.
     * @param {number} x X-Position.
     * @param {number} y Y-Position.
     * @param {{width?: number, height?: number}} [config={}] Optionale GrÃ¶ÃŸenanpassung.
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
     * Erstellt Hintergrundobjekte fÃ¼r einen kompletten Levelbereich.
     *
     * @param {number} [minX=-720] Linke Grenze.
     * @param {number} [maxX=720 * 5] Rechte Grenze.
     * @param {number} [step=720] Abstand zwischen Segmenten.
     * @param {number} [y=0] Gemeinsame Y-Position.
     * @param {{layerPaths?: string[], width?: number, height?: number}} [options={}] Erstellungsoptionen.
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



