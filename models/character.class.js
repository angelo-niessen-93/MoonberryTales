/**
 * @file models/character.class.js
 */

/**
 * Repräsentiert Character im Spiel.
 */
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
    intervalIds = [];

    /**
     * Führt constructor aus.
     */
    constructor() {
        super();
        this.setupInitialCharacterImage();
        this.loadAllImages();
        this.setupCharacterAudio();
        this.applyGravity();
        this.animate();
    }

    /**
     * Führt setupInitialCharacterImage aus.
     */
    setupInitialCharacterImage() {
        if (this.IMAGES_WALKING.length) this.loadImage(this.IMAGES_WALKING[0]);
    }

    /**
     * Führt setupCharacterAudio aus.
     */
    setupCharacterAudio() {
        if (this.attackSound) this.attackSound.volume = 0.5;
        if (this.jumpSound) this.jumpSound.volume = 0.5;
        if (!this.footstepSound) return;
        this.footstepSound.volume = 0.5;
        this.footstepSound.loop = true;
    }

    /**
     * Führt loadAllImages aus.
     */
    loadAllImages() {
        [this.IMAGES_IDLE, this.IMAGES_WALKING, this.IMAGES_JUMPING, this.IMAGES_ATTACKING, this.IMAGES_HURT, this.IMAGES_DEAD]
            .filter(Array.isArray)
            .forEach((arr) => this.loadImages(arr));
    }

    /**
     * Führt animate aus.
     */
    animate() {
        const movementInterval = setInterval(() => this.handleMovementTick(), 1000 / 60);
        this.intervalIds.push(movementInterval);
        const animationInterval = setInterval(() => this.handleAnimationTick(), 100);
        this.intervalIds.push(animationInterval);
    }

    /**
     * Führt handleMovementTick aus.
     */
    handleMovementTick() {
        if (!this.canProcessMovement()) return;
        this.applyHorizontalMovement();
        this.handleJumpInput();
        this.handleAttackInput();
        this.syncWalkAudio();
        this.world.camera_x = -this.x + 100;
    }

    /**
     * Führt canProcessMovement aus.
     */
    canProcessMovement() {
        if (!this.world || !this.world.keyboard) return false;
        if (window.__moonberryPaused || this.world.isPaused) return this.stopAndBlockMovement();
        if (this.world.isVictory || this.world.isGameOver) return this.stopAndBlockMovement();
        if (this.isDead()) return this.stopAndBlockMovement();
        return true;
    }

    /**
     * Führt stopAndBlockMovement aus.
     */
    stopAndBlockMovement() {
        this.stopFootsteps();
        return false;
    }

    /**
     * Führt applyHorizontalMovement aus.
     */
    applyHorizontalMovement() {
        if (this.world.keyboard.RIGHT && this.x < this.world.levelEndX) this.moveCharacterRight();
        if (this.world.keyboard.LEFT && this.x > 0) this.moveCharacterLeft();
    }

    /**
     * Führt moveCharacterRight aus.
     */
    moveCharacterRight() {
        this.x += this.speed;
        this.othersDirection = false;
    }

    /**
     * Führt moveCharacterLeft aus.
     */
    moveCharacterLeft() {
        this.x -= this.speed;
        this.othersDirection = true;
    }

    /**
     * Führt handleJumpInput aus.
     */
    handleJumpInput() {
        if (this.world.keyboard.UP && !this.isAboveGround()) this.jump();
    }

    /**
     * Führt handleAttackInput aus.
     */
    handleAttackInput() {
        if (this.world.keyboard.SPACE && !this.lastSpacePressed) this.startAttack();
        this.lastSpacePressed = this.world.keyboard.SPACE;
    }

    /**
     * Führt syncWalkAudio aus.
     */
    syncWalkAudio() {
        const isWalking = (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isAboveGround();
        if (isWalking && !this.isAttacking) this.playFootsteps();
        else this.stopFootsteps();
    }

    /**
     * Führt handleAnimationTick aus.
     */
    handleAnimationTick() {
        if (!this.world || !this.world.keyboard) return;
        if (window.__moonberryPaused || this.world.isPaused) return;
        if (this.isDead()) return this.playDeathAnimation();
        if (this.isAttacking) return this.playAttackAnimation();
        if (this.isHurt() && this.IMAGES_HURT.length) return this.playAnimation(this.IMAGES_HURT);
        this.playDefaultStateAnimation();
    }

    /**
     * Führt playDefaultStateAnimation aus.
     */
    playDefaultStateAnimation() {
        if (this.isAboveGround()) return this.playAnimation(this.IMAGES_JUMPING);
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) return this.playAnimation(this.IMAGES_WALKING);
        if (this.IMAGES_IDLE.length) return this.playAnimation(this.IMAGES_IDLE);
        const fallbackPath = this.IMAGES_WALKING[0];
        if (fallbackPath) this.img = this.imageCache[fallbackPath] || this.img;
    }

    /**
     * Führt isAboveGround aus.
     */
    isAboveGround() {
        return this.y < this.groundY;
    }

    /**
     * Führt getHitbox aus.
     */
    getHitbox() {
        return {
            x: this.x + 20,
            y: this.y + 88,
            width: this.width - 40,
            height: this.height - 96,
        };
    }

    /**
     * Führt getAttackHitbox aus.
     */
    getAttackHitbox() {
        const body = this.getHitbox();
        const attackWidth = 16;
        const attackHeight = Math.max(16, body.height - 48);
        const attackY = body.y + 22;
        const attackX = this.othersDirection
            ? body.x - attackWidth + 2
            : body.x + body.width - 2;
        return { x: attackX, y: attackY, width: attackWidth, height: attackHeight };
    }

    /**
     * Führt jump aus.
     */
    jump() {
        this.speedY = 20;
        this.stopFootsteps();
        if (this.jumpSound) {
            this.jumpSound.currentTime = 0;
            this.jumpSound.play().catch(() => {});
        }
    }

    /**
     * Führt playFootsteps aus.
     */
    playFootsteps() {
        if (this.footstepSound && this.footstepSound.paused) {
            this.footstepSound.play().catch(() => {});
        }
    }

    /**
     * Führt stopFootsteps aus.
     */
    stopFootsteps() {
        if (this.footstepSound && !this.footstepSound.paused) {
            this.footstepSound.pause();
            this.footstepSound.currentTime = 0;
        }
    }

    /**
     * Führt startAttack aus.
     */
    startAttack() {
        if (this.isAttacking || this.isDead() || !this.IMAGES_ATTACKING.length) {
            return false;
        }

        this.isAttacking = true;
        this.attackFrame = 0;
        this.stopFootsteps();
        if (this.attackSound) {
            this.attackSound.currentTime = 0;
            this.attackSound.play().catch(() => {});
        }
        return true;
    }

    /**
     * Führt playAttackAnimation aus.
     */
    playAttackAnimation() {
        const path = this.IMAGES_ATTACKING[this.attackFrame];
        this.img = this.imageCache[path];
        this.attackFrame++;
        if (this.attackFrame >= this.IMAGES_ATTACKING.length) {
            this.isAttacking = false;
            this.attackFrame = 0;
        }
    }

    /**
     * Führt playDeathAnimation aus.
     */
    playDeathAnimation() {
        const deathIndex = Math.min(this.deadFrame, this.IMAGES_DEAD.length - 1);
        const deathPath = this.IMAGES_DEAD[deathIndex];
        this.img = this.imageCache[deathPath];

        if (this.deadFrame < this.IMAGES_DEAD.length - 1) this.deadFrame++;
        else this.deathAnimationDone = true;
    }

    /**
     * Führt isHurt aus.
     */
    isHurt() {
        return !this.isDead() && Date.now() - this.lastHitAt < 500;
    }

    /**
     * Führt takeHit aus.
     * @param {*} fromEnemyX
     * @param {*} damage
     */
    takeHit(fromEnemyX, damage = 10) {
        if (this.isDead()) return false;
        if (!this.canTakeHitNow()) return false;
        this.takeDamage(damage);
        this.stopFootsteps();
        this.playHurtSound();
        this.applyHitKnockback(fromEnemyX);
        this.applyHitVerticalImpulse();
        this.resetAttackStateOnDeath();
        return true;
    }

    /**
     * Führt canTakeHitNow aus.
     */
    canTakeHitNow() {
        const now = Date.now();
        if (now - this.lastHitAt < 500) return false;
        this.lastHitAt = now;
        return true;
    }

    /**
     * Führt playHurtSound aus.
     */
    playHurtSound() {
        if (!this.hurtSound) return;
        this.hurtSound.currentTime = 0;
        this.hurtSound.play().catch(() => {});
    }

    /**
     * Führt applyHitKnockback aus.
     * @param {*} fromEnemyX
     */
    applyHitKnockback(fromEnemyX) {
        this.x += fromEnemyX >= this.x ? -40 : 40;
        if (this.world) this.x = Math.max(0, Math.min(this.x, this.world.levelEndX));
    }

    /**
     * Führt applyHitVerticalImpulse aus.
     */
    applyHitVerticalImpulse() {
        if (!this.isAboveGround()) this.speedY = 8;
    }

    /**
     * Führt resetAttackStateOnDeath aus.
     */
    resetAttackStateOnDeath() {
        if (!this.isDead()) return;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
    }

    /**
     * Führt dispose aus.
     */
    dispose() {
        this.intervalIds.forEach((id) => clearInterval(id));
        this.intervalIds = [];
        this.stopFootsteps();
    }
}



