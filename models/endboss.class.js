class Endboss extends MovableObject {
    static LEVEL_END_X = 720 * 5;
    static SPAWN_MIN_X = Endboss.LEVEL_END_X - 900;
    static SPAWN_MAX_X = Endboss.LEVEL_END_X - 300;

    height = 400;
    width = 250;
    y = 110;         
    speed = 1.2;
    IMAGES_WALKING = [
            '../img/Boss2/Walk1.png',
            '../img/Boss2/Walk2.png',
            '../img/Boss2/Walk3.png',
            '../img/Boss2/Walk4.png',
            '../img/Boss2/Walk5.png',
            '../img/Boss2/Walk6.png',
    ];

    constructor(x = null) {
        super();
        this.x = x ?? this.getSpawnX();
        this.patrolMinX = Math.max(Endboss.SPAWN_MIN_X, this.x - 160);
        this.patrolMaxX = Math.min(Endboss.SPAWN_MAX_X, this.x + 160);
        this.movingLeft = true;
        this.othersDirection = true;
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.animate();
    }

    getSpawnX() {
        return Endboss.SPAWN_MIN_X + Math.random() * (Endboss.SPAWN_MAX_X - Endboss.SPAWN_MIN_X);
    }

    animate() {
        setInterval(() => {
            if (this.movingLeft) {
                this.x -= this.speed;
                this.othersDirection = true;
                if (this.x <= this.patrolMinX) {
                    this.x = this.patrolMinX;
                    this.movingLeft = false;
                }
            } else {
                this.x += this.speed;
                this.othersDirection = false;
                if (this.x >= this.patrolMaxX) {
                    this.x = this.patrolMaxX;
                    this.movingLeft = true;
                }
            }
        }, 1000 / 60);

        setInterval(() => {
            const i = this.currentImage % this.IMAGES_WALKING.length;
            const path = this.IMAGES_WALKING[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        }, 120);
    }
}
