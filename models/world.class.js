class World {
  camera_x = 0;
  levelEndX = 720 * 5;
  projectiles = [];
  isGameOver = false;
  isVictory = false;

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

    this.setWorld();
    this.setupGameOverInteraction();
    this.draw();
  }

  createLevel() {
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
      Chain.createForArea(-720, 720 * 5, 720),
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

      const buttons = this.getEndScreenButtons();
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

      const buttons = this.getEndScreenButtons();
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
    this.isGameOver = false;
    this.isVictory = false;
    this.projectiles = [];
    this.hud = new HUD();
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
      this.updateProjectiles();
      this.resolveCharacterGround();
      this.checkCharacterCollisions();
      this.checkItemCollections();

      if (this.isBossDefeated()) {
        this.isVictory = true;
      } else if (typeof this.character.isDead === "function" && this.character.isDead()) {
        this.isGameOver = true;
        this.playGameOverSound();
      }
    }

    this.clearCanvas();
    this.moveCamera();

    [
      this.backgroundObjects,
      this.chain,
      this.tiles,
      this.items,
      this.projectiles,
      [this.character],
      this.enemies,
    ].forEach((group) => this.addObjectsToMap(group));

    this.resetCamera();
    this.hud.draw(this.ctx, this.character);

    if (this.isGameOver) {
      this.drawEndScreen(this.gameOverImage);
    } else if (this.isVictory) {
      this.drawEndScreen(this.victoryImage);
    }

    requestAnimationFrame(this.draw);
  };

  drawEndScreen(endImage) {
    this.ctx.save();

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const isVictoryImage = endImage === this.victoryImage;
    const fallbackWidth = 460;
    const fallbackHeight = isVictoryImage ? 360 : 220;
    let imageWidth = fallbackWidth;
    let imageHeight = fallbackHeight;
    if (endImage && endImage.complete && endImage.naturalWidth > 0 && endImage.naturalHeight > 0) {
      const scaleByHeight = fallbackHeight / endImage.naturalHeight;
      imageHeight = fallbackHeight;
      imageWidth = Math.round(endImage.naturalWidth * scaleByHeight);
    }
    const imageX = (this.canvas.width - imageWidth) / 2;
    const imageY = 95;

    if (endImage && endImage.complete) {
      this.ctx.drawImage(endImage, imageX, imageY, imageWidth, imageHeight);
    }

    const buttons = this.getEndScreenButtons();
    this.drawGameOverButton(buttons.restart, "#f7b500", "#1c1c1c");
    this.drawGameOverButton(buttons.home, "#e4e4e4", "#1c1c1c");

    this.ctx.restore();
  }

  getEndScreenButtons() {
    const gap = 20;
    const restart = this.gameOverButtons.restart;
    const home = this.gameOverButtons.home;
    const totalWidth = restart.width + gap + home.width;
    const startX = Math.round((this.canvas.width - totalWidth) / 2);
    const y = Math.round(this.canvas.height - 100);

    return {
      restart: { ...restart, x: startX, y },
      home: { ...home, x: startX + restart.width + gap, y },
    };
  }

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

  drawGameOverButton(button, bgColor, textColor) {
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(button.x, button.y, button.width, button.height);

    this.ctx.strokeStyle = "#1c1c1c";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(button.x, button.y, button.width, button.height);

    this.ctx.fillStyle = textColor;
    this.ctx.font = "20px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      button.label,
      button.x + button.width / 2,
      button.y + button.height / 2,
    );
  }

  resolveCharacterGround() {
    const baseGroundY = 260;
    const character = this.character;

    let groundedPlatformY = null;
    const feetLeft = character.x + 20;
    const feetRight = character.x + character.width - 20;
    const feetY = character.y + character.height;
    const gravityStep = character.acceleration ?? 0;
    const estimatedFallDistance = Math.max(0, -character.speedY) + gravityStep;
    const previousFeetY = feetY - estimatedFallDistance;

    this.tiles.forEach((tile) => {
      const hitbox =
        typeof tile.getHitbox === "function"
          ? tile.getHitbox()
          : { x: tile.x, y: tile.y, width: tile.width, height: tile.height };

      const overlapsX =
        feetRight > hitbox.x && feetLeft < hitbox.x + hitbox.width;
      const isFallingOrStanding = character.speedY <= 0;
      const isNearTop =
        feetY >= hitbox.y - 12 && feetY <= hitbox.y + hitbox.height;
      const crossedTopBetweenFrames =
        previousFeetY <= hitbox.y && feetY >= hitbox.y;
      const canLandOnTile = isNearTop || crossedTopBetweenFrames;

      if (!overlapsX || !canLandOnTile || !isFallingOrStanding) {
        return;
      }

      if (groundedPlatformY === null || hitbox.y < groundedPlatformY) {
        groundedPlatformY = hitbox.y;
      }
    });

    character.groundY =
      groundedPlatformY !== null
        ? groundedPlatformY - character.height
        : baseGroundY;

    if (character.y > character.groundY) {
      character.y = character.groundY;
      character.speedY = 0;
    }
  }

  checkCharacterCollisions() {
    if (
      typeof this.character.isDead === "function" &&
      this.character.isDead()
    ) {
      return;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (typeof enemy.isDead === "function" && enemy.isDead()) {
        if (typeof enemy.canBeRemoved === "function" && enemy.canBeRemoved()) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      if (this.character.isColliding(enemy)) {
        if (this.character.isAttacking && typeof enemy.takeHit === "function") {
          enemy.takeHit(this.character.x, this.character.attackDamage);

          if (
            typeof enemy.canBeRemoved === "function" &&
            enemy.canBeRemoved()
          ) {
            this.enemies.splice(i, 1);
          }
          continue;
        }

        const enemyWasAttacking = enemy.isAttacking === true;

        if (typeof enemy.triggerAttack === "function") {
          enemy.triggerAttack(this.character);
        }

        if (enemyWasAttacking) {
          this.character.takeHit(enemy.x, enemy.attackDamage ?? 10);
        }
      }
    }
  }
  checkItemCollections() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!item) {
        continue;
      }

      if (!this.isItemCollected(this.character, item)) {
        continue;
      }

      if (item.type === "heart") {
        if ((this.character.energy ?? 0) >= 100) {
          continue;
        }
        this.character.energy = Math.min(100, this.character.energy + 20);
        this.playHeartCollectSound();
      } else if (item.type === "coin") {
        this.hud.addCoin();
        this.playCoinCollectSound();
      }

      this.items.splice(i, 1);
    }
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

  isItemCollected(character, item) {
    const charHitbox = {
      x: character.x + 20,
      y: character.y + 20,
      width: character.width - 40,
      height: character.height - 40,
    };

    const itemHitbox = {
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
    };

    return (
      charHitbox.x + charHitbox.width > itemHitbox.x &&
      charHitbox.y + charHitbox.height > itemHitbox.y &&
      charHitbox.x < itemHitbox.x + itemHitbox.width &&
      charHitbox.y < itemHitbox.y + itemHitbox.height
    );
  }
  updateProjectiles() {
    const activeProjectiles = Array.isArray(this.character.projectiles)
      ? this.character.projectiles
      : [];

    activeProjectiles.forEach((projectile) => {
      projectile.update(this.levelEndX);

      if (!projectile.isActive) {
        return;
      }

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        if (enemy.isDead()) {
          continue;
        }

        if (projectile.isColliding(enemy)) {
          enemy.takeHit(this.character.x, this.character.attackDamage);
          projectile.isActive = false;
          break;
        }
      }
    });

    this.projectiles = activeProjectiles.filter((projectile) => projectile.isActive);
    if (Array.isArray(this.character.projectiles)) {
      this.character.projectiles = this.projectiles;
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  moveCamera() {
    this.ctx.translate(this.camera_x, 0);
  }

  resetCamera() {
    this.ctx.translate(-this.camera_x, 0);
  }

  addObjectsToMap(objects) {
    objects.forEach((obj) => this.addToMap(obj));
  }

  addToMap(obj) {
    if (!obj || !obj.img) {
      return;
    }

    this.ctx.save();

    if (obj.othersDirection) {
      this.ctx.translate(obj.x + obj.width, 0);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(obj.img, 0, obj.y, obj.width, obj.height);
      this.drawObjectFrame(
        {
          x: 0,
          y: obj.y,
          width: obj.width,
          height: obj.height,
        },
        obj,
      );
    } else {
      this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
      this.drawObjectFrame(obj, obj);
    }

    this.ctx.restore();
  }

  drawObjectFrame(frameSource, originalObject) {
    if (typeof originalObject.getHitbox === "function") {
      const hitbox = originalObject.getHitbox();
      this.drawFrame(hitbox.x, hitbox.y, hitbox.width, hitbox.height, "red");
      return;
    }

    this.drawFrame(
      frameSource.x,
      frameSource.y,
      frameSource.width,
      frameSource.height,
      "blue",
    );
  }

  drawFrame(x, y, width, height, color = "blue") {
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(x, y, width, height);
  }
}
