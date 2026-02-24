class World {
  camera_x = 0;
  levelEndX = 720 * 5;
  projectiles = [];
  isGameOver = false;
  coinsCollected = 0;

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;

    const selectedCharacter = localStorage.getItem("selectedCharacter");
    if (selectedCharacter === "Mage") {
      this.character = new Mage();
    } else if (selectedCharacter === "Rogue") {
      this.character = new Rogue();
    } else {
      this.character = new Knight();
    }

    this.level = this.createLevel();

    this.enemies = this.level.enemies;
    this.chain = this.level.chain;
    this.tiles = this.level.tiles;
    this.items = this.level.items;
    this.backgroundObjects = this.level.backgroundObjects;

    this.gameOverImage = new Image();
    this.gameOverImage.src = "img/Game-over.png";
    this.heartHudImage = new Image();
    this.heartHudImage.src = "img/Items/heart1.png";
    this.coinHudImage = new Image();
    this.coinHudImage.src = "img/Items/coin1.png";

    this.gameOverButtons = {
      restart: { x: 210, y: 380, width: 130, height: 42, label: "Restart" },
      home: { x: 360, y: 380, width: 190, height: 42, label: "Home" },
    };

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
      if (!this.isGameOver) {
        return;
      }

      const point = this.getCanvasPoint(event);
      if (this.isPointInButton(point, this.gameOverButtons.restart)) {
        window.location.reload();
        return;
      }

      if (this.isPointInButton(point, this.gameOverButtons.home)) {
        window.location.href = "./index.html";
      }
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (!this.isGameOver) {
        this.canvas.style.cursor = "default";
        return;
      }

      const point = this.getCanvasPoint(event);
      const onRestart = this.isPointInButton(point, this.gameOverButtons.restart);
      const onHome = this.isPointInButton(point, this.gameOverButtons.home);
      this.canvas.style.cursor = onRestart || onHome ? "pointer" : "default";
    });
  }

  getCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
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
    if (!this.isGameOver) {
      this.updateProjectiles();
      this.resolveCharacterGround();
      this.checkCharacterCollisions();
      this.checkItemCollections();

      if (typeof this.character.isDead === "function" && this.character.isDead()) {
        this.isGameOver = true;
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
    this.drawHud();

    if (this.isGameOver) {
      this.drawGameOverScreen();
    }

    requestAnimationFrame(this.draw);
  };

  drawGameOverScreen() {
    this.ctx.save();

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const imageWidth = 460;
    const imageHeight = 220;
    const imageX = (this.canvas.width - imageWidth) / 2;
    const imageY = 95;

    if (this.gameOverImage.complete) {
      this.ctx.drawImage(this.gameOverImage, imageX, imageY, imageWidth, imageHeight);
    }

    this.drawGameOverButton(this.gameOverButtons.restart, "#f7b500", "#1c1c1c");
    this.drawGameOverButton(this.gameOverButtons.home, "#e4e4e4", "#1c1c1c");

    this.ctx.restore();
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

  drawHud() {
    const maxHealth = 100;
    const currentHealth = Math.max(0, Math.min(maxHealth, this.character.energy ?? 0));
    const healthPercent = currentHealth / maxHealth;

    const barX = 20;
    const barY = 18;
    const barWidth = 220;
    const barHeight = 24;

    this.ctx.save();

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    this.ctx.fillRect(10, 10, 300, 78);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";

    this.ctx.fillStyle = "#2d2d2d";
    this.ctx.fillRect(barX, barY + 8, barWidth, barHeight);

    this.ctx.fillStyle = healthPercent > 0.35 ? "#39d353" : "#ef4444";
    this.ctx.fillRect(barX, barY + 8, barWidth * healthPercent, barHeight);

    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(barX, barY + 8, barWidth, barHeight);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "15px sans-serif";
    const heartIconSize = 16;
    const heartIconX = barX + 8;
    const heartIconY = barY + 13;
    if (this.heartHudImage.complete) {
      this.ctx.drawImage(
        this.heartHudImage,
        heartIconX,
        heartIconY,
        heartIconSize,
        heartIconSize,
      );
    }
    this.ctx.fillText(`${Math.round(currentHealth)}/${maxHealth}`, heartIconX + heartIconSize + 6, barY + 21);

    const coinIconSize = 24;
    const coinIconX = barX;
    const coinIconY = 60;
    if (this.coinHudImage.complete) {
      this.ctx.drawImage(
        this.coinHudImage,
        coinIconX,
        coinIconY,
        coinIconSize,
        coinIconSize,
      );
    }

    this.ctx.font = "18px sans-serif";
    this.ctx.fillText(`${this.coinsCollected}`, coinIconX + coinIconSize + 8, 72);

    this.ctx.restore();
  }

  resolveCharacterGround() {
    const baseGroundY = 260;
    const character = this.character;

    let groundedPlatformY = null;
    const feetLeft = character.x + 20;
    const feetRight = character.x + character.width - 20;
    const feetY = character.y + character.height;

    this.tiles.forEach((tile) => {
      const hitbox =
        typeof tile.getHitbox === "function"
          ? tile.getHitbox()
          : { x: tile.x, y: tile.y, width: tile.width, height: tile.height };

      const overlapsX =
        feetRight > hitbox.x && feetLeft < hitbox.x + hitbox.width;
      const isNearTop =
        feetY >= hitbox.y - 12 && feetY <= hitbox.y + hitbox.height;
      const isFallingOrStanding = character.speedY <= 0;

      if (!overlapsX || !isNearTop || !isFallingOrStanding) {
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
      } else if (item.type === "coin") {
        this.coinsCollected += 1;
      }

      this.items.splice(i, 1);
    }
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
