class Chain extends MovableObject {
    constructor() {
        super().loadImage('../img/Background/myst.png');

        this.x = 0;
        this.y = 20;
        this.width = 720;
        this.height = 480;
        this.speed = 0.35;

        this.animate();
    }

    animate() {
        this.moveLeft();
    }

}
