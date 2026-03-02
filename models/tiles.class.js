/**
 * @file models/tiles.class.js
 */
/**
 * Kachelobjekt für Plattformen inklusive separater Hitbox.
 */
class Tiles extends MovableObject {
  static DEFAULT_SIZE = { width: 64, height: 64 };
  static DEFAULT_HITBOX = { x: 1, y: 50, width: 10, height: 10 };
  static LAYOUT = [];

  /**
   * @param {string} imagePath Bildpfad der Kachel.
   * @param {number} [x=0] X-Position.
   * @param {number} [y=350] Y-Position.
   * @param {number} [width=Tiles.DEFAULT_SIZE.width] Breite.
   * @param {number} [height=Tiles.DEFAULT_SIZE.height] Höhe.
   * @param {{x: number, y: number, width: number, height: number}} [hitbox=Tiles.DEFAULT_HITBOX] Lokale Hitbox.
   */
  constructor(imagePath, x = 0, y = 350, width = Tiles.DEFAULT_SIZE.width, height = Tiles.DEFAULT_SIZE.height, hitbox = Tiles.DEFAULT_HITBOX) {
    super();
    this.loadImage(imagePath);
    this.imagePath = imagePath;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hitbox = { ...hitbox };
  }

  /**
   * Liefert die Welt-Hitbox der Kachel.
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  getHitbox() {
    return {
      x: this.x + this.hitbox.x,
      y: this.y + this.hitbox.y,
      width: this.hitbox.width,
      height: this.hitbox.height,
    };
  }

  /**
   * Erzeugt Kacheln aus einem Layout-Array.
   * @param {Array<{image: string, x: number, y: number, width?: number, height?: number, hitbox?: {x: number, y: number, width: number, height: number}}>} [layout=Tiles.LAYOUT] Layoutdaten.
   * @param {number} [minX=-Infinity] Linke Filtergrenze.
   * @param {number} [maxX=Infinity] Rechte Filtergrenze.
   * @returns {Tiles[]}
   */
  static createFromLayout(layout = Tiles.LAYOUT, minX = -Infinity, maxX = Infinity) {
    return layout.filter((entry) => Tiles.isInHorizontalRange(entry, minX, maxX)).map((entry) => Tiles.createTile(entry));
  }

  /**
   * Führt isInHorizontalRange aus.
   * @param {*} entry
   * @param {*} minX
   * @param {*} maxX
   */
  static isInHorizontalRange(entry, minX, maxX) {
    const width = entry.width ?? Tiles.DEFAULT_SIZE.width;
    return entry.x + width >= minX && entry.x <= maxX;
  }

  /**
   * Führt createTile aus.
   * @param {*} entry
   */
  static createTile(entry) {
    return new Tiles(
      entry.image,
      entry.x,
      entry.y,
      entry.width ?? Tiles.DEFAULT_SIZE.width,
      entry.height ?? Tiles.DEFAULT_SIZE.height,
      entry.hitbox ?? Tiles.DEFAULT_HITBOX,
    );
  }

  /**
   * Erstellt ein wiederholtes Gruppenlayout als Rohdaten.
   * @param {string[]} groupImages Bildpfade für eine Gruppe.
   * @param {number} startX Startposition der ersten Gruppe.
   * @param {number} y Y-Position.
   * @param {number} [count=1] Anzahl Gruppen.
   * @param {number} [gap=0] Abstand zwischen Gruppen.
   * @returns {Array<{image: string, x: number, y: number}>}
   */
  static createRepeatedGroup(groupImages, startX, y, count = 1, gap = 0) {
    const tiles = [];
    for (let i = 0; i < count; i++) {
      const baseX = Tiles.getGroupBaseX(groupImages, startX, i, gap);
      Tiles.pushGroupTiles(tiles, groupImages, baseX, y);
    }
    return tiles;
  }

  /**
   * Führt getGroupBaseX aus.
   * @param {*} groupImages
   * @param {*} startX
   * @param {*} groupIndex
   * @param {*} gap
   */
  static getGroupBaseX(groupImages, startX, groupIndex, gap) {
    const tileWidth = Tiles.DEFAULT_SIZE.width;
    return startX + groupIndex * (groupImages.length * tileWidth + gap);
  }

  /**
   * Führt pushGroupTiles aus.
   * @param {*} target
   * @param {*} groupImages
   * @param {*} baseX
   * @param {*} y
   */
  static pushGroupTiles(target, groupImages, baseX, y) {
    const tileWidth = Tiles.DEFAULT_SIZE.width;
    groupImages.forEach((image, index) => target.push({ image, x: baseX + index * tileWidth, y }));
  }

  /**
   * Erstellt eine einzelne Plattform aus mehreren Tiles.
   * @param {number} [startX=600] X-Startposition.
   * @param {number} [y=350] Y-Position.
   * @param {object} [options={}] Tile-Optionen.
   * @returns {Tiles[]}
   */
  static createPlatform(startX = 600, y = 350, options = {}) {
    const platformImages = options.platformImages ?? Tiles.getDefaultPlatformImages();
    return platformImages.map((imagePath, index) => Tiles.createPlatformTile(imagePath, index, startX, y, options));
  }

  /**
   * Führt getDefaultPlatformImages aus.
   */
  static getDefaultPlatformImages() {
    return [
      "img/dark_tiles/dark_tile26.png",
      "img/dark_tiles/dark_tile27.png",
      "img/dark_tiles/dark_tile28.png",
    ];
  }

  /**
   * Führt createPlatformTile aus.
   * @param {*} imagePath
   * @param {*} index
   * @param {*} startX
   * @param {*} y
   * @param {*} options
   */
  static createPlatformTile(imagePath, index, startX, y, options) {
    return new Tiles(
      imagePath,
      startX + index * Tiles.DEFAULT_SIZE.width,
      y,
      options.tileWidth ?? Tiles.DEFAULT_SIZE.width,
      options.tileHeight ?? Tiles.DEFAULT_SIZE.height,
      options.tileHitbox ?? Tiles.DEFAULT_HITBOX,
    );
  }

  /**
   * Erstellt Plattformen für einen Bereich aus Layout oder generiertem Muster.
   * @param {number} minX Linke Grenze.
   * @param {number} maxX Rechte Grenze.
   * @param {number} [gapX=320] Horizontaler Plattformabstand.
   * @param {number[]} [heights=[170, 230, 290, 350]] Rotierende Plattformhöhen.
   * @param {object} [options={}] Erstellungsoptionen.
   * @returns {Tiles[]}
   */
  static createPlatformsForArea(minX, maxX, gapX = 320, heights = [170, 230, 290, 350], options = {}) {
    const layout = options.layout ?? Tiles.LAYOUT;
    if (Array.isArray(layout) && layout.length) return Tiles.createFromLayout(layout, minX, maxX);
    return Tiles.createGeneratedPlatforms(minX, maxX, gapX, heights, options);
  }

  /**
   * Führt createGeneratedPlatforms aus.
   * @param {*} minX
   * @param {*} maxX
   * @param {*} gapX
   * @param {*} heights
   * @param {*} options
   */
  static createGeneratedPlatforms(minX, maxX, gapX, heights, options) {
    const platforms = [];
    for (let x = minX; x <= maxX; x += gapX) {
      const y = Tiles.getPlatformY(x, minX, gapX, heights);
      platforms.push(...Tiles.createPlatform(x, y, options));
    }
    return platforms;
  }

  /**
   * Führt getPlatformY aus.
   * @param {*} x
   * @param {*} minX
   * @param {*} gapX
   * @param {*} heights
   */
  static getPlatformY(x, minX, gapX, heights) {
    const index = Math.floor((x - minX) / gapX) % heights.length;
    return heights[index];
  }
}

