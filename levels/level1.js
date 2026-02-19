const enemies = [...Monster.createForLevel(120, 10), new Endboss()];
const chain = Chain.createForArea(-720, 720 * 5, 720);
const backgroundObjects = BackgroundObject.createForArea(-720, 720 * 5, 720, 0);
const tiles = Tiles.createPlatformsForArea(-720, 720 * 5, 320, [170, 230, 290, 350]);

const level1 = new Level(enemies, chain, backgroundObjects, tiles);

