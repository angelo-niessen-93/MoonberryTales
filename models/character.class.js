class Character extends MovableObject {
    height = 200;
    width = 100;
    y = 270;
    IMAGES_WALKING = [
            '../img/Knight/Walk/walk1.png',
            '../img/Knight/Walk/walk2.png',
            '../img/Knight/Walk/walk3.png',
            '../img/Knight/Walk/walk4.png',
            '../img/Knight/Walk/walk5.png',
            '../img/Knight/Walk/walk6.png'
        ];
        


    constructor() {
        super().loadImage('../img/Knight/Walk/walk1.png');
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
    jump(){

    }
}
