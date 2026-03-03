/**
 * @file models/movable-object.class.js
 */
/**
 * Base class for movable game objects with animation and collision.
 */
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

  /**
   * Reduces health.
   *
   * @param {number} [amount=10] Damage amount.
   * @returns {void}
   */
  takeDamage(amount = 10) {
    this.energy = Math.max(0, this.energy - amount);
  }

  /**
   * Checks whether the object has no health left.
   *
   * @returns {boolean}
   */
  isDead() {
    return this.energy <= 0;
  }

  /**
   * Starts gravity simulation.
   *
   * @returns {void}
   */
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

  /**
   * Default check whether the object is above the ground.
   *
   * @returns {boolean}
   */
  isAboveGround() {
    return this.y < 260;
  }

  /**
   * Loads a single image as the active sprite.
   *
   * @param {string} path Image path.
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Loads multiple images into the cache.
   *
   * @param {string[]} paths Image paths.
   * @returns {void}
   */
  loadImages(paths) {
    paths.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  /**
   * Plays a cyclic animation based on the image cache.
   *
   * @param {string[]} images Frame sequence.
   * @returns {void}
   */
  playAnimation(images) {
    const index = this.currentImage % images.length;
    this.img = this.imageCache[images[index]];
    this.currentImage++;
  }

  /**
   * Moves the object to the right.
   *
   * @returns {void}
   */
  moveRight() {
    this.x += this.speed;
  }

  /**
   * Moves the object to the left.
   *
   * @returns {void}
   */
  moveLeft() {
    this.x -= this.speed;

    if (this.x <= -this.width) {
      this.x = 0;
    }
  }

  /**
   * Checks AABB collision with optional custom hitboxes.
   *
   * @param {{x: number, y: number, width: number, height: number, getHitbox?: Function}} other Comparison object.
   * @returns {boolean}
   */
  isColliding(other) {
    const thisHitbox = this.getCollisionHitbox(this);
    const otherHitbox = this.getCollisionHitbox(other);
    return this.isAabbOverlap(thisHitbox, otherHitbox);
  }

  /**
   * Runs getCollisionHitbox.
   * @param {*} target
   */
  getCollisionHitbox(target) {
    if (typeof target.getHitbox === "function") return target.getHitbox();
    return { x: target.x, y: target.y, width: target.width, height: target.height };
  }

  /**
   * Runs isAabbOverlap.
   * @param {*} a
   * @param {*} b
   */
  isAabbOverlap(a, b) {
    return (
      a.x + a.width > b.x &&
      a.y + a.height > b.y &&
      a.x < b.x + b.width &&
      a.y < b.y + b.height
    );
  }
}




