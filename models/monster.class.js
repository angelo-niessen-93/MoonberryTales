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


    constructor(type = null, x = null, patrolMinX = null, patrolMaxX = null) {
        super();

        const availableTypes = Object.keys(Monster.WALKING_SETS);
        this.type = availableTypes.includes(type)
            ? type
            : availableTypes[Math.floor(Math.random() * availableTypes.length)];

        this.IMAGES_WALKING = Monster.WALKING_SETS[this.type];
        this.IMAGES_ATTACKING = Monster.ATTACK_SETS[this.type] || [];
        this.IMAGES_DEAD = Monster.DEAD_SETS[this.type] || [];

        const size = Monster.TYPE_SIZES[this.type];
        if (size) {
            this.width = size.width;
            this.height = size.height;
            this.y = size.y;
        }

        this.loadImage(this.IMAGES_WALKING[0]);
        this.speed = 0.45 + Math.random() * 0.25;
        this.x = x ?? this.getRandomSpawnX();
        this.setPatrolRange(patrolMinX, patrolMaxX);
        this.movingLeft = true;
        this.othersDirection = true;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
        this.energy = 50;
        this.attackDamage = 10;
        this.lastHitAt = 0;
        this.lastAttackAt = 0;
        const attackSoundByType = {
            ghost: "audio/ghost-attack.mp3",
            skeleton: "audio/skleton-attck.mp3",
        };
        const attackSoundPath = attackSoundByType[this.type];
        this.attackSound = attackSoundPath ? new Audio(attackSoundPath) : null;
        if (this.attackSound) {
            this.attackSound.volume = 0.5;
        }
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACKING);
        this.loadImages(this.IMAGES_DEAD);
        this.animate();
    }

    static createForLevel(characterStartX = 120, count = 10) {
        const minX = Math.max(
            Monster.MIN_SPAWN_X,
            characterStartX + Monster.SPAWN_AHEAD_DISTANCE
        );
        const maxX = Monster.LEVEL_END_X - Monster.NO_SPAWN_END_BUFFER;
        const step = (maxX - minX) / Math.max(1, count - 1);
        const monsters = [];

        for (let i = 0; i < count; i++) {
            const jitter = (Math.random() - 0.5) * 140;
            const x = Math.min(maxX, Math.max(minX, minX + step * i + jitter));
            const patrolMinX = Math.max(minX, x - 220);
            const patrolMaxX = Math.min(maxX, x + 220);
            monsters.push(new Monster(null, x, patrolMinX, patrolMaxX));
        }

        return monsters;
    }

    getRandomSpawnX() {
        const playerX = this.world?.character?.x ?? 120;
        const minX = Math.max(Monster.MIN_SPAWN_X, playerX + Monster.SPAWN_AHEAD_DISTANCE);
        const maxX = Monster.LEVEL_END_X - Monster.NO_SPAWN_END_BUFFER;

        if (minX >= maxX) {
            return maxX;
        }

        return minX + Math.random() * (maxX - minX);
    }

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

    movePatrol() {
        setInterval(() => {
            if (this.isDead()) {
                return;
            }

            if (this.isAttacking) {
                return;
            }

            if (this.movingLeft) {
                this.x -= this.speed;
                this.othersDirection = true;

                if (this.x <= this.patrolMinX) {
                    this.x = this.patrolMinX;
                    this.movingLeft = false;
                }
            } else {
                this.x += this.speed;
                this.othersDirection = false;

                if (this.x >= this.patrolMaxX) {
                    this.x = this.patrolMaxX;
                    this.movingLeft = true;
                }
            }
        }, 1000 / 60);
    }

    triggerAttack(target = null) {
        if (this.isDead()) {
            return;
        }

        if (!this.IMAGES_ATTACKING.length) {
            return;
        }

        const now = Date.now();
        if (now - this.lastAttackAt < 500) {
            return;
        }

        if (target) {
            this.othersDirection = target.x < this.x;
        }

        this.lastAttackAt = now;
        this.isAttacking = true;
        this.attackFrame = 0;
        if (this.attackSound) {
            this.attackSound.currentTime = 0;
            this.attackSound.play().catch(() => {});
        }
    }

    takeHit(fromCharacterX, damage = 25) {
        if (this.isDead()) {
            return false;
        }

        const now = Date.now();
        if (now - this.lastHitAt < 300) {
            return false;
        }

        this.lastHitAt = now;
        this.takeDamage(damage);

        const knockback = fromCharacterX <= this.x ? 20 : -20;
        this.x += knockback;
        this.x = Math.max(this.patrolMinX, Math.min(this.x, this.patrolMaxX));

        if (this.isDead()) {
            this.isAttacking = false;
            this.attackFrame = 0;
            this.deadFrame = 0;
            this.deathAnimationDone = false;
        }

        return true;
    }

    canBeRemoved() {
        return this.isDead() && this.deathAnimationDone;
    }

    animate() {
        this.movePatrol();

        setInterval(() => {
            if (this.isDead()) {
                if (!this.IMAGES_DEAD.length) {
                    this.deathAnimationDone = true;
                    return;
                }

                const deathIndex = Math.min(this.deadFrame, this.IMAGES_DEAD.length - 1);
                const deathPath = this.IMAGES_DEAD[deathIndex];
                this.img = this.imageCache[deathPath];

                if (this.deadFrame < this.IMAGES_DEAD.length - 1) {
                    this.deadFrame++;
                } else {
                    this.deathAnimationDone = true;
                }
                return;
            }

            if (this.isAttacking && this.IMAGES_ATTACKING.length) {
                const path = this.IMAGES_ATTACKING[this.attackFrame];
                this.img = this.imageCache[path];
                this.attackFrame++;

                if (this.attackFrame >= this.IMAGES_ATTACKING.length) {
                    this.isAttacking = false;
                    this.attackFrame = 0;
                }

                return;
            }

            const i = this.currentImage % this.IMAGES_WALKING.length;
            const path = this.IMAGES_WALKING[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        }, 100);
    }
}
