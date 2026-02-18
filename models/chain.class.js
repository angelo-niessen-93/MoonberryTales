class Chain extends MovableObject {
    constructor() {
        super().loadImage('../img/Background/myst.png');

        this.x = 0;
        this.y = 20;
        this.width = 720;
        this.height = 480;
        this.speed = 0.15;

        this.animate();
    }

    animate() {
        setInterval(() => {
            this.x -= this.speed;

            if (this.x <= -this.width) {
                this.x = 0;
            }
        }, 1000 / 60);
    }
}
