/**
 * @file models/world-collision.class.js
 */

/**
 * Repräsentiert WorldCollisionSystem im Spiel.
 */
class WorldCollisionSystem {

  /**
   * Führt constructor aus.
   * @param {*} world
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Führt resolveCharacterGround aus.
   */
  resolveCharacterGround() {
    const character = this.world.character;
    const characterHitbox = this.getCharacterHitbox(character);
    const hitboxBottomOffset = this.getHitboxBottomOffset(character, characterHitbox);
    const baseGroundY = this.getBaseGroundY(character, hitboxBottomOffset);
    const platformY = this.findGroundedPlatformY(character, characterHitbox);
    this.applyGroundToCharacter(character, hitboxBottomOffset, platformY, baseGroundY);
  }

  /**
   * Führt getCharacterHitbox aus.
   * @param {*} character
   */
  getCharacterHitbox(character) {
    if (typeof character.getHitbox === "function") {
      return character.getHitbox();
    }
    return { x: character.x, y: character.y, width: character.width, height: character.height };
  }

  /**
   * Führt getHitboxBottomOffset aus.
   * @param {*} character
   * @param {*} hitbox
   */
  getHitboxBottomOffset(character, hitbox) {
    return hitbox.y - character.y + hitbox.height;
  }

  /**
   * Führt getBaseGroundY aus.
   * @param {*} character
   * @param {*} hitboxBottomOffset
   */
  getBaseGroundY(character, hitboxBottomOffset) {
    const levelFloorY = 460;
    return levelFloorY - hitboxBottomOffset;
  }

  /**
   * Führt findGroundedPlatformY aus.
   * @param {*} character
   * @param {*} characterHitbox
   */
  findGroundedPlatformY(character, characterHitbox) {
    const state = this.getFeetState(character, characterHitbox);
    let groundedPlatformY = null;
    this.world.tiles.forEach((tile) => {
      groundedPlatformY = this.resolveTileLanding(state, character, tile, groundedPlatformY);
    });
    return groundedPlatformY;
  }

  /**
   * Führt getFeetState aus.
   * @param {*} character
   * @param {*} hitbox
   */
  getFeetState(character, hitbox) {
    const feetY = hitbox.y + hitbox.height;
    const gravityStep = character.acceleration ?? 0;
    const fallDistance = Math.max(0, -character.speedY) + gravityStep;
    return {
      feetLeft: hitbox.x,
      feetRight: hitbox.x + hitbox.width,
      feetY,
      previousFeetY: feetY - fallDistance,
    };
  }

  /**
   * Führt resolveTileLanding aus.
   * @param {*} state
   * @param {*} character
   * @param {*} tile
   * @param {*} groundedPlatformY
   */
  resolveTileLanding(state, character, tile, groundedPlatformY) {
    const hitbox = this.getTileHitbox(tile);
    const canLand = this.canCharacterLandOnTile(character, state, hitbox);
    if (!canLand) return groundedPlatformY;
    if (groundedPlatformY === null || hitbox.y < groundedPlatformY) return hitbox.y;
    return groundedPlatformY;
  }

  /**
   * Führt getTileHitbox aus.
   * @param {*} tile
   */
  getTileHitbox(tile) {
    if (typeof tile.getHitbox === "function") {
      return tile.getHitbox();
    }
    return { x: tile.x, y: tile.y, width: tile.width, height: tile.height };
  }

  /**
   * Führt canCharacterLandOnTile aus.
   * @param {*} character
   * @param {*} state
   * @param {*} hitbox
   */
  canCharacterLandOnTile(character, state, hitbox) {
    const overlapsX = state.feetRight > hitbox.x && state.feetLeft < hitbox.x + hitbox.width;
    const isFallingOrStanding = character.speedY <= 0;
    const isNearTop = state.feetY >= hitbox.y - 12 && state.feetY <= hitbox.y + hitbox.height;
    const crossedTop = state.previousFeetY <= hitbox.y && state.feetY >= hitbox.y;
    return overlapsX && isFallingOrStanding && (isNearTop || crossedTop);
  }

  /**
   * Führt applyGroundToCharacter aus.
   * @param {*} character
   * @param {*} hitboxBottomOffset
   * @param {*} groundedPlatformY
   * @param {*} baseGroundY
   */
  applyGroundToCharacter(character, hitboxBottomOffset, groundedPlatformY, baseGroundY) {
    character.groundY = groundedPlatformY !== null
      ? groundedPlatformY - hitboxBottomOffset
      : baseGroundY;
    if (character.y <= character.groundY) return;
    character.y = character.groundY;
    character.speedY = 0;
  }

  /**
   * Führt checkCharacterCollisions aus.
   */
  checkCharacterCollisions() {
    if (this.isCharacterDead()) return;
    for (let i = this.world.enemies.length - 1; i >= 0; i--) {
      const enemy = this.world.enemies[i];
      if (this.handleDeadEnemy(enemy, i)) continue;
      if (!this.isCharacterCollidingEnemy(enemy)) continue;
      this.handleCharacterEnemyCollision(enemy, i);
    }
  }

  /**
   * Führt isCharacterCollidingEnemy aus.
   * @param {*} enemy
   */
  isCharacterCollidingEnemy(enemy) {
    const characterHitbox = this.getCharacterCombatHitbox();
    const enemyHitbox = this.getEntityHitbox(enemy);
    return this.isAabbOverlap(characterHitbox, enemyHitbox);
  }

  /**
   * Führt getCharacterCombatHitbox aus.
   */
  getCharacterCombatHitbox() {
    const base = this.getEntityHitbox(this.world.character);
    const insetX = 10;
    const insetY = 6;
    const width = Math.max(18, base.width - insetX * 2);
    const height = Math.max(20, base.height - insetY * 2);
    return { x: base.x + insetX, y: base.y + insetY, width, height };
  }

  /**
   * Führt isCharacterDead aus.
   */
  isCharacterDead() {
    return typeof this.world.character.isDead === "function" && this.world.character.isDead();
  }

  /**
   * Führt handleDeadEnemy aus.
   * @param {*} enemy
   * @param {*} index
   */
  handleDeadEnemy(enemy, index) {
    const isDead = typeof enemy.isDead === "function" && enemy.isDead();
    if (!isDead) return false;
    this.removeEnemyIfRemovable(enemy, index);
    return true;
  }

  /**
   * Führt removeEnemyIfRemovable aus.
   * @param {*} enemy
   * @param {*} index
   */
  removeEnemyIfRemovable(enemy, index) {
    if (typeof enemy.canBeRemoved !== "function") return;
    if (!enemy.canBeRemoved()) return;
    this.world.enemies.splice(index, 1);
  }

  /**
   * Führt handleCharacterEnemyCollision aus.
   * @param {*} enemy
   * @param {*} index
   */
  handleCharacterEnemyCollision(enemy, index) {
    if (this.tryCharacterAttack(enemy, index)) return;
    const enemyWasAttacking = enemy.isAttacking === true;
    if (typeof enemy.triggerAttack === "function") enemy.triggerAttack(this.world.character);
    if (enemyWasAttacking) this.world.character.takeHit(enemy.x, enemy.attackDamage ?? 10);
  }

  /**
   * Führt tryCharacterAttack aus.
   * @param {*} enemy
   * @param {*} index
   */
  tryCharacterAttack(enemy, index) {
    const canAttack = this.world.character.isAttacking && typeof enemy.takeHit === "function";
    if (!canAttack) return false;
    if (!this.characterAttackHitsEnemy(enemy)) return false;
    enemy.takeHit(this.world.character.x, this.world.character.attackDamage);
    this.removeEnemyIfRemovable(enemy, index);
    return true;
  }

  /**
   * Führt characterAttackHitsEnemy aus.
   * @param {*} enemy
   */
  characterAttackHitsEnemy(enemy) {
    const attackHitbox = this.getCharacterAttackHitbox();
    const enemyHitbox = this.getEntityHitbox(enemy);
    if (!this.isAabbOverlap(attackHitbox, enemyHitbox)) return false;
    return this.isEnemyInAttackReach(enemyHitbox);
  }

  /**
   * Führt getCharacterAttackHitbox aus.
   */
  getCharacterAttackHitbox() {
    if (typeof this.world.character.getAttackHitbox === "function") {
      return this.world.character.getAttackHitbox();
    }
    return this.getEntityHitbox(this.world.character);
  }

  /**
   * Führt isEnemyInAttackReach aus.
   * @param {*} enemyHitbox
   */
  isEnemyInAttackReach(enemyHitbox) {
    const charHitbox = this.getEntityHitbox(this.world.character);
    const verticalOverlap = this.getVerticalOverlap(charHitbox, enemyHitbox);
    const minVerticalOverlap = Math.min(charHitbox.height, enemyHitbox.height) * 0.35;
    if (verticalOverlap < minVerticalOverlap) return false;
    const reach = 12;
    if (this.world.character.othersDirection) return enemyHitbox.x + enemyHitbox.width >= charHitbox.x - reach;
    return enemyHitbox.x <= charHitbox.x + charHitbox.width + reach;
  }

  /**
   * Führt getVerticalOverlap aus.
   * @param {*} a
   * @param {*} b
   */
  getVerticalOverlap(a, b) {
    const top = Math.max(a.y, b.y);
    const bottom = Math.min(a.y + a.height, b.y + b.height);
    return Math.max(0, bottom - top);
  }

  /**
   * Führt getEntityHitbox aus.
   * @param {*} entity
   */
  getEntityHitbox(entity) {
    if (typeof entity.getHitbox === "function") return entity.getHitbox();
    return { x: entity.x, y: entity.y, width: entity.width, height: entity.height };
  }

  /**
   * Führt isAabbOverlap aus.
   * @param {*} a
   * @param {*} b
   */
  isAabbOverlap(a, b) {
    return (
      a.x + a.width > b.x &&
      a.y + a.height > b.y &&
      a.x < b.x + b.width &&
      a.y < b.y + b.height
    );
  }

  /**
   * Führt checkItemCollections aus.
   */
  checkItemCollections() {
    for (let i = this.world.items.length - 1; i >= 0; i--) {
      const item = this.world.items[i];
      if (!item) continue;
      if (!this.isItemCollected(this.world.character, item)) continue;
      if (!this.applyItemEffect(item)) continue;
      this.world.items.splice(i, 1);
    }
  }

  /**
   * Führt applyItemEffect aus.
   * @param {*} item
   */
  applyItemEffect(item) {
    if (item.type === "heart") return this.collectHeart();
    if (item.type === "coin") return this.collectCoin();
    return true;
  }

  /**
   * Führt collectHeart aus.
   */
  collectHeart() {
    if ((this.world.character.energy ?? 0) >= 100) return false;
    this.world.character.energy = Math.min(100, this.world.character.energy + 20);
    this.world.playHeartCollectSound();
    return true;
  }

  /**
   * Führt collectCoin aus.
   */
  collectCoin() {
    this.world.hud.addCoin();
    this.world.playCoinCollectSound();
    return true;
  }

  /**
   * Führt isItemCollected aus.
   * @param {*} character
   * @param {*} item
   */
  isItemCollected(character, item) {
    const charHitbox = this.getCollectHitbox(character);
    const itemHitbox = { x: item.x, y: item.y, width: item.width, height: item.height };
    return (
      charHitbox.x + charHitbox.width > itemHitbox.x &&
      charHitbox.y + charHitbox.height > itemHitbox.y &&
      charHitbox.x < itemHitbox.x + itemHitbox.width &&
      charHitbox.y < itemHitbox.y + itemHitbox.height
    );
  }

  /**
   * Führt getCollectHitbox aus.
   * @param {*} character
   */
  getCollectHitbox(character) {
    if (typeof character.getHitbox === "function") return character.getHitbox();
    return {
      x: character.x + 20,
      y: character.y + 20,
      width: character.width - 40,
      height: character.height - 40,
    };
  }

  /**
   * Führt updateProjectiles aus.
   */
  updateProjectiles() {
    const activeProjectiles = this.getCharacterProjectiles();
    activeProjectiles.forEach((projectile) => this.updateProjectile(projectile));
    this.syncProjectiles(activeProjectiles);
  }

  /**
   * Führt getCharacterProjectiles aus.
   */
  getCharacterProjectiles() {
    return Array.isArray(this.world.character.projectiles) ? this.world.character.projectiles : [];
  }

  /**
   * Führt updateProjectile aus.
   * @param {*} projectile
   */
  updateProjectile(projectile) {
    projectile.update(this.world.levelEndX);
    if (!projectile.isActive) return;
    this.applyProjectileHits(projectile);
  }

  /**
   * Führt applyProjectileHits aus.
   * @param {*} projectile
   */
  applyProjectileHits(projectile) {
    for (let i = this.world.enemies.length - 1; i >= 0; i--) {
      const enemy = this.world.enemies[i];
      if (enemy.isDead()) continue;
      if (!projectile.isColliding(enemy)) continue;
      enemy.takeHit(this.world.character.x, this.world.character.attackDamage);
      projectile.isActive = false;
      break;
    }
  }

  /**
   * Führt syncProjectiles aus.
   * @param {*} activeProjectiles
   */
  syncProjectiles(activeProjectiles) {
    this.world.projectiles = activeProjectiles.filter((projectile) => projectile.isActive);
    if (!Array.isArray(this.world.character.projectiles)) return;
    this.world.character.projectiles = this.world.projectiles;
  }
}
