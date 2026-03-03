/**
 * @file models/world.class.js
 */

/**
 * Represents World in the game.
 */
class World {
  static LEVEL_STORAGE_KEY = "selectedLevel";
  camera_x = 0;
  levelEndX = 720 * 5;
  projectiles = [];
  enemyProjectiles = [];
  isGameOver = false;
  isVictory = false;
  isVictoryPending = false;
  victoryReadyAt = 0;
  bossDefeatEventDispatched = false;
  isPaused = false;
  runStartedAt = Date.now();
  resultSavedForRun = false;

  /**
   * Runs constructor.
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
   * Runs applyLevelData.
   */
  applyLevelData() {
    this.enemies = this.level.enemies;
    this.chain = this.level.chain;
    this.tiles = this.level.tiles;
    this.items = this.level.items;
    this.backgroundObjects = this.level.backgroundObjects;
    this.levelEndX = this.level.levelEndX ?? (720 * 5);
    this.hasEndboss = this.enemies.some((enemy) => this.isEndboss(enemy));
  }

  /**
   * Runs setupMedia.
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
   * Runs createImage.
   * @param {*} path
   */
  createImage(path) {
    const image = new Image();
    image.src = path;
    return image;
  }

  /**
   * Runs createAudio.
   * @param {*} path
   * @param {*} volume
   */
  createAudio(path, volume = 0.5) {
    const audio = new Audio(path);
    audio.volume = volume;
    return audio;
  }

  /**
   * Runs createGameOverButtons.
   */
  createGameOverButtons() {
    return {
      continue: { id: "continue", width: 250, height: 56, label: "Weiter" },
      restart: { id: "restart", width: 250, height: 56, label: "Neustart" },
      home: { id: "home", width: 250, height: 56, label: "Home" },
    };
  }

  /**
   * Runs setupSystems.
   */
  setupSystems() {
    this.hud = new HUD();
    this.collisionSystem = new WorldCollisionSystem(this);
    this.renderer = new WorldRenderer(this);
  }

  /**
   * Runs createLevel.
   */
  createLevel() {
    const selectedLevel = this.getSelectedLevelId();
    const creators = this.getLevelCreators();
    if (typeof creators[selectedLevel] === "function") {
      const selected = creators[selectedLevel]();
      if (selected) return selected;
    }
    if (typeof creators.level1 === "function") {
      const level = creators.level1();
      if (level) return level;
    }
    const tiles = Tiles.createPlatformsForArea(-720, 720 * 5, 320, [170, 230, 290, 300]);
    const items = Items.createForLevel(tiles, -720, 720 * 5, 28, { characterStartX: 120 });
    return this.createFallbackLevel(tiles, items);
  }

  /**
   * Runs getSelectedLevelId.
   */
  getSelectedLevelId() {
    const queryLevel = new URLSearchParams(window.location.search).get("level");
    if (String(queryLevel).toLowerCase() === "level2" || queryLevel === "2") return "level2";
    return "level1";
  }

  /**
   * Runs getLevelCreators.
   */
  getLevelCreators() {
    return {
      level1: typeof createLevel1 === "function" ? createLevel1 : (() => (typeof level1 !== "undefined" ? level1 : null)),
      level2: typeof createLevel2 === "function" ? createLevel2 : (() => (typeof level2 !== "undefined" ? level2 : null)),
    };
  }

  /**
   * Runs createFallbackLevel.
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
   * Runs setWorld.
   */
  setWorld() {
    this.character.world = this;
    this.enemies.forEach((enemy) => (enemy.world = this));
  }

  /**
   * Runs setupGameOverInteraction.
   */
  setupGameOverInteraction() {
    this.canvas.addEventListener("click", (event) => this.handleEndScreenClick(event));
    this.canvas.addEventListener("mousemove", (event) => this.handleEndScreenHover(event));
  }

  /**
   * Runs handleEndScreenClick.
   * @param {*} event
   */
  handleEndScreenClick(event) {
    if (!this.isEndStateActive()) return;
    const buttons = this.renderer.getEndScreenButtons();
    const point = this.getCanvasPoint(event);
    const hit = buttons.find((button) => this.isPointInButton(point, button));
    if (!hit) return;
    if (hit.id === "continue") return this.startNextLevel();
    if (hit.id === "restart") return this.restartGame();
    if (hit.id === "home") window.location.href = "./index.html";
  }

  /**
   * Runs handleEndScreenHover.
   * @param {*} event
   */
  handleEndScreenHover(event) {
    if (!this.isEndStateActive()) return this.setCanvasCursor("default");
    const buttons = this.renderer.getEndScreenButtons();
    const point = this.getCanvasPoint(event);
    const onButton = buttons.some((button) => this.isPointInButton(point, button));
    this.setCanvasCursor(onButton ? "pointer" : "default");
  }

  /**
   * Runs shouldShowContinueButton.
   */
  shouldShowContinueButton() {
    return this.isVictory && this.getSelectedLevelId() === "level1";
  }

  /**
   * Runs startNextLevel.
   */
  startNextLevel() {
    sessionStorage.setItem("showLoadingScreen", "1");
    window.location.href = "./game.html?level=2";
  }

  /**
   * Runs isEndStateActive.
   */
  isEndStateActive() {
    return this.isGameOver || this.isVictory;
  }

  /**
   * Runs setCanvasCursor.
   * @param {*} cursor
   */
  setCanvasCursor(cursor) {
    this.canvas.style.cursor = cursor;
  }

  /**
   * Runs getCanvasPoint.
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
   * Runs createCharacter.
   */
  createCharacter() {
    const selectedCharacter = localStorage.getItem("selectedCharacter");
    const character = selectedCharacter === "Mage" ? new Mage() : selectedCharacter === "Rogue" ? new Rogue() : new Knight();
    this.applyLevelCharacterSpawnOffset(character);
    return character;
  }

  /**
   * Runs applyLevelCharacterSpawnOffset.
   * @param {*} character
   */
  applyLevelCharacterSpawnOffset(character) {
    if (this.getSelectedLevelId() !== "level2") return;
    character.y = Math.max(0, character.y - 44);
  }

  /**
   * Runs restartGame.
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
   * Runs resetRunState.
   */
  resetRunState() {
    this.isGameOver = false;
    this.isVictory = false;
    this.isVictoryPending = false;
    this.victoryReadyAt = 0;
    this.bossDefeatEventDispatched = false;
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.runStartedAt = Date.now();
    this.resultSavedForRun = false;
  }

  /**
   * Runs rebuildWorldState.
   */
  rebuildWorldState() {
    this.hud = new HUD();
    this.character = this.createCharacter();
    this.level = this.createLevel();
    this.applyLevelData();
  }

  /**
   * Runs disposeEntity.
   * @param {*} entity
   */
  disposeEntity(entity) {
    if (entity && typeof entity.dispose === "function") {
      entity.dispose();
    }
  }

  /**
   * Runs resetKeyboardState.
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
   * Runs isPointInButton.
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

  /**
   * Runs draw.
   */
  draw = () => {
    this.updateWorldState();
    this.renderer.renderFrame();
    requestAnimationFrame(this.draw);
  };

  /**
   * Runs updateWorldState.
   */
  updateWorldState() {
    if (this.isPaused || this.isGameOver || this.isVictory) return;
    this.collisionSystem.updateProjectiles();
    this.collisionSystem.resolveCharacterGround();
    this.collisionSystem.checkCharacterCollisions();
    this.collisionSystem.checkItemCollections();
    this.updateRunOutcome();
  }

  /**
   * Runs updateRunOutcome.
   */
  updateRunOutcome() {
    if (this.isBossDefeated()) return this.updateVictoryState();
    if (typeof this.character.isDead === "function" && this.character.isDead()) this.updateDefeatState();
  }

  /**
   * Runs updateVictoryState.
   */
  updateVictoryState() {
    if (!this.isVictoryPending) this.startVictoryCountdown();
    if (Date.now() < this.victoryReadyAt) return;
    this.isVictory = true;
    this.isVictoryPending = false;
    this.saveRunResult("victory");
  }

  /**
   * Runs startVictoryCountdown.
   */
  startVictoryCountdown() {
    this.isVictoryPending = true;
    this.victoryReadyAt = Date.now() + 2000;
    this.notifyBossDefeated();
  }

  /**
   * Runs updateDefeatState.
   */
  updateDefeatState() {
    this.isGameOver = true;
    this.playGameOverSound();
    this.saveRunResult("defeat");
  }

  /**
   * Runs isEndboss.
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
   * Runs isBossDefeated.
   */
  isBossDefeated() {
    if (!this.hasEndboss) return false;
    const boss = this.enemies.find((enemy) => this.isEndboss(enemy));
    if (!boss) return true;
    if (typeof boss.isDead === "function") return boss.isDead();
    return false;
  }

  /**
   * Runs getActiveEndboss.
   */
  getActiveEndboss() {
    if (!this.hasEndboss) return null;
    const boss = this.enemies.find((enemy) => this.isEndboss(enemy));
    if (!boss) return null;
    if (typeof boss.isDead === "function" && boss.isDead()) return null;
    return boss;
  }

  /**
   * Runs notifyBossDefeated.
   */
  notifyBossDefeated() {
    if (this.bossDefeatEventDispatched) {
      return;
    }
    this.bossDefeatEventDispatched = true;
    window.dispatchEvent(new Event("boss-defeated"));
  }

  /**
   * Runs playCoinCollectSound.
   */
  playCoinCollectSound() {
    if (!this.coinCollectSound) {
      return;
    }

    this.coinCollectSound.currentTime = 0;
    this.coinCollectSound.play().catch(() => {});
  }

  /**
   * Runs playHeartCollectSound.
   */
  playHeartCollectSound() {
    if (!this.heartCollectSound) {
      return;
    }

    this.heartCollectSound.currentTime = 0;
    this.heartCollectSound.play().catch(() => {});
  }

  /**
   * Runs playGameOverSound.
   */
  playGameOverSound() {
    if (!this.gameOverSound) {
      return;
    }

    this.gameOverSound.currentTime = 0;
    this.gameOverSound.play().catch(() => {});
  }

  /**
   * Runs saveRunResult.
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
   * Runs buildRunEntry.
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
   * Runs calculateRunScore.
   * @param {*} coins
   * @param {*} duration
   * @param {*} resultType
   */
  calculateRunScore(coins, duration, resultType) {
    const victoryBonus = resultType === "victory" ? 5000 : 0;
    return Math.max(0, coins * 100 + victoryBonus - duration * 2);
  }

  /**
   * Runs getSortedLeaderboard.
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
   * Runs compareLeaderboardEntries.
   * @param {*} a
   * @param {*} b
   */
  compareLeaderboardEntries(a, b) {
    const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (Number(a.duration) || 0) - (Number(b.duration) || 0);
  }
}




