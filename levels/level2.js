/**
 * @file levels/level2.js
 */
const LEVEL2_CONFIG = {
    floorY: 426,
    world: {
        minX: -720,
        maxX: 720 * 5,
        step: 720,
    },
    monsters: {
        characterStartX: 120,
        groups: [
            { count: 3, forceType: "spider", attackDamage: 5, attackCooldownMs: 1300, patrolHalfRange: 170, jitterRange: 120, noSpawnEndBuffer: 1400 },
            { count: 3, forceType: "dino", attackDamage: 10, patrolHalfRange: 220, jitterRange: 130, minSpawnX: 900, noSpawnEndBuffer: 1400 },
            { count: 2, forceType: "ent", attackDamage: 12, patrolHalfRange: 240, jitterRange: 110, minSpawnX: 1700, noSpawnEndBuffer: 1400 },
        ],
    },
    boss: {
        enabled: true,
        attackDamage: 12,
        energy: 340,
        speed: 1.6,
        width: 300,
        height: 420,
        y: 94,
        patrolRange: 220,
        spawnMinX: 720 * 5 - 1200,
        spawnMaxX: 720 * 5 - 420,
        attackSoundPath: "audio/boss-attack.mp3",
        walkingImages: [
            "img/level2img/endboss/Walk1.png",
            "img/level2img/endboss/Walk2.png",
            "img/level2img/endboss/Walk3.png",
            "img/level2img/endboss/Walk4.png",
            "img/level2img/endboss/Walk5.png",
            "img/level2img/endboss/Walk6.png",
        ],
        attackImages: [
            "img/level2img/endboss/Attack1.png",
            "img/level2img/endboss/Attack2.png",
            "img/level2img/endboss/Attack3.png",
            "img/level2img/endboss/Attack4.png",
            "img/level2img/endboss/Attack5.png",
            "img/level2img/endboss/Attack6.png",
            "img/level2img/endboss/Attack7.png",
        ],
        hurtImages: [
            "img/level2img/endboss/Hurt1.png",
            "img/level2img/endboss/Hurt2.png",
        ],
        deadImages: [
            "img/level2img/endboss/Death0.png",
            "img/level2img/endboss/Death1.png",
            "img/level2img/endboss/Death01.png",
            "img/level2img/endboss/Death2.png",
            "img/level2img/endboss/Death3.png",
            "img/level2img/endboss/Death4.png",
        ],
    },
    chain: {
        imagePath: "img/level2img/coluds_small.png",
        y: 12,
        width: 724,
        height: 480,
        speed: 0.2,
    },
    background: {
        y: 0,
        layerPaths: [
            "img/level2img/sky.png",
            "img/level2img/clouds_back_layer2.png",
            "img/level2img/clouds_back_layer1.png",
            "img/level2img/mountains.png",
            "img/level2img/trees.png",
        ],
    },
    tiles: {
        gapX: 280,
        heights: [120, 170, 220, 150, 250, 190],
        tileHitbox: { x: 2, y: 24, width: 60, height: 14 },
        platformImages: [
            "img/level2img/Ground_grass_0020_tile.png",
            "img/level2img/Ground_grass_0024_tile.png",
            "img/level2img/Ground_grass_0016_tile.png",
        ],
    },
    floorDecoration: {
        imagePath: "img/level2img/Ground_grass_0001_tile.png",
        y: 416,
        tileWidth: 84,
        tileHeight: 64,
    },
    items: {
        coinCount: 40,
        heartYOffset: -4,
        lowPlatformYThreshold: 300,
        lowPlatformHeartLift: 18,
        heartImages: [
            "img/Items/heart1.png",
            "img/Items/heart2.png",
            "img/Items/heart3.png",
            "img/Items/heart4.png",
            "img/Items/heart5.png",
            "img/Items/heart6.png",
            "img/Items/heart7.png",
            "img/Items/heart8.png",
            "img/Items/heart9.png",
            "img/Items/heart10.png",
        ],
        coinImages: [
            "img/Items/coin1.png",
            "img/Items/coin2.png",
            "img/Items/coin3.png",
            "img/Items/coin4.png",
            "img/Items/coin5.png",
            "img/Items/coin6.png",
            "img/Items/coin7.png",
            "img/Items/coin8.png",
            "img/Items/coin9.png",
            "img/Items/coin10.png",
        ],
    },
};

/**
 * Runs createLevel2FromConfig.
 * @param {*} config
 */
function createLevel2FromConfig(config) {
    const bounds = getLevel2Bounds(config);
    const enemies = createLevel2Enemies(config, bounds);
    const chain = createLevel2Chain(config, bounds);
    const background = createLevel2Background(config, bounds);
    const floor = createLevel2FloorDecoration(config, bounds);
    const tiles = createLevel2Tiles(config, bounds);
    const items = createLevel2Items(config, bounds, tiles);
    const level = new Level(enemies, chain, [...background, ...floor], tiles, items);
    level.floorY = config.floorY ?? 445;
    level.levelEndX = config.world.maxX;
    return level;
}

/**
 * Runs getLevel2Bounds.
 * @param {*} config
 */
function getLevel2Bounds(config) {
    const minX = config.world.minX;
    const maxX = config.world.maxX;
    const step = config.world.step;
    const bossSpawnMinX = config.boss?.spawnMinX ?? (maxX - 1000);
    const blockedAreaPadding = config.boss?.blockedAreaPadding ?? 220;
    const accessibleMaxX = config.boss?.enabled ? Math.max(minX, Math.min(maxX, bossSpawnMinX - blockedAreaPadding)) : maxX;
    return { minX, maxX, step, accessibleMaxX };
}

/**
 * Runs createLevel2Enemies.
 * @param {*} config
 * @param {*} bounds
 */
function createLevel2Enemies(config, bounds) {
    const enemies = [];
    config.monsters.groups.forEach((group) => {
        const options = { ...group, characterStartX: config.monsters.characterStartX, levelEndX: bounds.maxX };
        enemies.push(...Monster.createForLevel(config.monsters.characterStartX, group.count, options));
    });
    if (config.boss?.enabled) enemies.push(new Endboss(null, config.boss));
    return enemies;
}

/**
 * Runs createLevel2Chain.
 * @param {*} config
 * @param {*} bounds
 */
function createLevel2Chain(config, bounds) {
    return Myst.createForArea(bounds.minX, bounds.maxX, bounds.step, {
        ...config.chain,
        minLoopX: bounds.minX,
        maxLoopX: bounds.maxX,
    });
}

/**
 * Runs createLevel2Background.
 * @param {*} config
 * @param {*} bounds
 */
function createLevel2Background(config, bounds) {
    return BackgroundObject.createForArea(
        bounds.minX, bounds.maxX, bounds.step, config.background.y, config.background,
    );
}

/**
 * Runs createLevel2FloorDecoration.
 * @param {*} config
 * @param {*} bounds
 */
function createLevel2FloorDecoration(config, bounds) {
    const floor = config.floorDecoration;
    if (!floor?.imagePath) return [];
    const tiles = [];
    const visualEndX = bounds.maxX + 720;
    for (let x = bounds.minX; x <= visualEndX + floor.tileWidth; x += floor.tileWidth) {
        tiles.push(new BackgroundObject(floor.imagePath, x, floor.y, { width: floor.tileWidth, height: floor.tileHeight }));
    }
    return tiles;
}

/**
 * Runs createLevel2Tiles.
 * @param {*} config
 * @param {*} bounds
 */
function createLevel2Tiles(config, bounds) {
    return Tiles.createPlatformsForArea(
        bounds.minX, bounds.accessibleMaxX, config.tiles.gapX, config.tiles.heights, config.tiles,
    );
}

/**
 * Runs createLevel2Items.
 * @param {*} config
 * @param {*} bounds
 * @param {*} tiles
 */
function createLevel2Items(config, bounds, tiles) {
    return Items.createForLevel(tiles, bounds.minX, bounds.accessibleMaxX, config.items.coinCount, {
        ...config.items,
        characterStartX: config.monsters.characterStartX,
        itemMaxX: bounds.accessibleMaxX,
    });
}

/**
 * Runs createLevel2.
 */
function createLevel2() {
    return createLevel2FromConfig(LEVEL2_CONFIG);
}

const level2 = createLevel2();
