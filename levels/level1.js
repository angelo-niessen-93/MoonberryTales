/**
 * @file levels/level1.js
 */
const LEVEL1_CONFIG = {
    world: {
        minX: -720,
        maxX: 720 * 5,
        step: 720,
    },
    monsters: {
        characterStartX: 120,
        count: 10,
        forceType: null,
        attackDamage: 10,
    },
    boss: {
        enabled: true,
        attackDamage: 18,
        energy: 300,
        attackSoundPath: 'audio/boss-attack.mp3',
    },
    chain: {
        imagePath: 'img/Background/myst.png',
        y: 20,
        width: 724,
        height: 480,
        speed: 0.35,
    },
    background: {
        y: 0,
        layerPaths: [
            'img/Background/back_ruin_spots.png',
            'img/Background/ruins_closer.png',
            'img/Background/ruins_low1.png',
            'img/Background/ruins_main.png',
            'img/Background/chains.png',
            'img/Background/floor_ruins.png',
        ],
    },
    tiles: {
        gapX: 320,
        heights: [170, 230, 290, 300],
        platformImages: [
            'img/dark_tiles/dark_tile26.png',
            'img/dark_tiles/dark_tile27.png',
            'img/dark_tiles/dark_tile28.png',
        ],
    },
    items: {
        coinCount: 28,
        heartYOffset: 0,
        lowPlatformYThreshold: 290,
        lowPlatformHeartLift: 18,
        heartImages: [
            'img/Items/heart1.png',
            'img/Items/heart2.png',
            'img/Items/heart3.png',
            'img/Items/heart4.png',
            'img/Items/heart5.png',
            'img/Items/heart6.png',
            'img/Items/heart7.png',
            'img/Items/heart8.png',
            'img/Items/heart9.png',
            'img/Items/heart10.png',
        ],
        coinImages: [
            'img/Items/coin1.png',
            'img/Items/coin2.png',
            'img/Items/coin3.png',
            'img/Items/coin4.png',
            'img/Items/coin5.png',
            'img/Items/coin6.png',
            'img/Items/coin7.png',
            'img/Items/coin8.png',
            'img/Items/coin9.png',
            'img/Items/coin10.png',
        ],
    },
};

/**
 * Runs createLevelFromConfig.
 * @param {*} config
 */
function createLevelFromConfig(config) {
    const bounds = getLevelBounds(config);
    const enemies = createLevelEnemies(config);
    const chain = createLevelChain(config, bounds);
    const backgroundObjects = createLevelBackground(config, bounds);
    const tiles = createLevelTiles(config, bounds);
    const items = createLevelItems(config, bounds, tiles);
    const level = new Level(enemies, chain, backgroundObjects, tiles, items);
    level.levelEndX = config.world.maxX;
    return level;
}

/**
 * Runs getLevelBounds.
 * @param {*} config
 */
function getLevelBounds(config) {
    const minX = config.world.minX;
    const maxX = config.world.maxX;
    const step = config.world.step;
    const bossSpawnMinX = config.boss?.spawnMinX ?? (maxX - 900);
    const blockedAreaPadding = config.boss?.blockedAreaPadding ?? 180;
    const accessibleMaxX = config.boss?.enabled ? Math.max(minX, Math.min(maxX, bossSpawnMinX - blockedAreaPadding)) : maxX;
    return { minX, maxX, step, accessibleMaxX };
}

/**
 * Runs createLevelEnemies.
 * @param {*} config
 */
function createLevelEnemies(config) {
    const enemies = Monster.createForLevel(
        config.monsters.characterStartX,
        config.monsters.count,
        config.monsters,
    );
    if (config.boss?.enabled) enemies.push(new Endboss(null, config.boss));
    return enemies;
}

/**
 * Runs createLevelChain.
 * @param {*} config
 * @param {*} bounds
 */
function createLevelChain(config, bounds) {
    return Myst.createForArea(bounds.minX, bounds.maxX, bounds.step, {
        ...config.chain,
        minLoopX: bounds.minX,
        maxLoopX: bounds.maxX,
    });
}

/**
 * Runs createLevelBackground.
 * @param {*} config
 * @param {*} bounds
 */
function createLevelBackground(config, bounds) {
    return BackgroundObject.createForArea(
        bounds.minX, bounds.maxX, bounds.step, config.background.y, config.background,
    );
}

/**
 * Runs createLevelTiles.
 * @param {*} config
 * @param {*} bounds
 */
function createLevelTiles(config, bounds) {
    return Tiles.createPlatformsForArea(
        bounds.minX, bounds.accessibleMaxX, config.tiles.gapX, config.tiles.heights, config.tiles,
    );
}

/**
 * Runs createLevelItems.
 * @param {*} config
 * @param {*} bounds
 * @param {*} tiles
 */
function createLevelItems(config, bounds, tiles) {
    return Items.createForLevel(tiles, bounds.minX, bounds.accessibleMaxX, config.items.coinCount, {
        ...config.items,
        characterStartX: config.monsters.characterStartX,
        itemMaxX: bounds.accessibleMaxX,
    });
}

/**
 * Runs createLevel1.
 */
function createLevel1() {
    return createLevelFromConfig(LEVEL1_CONFIG);
}

const level1 = createLevel1();




