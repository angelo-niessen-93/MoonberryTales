class Monster extends MovableObject {
    y = 320;

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

    constructor(type = null) {
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
        this.speed = 0.15 + Math.random() * 0.25;
        this.x = 200 + Math.random() * 500;
        this.loadImages(this.IMAGES_WALKING);
        this.animate();
    }

    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;

            if (this.x <= -this.width) {
                this.x = 720 + Math.random() * 500;
            }
        }, 1000 / 60);
    }

    animate() {
        this.moveLeft();

        setInterval(() => {
            let i = this.currentImage % this.IMAGES_WALKING.length;
            let path = this.IMAGES_WALKING[i];
            this.img = this.imageCache[path];
            this.currentImage++;
        }, 100);
    }
}


