class Character extends MovableObject {
   
    height = 200;
    width = 100;
    y = 230;
    speed = 4;
    groundY = 260;

   
    IMAGES_IDLE = [];
    IMAGES_WALKING = [];
    IMAGES_JUMPING = [];
    IMAGES_ATTACKING = [];
    IMAGES_HURT = [];
    IMAGES_DEAD = [];


    attackSound = null;
    jumpSound = null;
    footstepSound = null;
    hurtSound = null;

    lastHitAt = 0;
    attackDamage = 25;
    isAttacking = false;
    attackFrame = 0;
    deadFrame = 0;
    deathAnimationDone = false;
    lastSpacePressed = false;
    othersDirection = false;

    constructor() {
        super();

      
        if (this.IMAGES_WALKING.length) {
            this.loadImage(this.IMAGES_WALKING[0]);
        }

     
        this.loadAllImages();

        if (this.attackSound) this.attackSound.volume = 0.5;
        if (this.jumpSound) this.jumpSound.volume = 0.5;
        if (this.footstepSound) {
            this.footstepSound.volume = 0.5;
            this.footstepSound.loop = true;
        }
        this.applyGravity();
        this.animate();
    }

    loadAllImages() {
        [this.IMAGES_IDLE, this.IMAGES_WALKING, this.IMAGES_JUMPING, this.IMAGES_ATTACKING, this.IMAGES_HURT, this.IMAGES_DEAD]
            .filter(Array.isArray)
            .forEach((arr) => this.loadImages(arr));
    }

    animate() {
       
        setInterval(() => {
            if (!this.world || !this.world.keyboard) return;

            if (this.isDead()) {
                this.stopFootsteps();
                return;
            }

            if (this.world.keyboard.RIGHT && this.x < this.world.levelEndX) {
                this.x += this.speed;
                this.othersDirection = false;
            }
            if (this.world.keyboard.LEFT && this.x > 0) {
                this.x -= this.speed;
                this.othersDirection = true;
            }
            if (this.world.keyboard.UP && !this.isAboveGround()) {
                this.jump();
            }
            if (this.world.keyboard.SPACE && !this.lastSpacePressed) {
                this.startAttack();
            }
             
            this.lastSpacePressed = this.world.keyboard.SPACE;

            const isWalking = (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isAboveGround();
            if (isWalking && !this.isAttacking) this.playFootsteps();
            else this.stopFootsteps();

            this.world.camera_x = -this.x + 100;
        }, 1000 / 60);

        
        setInterval(() => {
            if (!this.world || !this.world.keyboard) return;

            if (this.isDead()) {
                this.playDeathAnimation();
                return;
            }

            if (this.isAttacking) {
                this.playAttackAnimation();
                return;
            }

            if (this.isHurt() && this.IMAGES_HURT.length) {
                this.playAnimation(this.IMAGES_HURT);
                return;
            }

            if (this.isAboveGround()) this.playAnimation(this.IMAGES_JUMPING);
            else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) this.playAnimation(this.IMAGES_WALKING);
            else if (this.IMAGES_IDLE.length) this.playAnimation(this.IMAGES_IDLE);
            else {
                const fallbackPath = this.IMAGES_WALKING[0];
                if (fallbackPath) this.img = this.imageCache[fallbackPath] || this.img;
            }
        }, 100);
    }

    isAboveGround() {
        return this.y < this.groundY;
    }

    getHitbox() {
        return {
            x: this.x + 20,
            y: this.y + 88,
            width: this.width - 40,
            height: this.height - 96,
        };
    }

    jump() {
        this.speedY = 20;
        this.stopFootsteps();
        if (this.jumpSound) {
            this.jumpSound.currentTime = 0;
            this.jumpSound.play().catch(() => {});
        }
    }

    playFootsteps() {
        if (this.footstepSound && this.footstepSound.paused) {
            this.footstepSound.play().catch(() => {});
        }
    }

    stopFootsteps() {
        if (this.footstepSound && !this.footstepSound.paused) {
            this.footstepSound.pause();
            this.footstepSound.currentTime = 0;
        }
    }

    startAttack() {
        this.isAttacking = true;
        this.attackFrame = 0;
        this.stopFootsteps();
        if (this.attackSound) {
            this.attackSound.currentTime = 0;
            this.attackSound.play().catch(() => {});
        }
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

    playDeathAnimation() {
        const deathIndex = Math.min(this.deadFrame, this.IMAGES_DEAD.length - 1);
        const deathPath = this.IMAGES_DEAD[deathIndex];
        this.img = this.imageCache[deathPath];

        if (this.deadFrame < this.IMAGES_DEAD.length - 1) this.deadFrame++;
        else this.deathAnimationDone = true;
    }

    isHurt() {
        return !this.isDead() && Date.now() - this.lastHitAt < 500;
    }

    takeHit(fromEnemyX, damage = 10) {
        if (this.isDead()) return false;

        const now = Date.now();
        if (now - this.lastHitAt < 500) return false;

        this.lastHitAt = now;
        this.takeDamage(damage);
        this.stopFootsteps();
        if (this.hurtSound) {
            this.hurtSound.currentTime = 0;
            this.hurtSound.play().catch(() => {});
        }

        this.x += fromEnemyX >= this.x ? -40 : 40;
        if (this.world) this.x = Math.max(0, Math.min(this.x, this.world.levelEndX));

        if (!this.isAboveGround()) this.speedY = 8;

        if (this.isDead()) {
            this.isAttacking = false;
            this.attackFrame = 0;
            this.deadFrame = 0;
            this.deathAnimationDone = false;
        }

        return true;
    }
}
