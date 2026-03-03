/**
 * @file models/endboss.class.js
 */

/**
 * Represents the end boss in the game.
 */
class Endboss extends MovableObject {
    static LEVEL_END_X = 720 * 5;
    static SPAWN_MIN_X = Endboss.LEVEL_END_X - 900;
    static SPAWN_MAX_X = Endboss.LEVEL_END_X - 300;

    height = 400;
    width = 250;
    y = 110;
    speed = 1.2;
    intervalIds = [];
    IMAGES_WALKING = [
        'img/Boss2/Walk1.png',
        'img/Boss2/Walk2.png',
        'img/Boss2/Walk3.png',
        'img/Boss2/Walk4.png',
        'img/Boss2/Walk5.png',
        'img/Boss2/Walk6.png',
    ];

    IMAGES_ATTACKING = [
        'img/Boss2/Attack1.png',
        'img/Boss2/Attack2.png',
        'img/Boss2/Attack3.png',
        'img/Boss2/Attack4.png',
        'img/Boss2/Attack5.png',
        'img/Boss2/Attack6.png',
        'img/Boss2/Attack7.png',
    ];

    IMAGES_HURT = [
        'img/Boss2/Hurt1.png',
        'img/Boss2/Hurt2.png',
    ];

    IMAGES_DEAD = [
        'img/Boss2/Death0.png',
        'img/Boss2/Death1.png',
        'img/Boss2/Death01.png',
        'img/Boss2/Death2.png',
        'img/Boss2/Death3.png',
        'img/Boss2/Death4.png'
    ];

    /**
     * Runs constructor.
     * @param {*} x
     * @param {*} config
     */
    constructor(x = null, config = {}) {
        super();
        const spawn = this.getSpawnConfig(config);
        this.initializeCoreState(x, config, spawn);
        this.applyImageConfig(config);
        this.setupAttackSound(config);
        this.loadBossImages();
        this.animate();
    }

    /**
     * Runs getSpawnConfig.
     * @param {*} config
     */
    getSpawnConfig(config) {
        return {
            minX: config.spawnMinX ?? Endboss.SPAWN_MIN_X,
            maxX: config.spawnMaxX ?? Endboss.SPAWN_MAX_X,
            patrolRange: config.patrolRange ?? 160,
        };
    }

    /**
     * Runs initializeCoreState.
     * @param {*} x
     * @param {*} config
     * @param {*} spawn
     */
    initializeCoreState(x, config, spawn) {
        this.x = x ?? this.getSpawnX(spawn.minX, spawn.maxX);
        this.patrolMinX = Math.max(spawn.minX, this.x - spawn.patrolRange);
        this.patrolMaxX = Math.min(spawn.maxX, this.x + spawn.patrolRange);
        this.applyMotionConfig(config);
        this.applyCombatConfig(config);
    }

    /**
     * Runs applyMotionConfig.
     * @param {*} config
     */
    applyMotionConfig(config) {
        this.movingLeft = true;
        this.othersDirection = true;
        this.speed = config.speed ?? this.speed;
        this.width = config.width ?? this.width;
        this.height = config.height ?? this.height;
        this.y = config.y ?? this.y;
    }

    /**
     * Runs applyCombatConfig.
     * @param {*} config
     */
    applyCombatConfig(config) {
        this.maxEnergy = config.energy ?? 350;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackDamage = config.attackDamage ?? 30;
        this.lastAttackAt = 0;
        this.lastHitAt = 0;
        this.hitCooldownMs = config.hitCooldownMs ?? 350;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
        this.energy = this.maxEnergy;
    }

    /**
     * Runs applyImageConfig.
     * @param {*} config
     */
    applyImageConfig(config) {
        this.IMAGES_WALKING = config.walkingImages ?? this.IMAGES_WALKING;
        this.IMAGES_ATTACKING = config.attackImages ?? this.IMAGES_ATTACKING;
        this.IMAGES_HURT = config.hurtImages ?? this.IMAGES_HURT;
        this.IMAGES_DEAD = config.deadImages ?? this.IMAGES_DEAD;
    }

    /**
     * Runs setupAttackSound.
     * @param {*} config
     */
    setupAttackSound(config) {
        const path = config.attackSoundPath ?? 'audio/boss-attack.mp3';
        this.attackSound = new Audio(path);
        this.attackSound.volume = config.attackSoundVolume ?? 0.5;
    }

    /**
     * Runs loadBossImages.
     */
    loadBossImages() {
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACKING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
    }

    /**
     * Runs getSpawnX.
     * @param {*} spawnMinX
     * @param {*} spawnMaxX
     */
    getSpawnX(spawnMinX = Endboss.SPAWN_MIN_X, spawnMaxX = Endboss.SPAWN_MAX_X) {
        return spawnMinX + Math.random() * (spawnMaxX - spawnMinX);
    }

    /**
     * Runs triggerAttack.
     * @param {*} target
     */
    triggerAttack(target = null) {
        if (!this.canStartAttack()) return;
        if (target) this.othersDirection = target.x < this.x;
        this.lastAttackAt = Date.now();
        this.isAttacking = true;
        this.attackFrame = 0;
        this.playAttackSound();
    }

    /**
     * Runs canStartAttack.
     */
    canStartAttack() {
        if (this.isDead()) return false;
        if (!this.IMAGES_ATTACKING.length) return false;
        return Date.now() - this.lastAttackAt >= 700;
    }

    /**
     * Runs playAttackSound.
     */
    playAttackSound() {
        if (!this.attackSound) return;
        this.attackSound.currentTime = 0;
        this.attackSound.play().catch(() => {});
    }

    /**
     * Runs takeHit.
     * @param {*} fromCharacterX
     * @param {*} damage
     */
    takeHit(fromCharacterX, damage = 25) {
        if (this.isDead()) return false;
        if (!this.canTakeHitNow()) return false;
        this.takeDamage(damage);
        this.applyKnockback(fromCharacterX);
        this.resetDeathAnimationIfNeeded();
        return true;
    }

    /**
     * Runs canTakeHitNow.
     */
    canTakeHitNow() {
        const now = Date.now();
        if (now - this.lastHitAt < this.hitCooldownMs) return false;
        this.lastHitAt = now;
        return true;
    }

    /**
     * Runs applyKnockback.
     * @param {*} fromCharacterX
     */
    applyKnockback(fromCharacterX) {
        const knockback = fromCharacterX <= this.x ? 25 : -25;
        this.x += knockback;
        this.x = Math.max(this.patrolMinX, Math.min(this.x, this.patrolMaxX));
    }

    /**
     * Runs resetDeathAnimationIfNeeded.
     */
    resetDeathAnimationIfNeeded() {
        if (!this.isDead()) return;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
    }

    /**
     * Runs canBeRemoved.
     */
    canBeRemoved() {
        return this.isDead() && this.deathAnimationDone;
    }

    /**
     * Runs getHitbox.
     */
    getHitbox() {
        return {
            x: this.x + 70,
            y: this.y + 118,
            width: this.width - 140,
            height: this.height - 132,
        };
    }

    /**
     * Runs animate.
     */
    animate() {
        const movementInterval = setInterval(() => this.handleMovementTick(), 1000 / 60);
        this.intervalIds.push(movementInterval);
        const animationInterval = setInterval(() => this.handleAnimationTick(), 120);
        this.intervalIds.push(animationInterval);
    }

    /**
     * Runs handleMovementTick.
     */
    handleMovementTick() {
        if (window.__moonberryPaused || this.world?.isPaused) return;
        if (this.isDead() || this.isAttacking) return;
        if (this.movingLeft) return this.movePatrolLeft();
        this.movePatrolRight();
    }

    /**
     * Runs movePatrolLeft.
     */
    movePatrolLeft() {
        this.x -= this.speed;
        this.othersDirection = true;
        if (this.x > this.patrolMinX) return;
        this.x = this.patrolMinX;
        this.movingLeft = false;
    }

    /**
     * Runs movePatrolRight.
     */
    movePatrolRight() {
        this.x += this.speed;
        this.othersDirection = false;
        if (this.x < this.patrolMaxX) return;
        this.x = this.patrolMaxX;
        this.movingLeft = true;
    }

    /**
     * Runs handleAnimationTick.
     */
    handleAnimationTick() {
        if (window.__moonberryPaused || this.world?.isPaused) return;
        if (this.isDead()) return this.playDeathTick();
        if (this.isAttacking && this.IMAGES_ATTACKING.length) return this.playAttackTick();
        this.playWalkTick();
    }

    /**
     * Runs playDeathTick.
     */
    playDeathTick() {
        const deadIndex = Math.min(this.deadFrame, this.IMAGES_DEAD.length - 1);
        const deadPath = this.IMAGES_DEAD[deadIndex];
        this.img = this.imageCache[deadPath] || this.img;
        if (this.deadFrame < this.IMAGES_DEAD.length - 1) this.deadFrame++;
        else this.deathAnimationDone = true;
    }

    /**
     * Runs playAttackTick.
     */
    playAttackTick() {
        const path = this.IMAGES_ATTACKING[this.attackFrame];
        this.img = this.imageCache[path];
        this.attackFrame++;
        if (this.attackFrame < this.IMAGES_ATTACKING.length) return;
        this.isAttacking = false;
        this.attackFrame = 0;
    }

    /**
     * Runs playWalkTick.
     */
    playWalkTick() {
        const i = this.currentImage % this.IMAGES_WALKING.length;
        this.img = this.imageCache[this.IMAGES_WALKING[i]];
        this.currentImage++;
    }

    /**
     * Runs dispose.
     */
    dispose() {
        this.intervalIds.forEach((id) => clearInterval(id));
        this.intervalIds = [];
    }
}




