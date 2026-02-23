class Mage extends Character {
    height = 200;
    width = 100;
    y = 230;
    speed = 4;  

    IMAGES_IDLE = [
        'img/Mage/Idle/mage_idle1.png',
        'img/Mage/Idle/mage_idle2.png',
        'img/Mage/Idle/mage_idle3.png',
        'img/Mage/Idle/mage_idle4.png',
        'img/Mage/Idle/mage_idle5.png',
        'img/Mage/Idle/mage_idle6.png',
        'img/Mage/Idle/mage_idle7.png',
        'img/Mage/Idle/mage_idle8.png',
        'img/Mage/Idle/mage_idle9.png',
        'img/Mage/Idle/mage_idle10.png',
        'img/Mage/Idle/mage_idle11.png',
        'img/Mage/Idle/mage_idle12.png',
        'img/Mage/Idle/mage_idle13.png',
        'img/Mage/Idle/mage_idle14.png'
    ];

    IMAGES_WALKING = [
        'img/Mage/Walk/walk1.png',
        'img/Mage/Walk/walk2.png',
        'img/Mage/Walk/walk3.png',
        'img/Mage/Walk/walk4.png',
        'img/Mage/Walk/walk5.png',
        'img/Mage/Walk/walk6.png'
    ];              

    IMAGES_JUMPING = [
        'img/Mage/High_jump/high_jump2.png',
        'img/Mage/High_jump/high_jump3.png',
        'img/Mage/High_jump/high_jump4.png',
        'img/Mage/High_jump/high_jump5.png',
        'img/Mage/High_jump/high_jump6.png',
        'img/Mage/High_jump/high_jump7.png',
        'img/Mage/High_jump/high_jump8.png',
        'img/Mage/High_jump/high_jump9.png',
        'img/Mage/High_jump/high_jump10.png',
        'img/Mage/High_jump/high_jump11.png',
        'img/Mage/High_jump/high_jump12.png'
    ];  

    IMAGES_ATTACKING = [
        'img/Mage/Attack/mage_attack1.png',
        'img/Mage/Attack/mage_attack2.png',
        'img/Mage/Attack/mage_attack3.png',
        'img/Mage/Attack/mage_attack4.png',
        'img/Mage/Attack/mage_attack5.png',
        'img/Mage/Attack/mage_attack6.png',  
        'img/Mage/Attack/mage_attack7.png' 
    ];

    IMAGES_DEAD = [
        'img/Mage/Death/mage_death1.png',
        'img/Mage/Death/mage_death2.png',   
        'img/Mage/Death/mage_death3.png',
        'img/Mage/Death/mage_death4.png',
        'img/Mage/Death/mage_death5.png',
        'img/Mage/Death/mage_death6.png',
        'img/Mage/Death/mage_death7.png',
        'img/Mage/Death/mage_death8.png',
        'img/Mage/Death/mage_death9.png',
        'img/Mage/Death/mage_death10.png',
    ];

    IMAGES_HURT = [
        'img/Mage/Hurt/hurt1.png',
        'img/Mage/Hurt/hurt2.png',
        'img/Mage/Hurt/hurt3.png',
        'img/Mage/Hurt/hurt4.png'
    ];

    attackSound = new Audio('audio/attack_mage.mp3');
    jumpSound = new Audio('audio/classic-jump.mp3');
    footstepSound = new Audio('audio/footstep.mp3');    
    projectiles = [];
    projectileCooldownMs = 350;
    lastProjectileAt = 0;
    projectileStartFrame = 5;
    hasShotInCurrentAttack = false;
    FIRE_PROJECTILE_IMAGES = [
        "img/Mage/Fire/fire1.png",
        "img/Mage/Fire/fire2.png",
        "img/Mage/Fire/fire3.png",
        "img/Mage/Fire/fire4.png",
        "img/Mage/Fire/fire5.png",
        "img/Mage/Fire/fire6.png",
        "img/Mage/Fire/fire7.png",
        "img/Mage/Fire/fire8.png",
        "img/Mage/Fire/fire9.png"
    ];

    constructor() {
        super();
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_ATTACKING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
 }

    startAttack() {
        super.startAttack();
        this.hasShotInCurrentAttack = false;
    }

    playAttackAnimation() {
        const path = this.IMAGES_ATTACKING[this.attackFrame];
        this.img = this.imageCache[path];

        if (this.attackFrame === this.projectileStartFrame && !this.hasShotInCurrentAttack) {
            this.spawnFireProjectile();
            this.hasShotInCurrentAttack = true;
        }

        this.attackFrame++;
        if (this.attackFrame >= this.IMAGES_ATTACKING.length) {
            this.isAttacking = false;
            this.attackFrame = 0;
            this.hasShotInCurrentAttack = false;
        }
    }

    spawnFireProjectile() {
        const now = Date.now();
        if (now - this.lastProjectileAt < this.projectileCooldownMs) {
            return;
        }

        const projectileWidth = 80;
        const projectileHeight = 80;
        const spawnPadding = 8;
        const spawnX = this.othersDirection
            ? this.x + spawnPadding
            : this.x + this.width - projectileWidth - spawnPadding;
        const spawnY = this.y + this.height / 2 - projectileHeight / 2;
        const projectile = new FireProjectile({
            x: spawnX,
            y: spawnY,
            movingLeft: this.othersDirection,
            images: this.FIRE_PROJECTILE_IMAGES,
            width: projectileWidth,
            height: projectileHeight,
            speed: 8,
            lifetimeMs: 2000,
            hitboxInset: 24,
            frameIntervalMs: 60,
            loopAnimation: false,
        });
        this.projectiles.push(projectile);
        this.lastProjectileAt = now;
    }

}
