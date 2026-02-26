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

    constructor(x = null, config = {}) {
        super();
        const spawnMinX = config.spawnMinX ?? Endboss.SPAWN_MIN_X;
        const spawnMaxX = config.spawnMaxX ?? Endboss.SPAWN_MAX_X;

        this.x = x ?? this.getSpawnX(spawnMinX, spawnMaxX);
        this.patrolMinX = Math.max(spawnMinX, this.x - (config.patrolRange ?? 160));
        this.patrolMaxX = Math.min(spawnMaxX, this.x + (config.patrolRange ?? 160));
        this.movingLeft = true;
        this.othersDirection = true;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackDamage = config.attackDamage ?? 30;
        this.lastAttackAt = 0;
        this.deadFrame = 0;
        this.deathAnimationDone = false;
        this.energy = config.energy ?? 350;
        this.speed = config.speed ?? this.speed;
        this.width = config.width ?? this.width;
        this.height = config.height ?? this.height;
        this.y = config.y ?? this.y;

        this.IMAGES_WALKING = config.walkingImages ?? this.IMAGES_WALKING;
        this.IMAGES_ATTACKING = config.attackImages ?? this.IMAGES_ATTACKING;
        this.IMAGES_HURT = config.hurtImages ?? this.IMAGES_HURT;
        this.IMAGES_DEAD = config.deadImages ?? this.IMAGES_DEAD;

        this.attackSound = config.attackSoundPath ? new Audio(config.attackSoundPath) : new Audio('audio/boss-attack.mp3');
        this.attackSound.volume = config.attackSoundVolume ?? 0.5;

        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACKING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.animate();
    }

    getSpawnX(spawnMinX = Endboss.SPAWN_MIN_X, spawnMaxX = Endboss.SPAWN_MAX_X) {
        return spawnMinX + Math.random() * (spawnMaxX - spawnMinX);
    }

    triggerAttack(target = null) {
        if (this.isDead()) {
            return;
        }

        if (!this.IMAGES_ATTACKING.length) {
            return;
        }

        const now = Date.now();
        if (now - this.lastAttackAt < 700) {
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

        this.takeDamage(damage);

        const knockback = fromCharacterX <= this.x ? 25 : -25;
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

    getHitbox() {
        return {
            x: this.x + 70,
            y: this.y + 118,
            width: this.width - 140,
            height: this.height - 132,
        };
    }

    animate() {
        const movementInterval = setInterval(() => {
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
        this.intervalIds.push(movementInterval);

        const animationInterval = setInterval(() => {
            if (this.isDead()) {
                const deadIndex = Math.min(this.deadFrame, this.IMAGES_DEAD.length - 1);
                const deadPath = this.IMAGES_DEAD[deadIndex];
                this.img = this.imageCache[deadPath] || this.img;

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
        }, 120);
        this.intervalIds.push(animationInterval);
    }

    dispose() {
        this.intervalIds.forEach((id) => clearInterval(id));
        this.intervalIds = [];
    }
}
