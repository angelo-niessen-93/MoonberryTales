class World {
  camera_x = 0;
  levelEndX = 720 * 5;
  projectiles = [];

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

    this.setWorld();
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

  draw = () => {
    this.updateProjectiles();
    this.resolveCharacterGround();
    this.checkCharacterCollisions();
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
    requestAnimationFrame(this.draw);
  };

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
