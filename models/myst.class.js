class Myst extends MovableObject {
    static MIN_X = -720;
    static MAX_X = 720 * 5;

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

    static createForArea(minX = -720, maxX = 720 * 5, step = 720, options = {}) {
        const objects = [];

        for (let x = minX; x <= maxX; x += step) {
            objects.push(new Myst(x, options));
        }

        return objects;
    }

    animate() {
        this.moveLeft();
    }

    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;

            if (this.x <= this.minLoopX - this.width) {
                this.x = this.maxLoopX;
            }
        }, 1000 / 60);
    }

}
