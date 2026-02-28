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

    constructor(type = 'heart', x = 0, y = 0, options = {}) {
        const heartImages = options.heartImages ?? Items.HEART_IMAGES;
        const coinImages = options.coinImages ?? Items.COIN_IMAGES;
        const imageSet = type === 'coin' ? coinImages : heartImages;
        super().loadImage(imageSet[0]);
        this.loadImages(imageSet);
        this.imageSet = imageSet;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = options.width ?? 36;
        this.height = options.height ?? 36;

        this.animate(options.animationSpeedMs ?? 120);
    }

    animate(speedMs = 120) {
        setInterval(() => {
            if (window.__moonberryPaused) {
                return;
            }
            this.playAnimation(this.imageSet);
        }, speedMs);
    }

    static createHeartsForPlatforms(tiles = [], options = {}) {
        const hearts = [];
        const placeEveryNthTile = options.placeEveryNthTile ?? 3;

        for (let i = 0; i < tiles.length; i += placeEveryNthTile) {
            const middleTile = tiles[i + 1] || tiles[i];
            if (!middleTile) {
                continue;
            }

            const itemWidth = options.width ?? 36;
            const itemHeight = options.height ?? 36;
            const x = middleTile.x + (middleTile.width - itemWidth) / 2;
            const y = middleTile.y - itemHeight;
            hearts.push(new Items('heart', x, y, options));
        }

        return hearts;
    }

    static isInHeartZone(x, y, hearts = [], minDistance = 90) {
        return hearts.some(heart => {
            const dx = Math.abs(x - heart.x);
            const dy = Math.abs(y - heart.y);
            return dx < minDistance && dy < minDistance;
        });
    }

    static createCoinsForArea(minX, maxX, hearts = [], count = 28, options = {}) {
        const coins = [];
        let attempts = 0;
        const maxAttempts = count * 20;
        const coinMinY = options.coinMinY ?? 70;
        const coinMaxY = options.coinMaxY ?? 390;
        const heartZoneDistance = options.heartZoneDistance ?? 90;

        while (coins.length < count && attempts < maxAttempts) {
            attempts++;

            const x = minX + Math.random() * (maxX - minX);
            const y = coinMinY + Math.random() * (coinMaxY - coinMinY);

            if (Items.isInHeartZone(x, y, hearts, heartZoneDistance)) {
                continue;
            }

            coins.push(new Items('coin', x, y, options));
        }

        return coins;
    }

    static createForLevel(tiles = [], minX = -720, maxX = 720 * 5, coinCount = 28, options = {}) {
        const hearts = Items.createHeartsForPlatforms(tiles, options);
        const coins = Items.createCoinsForArea(minX, maxX, hearts, coinCount, options);
        return [...hearts, ...coins];
    }
}
