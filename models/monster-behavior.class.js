/**
 * @file models/monster-behavior.class.js
 * @description Behavior and combat runtime methods attached to `Monster.prototype`.
 */

/**
 * Returns the active hitbox of the monster with type-specific insets.
 *
 * @returns {{x: number, y: number, width: number, height: number}} Hitbox rectangle.
 */
Monster.prototype.getHitbox = function() {
    const inset = this.getHitboxInsets();
    return {
        x: this.x + inset.x,
        y: this.y + inset.top,
        width: Math.max(26, this.width - inset.x * 2),
        height: Math.max(30, this.height - inset.top - inset.bottom)
    };
};

/**
 * Resolves hitbox insets for the current monster type.
 *
 * @returns {{x: number, top: number, bottom: number}} Insets used for hitbox calculation.
 */
Monster.prototype.getHitboxInsets = function() {
    if (this.type === "ent") return this.getEntHitboxInsets();
    if (this.isLevel2MonsterType()) return this.getLevel2HitboxInsets();
    return this.getDefaultHitboxInsets();
};

/**
 * Returns whether the monster type belongs to the level-2 enemy set.
 *
 * @returns {boolean} `true` for spider, dino, or ent.
 */
Monster.prototype.isLevel2MonsterType = function() {
    return this.type === "spider" || this.type === "dino" || this.type === "ent";
};

/**
 * Returns hitbox insets for level-2 monsters.
 *
 * @returns {{x: number, top: number, bottom: number}} Insets for level-2 monsters.
 */
Monster.prototype.getLevel2HitboxInsets = function() {
    return { x: Math.round(this.width * 0.14), top: Math.round(this.height * 0.2), bottom: Math.round(this.height * 0.12) };
};

/**
 * Returns hitbox insets for ent monsters.
 *
 * @returns {{x: number, top: number, bottom: number}} Insets for ent monsters.
 */
Monster.prototype.getEntHitboxInsets = function() {
    return { x: Math.round(this.width * 0.24), top: Math.round(this.height * 0.26), bottom: Math.round(this.height * 0.18) };
};

/**
 * Returns default hitbox insets for non-special monster types.
 *
 * @returns {{x: number, top: number, bottom: number}} Default insets.
 */
Monster.prototype.getDefaultHitboxInsets = function() {
    return { x: Math.round(this.width * 0.22), top: Math.round(this.height * 0.34), bottom: Math.round(this.height * 0.18) };
};

/**
 * Starts the patrol movement update loop.
 *
 * @returns {void}
 */
Monster.prototype.movePatrol = function() {
    const patrolInterval = setInterval(() => this.handlePatrolTick(), 1000 / 60);
    this.intervalIds.push(patrolInterval);
};

/**
 * Executes one patrol movement tick.
 *
 * @returns {void}
 */
Monster.prototype.handlePatrolTick = function() {
    if (window.__moonberryPaused || this.world?.isPaused) return;
    if (this.isDead() || this.isAttacking) return;
    if (this.tryTriggerRangedAttack()) return;
    if (this.movingLeft) return this.movePatrolLeft();
    this.movePatrolRight();
};

/**
 * Attempts to start a ranged attack when target conditions are met.
 *
 * @returns {boolean} `true` when an attack is active after this check.
 */
Monster.prototype.tryTriggerRangedAttack = function() {
    if (this.type !== "spider" || !this.world?.character) return false;
    const char = this.world.character;
    const distX = Math.abs((char.x + char.width / 2) - (this.x + this.width / 2));
    const distY = Math.abs((char.y + char.height / 2) - (this.y + this.height / 2));
    if (distX > 250 || distY > 130) return false;
    this.triggerAttack(char);
    return this.isAttacking;
};

/**
 * Moves the monster left within patrol bounds.
 *
 * @returns {void}
 */
Monster.prototype.movePatrolLeft = function() {
    this.x -= this.speed;
    this.othersDirection = true;
    if (this.x > this.patrolMinX) return;
    this.x = this.patrolMinX;
    this.movingLeft = false;
};

/**
 * Moves the monster right within patrol bounds.
 *
 * @returns {void}
 */
Monster.prototype.movePatrolRight = function() {
    this.x += this.speed;
    this.othersDirection = false;
    if (this.x < this.patrolMaxX) return;
    this.x = this.patrolMaxX;
    this.movingLeft = true;
};

/**
 * Starts the attack animation/cooldown cycle.
 *
 * @param {{x: number}|null} [target=null] - Optional target used for facing direction.
 * @returns {void}
 */
Monster.prototype.triggerAttack = function(target = null) {
    if (!this.canStartAttack()) return;
    if (target) this.othersDirection = target.x < this.x;
    this.lastAttackAt = Date.now();
    this.isAttacking = true;
    this.attackFrame = 0;
    this.attackProjectileFired = false;
    this.playAttackSound();
};

/**
 * Returns whether a new attack can be started.
 *
 * @returns {boolean} `true` if alive, attack frames exist, and cooldown elapsed.
 */
Monster.prototype.canStartAttack = function() {
    if (this.isDead()) return false;
    if (!this.IMAGES_ATTACKING.length) return false;
    return Date.now() - this.lastAttackAt >= this.attackCooldownMs;
};

/**
 * Plays the monster attack sound effect.
 *
 * @returns {void}
 */
Monster.prototype.playAttackSound = function() {
    if (!this.attackSound) return;
    this.attackSound.currentTime = 0;
    this.attackSound.play().catch(() => {});
};

/**
 * Applies damage and knockback if current hit cooldown allows it.
 *
 * @param {number} fromCharacterX - X-position of attacker for knockback direction.
 * @param {number} [damage=25] - Damage amount.
 * @returns {boolean} `true` if hit was applied.
 */
Monster.prototype.takeHit = function(fromCharacterX, damage = 25) {
    if (this.isDead()) return false;
    if (!this.canTakeHitNow()) return false;
    this.takeDamage(damage);
    this.applyKnockback(fromCharacterX);
    this.resetDeathAnimationIfNeeded();
    return true;
};

/**
 * Returns whether the monster can receive damage at this moment.
 *
 * @returns {boolean} `true` if hit cooldown elapsed.
 */
Monster.prototype.canTakeHitNow = function() {
    const now = Date.now();
    if (now - this.lastHitAt < 300) return false;
    this.lastHitAt = now;
    return true;
};

/**
 * Applies horizontal knockback and clamps within patrol range.
 *
 * @param {number} fromCharacterX - X-position of attacker.
 * @returns {void}
 */
Monster.prototype.applyKnockback = function(fromCharacterX) {
    const knockback = fromCharacterX <= this.x ? 20 : -20;
    this.x += knockback;
    this.x = Math.max(this.patrolMinX, Math.min(this.x, this.patrolMaxX));
};

/**
 * Resets death animation state when health reaches zero.
 *
 * @returns {void}
 */
Monster.prototype.resetDeathAnimationIfNeeded = function() {
    if (!this.isDead()) return;
    this.isAttacking = false;
    this.attackFrame = 0;
    this.deadFrame = 0;
    this.deathAnimationDone = false;
};

/**
 * Returns whether dead monster can be removed from the world.
 *
 * @returns {boolean} `true` when death animation has finished.
 */
Monster.prototype.canBeRemoved = function() {
    return this.isDead() && this.deathAnimationDone;
};

/**
 * Starts movement and animation loops.
 *
 * @returns {void}
 */
Monster.prototype.animate = function() {
    this.movePatrol();
    const animationInterval = setInterval(() => this.handleAnimationTick(), 100);
    this.intervalIds.push(animationInterval);
};

/**
 * Executes one animation frame tick based on monster state.
 *
 * @returns {void}
 */
Monster.prototype.handleAnimationTick = function() {
    if (window.__moonberryPaused || this.world?.isPaused) return;
    if (this.isDead()) return this.playDeathTick();
    if (this.isAttacking && this.IMAGES_ATTACKING.length) return this.playAttackTick();
    if (this.isHurt() && this.IMAGES_HURT.length) return this.playHurtTick();
    this.playWalkTick();
};

/**
 * Returns whether hurt animation should currently play.
 *
 * @returns {boolean} `true` while in short post-hit window.
 */
Monster.prototype.isHurt = function() {
    return !this.isDead() && Date.now() - this.lastHitAt < 220;
};

/**
 * Plays one frame of death animation.
 *
 * @returns {void}
 */
Monster.prototype.playDeathTick = function() {
    if (!this.IMAGES_DEAD.length) return this.markDeathAnimationDone();
    const deathIndex = Math.min(this.deadFrame, this.IMAGES_DEAD.length - 1);
    this.img = this.imageCache[this.IMAGES_DEAD[deathIndex]];
    if (this.deadFrame < this.IMAGES_DEAD.length - 1) this.deadFrame++;
    else this.markDeathAnimationDone();
};

/**
 * Marks death animation completion.
 *
 * @returns {void}
 */
Monster.prototype.markDeathAnimationDone = function() {
    this.deathAnimationDone = true;
};

/**
 * Plays one frame of attack animation and fires spider projectile when applicable.
 *
 * @returns {void}
 */
Monster.prototype.playAttackTick = function() {
    const path = this.IMAGES_ATTACKING[this.attackFrame];
    this.img = this.imageCache[path];
    this.tryShootSpiderWeb();
    this.attackFrame++;
    if (this.attackFrame < this.IMAGES_ATTACKING.length) return;
    this.isAttacking = false;
    this.attackFrame = 0;
};

/**
 * Plays one frame of hurt animation.
 *
 * @returns {void}
 */
Monster.prototype.playHurtTick = function() {
    const i = this.currentImage % this.IMAGES_HURT.length;
    this.img = this.imageCache[this.IMAGES_HURT[i]];
    this.currentImage++;
};

/**
 * Attempts to spawn and register a spider web projectile.
 *
 * @returns {void}
 */
Monster.prototype.tryShootSpiderWeb = function() {
    if (this.type !== "spider" || this.attackProjectileFired) return;
    if (!this.world || typeof FireProjectile === "undefined") return;
    if (this.attackFrame !== 1) return;
    const projectile = this.createSpiderWebProjectile();
    if (!projectile) return;
    if (!Array.isArray(this.world.enemyProjectiles)) this.world.enemyProjectiles = [];
    this.world.enemyProjectiles.push(projectile);
    this.attackProjectileFired = true;
};

/**
 * Creates a spider web projectile instance.
 *
 * @returns {Object} FireProjectile instance.
 */
Monster.prototype.createSpiderWebProjectile = function() {
    const x = this.getSpiderWebSpawnX();
    const y = this.getSpiderWebSpawnY();
    return new FireProjectile({
        x, y, movingLeft: this.othersDirection, images: Monster.SPIDER_WEB_IMAGES,
        width: 74, height: 48, speed: 6, lifetimeMs: 1800, hitboxInset: 14, frameIntervalMs: 70, loopAnimation: true
    });
};

/**
 * Returns spawn X-coordinate for a spider web projectile.
 *
 * @returns {number} Projectile spawn X position.
 */
Monster.prototype.getSpiderWebSpawnX = function() {
    if (this.othersDirection) return this.x + 4;
    return this.x + this.width - 34;
};

/**
 * Returns spawn Y-coordinate for a spider web projectile.
 *
 * @returns {number} Projectile spawn Y position.
 */
Monster.prototype.getSpiderWebSpawnY = function() {
    return this.y + Math.round(this.height * 0.34);
};

/**
 * Plays one frame of walk animation.
 *
 * @returns {void}
 */
Monster.prototype.playWalkTick = function() {
    const i = this.currentImage % this.IMAGES_WALKING.length;
    this.img = this.imageCache[this.IMAGES_WALKING[i]];
    this.currentImage++;
};

/**
 * Clears registered intervals and releases runtime timers.
 *
 * @returns {void}
 */
Monster.prototype.dispose = function() {
    this.intervalIds.forEach((id) => clearInterval(id));
    this.intervalIds = [];
};
