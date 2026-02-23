class Rogue extends Character {
  height = 200;
  width = 100;
  y = 230;
  speed = 4;

  IMAGES_IDLE = [
    'img/Rogue/Idle/rogue_idle1.png',
    'img/Rogue/Idle/rogue_idle2.png',
    'img/Rogue/Idle/rogue_idle3.png',
    'img/Rogue/Idle/rogue_idle4.png',
    'img/Rogue/Idle/rogue_idle5.png',
    'img/Rogue/Idle/rogue_idle6.png',
    'img/Rogue/Idle/rogue_idle7.png',
    'img/Rogue/Idle/rogue_idle8.png',
    'img/Rogue/Idle/rogue_idle9.png',
    'img/Rogue/Idle/rogue_idle10.png',
    'img/Rogue/Idle/rogue_idle11.png',
    'img/Rogue/Idle/rogue_idle12.png',
    'img/Rogue/Idle/rogue_idle13.png',
    'img/Rogue/Idle/rogue_idle14.png',
    'img/Rogue/Idle/rogue_idle15.png',
    'img/Rogue/Idle/rogue_idle16.png',
    'img/Rogue/Idle/rogue_idle17.png',
    'img/Rogue/Idle/rogue_idle18.png'
  ];

  IMAGES_WALKING = [
    "img/Rogue/Walk/walk1.png",
    "img/Rogue/Walk/walk2.png",
    "img/Rogue/Walk/walk3.png",
    "img/Rogue/Walk/walk4.png",
    "img/Rogue/Walk/walk5.png",
    "img/Rogue/Walk/walk6.png",
  ];

  IMAGES_JUMPING = [
    "img/Rogue/High_Jump/high_jump2.png",
    "img/Rogue/High_Jump/high_jump3.png",
    "img/Rogue/High_Jump/high_jump4.png",
    "img/Rogue/High_Jump/high_jump5.png",
    "img/Rogue/High_Jump/high_jump6.png",
    "img/Rogue/High_Jump/high_jump7.png",
    "img/Rogue/High_Jump/high_jump8.png",
    "img/Rogue/High_Jump/high_jump9.png",
    "img/Rogue/High_Jump/high_jump10.png",
    "img/Rogue/High_Jump/high_jump11.png",
    "img/Rogue/High_Jump/high_jump12.png",
  ];

  IMAGES_ATTACKING = [
    "img/Rogue/Attack/rogue_Attack1.png",
    "img/Rogue/Attack/rogue_Attack2.png",
    "img/Rogue/Attack/rogue_Attack3.png",
    "img/Rogue/Attack/rogue_Attack4.png",
    "img/Rogue/Attack/rogue_Attack5.png",
    "img/Rogue/Attack/rogue_Attack6.png",
    "img/Rogue/Attack/rogue_Attack7.png",
  ];

  IMAGES_DEAD = [
    "img/Rogue/Death/rogue_death1.png",
    "img/Rogue/Death/rogue_death2.png",
    "img/Rogue/Death/rogue_death3.png",
    "img/Rogue/Death/rogue_death4.png",
    "img/Rogue/Death/rogue_death5.png",
    "img/Rogue/Death/rogue_death6.png",
    "img/Rogue/Death/rogue_death7.png",
    "img/Rogue/Death/rogue_death8.png",
    "img/Rogue/Death/rogue_death9.png",
    "img/Rogue/Death/rogue_death10.png",
  ];

  attackSound = new Audio("audio/fight.mp3");
  jumpSound = new Audio("audio/classic-jump.mp3");
  footstepSound = new Audio("audio/footstep.mp3");

  constructor() {
    super();
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_DEAD);
  }
}
