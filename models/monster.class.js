class Monster extends MovableObject {
    y = 320;
    IMAGES_WALKING = [
        '../img/Skeleton/skeleton04_walk1.png',
        '../img/Skeleton/skeleton05_walk2.png',
        '../img/Skeleton/skeleton06_walk3.png',
        '../img/Skeleton/skeleton07_walk4.png',
        '../img/Skeleton/skeleton08_walk5.png',
        '../img/Skeleton/skeleton09_walk6.png',
    ];

    constructor() {
        super().loadImage('../img/Skeleton/skeleton04_walk1.png');

        this.x = 200 + Math.random() * 500;
        this.loadImages(this.IMAGES_WALKING);
        this.animate();
    }

    animate() {
        setInterval(() => {
            let i = this.currentImage % this.IMAGES_WALKING.length;
            let path = this.IMAGES_WALKING[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        }, 100);
    }
}
