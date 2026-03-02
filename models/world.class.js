/**
 * @file models/world.class.js
 */

/**
 * Repräsentiert World im Spiel.
 */
class World {
  camera_x = 0;
  levelEndX = 720 * 5;
  projectiles = [];
  isGameOver = false;
  isVictory = false;
  isVictoryPending = false;
  victoryReadyAt = 0;
  bossDefeatEventDispatched = false;
  isPaused = false;
  runStartedAt = Date.now();
  resultSavedForRun = false;

  /**
   * Führt constructor aus.
   * @param {*} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.character = this.createCharacter();
    this.level = this.createLevel();
    this.applyLevelData();
    this.setupMedia();
    this.setupSystems();
    this.setWorld();
    this.setupGameOverInteraction();
    this.draw();
  }

  /**
   * Führt applyLevelData aus.
   */
  applyLevelData() {
    this.enemies = this.level.enemies;
    this.chain = this.level.chain;
    this.tiles = this.level.tiles;
    this.items = this.level.items;
    this.backgroundObjects = this.level.backgroundObjects;
    this.hasEndboss = this.enemies.some((enemy) => this.isEndboss(enemy));
  }

  /**
   * Führt setupMedia aus.
   */
  setupMedia() {
    this.gameOverImage = this.createImage("img/Game-over.png");
    this.victoryImage = this.createImage("img/You Win!.png");
    this.gameOverSound = this.createAudio("audio/game-over-sound.mp3");
    this.heartCollectSound = this.createAudio("audio/equipment-pick-up.mp3");
    this.coinCollectSound = this.createAudio("audio/collecting-coins.mp3");
    this.gameOverButtons = this.createGameOverButtons();
  }

  /**
   * Führt createImage aus.
   * @param {*} path
   */
  createImage(path) {
    const image = new Image();
    image.src = path;
    return image;
  }

  /**
   * Führt createAudio aus.
   * @param {*} path
   * @param {*} volume
   */
  createAudio(path, volume = 0.5) {
    const audio = new Audio(path);
    audio.volume = volume;
    return audio;
  }

  /**
   * Führt createGameOverButtons aus.
   */
  createGameOverButtons() {
    return {
      restart: { width: 250, height: 56, label: "Neustart" },
      home: { width: 250, height: 56, label: "Home" },
    };
  }

  /**
   * Führt setupSystems aus.
   */
  setupSystems() {
    this.hud = new HUD();
    this.collisionSystem = new WorldCollisionSystem(this);
    this.renderer = new WorldRenderer(this);
  }

  /**
   * Führt createLevel aus.
   */
  createLevel() {
    if (typeof createLevel1 === "function") return createLevel1();
    if (typeof level1 !== "undefined") return level1;
    const tiles = Tiles.createPlatformsForArea(-720, 720 * 5, 320, [170, 230, 290, 300]);
    const items = Items.createForLevel(tiles, -720, 720 * 5, 28, { characterStartX: 120 });
    return this.createFallbackLevel(tiles, items);
  }

  /**
   * Führt createFallbackLevel aus.
   * @param {*} tiles
   * @param {*} items
   */
  createFallbackLevel(tiles, items) {
    return new Level(
      Monster.createForLevel(120, 10),
      Myst.createForArea(-720, 720 * 5, 720),
      BackgroundObject.createForArea(-720, 720 * 5, 720, 0),
      tiles,
      items,
    );
  }

  /**
   * Führt setWorld aus.
   */
  setWorld() {
    this.character.world = this;
    this.enemies.forEach((enemy) => (enemy.world = this));
  }

  /**
   * Führt setupGameOverInteraction aus.
   */
  setupGameOverInteraction() {
    this.canvas.addEventListener("click", (event) => this.handleEndScreenClick(event));
    this.canvas.addEventListener("mousemove", (event) => this.handleEndScreenHover(event));
  }

  /**
   * Führt handleEndScreenClick aus.
   * @param {*} event
   */
  handleEndScreenClick(event) {
    if (!this.isEndStateActive()) return;
    const buttons = this.renderer.getEndScreenButtons();
    const point = this.getCanvasPoint(event);
    if (this.isPointInButton(point, buttons.restart)) return this.restartGame();
    if (this.isPointInButton(point, buttons.home)) window.location.href = "./index.html";
  }

  /**
   * Führt handleEndScreenHover aus.
   * @param {*} event
   */
  handleEndScreenHover(event) {
    if (!this.isEndStateActive()) return this.setCanvasCursor("default");
    const buttons = this.renderer.getEndScreenButtons();
    const point = this.getCanvasPoint(event);
    const onRestart = this.isPointInButton(point, buttons.restart);
    const onHome = this.isPointInButton(point, buttons.home);
    this.setCanvasCursor(onRestart || onHome ? "pointer" : "default");
  }

  /**
   * Führt isEndStateActive aus.
   */
  isEndStateActive() {
    return this.isGameOver || this.isVictory;
  }

  /**
   * Führt setCanvasCursor aus.
   * @param {*} cursor
   */
  setCanvasCursor(cursor) {
    this.canvas.style.cursor = cursor;
  }

  /**
   * Führt getCanvasPoint aus.
   * @param {*} event
   */
  getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  /**
   * Führt createCharacter aus.
   */
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

  /**
   * Führt restartGame aus.
   */
  restartGame() {
    this.disposeEntity(this.character);
    this.enemies.forEach((enemy) => this.disposeEntity(enemy));
    this.resetRunState();
    this.resetKeyboardState();
    this.rebuildWorldState();
    this.setCanvasCursor("default");
    this.setWorld();
    window.dispatchEvent(new Event("game-restarted"));
  }

  /**
   * Führt resetRunState aus.
   */
  resetRunState() {
    this.isGameOver = false;
    this.isVictory = false;
    this.isVictoryPending = false;
    this.victoryReadyAt = 0;
    this.bossDefeatEventDispatched = false;
    this.projectiles = [];
    this.runStartedAt = Date.now();
    this.resultSavedForRun = false;
  }

  /**
   * Führt rebuildWorldState aus.
   */
  rebuildWorldState() {
    this.hud = new HUD();
    this.character = this.createCharacter();
    this.level = this.createLevel();
    this.applyLevelData();
  }

  /**
   * Führt disposeEntity aus.
   * @param {*} entity
   */
  disposeEntity(entity) {
    if (entity && typeof entity.dispose === "function") {
      entity.dispose();
    }
  }

  /**
   * Führt resetKeyboardState aus.
   */
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

  /**
   * Führt isPointInButton aus.
   * @param {*} point
   * @param {*} button
   */
  isPointInButton(point, button) {
    return (
      point.x >= button.x &&
      point.x <= button.x + button.width &&
      point.y >= button.y &&
      point.y <= button.y + button.height
    );
  }

  draw = () => {
    if (!this.isPaused && !this.isGameOver && !this.isVictory) {
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
          this.saveRunResult("victory");
        }
      } else if (typeof this.character.isDead === "function" && this.character.isDead()) {
        this.isGameOver = true;
        this.playGameOverSound();
        this.saveRunResult("defeat");
      }
    }

    this.renderer.renderFrame();

    requestAnimationFrame(this.draw);
  };

  /**
   * Führt isEndboss aus.
   * @param {*} enemy
   */
  isEndboss(enemy) {
    if (!enemy) {
      return false;
    }

    if (typeof Endboss !== "undefined" && enemy instanceof Endboss) {
      return true;
    }

    return enemy.constructor?.name === "Endboss";
  }

  /**
   * Führt isBossDefeated aus.
   */
  isBossDefeated() {
    if (!this.hasEndboss) return false;
    const boss = this.enemies.find((enemy) => this.isEndboss(enemy));
    if (!boss) return true;
    if (typeof boss.isDead === "function") return boss.isDead();
    return false;
  }

  /**
   * Führt getActiveEndboss aus.
   */
  getActiveEndboss() {
    if (!this.hasEndboss) return null;
    const boss = this.enemies.find((enemy) => this.isEndboss(enemy));
    if (!boss) return null;
    if (typeof boss.isDead === "function" && boss.isDead()) return null;
    return boss;
  }

  /**
   * Führt notifyBossDefeated aus.
   */
  notifyBossDefeated() {
    if (this.bossDefeatEventDispatched) {
      return;
    }
    this.bossDefeatEventDispatched = true;
    window.dispatchEvent(new Event("boss-defeated"));
  }

  /**
   * Führt playCoinCollectSound aus.
   */
  playCoinCollectSound() {
    if (!this.coinCollectSound) {
      return;
    }

    this.coinCollectSound.currentTime = 0;
    this.coinCollectSound.play().catch(() => {});
  }

  /**
   * Führt playHeartCollectSound aus.
   */
  playHeartCollectSound() {
    if (!this.heartCollectSound) {
      return;
    }

    this.heartCollectSound.currentTime = 0;
    this.heartCollectSound.play().catch(() => {});
  }

  /**
   * Führt playGameOverSound aus.
   */
  playGameOverSound() {
    if (!this.gameOverSound) {
      return;
    }

    this.gameOverSound.currentTime = 0;
    this.gameOverSound.play().catch(() => {});
  }

  /**
   * Führt saveRunResult aus.
   * @param {*} resultType
   */
  saveRunResult(resultType) {
    if (this.resultSavedForRun) return;
    this.resultSavedForRun = true;
    const newEntry = this.buildRunEntry(resultType);
    try {
      const raw = localStorage.getItem("moonberryLeaderboard");
      const list = raw ? JSON.parse(raw) : [];
      const sorted = this.getSortedLeaderboard(list, newEntry);
      localStorage.setItem("moonberryLeaderboard", JSON.stringify(sorted.slice(0, 10)));
    } catch (_) {}
  }

  /**
   * Führt buildRunEntry aus.
   * @param {*} resultType
   */
  buildRunEntry(resultType) {
    const coins = Number.isFinite(this.hud?.coinsCollected) ? this.hud.coinsCollected : 0;
    const duration = Math.max(1, Math.round((Date.now() - this.runStartedAt) / 1000));
    const score = this.calculateRunScore(coins, duration, resultType);
    return {
      name: this.character?.constructor?.name || "Abenteurer",
      result: resultType === "victory" ? "Sieg" : "Niederlage",
      coins,
      duration,
      score,
      playedAt: new Date().toISOString(),
    };
  }

  /**
   * Führt calculateRunScore aus.
   * @param {*} coins
   * @param {*} duration
   * @param {*} resultType
   */
  calculateRunScore(coins, duration, resultType) {
    const victoryBonus = resultType === "victory" ? 5000 : 0;
    return Math.max(0, coins * 100 + victoryBonus - duration * 2);
  }

  /**
   * Führt getSortedLeaderboard aus.
   * @param {*} list
   * @param {*} newEntry
   */
  getSortedLeaderboard(list, newEntry) {
    const safeList = Array.isArray(list) ? list : [];
    safeList.push(newEntry);
    safeList.sort((a, b) => this.compareLeaderboardEntries(a, b));
    return safeList;
  }

  /**
   * Führt compareLeaderboardEntries aus.
   * @param {*} a
   * @param {*} b
   */
  compareLeaderboardEntries(a, b) {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (Number(a.duration) || 0) - (Number(b.duration) || 0);
  }
}



