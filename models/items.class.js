/**
 * @file models/items.class.js
 */
/**
 * Represents collectible items such as hearts and coins.
 */
class Items extends MovableObject {
    static HEART_IMAGES = [
        'img/Items/heart1.png',
        'img/Items/heart2.png',
        'img/Items/heart3.png',
        'img/Items/heart4.png',
        'img/Items/heart5.png',
        'img/Items/heart6.png',
        'img/Items/heart7.png',
        'img/Items/heart8.png',
        'img/Items/heart9.png',
        'img/Items/heart10.png',
    ];

    static COIN_IMAGES = [
        'img/Items/coin1.png',
        'img/Items/coin2.png',
        'img/Items/coin3.png',
        'img/Items/coin4.png',
        'img/Items/coin5.png',
        'img/Items/coin6.png',
        'img/Items/coin7.png',
        'img/Items/coin8.png',
        'img/Items/coin9.png',
        'img/Items/coin10.png',
    ];

    /**
     * @param {"heart"|"coin"} [type="heart"] Item type.
     * @param {number} [x=0] X position.
     * @param {number} [y=0] Y position.
     * @param {object} [options={}] Additional item options.
     */
    constructor(type = 'heart', x = 0, y = 0, options = {}) {
        const imageSet = Items.getImageSet(type, options);
        super().loadImage(imageSet[0]);
        this.initializeItemState(type, x, y, imageSet, options);
        this.animate(options.animationSpeedMs ?? 120);
    }

    /**
     * Runs getImageSet.
     * @param {*} type
     * @param {*} options
     */
    static getImageSet(type, options = {}) {
        const heartImages = options.heartImages ?? Items.HEART_IMAGES;
        const coinImages = options.coinImages ?? Items.COIN_IMAGES;
        return type === 'coin' ? coinImages : heartImages;
    }

    /**
     * Runs initializeItemState.
     * @param {*} type
     * @param {*} x
     * @param {*} y
     * @param {*} imageSet
     * @param {*} options
     */
    initializeItemState(type, x, y, imageSet, options) {
        this.loadImages(imageSet);
        this.imageSet = imageSet;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = options.width ?? 36;
        this.height = options.height ?? 36;
    }

    /**
     * Starts cyclic item animation.
     *
     * @param {number} [speedMs=120] Interval in milliseconds.
     * @returns {void}
     */
    animate(speedMs = 120) {
        setInterval(() => {
            if (window.__moonberryPaused) {
                return;
            }
            this.playAnimation(this.imageSet);
        }, speedMs);
    }

    /**
     * Creates hearts above selected platforms.
     *
     * @param {Tiles[]} [tiles=[]] Platform tiles.
     * @param {object} [options={}] Placement options.
     * @returns {Items[]}
     */
    static createHeartsForPlatforms(tiles = [], options = {}) {
        const hearts = [];
        const cfg = Items.getHeartPlacementConfig(options);
        const itemSize = Items.getItemSize(options);
        const step = cfg.placeEveryNthTile;
        for (let i = 0; i < tiles.length; i += step) {
            const middleTile = tiles[i + 1] || tiles[i];
            if (!middleTile) continue;
            const pos = Items.getHeartPosition(middleTile, itemSize, cfg);
            hearts.push(new Items('heart', pos.x, pos.y, options));
        }
        return hearts;
    }

    /**
     * Runs getHeartPlacementConfig.
     * @param {*} options
     */
    static getHeartPlacementConfig(options = {}) {
        return {
            placeEveryNthTile: options.placeEveryNthTile ?? 3,
            heartYOffset: options.heartYOffset ?? 0,
            lowPlatformYThreshold: options.lowPlatformYThreshold ?? 320,
            lowPlatformHeartLift: options.lowPlatformHeartLift ?? 0,
        };
    }

    /**
     * Runs getItemSize.
     * @param {*} options
     */
    static getItemSize(options = {}) {
        return { width: options.width ?? 36, height: options.height ?? 36 };
    }

    /**
     * Runs getHeartPosition.
     * @param {*} tile
     * @param {*} itemSize
     * @param {*} cfg
     */
    static getHeartPosition(tile, itemSize, cfg) {
        const x = tile.x + (tile.width - itemSize.width) / 2;
        const extraLift = tile.y >= cfg.lowPlatformYThreshold ? cfg.lowPlatformHeartLift : 0;
        const y = tile.y - itemSize.height - cfg.heartYOffset - extraLift;
        return { x, y };
    }

    /**
     * Checks whether a position is near existing hearts.
     *
     * @param {number} x X position.
     * @param {number} y Y position.
     * @param {Items[]} [hearts=[]] Reference hearts.
     * @param {number} [minDistance=90] Minimum distance.
     * @returns {boolean}
     */
    static isInHeartZone(x, y, hearts = [], minDistance = 90) {
        return hearts.some(heart => {
            const dx = Math.abs(x - heart.x);
            const dy = Math.abs(y - heart.y);
            return dx < minDistance && dy < minDistance;
        });
    }

    /**
     * Creates random coins in an area.
     *
     * @param {number} minX Left area boundary.
     * @param {number} maxX Right area boundary.
     * @param {Items[]} [hearts=[]] Already placed hearts.
     * @param {number} [count=28] Number of coins.
     * @param {object} [options={}] Placement options.
     * @returns {Items[]}
     */
    static createCoinsForArea(minX, maxX, hearts = [], count = 28, options = {}) {
        const coins = [];
        let attempts = 0;
        const maxAttempts = count * 20;
        const cfg = Items.getCoinPlacementConfig(options);
        while (coins.length < count && attempts < maxAttempts) {
            attempts++;
            const pos = Items.getRandomCoinPosition(minX, maxX, cfg);
            if (Items.isInHeartZone(pos.x, pos.y, hearts, cfg.heartZoneDistance)) continue;
            coins.push(new Items('coin', pos.x, pos.y, options));
        }
        return coins;
    }

    /**
     * Runs getCoinPlacementConfig.
     * @param {*} options
     */
    static getCoinPlacementConfig(options = {}) {
        return {
            coinMinY: options.coinMinY ?? 70,
            coinMaxY: options.coinMaxY ?? 390,
            heartZoneDistance: options.heartZoneDistance ?? 90,
        };
    }

    /**
     * Runs getRandomCoinPosition.
     * @param {*} minX
     * @param {*} maxX
     * @param {*} cfg
     */
    static getRandomCoinPosition(minX, maxX, cfg) {
        const x = minX + Math.random() * (maxX - minX);
        const y = cfg.coinMinY + Math.random() * (cfg.coinMaxY - cfg.coinMinY);
        return { x, y };
    }

    /**
     * Creates all collectible items for a level.
     *
     * @param {Tiles[]} [tiles=[]] Platform tiles.
     * @param {number} [minX=-720] Left area boundary.
     * @param {number} [maxX=720 * 5] Right area boundary.
     * @param {number} [coinCount=28] Number of coins.
     * @param {object} [options={}] Placement options.
     * @returns {Items[]}
     */
    static createForLevel(tiles = [], minX = -720, maxX = 720 * 5, coinCount = 28, options = {}) {
        const range = Items.getItemSpawnRange(minX, maxX, options);
        const spawnTiles = Items.getTilesInSpawnRange(tiles, range.minX);
        const hearts = Items.createHeartsForPlatforms(spawnTiles, options);
        const coins = Items.createCoinsForArea(range.minX, range.maxX, hearts, coinCount, options);
        return [...hearts, ...coins];
    }

    /**
     * Runs getItemSpawnRange.
     * @param {*} minX
     * @param {*} maxX
     * @param {*} options
     */
    static getItemSpawnRange(minX, maxX, options = {}) {
        const characterStartX = options.characterStartX ?? minX;
        const itemMinX = options.itemMinX ?? minX;
        const itemMaxX = options.itemMaxX ?? maxX;
        const spawnMinX = Math.max(minX, characterStartX, itemMinX);
        const spawnMaxX = Math.min(maxX, itemMaxX);
        return { minX: spawnMinX, maxX: Math.max(spawnMinX, spawnMaxX) };
    }

    /**
     * Runs getTilesInSpawnRange.
     * @param {*} tiles
     * @param {*} minX
     */
    static getTilesInSpawnRange(tiles, minX) {
        return tiles.filter((tile) => tile.x + tile.width >= minX);
    }
}





