function createLevel1() {
    const enemies = [...Monster.createForLevel(120, 10), new Endboss()];
    const chain = Chain.createForArea(-720, 720 * 5, 720);
    const backgroundObjects = BackgroundObject.createForArea(-720, 720 * 5, 720, 0);
    const tiles = Tiles.createPlatformsForArea(-720, 720 * 5, 320, [170, 230, 290, 350]);
    const items = Items.createForLevel(tiles, -720, 720 * 5, 28);

    return new Level(enemies, chain, backgroundObjects, tiles, items);
}

const level1 = createLevel1();
