class Tiles extends MovableObject {
    static PLATFORM_IMAGES = [
        '../img/dark_tiles/dark_tile26.png',
        '../img/dark_tiles/dark_tile27.png',
        '../img/dark_tiles/dark_tile28.png',
    ];
    
    // Hier passt du die Plattform-Hitbox an.
    // x/y sind Offsets relativ zum Tile-Bild, width/height ist die Hitbox-Groesse.
    static HITBOX = {
        x: 2,
        y: 50,
        width: 60,
        height: 10,
    };

    constructor(imagePath, x = 0, y = 350) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
    }

    getHitbox() {
        return {
            x: this.x + Tiles.HITBOX.x,
            y: this.y + Tiles.HITBOX.y,
            width: Tiles.HITBOX.width,
            height: Tiles.HITBOX.height,
        };
    }

    static createPlatform(startX = 600, y = 350) {
        const tileWidth = 64;
        return Tiles.PLATFORM_IMAGES.map((imagePath, index) => {
            return new Tiles(imagePath, startX + index * tileWidth, y);
        });
    }

    static createPlatformsForArea(minX, maxX, gapX = 320, heights = [170, 230, 290, 350]) {
        const platforms = [];

        for (let x = minX; x <= maxX; x += gapX) {
            const y = heights[Math.floor((x - minX) / gapX) % heights.length];
            platforms.push(...Tiles.createPlatform(x, y));
        }

        return platforms;
    }
}
