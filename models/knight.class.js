class Knight extends Character {
    
    height = 200;
    width = 100;
    y = 230;
    speed = 4;

   
    IMAGES_WALKING = [
        'img/Knight/Walk/walk1.png',
        'img/Knight/Walk/walk2.png',
        'img/Knight/Walk/walk3.png',
        'img/Knight/Walk/walk4.png',
        'img/Knight/Walk/walk5.png',
        'img/Knight/Walk/walk6.png'
    ];

    IMAGES_JUMPING = [
        'img/Knight/Jump_high/high_jump2.png',
        'img/Knight/Jump_high/high_jump3.png',
        'img/Knight/Jump_high/high_jump4.png',
        'img/Knight/Jump_high/high_jump5.png',
        'img/Knight/Jump_high/high_jump6.png',
        'img/Knight/Jump_high/high_jump7.png'
    ];

    IMAGES_ATTACKING = [
        'img/Knight/Extra_Attack/attack_extra1.png',
        'img/Knight/Extra_Attack/attack_extra2.png',
        'img/Knight/Extra_Attack/attack_extra3.png',
        'img/Knight/Extra_Attack/attack_extra4.png',
        'img/Knight/Extra_Attack/attack_extra5.png',
        'img/Knight/Extra_Attack/attack_extra6.png',  
        'img/Knight/Extra_Attack/attack_extra7.png',  
        'img/Knight/Extra_Attack/attack_extra8.png',  
    ];

    IMAGES_DEAD = [
        'img/Knight/Death/knight_death1.png',
        'img/Knight/Death/knight_death2.png',
        'img/Knight/Death/knight_death3.png',
        'img/Knight/Death/knight_death4.png',
        'img/Knight/Death/knight_death5.png',
        'img/Knight/Death/knight_death6.png',
        'img/Knight/Death/knight_death7.png',
        'img/Knight/Death/knight_death8.png',
        'img/Knight/Death/knight_death9.png',
        'img/Knight/Death/knight_death10.png',
    ];


    attackSound = new Audio('audio/fight.mp3');
    jumpSound = new Audio('audio/classic-jump.mp3');
    footstepSound = new Audio('audio/footstep.mp3');

    constructor() {
        super();  
      
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_ATTACKING);
        this.loadImages(this.IMAGES_DEAD);
    }
}
