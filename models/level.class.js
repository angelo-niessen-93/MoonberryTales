/**
 * @file models/level.class.js
 */
/**
 * Container for all objects in a level.
 */
class Level {
    /**
     * @param {object[]} [enemies=[]] Enemy objects.
     * @param {object[]} [chain=[]] Chain/foreground objects.
     * @param {object[]} [backgroundObjects=[]] Background objects.
     * @param {object[]} [tiles=[]] Platform tiles.
     * @param {object[]} [items=[]] Collectible items.
     */
    constructor(enemies = [], chain = [], backgroundObjects = [], tiles = [], items = []) {
        this.enemies = enemies;
        this.chain = chain;
        this.backgroundObjects = backgroundObjects;
        this.tiles = tiles;
        this.items = items;
    }
}




