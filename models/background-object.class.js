class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    constructor(imagePath, x, y) {
        super().loadImage(imagePath); 
        this.y = y;
        this.x = x;
 }

    static LAYER_PATHS = [
        'img/Background/back_ruin_spots.png',
        'img/Background/ruins_closer.png',
        'img/Background/ruins_low1.png',
        'img/Background/ruins_main.png',
        'img/Background/chains.png',
        'img/Background/floor_ruins.png',
    ];

    static createForArea(minX = -720, maxX = 720 * 5, step = 720, y = 0) {
        const objects = [];

        for (let x = minX; x <= maxX; x += step) {
            BackgroundObject.LAYER_PATHS.forEach((path) => {
                objects.push(new BackgroundObject(path, x, y));
            });
        }

        return objects;
    }
} 
