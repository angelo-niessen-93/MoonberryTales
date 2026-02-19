class MovableObject {
  x = 120;
  y = 310;
  width = 100;
  height = 150;

  img;
  imageCache = {};
  currentImage = 0;

  speed = 0;
  speedY = 0;
  acceleration = 2;
  othersDirection = false;
  energy = 100;

  takeDamage(amount = 10) {
    this.energy = Math.max(0, this.energy - amount);
  }

  isDead() {
    return this.energy <= 0;
  }

  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 25);
  }

  isAboveGround() {
    return this.y < 260;
  }

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  loadImages(paths) {
    paths.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  playAnimation(images) {
    const index = this.currentImage % images.length;
    this.img = this.imageCache[images[index]];
    this.currentImage++;
  }

  moveRight() {
    this.x += this.speed;
  }

  moveLeft() {
    this.x -= this.speed;

    if (this.x <= -this.width) {
      this.x = 0;
    }
  }

  isColliding(other) {
    const inset = 80;
    return (
      this.x + this.width > other.x + inset &&
      this.y + this.height > other.y + inset &&
      this.x < other.x + other.width - inset &&
      this.y < other.y + other.height - inset
    );
  }
}
