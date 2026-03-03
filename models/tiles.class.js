/**
 * @file models/tiles.class.js
 */
/**
 * Tile object for platforms including a separate hitbox.
 */
class Tiles extends MovableObject {
  static DEFAULT_SIZE = { width: 64, height: 64 };
  static DEFAULT_HITBOX = { x: 2, y: 36, width: 60, height: 14 };
  static PLATFORM_Y_OFFSET = 8;
  static LAYOUT = [];

  /**
   * @param {string} imagePath Tile image path.
   * @param {number} [x=0] X position.
   * @param {number} [y=350] Y position.
   * @param {number} [width=Tiles.DEFAULT_SIZE.width] Width.
   * @param {number} [height=Tiles.DEFAULT_SIZE.height] Height.
   * @param {{x: number, y: number, width: number, height: number}} [hitbox=Tiles.DEFAULT_HITBOX] Local hitbox.
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
   * Returns the world hitbox of the tile.
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
   * Creates tiles from a layout array.
   * @param {Array<{image: string, x: number, y: number, width?: number, height?: number, hitbox?: {x: number, y: number, width: number, height: number}}>} [layout=Tiles.LAYOUT] Layout data.
   * @param {number} [minX=-Infinity] Left filter boundary.
   * @param {number} [maxX=Infinity] Right filter boundary.
   * @returns {Tiles[]}
   */
  static createFromLayout(layout = Tiles.LAYOUT, minX = -Infinity, maxX = Infinity) {
    return layout.filter((entry) => Tiles.isInHorizontalRange(entry, minX, maxX)).map((entry) => Tiles.createTile(entry));
  }

  /**
   * Runs isInHorizontalRange.
   * @param {*} entry
   * @param {*} minX
   * @param {*} maxX
   */
  static isInHorizontalRange(entry, minX, maxX) {
    const width = entry.width ?? Tiles.DEFAULT_SIZE.width;
    return entry.x + width >= minX && entry.x <= maxX;
  }

  /**
   * Runs createTile.
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
   * Creates a repeated group layout as raw data.
   * @param {string[]} groupImages Image paths for one group.
   * @param {number} startX Start position of the first group.
   * @param {number} y Y position.
   * @param {number} [count=1] Number of groups.
   * @param {number} [gap=0] Spacing between groups.
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
   * Runs getGroupBaseX.
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
   * Runs pushGroupTiles.
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
   * Creates a single platform from multiple tiles.
   * @param {number} [startX=600] X start position.
   * @param {number} [y=350] Y position.
   * @param {object} [options={}] Tile options.
   * @returns {Tiles[]}
   */
  static createPlatform(startX = 600, y = 350, options = {}) {
    const platformImages = options.platformImages ?? Tiles.getDefaultPlatformImages();
    return platformImages.map((imagePath, index) => Tiles.createPlatformTile(imagePath, index, startX, y, options));
  }

  /**
   * Runs getDefaultPlatformImages.
   */
  static getDefaultPlatformImages() {
    return [
      "img/dark_tiles/dark_tile26.png",
      "img/dark_tiles/dark_tile27.png",
      "img/dark_tiles/dark_tile28.png",
    ];
  }

  /**
   * Runs createPlatformTile.
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
      y + Tiles.PLATFORM_Y_OFFSET,
      options.tileWidth ?? Tiles.DEFAULT_SIZE.width,
      options.tileHeight ?? Tiles.DEFAULT_SIZE.height,
      options.tileHitbox ?? Tiles.DEFAULT_HITBOX,
    );
  }

  /**
   * Creates platforms for an area from layout or generated pattern.
   * @param {number} minX Left boundary.
   * @param {number} maxX Right boundary.
   * @param {number} [gapX=320] Horizontal platform spacing.
   * @param {number[]} [heights=[170, 230, 290, 350]] Rotating platform heights.
   * @param {object} [options={}] Creation options.
   * @returns {Tiles[]}
   */
  static createPlatformsForArea(minX, maxX, gapX = 320, heights = [170, 230, 290, 350], options = {}) {
    const layout = options.layout ?? Tiles.LAYOUT;
    if (Array.isArray(layout) && layout.length) return Tiles.createFromLayout(layout, minX, maxX);
    return Tiles.createGeneratedPlatforms(minX, maxX, gapX, heights, options);
  }

  /**
   * Runs createGeneratedPlatforms.
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
   * Runs getPlatformY.
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



