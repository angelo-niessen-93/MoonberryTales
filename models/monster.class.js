/**
 * @file models/monster.class.js
 */

/**
 * Represents Monster in the game.
 */
class Monster extends MovableObject {
    y = 320;
    static LEVEL_END_X = 720 * 5;
    static NO_SPAWN_END_BUFFER = 720;
    static MIN_SPAWN_X = 300;
    static SPAWN_AHEAD_DISTANCE = 350;
    static DEFAULT_RANDOM_TYPES = ["skeleton", "dragon", "ghost"];

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
        dino: [
            'img/level2img/level2monster/dino/walk1.png',
            'img/level2img/level2monster/dino/walk2.png',
            'img/level2img/level2monster/dino/walk3.png',
            'img/level2img/level2monster/dino/walk4.png',
        ],
        ent: [
            'img/level2img/level2monster/ent/walk1.png',
            'img/level2img/level2monster/ent/walk2.png',
            'img/level2img/level2monster/ent/walk3.png',
            'img/level2img/level2monster/ent/walk4.png',
            'img/level2img/level2monster/ent/walk5.png',
            'img/level2img/level2monster/ent/walk6.png',
        ],
        spider: [
            'img/level2img/level2monster/spider/walk1.png',
            'img/level2img/level2monster/spider/walk2.png',
            'img/level2img/level2monster/spider/walk3.png',
            'img/level2img/level2monster/spider/walk4.png',
            'img/level2img/level2monster/spider/walk5.png',
            'img/level2img/level2monster/spider/walk6.png',
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
        spider: [
            'img/level2img/level2monster/spider/attack1.png',
            'img/level2img/level2monster/spider/attack2.png',
            'img/level2img/level2monster/spider/attack3.png',
        ],
        dino: [
            'img/level2img/level2monster/dino/attack1.png',
            'img/level2img/level2monster/dino/attack2.png',
            'img/level2img/level2monster/dino/attack3.png',
            'img/level2img/level2monster/dino/attack4.png',
            'img/level2img/level2monster/dino/attack5.png',
        ],
        ent: [
            'img/level2img/level2monster/ent/attack1.png',
            'img/level2img/level2monster/ent/attack2.png',
            'img/level2img/level2monster/ent/attack3.png',
            'img/level2img/level2monster/ent/attack4.png',
            'img/level2img/level2monster/ent/attack5.png',
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
        spider: [
            'img/level2img/level2monster/spider/death1.png',
            'img/level2img/level2monster/spider/death2.png',
            'img/level2img/level2monster/spider/death3.png',
            'img/level2img/level2monster/spider/death4.png',
        ],
        dino: [
            'img/level2img/level2monster/dino/death1.png',
            'img/level2img/level2monster/dino/death2.png',
            'img/level2img/level2monster/dino/death3.png',
            'img/level2img/level2monster/dino/death4.png',
            'img/level2img/level2monster/dino/death5.png',
            'img/level2img/level2monster/dino/death6.png',
        ],
        ent: [
            'img/level2img/level2monster/ent/death1.png',
            'img/level2img/level2monster/ent/death2.png',
            'img/level2img/level2monster/ent/death3.png',
            'img/level2img/level2monster/ent/death4.png',
            'img/level2img/level2monster/ent/death5.png',
            'img/level2img/level2monster/ent/death6.png',
            'img/level2img/level2monster/ent/death7.png',
        ],
    };

    static HURT_SETS = {
        dino: [
            'img/level2img/level2monster/dino/hurt1.png',
            'img/level2img/level2monster/dino/hurt2.png',
            'img/level2img/level2monster/dino/hurt3.png',
            'img/level2img/level2monster/dino/hurt4.png',
        ],
        ent: [
            'img/level2img/level2monster/ent/hurt1.png',
            'img/level2img/level2monster/ent/hurt2.png',
            'img/level2img/level2monster/ent/hurt3.png',
        ],
    };


    static TYPE_SIZES = {
        skeleton: { width: 100, height: 150, y: 320 },
        dragon: { width: 160, height: 220, y: 300 },
        ghost: { width: 120, height: 170, y: 300 },
        ent: { width: 220, height: 320, y: 200 },
    };
    static ATTACK_SOUND_BY_TYPE = {
        ghost: 'audio/ghost-attack.mp3',
        skeleton: 'audio/skeleton-attack.mp3',
    };
    static SPIDER_WEB_IMAGES = [
        'img/level2img/level2monster/spider/web1.png',
        'img/level2img/level2monster/spider/web2.png',
        'img/level2img/level2monster/spider/web3.png',
        'img/level2img/level2monster/spider/web4.png',
        'img/level2img/level2monster/spider/web5.png',
    ];
    intervalIds = [];


    /**
     * Runs constructor.
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
     * Runs getSetConfig.
     * @param {*} config
     */
    getSetConfig(config) {
        return {
            walkingSets: config.walkingSets ?? Monster.WALKING_SETS,
            attackSets: config.attackSets ?? Monster.ATTACK_SETS,
            deadSets: config.deadSets ?? Monster.DEAD_SETS,
            hurtSets: config.hurtSets ?? Monster.HURT_SETS,
            typeSizes: config.typeSizes ?? Monster.TYPE_SIZES,
        };
    }

    /**
     * Runs initializeType.
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
     * Runs applyTypeAssets.
     * @param {*} sets
     */
    applyTypeAssets(sets) {
        this.IMAGES_WALKING = sets.walkingSets[this.type] ?? [];
        this.IMAGES_ATTACKING = sets.attackSets[this.type] || [];
        this.IMAGES_DEAD = sets.deadSets[this.type] || [];
        this.IMAGES_HURT = sets.hurtSets[this.type] || [];
    }

    /**
     * Runs applyTypeSize.
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
     * Runs initializeMonsterState.
     * @param {*} x
     * @param {*} patrolMinX
     * @param {*} patrolMaxX
     * @param {*} config
     */
    initializeMonsterState(x, patrolMinX, patrolMaxX, config) {
        this.levelEndXLimit = config.levelEndX ?? Monster.LEVEL_END_X;
        this.noSpawnEndBuffer = config.noSpawnEndBuffer ?? Monster.NO_SPAWN_END_BUFFER;
        this.loadImage(this.IMAGES_WALKING[0]);
        this.speed = 0.45 + Math.random() * 0.25;
        this.x = x ?? this.getRandomSpawnX();
        this.setPatrolRange(patrolMinX, patrolMaxX);
        this.movingLeft = true;
        this.othersDirection = true;
        this.initializeCombatState(config);
    }

    /**
     * Runs initializeCombatState.
     * @param {*} config
     */
    initializeCombatState(config) {
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackProjectileFired = false;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
        this.energy = 50;
        this.attackDamage = config.attackDamage ?? 10;
        this.attackCooldownMs = config.attackCooldownMs ?? 500;
        this.lastHitAt = 0;
        this.lastAttackAt = 0;
    }

    /**
     * Runs setupAttackSound.
     * @param {*} config
     */
    setupAttackSound(config) {
        const map = config.attackSoundByType ?? Monster.ATTACK_SOUND_BY_TYPE;
        const attackSoundPath = map[this.type];
        this.attackSound = attackSoundPath ? new Audio(attackSoundPath) : null;
        if (this.attackSound) this.attackSound.volume = config.attackSoundVolume ?? 0.5;
    }

    /**
     * Runs loadMonsterImages.
     */
    loadMonsterImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACKING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
    }

    /**
     * Runs createForLevel.
     * @param {*} characterStartX
     * @param {*} count
     * @param {*} options
     */
    static createForLevel(characterStartX = 120, count = 10, options = {}) {
        const range = Monster.getLevelSpawnRange(characterStartX, options);
        const step = (range.maxX - range.minX) / Math.max(1, count - 1);
        const monsters = [];
        for (let i = 0; i < count; i++) {
            const spawn = Monster.createSpawnPoint(i, step, range, options);
            const type = Monster.getSpawnType(options);
            monsters.push(new Monster(type, spawn.x, spawn.patrolMinX, spawn.patrolMaxX, options));
        }
        return monsters;
    }

    /**
     * Runs getSpawnType.
     * @param {*} options
     */
    static getSpawnType(options = {}) {
        if (options.forceType) return options.forceType;
        const allowed = Array.isArray(options.allowedTypes) ? options.allowedTypes : Monster.DEFAULT_RANDOM_TYPES;
        const types = allowed.filter((type) => Array.isArray(Monster.WALKING_SETS[type]));
        if (!types.length) return "skeleton";
        const index = Math.floor(Math.random() * types.length);
        return types[index];
    }

    /**
     * Runs getLevelSpawnRange.
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
     * Runs createSpawnPoint.
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
     * Runs getRandomSpawnX.
     */
    getRandomSpawnX() {
        const playerX = this.world?.character?.x ?? 120;
        const minX = Math.max(Monster.MIN_SPAWN_X, playerX + Monster.SPAWN_AHEAD_DISTANCE);
        const maxX = this.levelEndXLimit - this.noSpawnEndBuffer;

        if (minX >= maxX) {
            return maxX;
        }

        return minX + Math.random() * (maxX - minX);
    }

    /**
     * Runs setPatrolRange.
     * @param {*} minX
     * @param {*} maxX
     */
    setPatrolRange(minX = null, maxX = null) {
        const levelMin = Monster.MIN_SPAWN_X;
        const levelMax = this.levelEndXLimit - this.noSpawnEndBuffer;
        const defaultHalfRange = 260;

        this.patrolMinX = Math.max(levelMin, minX ?? this.x - defaultHalfRange);
        this.patrolMaxX = Math.min(levelMax, maxX ?? this.x + defaultHalfRange);

        if (this.patrolMaxX <= this.patrolMinX) {
            this.patrolMaxX = Math.min(levelMax, this.patrolMinX + 200);
        }
    }

}






