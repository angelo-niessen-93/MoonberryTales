/**
 * @file models/fire-projectile.class.js
 */
/**
 * Projectile with limited lifetime and frame animation.
 */
class FireProjectile extends MovableObject {
  othersDirection = false;
  currentFrame = 0;
  isActive = true;
  createdAt = Date.now();
  lifetimeMs = 2000;
  hitboxInset = 10;
  IMAGES_FLYING = [];
  frameIntervalMs = 70;
  loopAnimation = false;
  lastFrameAt = Date.now();

  /**
   * @param {{
   *   x: number,
   *   y: number,
   *   movingLeft?: boolean,
   *   images?: string[],
   *   width?: number,
   *   height?: number,
   *   speed?: number,
   *   lifetimeMs?: number,
   *   hitboxInset?: number,
   *   frameIntervalMs?: number,
   *   loopAnimation?: boolean
   * }} options Projectile initialization.
   */
  constructor({
    x,
    y,
    movingLeft = false,
    images = [],
    width = 80,
    height = 80,
    speed = 8,
    lifetimeMs = 2000,
    hitboxInset = 10,
    frameIntervalMs = 70,
    loopAnimation = false,
  }) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.othersDirection = movingLeft;
    this.speed = movingLeft ? -speed : speed;
    this.lifetimeMs = lifetimeMs;
    this.hitboxInset = hitboxInset;
    this.frameIntervalMs = frameIntervalMs;
    this.loopAnimation = loopAnimation;
    this.IMAGES_FLYING = images;

    if (this.IMAGES_FLYING.length) {
      this.loadImage(this.IMAGES_FLYING[0]);
      this.loadImages(this.IMAGES_FLYING);
    } else {
      this.isActive = false;
    }
  }

  /**
   * Updates position, animation, and lifetime.
   *
   * @param {number} levelEndX Right level boundary.
   * @returns {void}
   */
  update(levelEndX) {
    if (!this.isActive) {
      return;
    }

    this.x += this.speed;
    this.updateAnimationFrame();

    const isOutOfBounds = this.x < -this.width || this.x > levelEndX + this.width;
    const isExpired = Date.now() - this.createdAt > this.lifetimeMs;
    if (isOutOfBounds || isExpired) {
      this.isActive = false;
    }
  }

  /**
   * Advances projectile animation to the next frame.
   *
   * @returns {void}
   */
  updateAnimationFrame() {
    if (!this.IMAGES_FLYING.length) return;
    const now = Date.now();
    if (now - this.lastFrameAt < this.frameIntervalMs) return;
    this.lastFrameAt = now;
    this.advanceAnimationFrame();
    this.img = this.imageCache[this.IMAGES_FLYING[this.currentFrame]];
  }

  /**
   * Runs advanceAnimationFrame.
   */
  advanceAnimationFrame() {
    if (this.loopAnimation) {
      this.currentFrame = (this.currentFrame + 1) % this.IMAGES_FLYING.length;
      return;
    }
    if (this.currentFrame < this.IMAGES_FLYING.length - 1) this.currentFrame++;
  }

  /**
   * Checks collision against another object.
   *
   * @param {{x: number, y: number, width: number, height: number}} other Comparison object.
   * @returns {boolean}
   */
  isColliding(other) {
    const projectile = this.getProjectileHitbox();
    const target = this.getTargetHitbox(other);
    return (
      projectile.x + projectile.width > target.x &&
      projectile.y + projectile.height > target.y &&
      projectile.x < target.x + target.width &&
      projectile.y < target.y + target.height
    );
  }

  /**
   * Runs getProjectileHitbox.
   */
  getProjectileHitbox() {
    const inset = Math.max(0, this.hitboxInset);
    return {
      x: this.x + inset,
      y: this.y + inset,
      width: Math.max(2, this.width - inset * 2),
      height: Math.max(2, this.height - inset * 2),
    };
  }

  /**
   * Runs getTargetHitbox.
   * @param {*} other
   */
  getTargetHitbox(other) {
    if (typeof other.getHitbox === "function") return other.getHitbox();
    return { x: other.x, y: other.y, width: other.width, height: other.height };
  }
}





