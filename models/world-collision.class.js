class WorldCollisionSystem {
  constructor(world) {
    this.world = world;
  }

  resolveCharacterGround() {
    const character = this.world.character;
    const characterHitbox =
      typeof character.getHitbox === "function"
        ? character.getHitbox()
        : { x: character.x, y: character.y, width: character.width, height: character.height };
    const hitboxBottomOffset =
      characterHitbox.y - character.y + characterHitbox.height;
    const levelFloorY = 460;
    const baseGroundY = levelFloorY - hitboxBottomOffset;

    let groundedPlatformY = null;
    const feetLeft = characterHitbox.x;
    const feetRight = characterHitbox.x + characterHitbox.width;
    const feetY = characterHitbox.y + characterHitbox.height;
    const gravityStep = character.acceleration ?? 0;
    const estimatedFallDistance = Math.max(0, -character.speedY) + gravityStep;
    const previousFeetY = feetY - estimatedFallDistance;

    this.world.tiles.forEach((tile) => {
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
        ? groundedPlatformY - hitboxBottomOffset
        : baseGroundY;

    if (character.y > character.groundY) {
      character.y = character.groundY;
      character.speedY = 0;
    }
  }

  checkCharacterCollisions() {
    if (
      typeof this.world.character.isDead === "function" &&
      this.world.character.isDead()
    ) {
      return;
    }

    for (let i = this.world.enemies.length - 1; i >= 0; i--) {
      const enemy = this.world.enemies[i];

      if (typeof enemy.isDead === "function" && enemy.isDead()) {
        if (typeof enemy.canBeRemoved === "function" && enemy.canBeRemoved()) {
          this.world.enemies.splice(i, 1);
        }
        continue;
      }

      if (this.world.character.isColliding(enemy)) {
        if (
          this.world.character.isAttacking &&
          typeof enemy.takeHit === "function"
        ) {
          enemy.takeHit(
            this.world.character.x,
            this.world.character.attackDamage,
          );

          if (
            typeof enemy.canBeRemoved === "function" &&
            enemy.canBeRemoved()
          ) {
            this.world.enemies.splice(i, 1);
          }
          continue;
        }

        const enemyWasAttacking = enemy.isAttacking === true;

        if (typeof enemy.triggerAttack === "function") {
          enemy.triggerAttack(this.world.character);
        }

        if (enemyWasAttacking) {
          this.world.character.takeHit(enemy.x, enemy.attackDamage ?? 10);
        }
      }
    }
  }

  checkItemCollections() {
    for (let i = this.world.items.length - 1; i >= 0; i--) {
      const item = this.world.items[i];
      if (!item) {
        continue;
      }

      if (!this.isItemCollected(this.world.character, item)) {
        continue;
      }

      if (item.type === "heart") {
        if ((this.world.character.energy ?? 0) >= 100) {
          continue;
        }
        this.world.character.energy = Math.min(
          100,
          this.world.character.energy + 20,
        );
        this.world.playHeartCollectSound();
      } else if (item.type === "coin") {
        this.world.hud.addCoin();
        this.world.playCoinCollectSound();
      }

      this.world.items.splice(i, 1);
    }
  }

  isItemCollected(character, item) {
    const charHitbox =
      typeof character.getHitbox === "function"
        ? character.getHitbox()
        : {
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
    const activeProjectiles = Array.isArray(this.world.character.projectiles)
      ? this.world.character.projectiles
      : [];

    activeProjectiles.forEach((projectile) => {
      projectile.update(this.world.levelEndX);

      if (!projectile.isActive) {
        return;
      }

      for (let i = this.world.enemies.length - 1; i >= 0; i--) {
        const enemy = this.world.enemies[i];
        if (enemy.isDead()) {
          continue;
        }

        if (projectile.isColliding(enemy)) {
          enemy.takeHit(
            this.world.character.x,
            this.world.character.attackDamage,
          );
          projectile.isActive = false;
          break;
        }
      }
    });

    this.world.projectiles = activeProjectiles.filter(
      (projectile) => projectile.isActive,
    );
    if (Array.isArray(this.world.character.projectiles)) {
      this.world.character.projectiles = this.world.projectiles;
    }
  }
}
