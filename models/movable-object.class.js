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
      if (window.__moonberryPaused) {
        return;
      }

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
    const thisHitbox =
      typeof this.getHitbox === "function"
        ? this.getHitbox()
        : { x: this.x, y: this.y, width: this.width, height: this.height };
    const otherHitbox =
      typeof other.getHitbox === "function"
        ? other.getHitbox()
        : { x: other.x, y: other.y, width: other.width, height: other.height };

    return (
      thisHitbox.x + thisHitbox.width > otherHitbox.x &&
      thisHitbox.y + thisHitbox.height > otherHitbox.y &&
      thisHitbox.x < otherHitbox.x + otherHitbox.width &&
      thisHitbox.y < otherHitbox.y + otherHitbox.height
    );
  }
}
