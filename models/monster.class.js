/**
 * @file models/monster.class.js
 */

/**
 * Repräsentiert Monster im Spiel.
 */
class Monster extends MovableObject {
    y = 320;
    static LEVEL_END_X = 720 * 5;
    static NO_SPAWN_END_BUFFER = 720;
    static MIN_SPAWN_X = 300;
    static SPAWN_AHEAD_DISTANCE = 350;

    static WALKING_SETS = {
        skeleton: [
            'img/Skeleton/skeleton04_walk1.png',
            'img/Skeleton/skeleton05_walk2.png',
            'img/Skeleton/skeleton06_walk3.png',
            'img/Skeleton/skeleton07_walk4.png',
            'img/Skeleton/skeleton08_walk5.png',
            'img/Skeleton/skeleton09_walk6.png',
        ],
        dragon: [
            'img/Dragon/dragon04_walk1.png',
            'img/Dragon/dragon05_walk2.png',
            'img/Dragon/dragon06_walk3.png',
            'img/Dragon/dragon07_walk4.png',
            'img/Dragon/dragon08_walk5.png',
        ],
        ghost: [
            'img/Ghost/ghost05_walk1.png',
            'img/Ghost/ghost06_walk2.png',
            'img/Ghost/ghost07_walk3.png',
            'img/Ghost/ghost08_walk4.png',
        ],
    };

    static ATTACK_SETS = {
        skeleton: [
            'img/Skeleton/skeleton10_attack1.png',
            'img/Skeleton/skeleton11_attack2.png',
            'img/Skeleton/skeleton12_attack3.png',
        ],
        dragon: [
            'img/Dragon/dragon09_attack1.png',
            'img/Dragon/dragon10_attack2.png',
            'img/Dragon/dragon11_attack3.png',
            'img/Dragon/dragon12_attack4.png',
        ],
        ghost: [
            'img/Ghost/ghost09_attack1.png',
            'img/Ghost/ghost10_attack2.png',
            'img/Ghost/ghost11_attack3.png',
            'img/Ghost/ghost12_attack4.png',
        ],
    };

    static DEAD_SETS = {
        skeleton: [
            'img/Skeleton/skeleton15_death1.png',
            'img/Skeleton/skeleton16_death2.png',
            'img/Skeleton/skeleton17_death3.png',
            'img/Skeleton/skeleton18_death4.png',
            'img/Skeleton/skeleton19_death5.png',
        ],
        dragon: [
            'img/Dragon/dragon15_death1.png',
            'img/Dragon/dragon16_death2.png',
            'img/Dragon/dragon17_death3.png',
            'img/Dragon/dragon18_death4.png',
        ],
        ghost: [
            'img/Ghost/ghost15_death1.png',
            'img/Ghost/ghost16_death2.png',
            'img/Ghost/ghost17_death3.png',
            'img/Ghost/ghost18_death4.png',
        ],
    };


    static TYPE_SIZES = {
        skeleton: { width: 100, height: 150, y: 320 },
        dragon: { width: 160, height: 220, y: 300 },
        ghost: { width: 120, height: 170, y: 300 },
    };
    static ATTACK_SOUND_BY_TYPE = {
        ghost: 'audio/ghost-attack.mp3',
        skeleton: 'audio/skleton-attck.mp3',
    };
    intervalIds = [];


    /**
     * Führt constructor aus.
     * @param {*} type
     * @param {*} x
     * @param {*} patrolMinX
     * @param {*} patrolMaxX
     * @param {*} config
     */
    constructor(type = null, x = null, patrolMinX = null, patrolMaxX = null, config = {}) {
        super();
        const sets = this.getSetConfig(config);
        this.initializeType(type, sets.walkingSets);
        this.applyTypeAssets(sets);
        this.applyTypeSize(sets.typeSizes);
        this.initializeMonsterState(x, patrolMinX, patrolMaxX, config);
        this.setupAttackSound(config);
        this.loadMonsterImages();
        this.animate();
    }

    /**
     * Führt getSetConfig aus.
     * @param {*} config
     */
    getSetConfig(config) {
        return {
            walkingSets: config.walkingSets ?? Monster.WALKING_SETS,
            attackSets: config.attackSets ?? Monster.ATTACK_SETS,
            deadSets: config.deadSets ?? Monster.DEAD_SETS,
            typeSizes: config.typeSizes ?? Monster.TYPE_SIZES,
        };
    }

    /**
     * Führt initializeType aus.
     * @param {*} type
     * @param {*} walkingSets
     */
    initializeType(type, walkingSets) {
        const availableTypes = Object.keys(walkingSets);
        if (availableTypes.includes(type)) {
            this.type = type;
            return;
        }
        const randomIndex = Math.floor(Math.random() * availableTypes.length);
        this.type = availableTypes[randomIndex];
    }

    /**
     * Führt applyTypeAssets aus.
     * @param {*} sets
     */
    applyTypeAssets(sets) {
        this.IMAGES_WALKING = sets.walkingSets[this.type] ?? [];
        this.IMAGES_ATTACKING = sets.attackSets[this.type] || [];
        this.IMAGES_DEAD = sets.deadSets[this.type] || [];
    }

    /**
     * Führt applyTypeSize aus.
     * @param {*} typeSizes
     */
    applyTypeSize(typeSizes) {
        const size = typeSizes[this.type];
        if (!size) return;
        this.width = size.width;
        this.height = size.height;
        this.y = size.y;
    }

    /**
     * Führt initializeMonsterState aus.
     * @param {*} x
     * @param {*} patrolMinX
     * @param {*} patrolMaxX
     * @param {*} config
     */
    initializeMonsterState(x, patrolMinX, patrolMaxX, config) {
        this.loadImage(this.IMAGES_WALKING[0]);
        this.speed = 0.45 + Math.random() * 0.25;
        this.x = x ?? this.getRandomSpawnX();
        this.setPatrolRange(patrolMinX, patrolMaxX);
        this.movingLeft = true;
        this.othersDirection = true;
        this.initializeCombatState(config);
    }

    /**
     * Führt initializeCombatState aus.
     * @param {*} config
     */
    initializeCombatState(config) {
        this.isAttacking = false;
        this.attackFrame = 0;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
        this.energy = 50;
        this.attackDamage = config.attackDamage ?? 10;
        this.lastHitAt = 0;
        this.lastAttackAt = 0;
    }

    /**
     * Führt setupAttackSound aus.
     * @param {*} config
     */
    setupAttackSound(config) {
        const map = config.attackSoundByType ?? Monster.ATTACK_SOUND_BY_TYPE;
        const attackSoundPath = map[this.type];
        this.attackSound = attackSoundPath ? new Audio(attackSoundPath) : null;
        if (this.attackSound) this.attackSound.volume = config.attackSoundVolume ?? 0.5;
    }

    /**
     * Führt loadMonsterImages aus.
     */
    loadMonsterImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACKING);
        this.loadImages(this.IMAGES_DEAD);
    }

    /**
     * Führt createForLevel aus.
     * @param {*} characterStartX
     * @param {*} count
     * @param {*} options
     */
    static createForLevel(characterStartX = 120, count = 10, options = {}) {
        const range = Monster.getLevelSpawnRange(characterStartX, options);
        const step = (range.maxX - range.minX) / Math.max(1, count - 1);
        const monsters = [];
        const forceType = options.forceType ?? null;
        for (let i = 0; i < count; i++) {
            const spawn = Monster.createSpawnPoint(i, step, range, options);
            monsters.push(new Monster(forceType, spawn.x, spawn.patrolMinX, spawn.patrolMaxX, options));
        }
        return monsters;
    }

    /**
     * Führt getLevelSpawnRange aus.
     * @param {*} characterStartX
     * @param {*} options
     */
    static getLevelSpawnRange(characterStartX, options = {}) {
        const minSpawnX = options.minSpawnX ?? Monster.MIN_SPAWN_X;
        const spawnAheadDistance = options.spawnAheadDistance ?? Monster.SPAWN_AHEAD_DISTANCE;
        const levelEndX = options.levelEndX ?? Monster.LEVEL_END_X;
        const noSpawnEndBuffer = options.noSpawnEndBuffer ?? Monster.NO_SPAWN_END_BUFFER;
        return {
            minX: Math.max(minSpawnX, characterStartX + spawnAheadDistance),
            maxX: levelEndX - noSpawnEndBuffer,
        };
    }

    /**
     * Führt createSpawnPoint aus.
     * @param {*} index
     * @param {*} step
     * @param {*} range
     * @param {*} options
     */
    static createSpawnPoint(index, step, range, options = {}) {
        const jitterRange = options.jitterRange ?? 140;
        const jitter = (Math.random() - 0.5) * jitterRange;
        const x = Math.min(range.maxX, Math.max(range.minX, range.minX + step * index + jitter));
        const patrolHalfRange = options.patrolHalfRange ?? 220;
        return {
            x,
            patrolMinX: Math.max(range.minX, x - patrolHalfRange),
            patrolMaxX: Math.min(range.maxX, x + patrolHalfRange),
        };
    }

    /**
     * Führt getRandomSpawnX aus.
     */
    getRandomSpawnX() {
        const playerX = this.world?.character?.x ?? 120;
        const minX = Math.max(Monster.MIN_SPAWN_X, playerX + Monster.SPAWN_AHEAD_DISTANCE);
        const maxX = Monster.LEVEL_END_X - Monster.NO_SPAWN_END_BUFFER;

        if (minX >= maxX) {
            return maxX;
        }

        return minX + Math.random() * (maxX - minX);
    }

    /**
     * Führt setPatrolRange aus.
     * @param {*} minX
     * @param {*} maxX
     */
    setPatrolRange(minX = null, maxX = null) {
        const levelMin = Monster.MIN_SPAWN_X;
        const levelMax = Monster.LEVEL_END_X - Monster.NO_SPAWN_END_BUFFER;
        const defaultHalfRange = 260;

        this.patrolMinX = Math.max(levelMin, minX ?? this.x - defaultHalfRange);
        this.patrolMaxX = Math.min(levelMax, maxX ?? this.x + defaultHalfRange);

        if (this.patrolMaxX <= this.patrolMinX) {
            this.patrolMaxX = Math.min(levelMax, this.patrolMinX + 200);
        }
    }

    /**
     * Führt getHitbox aus.
     */
    getHitbox() {
        return {
            x: this.x + 34,
            y: this.y + 74,
            width: this.width - 68,
            height: this.height - 102,
        };
    }

    /**
     * Führt movePatrol aus.
     */
    movePatrol() {
        const patrolInterval = setInterval(() => this.handlePatrolTick(), 1000 / 60);
        this.intervalIds.push(patrolInterval);
    }

    /**
     * Führt handlePatrolTick aus.
     */
    handlePatrolTick() {
        if (window.__moonberryPaused || this.world?.isPaused) return;
        if (this.isDead() || this.isAttacking) return;
        if (this.movingLeft) return this.movePatrolLeft();
        this.movePatrolRight();
    }

    /**
     * Führt movePatrolLeft aus.
     */
    movePatrolLeft() {
        this.x -= this.speed;
        this.othersDirection = true;
        if (this.x > this.patrolMinX) return;
        this.x = this.patrolMinX;
        this.movingLeft = false;
    }

    /**
     * Führt movePatrolRight aus.
     */
    movePatrolRight() {
        this.x += this.speed;
        this.othersDirection = false;
        if (this.x < this.patrolMaxX) return;
        this.x = this.patrolMaxX;
        this.movingLeft = true;
    }

    /**
     * Führt triggerAttack aus.
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
     * Führt canStartAttack aus.
     */
    canStartAttack() {
        if (this.isDead()) return false;
        if (!this.IMAGES_ATTACKING.length) return false;
        return Date.now() - this.lastAttackAt >= 500;
    }

    /**
     * Führt playAttackSound aus.
     */
    playAttackSound() {
        if (!this.attackSound) return;
        this.attackSound.currentTime = 0;
        this.attackSound.play().catch(() => {});
    }

    /**
     * Führt takeHit aus.
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
     * Führt canTakeHitNow aus.
     */
    canTakeHitNow() {
        const now = Date.now();
        if (now - this.lastHitAt < 300) return false;
        this.lastHitAt = now;
        return true;
    }

    /**
     * Führt applyKnockback aus.
     * @param {*} fromCharacterX
     */
    applyKnockback(fromCharacterX) {
        const knockback = fromCharacterX <= this.x ? 20 : -20;
        this.x += knockback;
        this.x = Math.max(this.patrolMinX, Math.min(this.x, this.patrolMaxX));
    }

    /**
     * Führt resetDeathAnimationIfNeeded aus.
     */
    resetDeathAnimationIfNeeded() {
        if (!this.isDead()) return;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
    }

    /**
     * Führt canBeRemoved aus.
     */
    canBeRemoved() {
        return this.isDead() && this.deathAnimationDone;
    }

    /**
     * Führt animate aus.
     */
    animate() {
        this.movePatrol();
        const animationInterval = setInterval(() => this.handleAnimationTick(), 100);
        this.intervalIds.push(animationInterval);
    }

    /**
     * Führt handleAnimationTick aus.
     */
    handleAnimationTick() {
        if (window.__moonberryPaused || this.world?.isPaused) return;
        if (this.isDead()) return this.playDeathTick();
        if (this.isAttacking && this.IMAGES_ATTACKING.length) return this.playAttackTick();
        this.playWalkTick();
    }

    /**
     * Führt playDeathTick aus.
     */
    playDeathTick() {
        if (!this.IMAGES_DEAD.length) return this.markDeathAnimationDone();
        const deathIndex = Math.min(this.deadFrame, this.IMAGES_DEAD.length - 1);
        this.img = this.imageCache[this.IMAGES_DEAD[deathIndex]];
        if (this.deadFrame < this.IMAGES_DEAD.length - 1) this.deadFrame++;
        else this.markDeathAnimationDone();
    }

    /**
     * Führt markDeathAnimationDone aus.
     */
    markDeathAnimationDone() {
        this.deathAnimationDone = true;
    }

    /**
     * Führt playAttackTick aus.
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
     * Führt playWalkTick aus.
     */
    playWalkTick() {
        const i = this.currentImage % this.IMAGES_WALKING.length;
        this.img = this.imageCache[this.IMAGES_WALKING[i]];
        this.currentImage++;
    }

    /**
     * Führt dispose aus.
     */
    dispose() {
        this.intervalIds.forEach((id) => clearInterval(id));
        this.intervalIds = [];
    }
}



