class Chain extends MovableObject {
        constructor() {
        super().loadImage('../img/Background/chains.png');
        this.x = Math.random() * 500;
        this.y = 20;
        this.width = 720;
        this.height = 480;
    }
}

