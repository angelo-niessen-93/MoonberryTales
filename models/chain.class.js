class Chain extends MovableObject {
    static MIN_X = -720;
    static MAX_X = 720 * 5;

    constructor(x = 0) {
        super().loadImage('img/Background/myst.png');

        this.x = x;
        this.y = 20;
        this.width = 720;
        this.height = 480;
        this.speed = 0.35;

        this.animate();
    }

    static createForArea(minX = -720, maxX = 720 * 5, step = 720) {
        const objects = [];

        for (let x = minX; x <= maxX; x += step) {
            objects.push(new Chain(x));
        }

        return objects;
    }

    animate() {
        this.moveLeft();
    }

    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;

            if (this.x <= Chain.MIN_X - this.width) {
                this.x = Chain.MAX_X;
            }
        }, 1000 / 60);
    }

}
