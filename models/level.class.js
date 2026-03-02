/**
 * @file models/level.class.js
 */
/**
 * Container fÃ¼r alle Objekte eines Levels.
 */
class Level {
    /**
     * @param {object[]} [enemies=[]] Gegnerobjekte.
     * @param {object[]} [chain=[]] Ketten-/Vordergrundobjekte.
     * @param {object[]} [backgroundObjects=[]] Hintergrundobjekte.
     * @param {object[]} [tiles=[]] Plattformkacheln.
     * @param {object[]} [items=[]] Sammelitems.
     */
    constructor(enemies = [], chain = [], backgroundObjects = [], tiles = [], items = []) {
        this.enemies = enemies;
        this.chain = chain;
        this.backgroundObjects = backgroundObjects;
        this.tiles = tiles;
        this.items = items;
    }
}



