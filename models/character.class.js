class Character extends MovableObject {
    height = 200;
    width = 100;
    y = 260;
    speed = 4;
         



    IMAGES_WALKING = [
            '../img/Knight/Walk/walk1.png',
            '../img/Knight/Walk/walk2.png',
            '../img/Knight/Walk/walk3.png',
            '../img/Knight/Walk/walk4.png',
            '../img/Knight/Walk/walk5.png',
            '../img/Knight/Walk/walk6.png'
        ];

    IMAGES_JUMPING = [
        '../img/Knight/Jump_high/high_jump2.png',
        '../img/Knight/Jump_high/high_jump3.png',
        '../img/Knight/Jump_high/high_jump4.png',
        '../img/Knight/Jump_high/high_jump5.png',
        '../img/Knight/Jump_high/high_jump6.png',
        '../img/Knight/Jump_high/high_jump7.png'
    ];   

    world;    
    jumpSound = new Audio('audio/classic-jump.mp3');
    footstepSound = new Audio('audio/footstep.mp3');


    constructor() {
        super().loadImage('../img/Knight/Walk/walk1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.jumpSound.volume = 0.5;
        this.footstepSound.volume = 0.35;
        this.footstepSound.loop = true;
        this.applyGravity();
        this.animate();

    }

    animate() {
    
    setInterval(() => {
        if (this.world.keyboard.RIGHT && this.x < this.world.levelEndX) {
           this .x += this.speed;
           this.othersDirection = false;
        }
        if (this.world.keyboard.LEFT && this.x > 0) {
            this.x -= this.speed;
            this.othersDirection = true;
        }
        if(this.world.keyboard.UP && !this.isAboveGround()) {
            this.jump();
        }

        const isWalking = (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isAboveGround();
        if (isWalking) {
            this.playFootsteps();
        } else {
            this.stopFootsteps();
        }


        this.world.camera_x = -this.x + 100;
    },1000 / 60);



    setInterval(() => {

        if(this.isAboveGround()) {
            this.playAnimation(this.IMAGES_JUMPING);
        } else { 

        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
       this.playAnimation(this.IMAGES_WALKING);
        } else {
            this.img = this.imageCache[this.IMAGES_WALKING[0]];
            this.currentImage = 0;
        }
       }
    }, 100);
 }
    jump(){
        this.speedY = 20;
        this.stopFootsteps();
        this.jumpSound.currentTime = 0;
        this.jumpSound.play().catch(() => {});
    }

    playFootsteps() {
        if (!this.footstepSound.paused) {
            return;
        }
        this.footstepSound.play().catch(() => {});
    }

    stopFootsteps() {
        if (this.footstepSound.paused) {
            return;
        }
        this.footstepSound.pause();
        this.footstepSound.currentTime = 0;
    }
}
