class Monster extends MovableObject {
    y = 320;
    static LEVEL_END_X = 720 * 5;
    static NO_SPAWN_END_BUFFER = 720;
    static MIN_SPAWN_X = 300;
    static SPAWN_AHEAD_DISTANCE = 350;

    static WALKING_SETS = {
        skeleton: [
            '../img/Skeleton/skeleton04_walk1.png',
            '../img/Skeleton/skeleton05_walk2.png',
            '../img/Skeleton/skeleton06_walk3.png',
            '../img/Skeleton/skeleton07_walk4.png',
            '../img/Skeleton/skeleton08_walk5.png',
            '../img/Skeleton/skeleton09_walk6.png',
        ],
        dragon: [
            '../img/Dragon/dragon04_walk1.png',
            '../img/Dragon/dragon05_walk2.png',
            '../img/Dragon/dragon06_walk3.png',
            '../img/Dragon/dragon07_walk4.png',
            '../img/Dragon/dragon08_walk5.png',
        ],
        ghost: [
            '../img/Ghost/ghost05_walk1.png',
            '../img/Ghost/ghost06_walk2.png',
            '../img/Ghost/ghost07_walk3.png',
            '../img/Ghost/ghost08_walk4.png',
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
        this.loadImages(this.IMAGES_WALKING);
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

    animate() {
        this.movePatrol();

        setInterval(() => {
            let i = this.currentImage % this.IMAGES_WALKING.length;
            let path = this.IMAGES_WALKING[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        }, 100);
    }
}
