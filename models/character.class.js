class Character extends MovableObject {
    height = 200;
    width = 100;
    y = 270;
    speed = 4;
    IMAGES_WALKING = [
            '../img/Knight/Walk/walk1.png',
            '../img/Knight/Walk/walk2.png',
            '../img/Knight/Walk/walk3.png',
            '../img/Knight/Walk/walk4.png',
            '../img/Knight/Walk/walk5.png',
            '../img/Knight/Walk/walk6.png'
        ];
    world;    


    constructor() {
        super().loadImage('../img/Knight/Walk/walk1.png');
        this.loadImages(this.IMAGES_WALKING);

        this.animate();

    }

    animate() {
    
    setInterval(() => {
        if (this.world.keyboard.RIGHT) {
           this .x += this.speed;
        }
        if (this.world.keyboard.LEFT) {
            this.x -= this.speed;
        }

    },1000 / 60);



    setInterval(() => {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            
        
       let i = this.currentImage % this.IMAGES_WALKING.length;
       let path = this.IMAGES_WALKING[i];
       this.img = this.imageCache[path];
       this.currentImage++;
       }
    }, 100);
 }
    jump(){

    }
}
