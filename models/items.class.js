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

    constructor(type = 'heart', x = 0, y = 0) {
        const imageSet = type === 'coin' ? Items.COIN_IMAGES : Items.HEART_IMAGES;
        super().loadImage(imageSet[0]);
        this.loadImages(imageSet);
        this.imageSet = imageSet;
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 36;

        this.animate();
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.imageSet);
        }, 120);
    }

    static createHeartsForPlatforms(tiles = []) {
        const hearts = [];

        for (let i = 0; i < tiles.length; i += 3) {
            const middleTile = tiles[i + 1] || tiles[i];
            if (!middleTile) {
                continue;
            }

            const x = middleTile.x + (middleTile.width - 36) / 2;
            const y = middleTile.y - 36;
            hearts.push(new Items('heart', x, y));
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

    static createCoinsForArea(minX, maxX, hearts = [], count = 28) {
        const coins = [];
        let attempts = 0;
        const maxAttempts = count * 20;

        while (coins.length < count && attempts < maxAttempts) {
            attempts++;

            const x = minX + Math.random() * (maxX - minX);
            const y = 70 + Math.random() * 320;

            if (Items.isInHeartZone(x, y, hearts)) {
                continue;
            }

            coins.push(new Items('coin', x, y));
        }

        return coins;
    }

    static createForLevel(tiles = [], minX = -720, maxX = 720 * 5, coinCount = 28) {
        const hearts = Items.createHeartsForPlatforms(tiles);
        const coins = Items.createCoinsForArea(minX, maxX, hearts, coinCount);
        return [...hearts, ...coins];
    }
}
