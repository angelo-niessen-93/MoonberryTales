/**
 * @file models/fire-projectile.class.js
 */
/**
 * Projektil mit begrenzter Lebensdauer und Frame-Animation.
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
   * }} options Projektil-Initialisierung.
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
   * Aktualisiert Position, Animation und Lebensdauer.
   *
   * @param {number} levelEndX Rechte Levelgrenze.
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
   * Schaltet die Projektile-Animation auf das nÃ¤chste Frame.
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
   * Führt advanceAnimationFrame aus.
   */
  advanceAnimationFrame() {
    if (this.loopAnimation) {
      this.currentFrame = (this.currentFrame + 1) % this.IMAGES_FLYING.length;
      return;
    }
    if (this.currentFrame < this.IMAGES_FLYING.length - 1) this.currentFrame++;
  }

  /**
   * PrÃ¼ft eine Kollision gegen ein anderes Objekt.
   *
   * @param {{x: number, y: number, width: number, height: number}} other Vergleichsobjekt.
   * @returns {boolean}
   */
  isColliding(other) {
    const inset = this.hitboxInset;
    return (
      this.x + this.width > other.x + inset &&
      this.y + this.height > other.y + inset &&
      this.x < other.x + other.width - inset &&
      this.y < other.y + other.height - inset
    );
  }
}



