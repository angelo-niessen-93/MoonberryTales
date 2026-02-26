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
        attackDamage: 30,
        energy: 350,
        attackSoundPath: 'audio/boss-attack.mp3',
    },
    chain: {
        imagePath: 'img/Background/myst.png',
        y: 20,
        width: 720,
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
        heights: [170, 230, 290, 350],
        platformImages: [
            'img/dark_tiles/dark_tile26.png',
            'img/dark_tiles/dark_tile27.png',
            'img/dark_tiles/dark_tile28.png',
        ],
    },
    items: {
        coinCount: 28,
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

function createLevelFromConfig(config) {
    const minX = config.world.minX;
    const maxX = config.world.maxX;
    const step = config.world.step;

    const enemies = Monster.createForLevel(
        config.monsters.characterStartX,
        config.monsters.count,
        config.monsters,
    );

    if (config.boss?.enabled) {
        enemies.push(new Endboss(null, config.boss));
    }

    const chain = Myst.createForArea(minX, maxX, step, {
        ...config.chain,
        minLoopX: minX,
        maxLoopX: maxX,
    });

    const backgroundObjects = BackgroundObject.createForArea(
        minX,
        maxX,
        step,
        config.background.y,
        config.background,
    );

    const tiles = Tiles.createPlatformsForArea(
        minX,
        maxX,
        config.tiles.gapX,
        config.tiles.heights,
        config.tiles,
    );

    const items = Items.createForLevel(
        tiles,
        minX,
        maxX,
        config.items.coinCount,
        config.items,
    );

    return new Level(enemies, chain, backgroundObjects, tiles, items);
}

function createLevel1() {
    return createLevelFromConfig(LEVEL1_CONFIG);
}

const level1 = createLevel1();
