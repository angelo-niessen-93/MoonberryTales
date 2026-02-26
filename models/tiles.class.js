class Tiles extends MovableObject {
    static DEFAULT_SIZE = {
        width: 64,
        height: 64,
    };

    static DEFAULT_HITBOX = {
        x: 2,
        y: 50,
        width: 60,
        height: 10,
    };

    static LAYOUT = [];

    constructor(imagePath, x = 0, y = 350, width = Tiles.DEFAULT_SIZE.width, height = Tiles.DEFAULT_SIZE.height, hitbox = Tiles.DEFAULT_HITBOX) {
        super();
        this.loadImage(imagePath);
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hitbox = { ...hitbox };
    }

    getHitbox() {
        return {
            x: this.x + this.hitbox.x,
            y: this.y + this.hitbox.y,
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
    }

    static createFromLayout(layout = Tiles.LAYOUT, minX = -Infinity, maxX = Infinity) {
        return layout
            .filter((entry) => {
                const width = entry.width ?? Tiles.DEFAULT_SIZE.width;
                return entry.x + width >= minX && entry.x <= maxX;
            })
            .map((entry) => {
                return new Tiles(
                    entry.image,
                    entry.x,
                    entry.y,
                    entry.width ?? Tiles.DEFAULT_SIZE.width,
                    entry.height ?? Tiles.DEFAULT_SIZE.height,
                    entry.hitbox ?? Tiles.DEFAULT_HITBOX,
                );
            });
    }

    static createRepeatedGroup(groupImages, startX, y, count = 1, gap = 0) {
        const tiles = [];
        const tileWidth = Tiles.DEFAULT_SIZE.width;

        for (let i = 0; i < count; i++) {
            const baseX = startX + i * (groupImages.length * tileWidth + gap);
            groupImages.forEach((image, index) => {
                tiles.push({
                    image,
                    x: baseX + index * tileWidth,
                    y,
                });
            });
        }

        return tiles;
    }

    static createPlatform(startX = 600, y = 350, options = {}) {
        const platformImages = options.platformImages ?? [
            'img/dark_tiles/dark_tile26.png',
            'img/dark_tiles/dark_tile27.png',
            'img/dark_tiles/dark_tile28.png',
        ];

        return platformImages.map((imagePath, index) => {
            return new Tiles(
                imagePath,
                startX + index * Tiles.DEFAULT_SIZE.width,
                y,
                options.tileWidth ?? Tiles.DEFAULT_SIZE.width,
                options.tileHeight ?? Tiles.DEFAULT_SIZE.height,
                options.tileHitbox ?? Tiles.DEFAULT_HITBOX,
            );
        });
    }

    static createPlatformsForArea(minX, maxX, gapX = 320, heights = [170, 230, 290, 350], options = {}) {
        const layout = options.layout ?? Tiles.LAYOUT;
        if (Array.isArray(layout) && layout.length) {
            return Tiles.createFromLayout(layout, minX, maxX);
        }
        const platforms = [];
        for (let x = minX; x <= maxX; x += gapX) {
            const y = heights[Math.floor((x - minX) / gapX) % heights.length];
            platforms.push(...Tiles.createPlatform(x, y, options));
        }
        return platforms;
    }
}
