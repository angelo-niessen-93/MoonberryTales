class World {
  camera_x = 0;
  levelEndX = 720 * 5;
  projectiles = [];
  isGameOver = false;
  isVictory = false;
  isVictoryPending = false;
  victoryReadyAt = 0;
  bossDefeatEventDispatched = false;

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.character = this.createCharacter();

    this.level = this.createLevel();

    this.enemies = this.level.enemies;
    this.chain = this.level.chain;
    this.tiles = this.level.tiles;
    this.items = this.level.items;
    this.backgroundObjects = this.level.backgroundObjects;

    this.gameOverImage = new Image();
    this.gameOverImage.src = "img/Game-over.png";
    this.victoryImage = new Image();
    this.victoryImage.src = "img/You Win!.png";
    this.gameOverSound = new Audio("audio/game-over-sound.mp3");
    this.gameOverSound.volume = 0.5;
    this.heartCollectSound = new Audio("audio/equipment-pick-up.mp3");
    this.heartCollectSound.volume = 0.5;
    this.coinCollectSound = new Audio("audio/collecting-coins.mp3");
    this.coinCollectSound.volume = 0.5;

    this.gameOverButtons = {
      restart: { width: 130, height: 42, label: "Restart" },
      home: { width: 190, height: 42, label: "Home" },
    };
    this.hasEndboss = this.enemies.some((enemy) => this.isEndboss(enemy));
    this.hud = new HUD();
    this.collisionSystem = new WorldCollisionSystem(this);
    this.renderer = new WorldRenderer(this);

    this.setWorld();
    this.setupGameOverInteraction();
    this.draw();
  }

  createLevel() {
    if (typeof createLevel1 === "function") {
      return createLevel1();
    }
    if (typeof level1 !== "undefined") return level1;

    const tiles = Tiles.createPlatformsForArea(
      -720,
      720 * 5,
      320,
      [170, 230, 290, 350],
    );
    const items = Items.createForLevel(tiles, -720, 720 * 5, 28);

    return new Level(
      Monster.createForLevel(120, 10),
      Myst.createForArea(-720, 720 * 5, 720),
      BackgroundObject.createForArea(-720, 720 * 5, 720, 0),
      tiles,
      items,
    );
  }

  setWorld() {
    this.character.world = this;
    this.enemies.forEach((enemy) => (enemy.world = this));
  }

  setupGameOverInteraction() {
    this.canvas.addEventListener("click", (event) => {
      if (!this.isGameOver && !this.isVictory) {
        return;
      }

      const buttons = this.renderer.getEndScreenButtons();
      const point = this.getCanvasPoint(event);
      if (this.isPointInButton(point, buttons.restart)) {
        this.restartGame();
        return;
      }

      if (this.isPointInButton(point, buttons.home)) {
        window.location.href = "./index.html";
      }
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (!this.isGameOver && !this.isVictory) {
        this.canvas.style.cursor = "default";
        return;
      }

      const buttons = this.renderer.getEndScreenButtons();
      const point = this.getCanvasPoint(event);
      const onRestart = this.isPointInButton(point, buttons.restart);
      const onHome = this.isPointInButton(point, buttons.home);
      this.canvas.style.cursor = onRestart || onHome ? "pointer" : "default";
    });
  }

  getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  createCharacter() {
    const selectedCharacter = localStorage.getItem("selectedCharacter");
    if (selectedCharacter === "Mage") {
      return new Mage();
    }
    if (selectedCharacter === "Rogue") {
      return new Rogue();
    }
    return new Knight();
  }

  restartGame() {
    this.disposeEntity(this.character);
    this.enemies.forEach((enemy) => this.disposeEntity(enemy));
    this.isGameOver = false;
    this.isVictory = false;
    this.isVictoryPending = false;
    this.victoryReadyAt = 0;
    this.bossDefeatEventDispatched = false;
    this.projectiles = [];
    this.hud = new HUD();
    this.resetKeyboardState();
    this.character = this.createCharacter();
    this.level = this.createLevel();
    this.enemies = this.level.enemies;
    this.chain = this.level.chain;
    this.tiles = this.level.tiles;
    this.items = this.level.items;
    this.backgroundObjects = this.level.backgroundObjects;
    this.hasEndboss = this.enemies.some((enemy) => this.isEndboss(enemy));
    this.canvas.style.cursor = "default";
    this.setWorld();
    window.dispatchEvent(new Event("game-restarted"));
  }

  disposeEntity(entity) {
    if (entity && typeof entity.dispose === "function") {
      entity.dispose();
    }
  }

  resetKeyboardState() {
    if (!this.keyboard) {
      return;
    }
    this.keyboard.LEFT = false;
    this.keyboard.RIGHT = false;
    this.keyboard.UP = false;
    this.keyboard.DOWN = false;
    this.keyboard.SPACE = false;
    this.keyboard.SHIFT = false;
  }

  isPointInButton(point, button) {
    return (
      point.x >= button.x &&
      point.x <= button.x + button.width &&
      point.y >= button.y &&
      point.y <= button.y + button.height
    );
  }

  draw = () => {
    if (!this.isGameOver && !this.isVictory) {
      this.collisionSystem.updateProjectiles();
      this.collisionSystem.resolveCharacterGround();
      this.collisionSystem.checkCharacterCollisions();
      this.collisionSystem.checkItemCollections();

      if (this.isBossDefeated()) {
        if (!this.isVictoryPending) {
          this.isVictoryPending = true;
          this.victoryReadyAt = Date.now() + 2000;
          this.notifyBossDefeated();
        }
        if (Date.now() >= this.victoryReadyAt) {
          this.isVictory = true;
          this.isVictoryPending = false;
        }
      } else if (typeof this.character.isDead === "function" && this.character.isDead()) {
        this.isGameOver = true;
        this.playGameOverSound();
      }
    }

    this.renderer.renderFrame();

    requestAnimationFrame(this.draw);
  };

  isEndboss(enemy) {
    if (!enemy) {
      return false;
    }

    if (typeof Endboss !== "undefined" && enemy instanceof Endboss) {
      return true;
    }

    return enemy.constructor?.name === "Endboss";
  }

  isBossDefeated() {
    if (!this.hasEndboss) {
      return false;
    }

    const boss = this.enemies.find((enemy) => this.isEndboss(enemy));
    if (!boss) {
      return true;
    }

    if (typeof boss.isDead === "function") {
      return boss.isDead();
    }

    return false;
  }

  notifyBossDefeated() {
    if (this.bossDefeatEventDispatched) {
      return;
    }
    this.bossDefeatEventDispatched = true;
    window.dispatchEvent(new Event("boss-defeated"));
  }

  playCoinCollectSound() {
    if (!this.coinCollectSound) {
      return;
    }

    this.coinCollectSound.currentTime = 0;
    this.coinCollectSound.play().catch(() => {});
  }

  playHeartCollectSound() {
    if (!this.heartCollectSound) {
      return;
    }

    this.heartCollectSound.currentTime = 0;
    this.heartCollectSound.play().catch(() => {});
  }

  playGameOverSound() {
    if (!this.gameOverSound) {
      return;
    }

    this.gameOverSound.currentTime = 0;
    this.gameOverSound.play().catch(() => {});
  }

}
