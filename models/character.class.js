class Character extends MovableObject {
    height = 200;
    width = 100;
    y = 230;
    speed = 4;
         



    IMAGES_WALKING = [
            'img/Knight/Walk/walk1.png',
            'img/Knight/Walk/walk2.png',
            'img/Knight/Walk/walk3.png',
            'img/Knight/Walk/walk4.png',
            'img/Knight/Walk/walk5.png',
            'img/Knight/Walk/walk6.png'
        ];

    IMAGES_JUMPING = [
        'img/Knight/Jump_high/high_jump2.png',
        'img/Knight/Jump_high/high_jump3.png',
        'img/Knight/Jump_high/high_jump4.png',
        'img/Knight/Jump_high/high_jump5.png',
        'img/Knight/Jump_high/high_jump6.png',
        'img/Knight/Jump_high/high_jump7.png'
    ];   

    IMAGES_ATTACKING = [
        'img/Knight/Extra_Attack/attack_extra1.png',
        'img/Knight/Extra_Attack/attack_extra2.png',
        'img/Knight/Extra_Attack/attack_extra3.png',
        'img/Knight/Extra_Attack/attack_extra4.png',
        'img/Knight/Extra_Attack/attack_extra5.png',
        'img/Knight/Extra_Attack/attack_extra6.png',  
        'img/Knight/Extra_Attack/attack_extra7.png',  
        'img/Knight/Extra_Attack/attack_extra8.png',  
    ];

    IMAGES_DEAD = [
        'img/Knight/Dead/knight_death1.png',
        'img/Knight/Dead/knight_death2.png',
        'img/Knight/Dead/knight_death3.png',
        'img/Knight/Dead/knight_death4.png',
        'img/Knight/Dead/knight_death5.png',
        'img/Knight/Dead/knight_death6.png',
        'img/Knight/Dead/knight_death7.png',
        'img/Knight/Dead/knight_death8.png',
        'img/Knight/Dead/knight_death9.png',
        'img/Knight/Dead/knight_death10.png',
    ];

    world;   
    attacksound = new Audio('audio/fight.mp3') 
    jumpSound = new Audio('audio/classic-jump.mp3');
    footstepSound = new Audio('audio/footstep.mp3');
    lastHitAt = 0;
    attackDamage = 25;
    isAttacking = false;
    attackFrame = 0;
    lastSpacePressed = false;
    groundY = 260;


    constructor() {
        super().loadImage('img/Knight/Walk/walk1.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_ATTACKING);
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
        if (this.world.keyboard.SPACE && !this.lastSpacePressed) {
            this.startAttack();
        }
        this.lastSpacePressed = this.world.keyboard.SPACE;

        const isWalking = (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isAboveGround();
        if (isWalking && !this.isAttacking) {
            this.playFootsteps();
        } else {
            this.stopFootsteps();
        }


        this.world.camera_x = -this.x + 100;
    },1000 / 60);



    setInterval(() => {
        if (this.isAttacking) {
            this.playAttackAnimation();
            return;
        }

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

    isAboveGround() {
        return this.y < this.groundY;
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

    startAttack() {
        this.isAttacking = true;
        this.attackFrame = 0;
        this.stopFootsteps();
        this.attacksound.currentTime = 0;
        this.attacksound.play().catch(() => {});
    }

    playAttackAnimation() {
        const path = this.IMAGES_ATTACKING[this.attackFrame];
        this.img = this.imageCache[path];
        this.attackFrame++;

        if (this.attackFrame >= this.IMAGES_ATTACKING.length) {
            this.isAttacking = false;
            this.attackFrame = 0;
        }
    }

    takeHit(fromEnemyX, damage = 10) {
        const now = Date.now();
        if (now - this.lastHitAt < 500) {
            return false;
        }

        this.lastHitAt = now;
        this.takeDamage(damage);
        this.stopFootsteps();

        const knockback = fromEnemyX >= this.x ? -40 : 40;
        this.x += knockback;

        if (this.world) {
            this.x = Math.max(0, Math.min(this.x, this.world.levelEndX));
        }

        if (!this.isAboveGround()) {
            this.speedY = 8;
        }

        return true;
    }
}
