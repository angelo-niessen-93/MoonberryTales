class HUD {
    constructor() {
        this.health = 100;
        this.score = 0;
        this.loadImage('img/HUD/health.png');
        this.loadImages(HUD.HEALTH_IMAGES);
    }
}
