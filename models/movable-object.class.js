/**
 * @file models/movable-object.class.js
 */
/**
 * Basisklasse fÃ¼r bewegliche Spielobjekte mit Animation und Kollision.
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
   * Reduziert die Lebensenergie.
   *
   * @param {number} [amount=10] Schadensmenge.
   * @returns {void}
   */
  takeDamage(amount = 10) {
    this.energy = Math.max(0, this.energy - amount);
  }

  /**
   * PrÃ¼ft, ob das Objekt keine Lebensenergie mehr hat.
   *
   * @returns {boolean}
   */
  isDead() {
    return this.energy <= 0;
  }

  /**
   * Startet die Schwerkraftberechnung.
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
   * StandardprÃ¼fung, ob das Objekt Ã¼ber dem Boden liegt.
   *
   * @returns {boolean}
   */
  isAboveGround() {
    return this.y < 260;
  }

  /**
   * LÃ¤dt ein einzelnes Bild als aktives Sprite.
   *
   * @param {string} path Bildpfad.
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * LÃ¤dt mehrere Bilder in den Cache.
   *
   * @param {string[]} paths Bildpfade.
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
   * Spielt eine zyklische Animation auf Basis des Bild-Caches.
   *
   * @param {string[]} images Frame-Sequenz.
   * @returns {void}
   */
  playAnimation(images) {
    const index = this.currentImage % images.length;
    this.img = this.imageCache[images[index]];
    this.currentImage++;
  }

  /**
   * Bewegt das Objekt nach rechts.
   *
   * @returns {void}
   */
  moveRight() {
    this.x += this.speed;
  }

  /**
   * Bewegt das Objekt nach links.
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
   * PrÃ¼ft AABB-Kollision mit optionalen individuellen Hitboxen.
   *
   * @param {{x: number, y: number, width: number, height: number, getHitbox?: Function}} other Vergleichsobjekt.
   * @returns {boolean}
   */
  isColliding(other) {
    const thisHitbox = this.getCollisionHitbox(this);
    const otherHitbox = this.getCollisionHitbox(other);
    return this.isAabbOverlap(thisHitbox, otherHitbox);
  }

  /**
   * Führt getCollisionHitbox aus.
   * @param {*} target
   */
  getCollisionHitbox(target) {
    if (typeof target.getHitbox === "function") return target.getHitbox();
    return { x: target.x, y: target.y, width: target.width, height: target.height };
  }

  /**
   * Führt isAabbOverlap aus.
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



