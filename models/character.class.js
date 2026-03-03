/**
 * @file models/character.class.js
 */

/**
 * Represents Character in the game.
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
     * Runs constructor.
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
     * Runs setupInitialCharacterImage.
     */
    setupInitialCharacterImage() {
        if (this.IMAGES_WALKING.length) this.loadImage(this.IMAGES_WALKING[0]);
    }

    /**
     * Runs setupCharacterAudio.
     */
    setupCharacterAudio() {
        if (this.attackSound) this.attackSound.volume = 0.5;
        if (this.jumpSound) this.jumpSound.volume = 0.5;
        if (!this.footstepSound) return;
        this.footstepSound.volume = 0.5;
        this.footstepSound.loop = true;
    }

    /**
     * Runs loadAllImages.
     */
    loadAllImages() {
        [this.IMAGES_IDLE, this.IMAGES_WALKING, this.IMAGES_JUMPING, this.IMAGES_ATTACKING, this.IMAGES_HURT, this.IMAGES_DEAD]
            .filter(Array.isArray)
            .forEach((arr) => this.loadImages(arr));
    }

    /**
     * Runs animate.
     */
    animate() {
        const movementInterval = setInterval(() => this.handleMovementTick(), 1000 / 60);
        this.intervalIds.push(movementInterval);
        const animationInterval = setInterval(() => this.handleAnimationTick(), 100);
        this.intervalIds.push(animationInterval);
    }

    /**
     * Runs handleMovementTick.
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
     * Runs canProcessMovement.
     */
    canProcessMovement() {
        if (!this.world || !this.world.keyboard) return false;
        if (window.__moonberryPaused || this.world.isPaused) return this.stopAndBlockMovement();
        if (this.world.isVictory || this.world.isGameOver) return this.stopAndBlockMovement();
        if (this.isDead()) return this.stopAndBlockMovement();
        return true;
    }

    /**
     * Runs stopAndBlockMovement.
     */
    stopAndBlockMovement() {
        this.stopFootsteps();
        return false;
    }

    /**
     * Runs applyHorizontalMovement.
     */
    applyHorizontalMovement() {
        if (this.world.keyboard.RIGHT && this.x < this.world.levelEndX) this.moveCharacterRight();
        if (this.world.keyboard.LEFT && this.x > 0) this.moveCharacterLeft();
    }

    /**
     * Runs moveCharacterRight.
     */
    moveCharacterRight() {
        this.x += this.speed;
        this.othersDirection = false;
    }

    /**
     * Runs moveCharacterLeft.
     */
    moveCharacterLeft() {
        this.x -= this.speed;
        this.othersDirection = true;
    }

    /**
     * Runs handleJumpInput.
     */
    handleJumpInput() {
        if (this.world.keyboard.UP && !this.isAboveGround()) this.jump();
    }

    /**
     * Runs handleAttackInput.
     */
    handleAttackInput() {
        if (this.world.keyboard.SPACE && !this.lastSpacePressed) this.startAttack();
        this.lastSpacePressed = this.world.keyboard.SPACE;
    }

    /**
     * Runs syncWalkAudio.
     */
    syncWalkAudio() {
        const isWalking = (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isAboveGround();
        if (isWalking && !this.isAttacking) this.playFootsteps();
        else this.stopFootsteps();
    }

    /**
     * Runs handleAnimationTick.
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
     * Runs playDefaultStateAnimation.
     */
    playDefaultStateAnimation() {
        if (this.isAboveGround()) return this.playAnimation(this.IMAGES_JUMPING);
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) return this.playAnimation(this.IMAGES_WALKING);
        if (this.IMAGES_IDLE.length) return this.playAnimation(this.IMAGES_IDLE);
        const fallbackPath = this.IMAGES_WALKING[0];
        if (fallbackPath) this.img = this.imageCache[fallbackPath] || this.img;
    }

    /**
     * Runs isAboveGround.
     */
    isAboveGround() {
        return this.y < this.groundY;
    }

    /**
     * Runs getHitbox.
     */
    getHitbox() {
        const insetX = 30;
        const insetTop = 102;
        const insetBottom = 22;
        return {
            x: this.x + insetX,
            y: this.y + insetTop,
            width: this.width - insetX * 2,
            height: this.height - insetTop - insetBottom,
        };
    }

    /**
     * Runs getAttackHitbox.
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
     * Runs jump.
     */
    jump() {
        this.speedY = 22;
        this.stopFootsteps();
        if (this.jumpSound) {
            this.jumpSound.currentTime = 0;
            this.jumpSound.play().catch(() => {});
        }
    }

    /**
     * Runs playFootsteps.
     */
    playFootsteps() {
        if (this.footstepSound && this.footstepSound.paused) {
            this.footstepSound.play().catch(() => {});
        }
    }

    /**
     * Runs stopFootsteps.
     */
    stopFootsteps() {
        if (this.footstepSound && !this.footstepSound.paused) {
            this.footstepSound.pause();
            this.footstepSound.currentTime = 0;
        }
    }

    /**
     * Runs startAttack.
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
     * Runs playAttackAnimation.
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
     * Runs playDeathAnimation.
     */
    playDeathAnimation() {
        const deathIndex = Math.min(this.deadFrame, this.IMAGES_DEAD.length - 1);
        const deathPath = this.IMAGES_DEAD[deathIndex];
        this.img = this.imageCache[deathPath];

        if (this.deadFrame < this.IMAGES_DEAD.length - 1) this.deadFrame++;
        else this.deathAnimationDone = true;
    }

    /**
     * Runs isHurt.
     */
    isHurt() {
        return !this.isDead() && Date.now() - this.lastHitAt < 500;
    }

    /**
     * Runs takeHit.
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
     * Runs canTakeHitNow.
     */
    canTakeHitNow() {
        const now = Date.now();
        if (now - this.lastHitAt < 500) return false;
        this.lastHitAt = now;
        return true;
    }

    /**
     * Runs playHurtSound.
     */
    playHurtSound() {
        if (!this.hurtSound) return;
        this.hurtSound.currentTime = 0;
        this.hurtSound.play().catch(() => {});
    }

    /**
     * Runs applyHitKnockback.
     * @param {*} fromEnemyX
     */
    applyHitKnockback(fromEnemyX) {
        this.x += fromEnemyX >= this.x ? -40 : 40;
        if (this.world) this.x = Math.max(0, Math.min(this.x, this.world.levelEndX));
    }

    /**
     * Runs applyHitVerticalImpulse.
     */
    applyHitVerticalImpulse() {
        if (!this.isAboveGround()) this.speedY = 8;
    }

    /**
     * Runs resetAttackStateOnDeath.
     */
    resetAttackStateOnDeath() {
        if (!this.isDead()) return;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
    }

    /**
     * Runs dispose.
     */
    dispose() {
        this.intervalIds.forEach((id) => clearInterval(id));
        this.intervalIds = [];
        this.stopFootsteps();
    }
}




