/**
 * @file models/world-renderer.class.js
 */

/**
 * Represents WorldRenderer in the game.
 */
class WorldRenderer {

  /**
   * Runs constructor.
   * @param {*} world
   */
  constructor(world) {
    this.world = world;
    this.endScreenButtonImage = new Image();
    this.endScreenButtonImage.src = "img/14Pause/button_yellow.png";
  }

  /**
   * Runs renderFrame.
   */
  renderFrame() {
    this.clearCanvas();
    this.moveCamera();
    this.getRenderableGroups().forEach((group) => this.addObjectsToMap(group));
    this.drawBossHealthBarInWorld();
    this.resetCamera();
    this.world.hud.draw(this.world.ctx, this.world.character);
    this.drawEndStateIfNeeded();
  }

  /**
   * Runs getRenderableGroups.
   */
  getRenderableGroups() {
    return [
      this.world.backgroundObjects,
      this.world.chain,
      this.world.tiles,
      this.world.items,
      this.world.projectiles,
      this.world.enemyProjectiles,
      [this.world.character],
      this.world.enemies,
    ];
  }

  /**
   * Runs drawEndStateIfNeeded.
   */
  drawEndStateIfNeeded() {
    if (this.world.isGameOver) this.drawEndScreen(this.world.gameOverImage);
    if (this.world.isVictory) this.drawEndScreen(this.world.victoryImage);
  }

  /**
   * Runs drawEndScreen.
   * @param {*} endImage
   */
  drawEndScreen(endImage) {
    this.world.ctx.save();
    this.drawEndScreenOverlay();
    const layout = this.getEndScreenLayout(endImage);
    this.drawEndScreenTitle(layout.title);
    layout.buttons.forEach((button) => this.drawGameOverButton(button));
    this.world.ctx.restore();
  }

  /**
   * Runs drawEndScreenOverlay.
   */
  drawEndScreenOverlay() {
    this.world.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.world.ctx.fillRect(0, 0, this.world.canvas.width, this.world.canvas.height);
  }

  /**
   * Runs drawEndScreenTitle.
   * @param {*} title
   */
  drawEndScreenTitle(title) {
    if (!title.image || !title.image.complete) return;
    this.world.ctx.drawImage(title.image, title.x, title.y, title.width, title.height);
  }

  /**
   * Runs getEndScreenLayout.
   * @param {*} endImage
   */
  getEndScreenLayout(endImage) {
    const cfg = this.getEndLayoutConfig();
    const title = this.getTitleLayout(endImage, cfg);
    const buttons = this.getButtonsLayout(title, cfg);
    return { title, buttons };
  }

  /**
   * Runs getEndLayoutConfig.
   */
  getEndLayoutConfig() {
    const buttons = this.getVisibleButtonTemplates();
    return {
      titleToButtonsGap: 14,
      buttonsGap: 14,
      centerX: this.world.canvas.width / 2,
      maxTitleWidth: Math.round(this.world.canvas.width * 0.9),
      targetTitleHeight: Math.round(this.world.canvas.height * 0.5),
      buttons,
    };
  }

  /**
   * Runs getVisibleButtonTemplates.
   */
  getVisibleButtonTemplates() {
    const buttons = [];
    if (this.world.shouldShowContinueButton()) buttons.push(this.world.gameOverButtons.continue);
    buttons.push(this.world.gameOverButtons.restart, this.world.gameOverButtons.home);
    return buttons;
  }

  /**
   * Runs getTitleLayout.
   * @param {*} endImage
   * @param {*} cfg
   */
  getTitleLayout(endImage, cfg) {
    const size = this.getTitleSize(endImage, cfg.maxTitleWidth, cfg.targetTitleHeight);
    const y = this.getContentStartY(size.height, cfg);
    return { image: endImage, width: size.width, height: size.height, x: Math.round(cfg.centerX - size.width / 2), y };
  }

  /**
   * Runs getTitleSize.
   * @param {*} endImage
   * @param {*} maxTitleWidth
   * @param {*} targetTitleHeight
   */
  getTitleSize(endImage, maxTitleWidth, targetTitleHeight) {
    const fallback = { width: Math.min(maxTitleWidth, 700), height: targetTitleHeight };
    const isReady = endImage && endImage.complete && endImage.naturalWidth > 0 && endImage.naturalHeight > 0;
    if (!isReady) return fallback;
    const size = this.scaleImageToHeight(endImage, targetTitleHeight);
    if (size.width <= maxTitleWidth) return size;
    return this.scaleImageToWidth(endImage, maxTitleWidth);
  }

  /**
   * Runs scaleImageToHeight.
   * @param {*} image
   * @param {*} height
   */
  scaleImageToHeight(image, height) {
    return { width: Math.round((image.naturalWidth / image.naturalHeight) * height), height };
  }

  /**
   * Runs scaleImageToWidth.
   * @param {*} image
   * @param {*} width
   */
  scaleImageToWidth(image, width) {
    return { width, height: Math.round((image.naturalHeight / image.naturalWidth) * width) };
  }

  /**
   * Runs getContentStartY.
   * @param {*} titleHeight
   * @param {*} restartHeight
   * @param {*} homeHeight
   * @param {*} cfg
   */
  getContentStartY(titleHeight, cfg) {
    const buttonsHeight = cfg.buttons.reduce((sum, button, index) => {
      const gap = index < cfg.buttons.length - 1 ? cfg.buttonsGap : 0;
      return sum + button.height + gap;
    }, 0);
    const contentHeight = titleHeight + cfg.titleToButtonsGap + buttonsHeight;
    return Math.round((this.world.canvas.height - contentHeight) / 2);
  }

  /**
   * Runs getButtonsLayout.
   * @param {*} title
   * @param {*} cfg
   */
  getButtonsLayout(title, cfg) {
    let nextY = title.y + title.height + cfg.titleToButtonsGap;
    return cfg.buttons.map((button) => {
      const layout = { ...button, x: Math.round(cfg.centerX - button.width / 2), y: nextY };
      nextY += button.height + cfg.buttonsGap;
      return layout;
    });
  }

  /**
   * Runs getEndScreenButtons.
   */
  getEndScreenButtons() {
    const endImage = this.world.isVictory ? this.world.victoryImage : this.world.gameOverImage;
    const layout = this.getEndScreenLayout(endImage);
    return layout.buttons;
  }

  /**
   * Runs drawGameOverButton.
   * @param {*} button
   */
  drawGameOverButton(button) {
    this.drawButtonBackground(button);
    this.drawButtonLabel(button);
  }

  /**
   * Runs drawButtonBackground.
   * @param {*} button
   */
  drawButtonBackground(button) {
    if (this.hasButtonImage()) {
      this.world.ctx.drawImage(this.endScreenButtonImage, button.x, button.y, button.width, button.height);
      return;
    }
    this.world.ctx.fillStyle = "#f7b500";
    this.world.ctx.fillRect(button.x, button.y, button.width, button.height);
    this.world.ctx.strokeStyle = "#1c1c1c";
    this.world.ctx.lineWidth = 2;
    this.world.ctx.strokeRect(button.x, button.y, button.width, button.height);
  }

  /**
   * Runs hasButtonImage.
   */
  hasButtonImage() {
    return this.endScreenButtonImage.complete && this.endScreenButtonImage.naturalWidth > 0;
  }

  /**
   * Runs drawButtonLabel.
   * @param {*} button
   */
  drawButtonLabel(button) {
    this.world.ctx.fillStyle = "#1c1c1c";
    this.world.ctx.font = "bold 24px sans-serif";
    this.world.ctx.textAlign = "center";
    this.world.ctx.textBaseline = "middle";
    this.world.ctx.fillText(String(button.label).toUpperCase(), button.x + button.width / 2, button.y + button.height / 2);
  }

  /**
   * Runs clearCanvas.
   */
  clearCanvas() {
    this.world.ctx.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
  }

  /**
   * Runs moveCamera.
   */
  moveCamera() {
    this.world.ctx.translate(this.world.camera_x, 0);
  }

  /**
   * Runs resetCamera.
   */
  resetCamera() {
    this.world.ctx.translate(-this.world.camera_x, 0);
  }

  /**
   * Runs addObjectsToMap.
   * @param {*} objects
   */
  addObjectsToMap(objects) {
    objects.forEach((obj) => this.addToMap(obj));
  }

  /**
   * Runs addToMap.
   * @param {*} obj
   */
  addToMap(obj) {
    if (!obj || !obj.img) return;
    this.world.ctx.save();
    if (obj.othersDirection) this.drawMirroredObject(obj);
    if (!obj.othersDirection) this.drawNormalObject(obj);
    this.world.ctx.restore();
  }

  /**
   * Runs drawMirroredObject.
   * @param {*} obj
   */
  drawMirroredObject(obj) {
    const image = this.getRenderableImage(obj);
    this.world.ctx.translate(obj.x + obj.width, 0);
    this.world.ctx.scale(-1, 1);
    this.world.ctx.drawImage(image, 0, obj.y, obj.width, obj.height);
    this.drawObjectFrame({ x: 0, y: obj.y, width: obj.width, height: obj.height }, obj);
  }

  /**
   * Runs drawNormalObject.
   * @param {*} obj
   */
  drawNormalObject(obj) {
    const image = this.getRenderableImage(obj);
    this.world.ctx.drawImage(image, obj.x, obj.y, obj.width, obj.height);
    this.drawObjectFrame(obj, obj);
  }

  /**
   * Runs getRenderableImage.
   * @param {*} obj
   */
  getRenderableImage(obj) {
    if (!Array.isArray(obj.animationFrames) || !obj.animationFrames.length) return obj.img;
    const interval = Math.max(40, obj.animationIntervalMs ?? 120);
    const offset = obj.animationStartMs ?? 0;
    const index = Math.floor((Date.now() + offset) / interval) % obj.animationFrames.length;
    const path = obj.animationFrames[index];
    return obj.imageCache?.[path] ?? obj.img;
  }

  /**
   * Runs drawBossHealthBarInWorld.
   */
  drawBossHealthBarInWorld() {
    const boss = this.world.getActiveEndboss();
    if (!boss) return;
    if (!this.isBossVisibleOnScreen(boss)) return;
    const bar = this.getBossHealthBarLayout(boss);
    this.drawBossHealthBar(bar);
  }

  /**
   * Runs isBossVisibleOnScreen.
   * @param {*} boss
   */
  isBossVisibleOnScreen(boss) {
    const screenX = boss.x + this.world.camera_x;
    const right = screenX + boss.width;
    return right >= 0 && screenX <= this.world.canvas.width;
  }

  /**
   * Runs getBossHealthBarLayout.
   * @param {*} boss
   */
  getBossHealthBarLayout(boss) {
    const maxHealth = Math.max(1, boss.maxEnergy ?? boss.energy ?? 1);
    const currentHealth = Math.max(0, Math.min(maxHealth, boss.energy ?? maxHealth));
    const width = Math.max(80, Math.round(boss.width * 0.55));
    const height = 8;
    const x = Math.round(boss.x + (boss.width - width) / 2);
    const y = Math.round(boss.y - 12);
    return { x, y, width, height, percent: currentHealth / maxHealth };
  }

  /**
   * Runs drawBossHealthBar.
   * @param {*} bar
   */
  drawBossHealthBar(bar) {
    this.world.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.world.ctx.fillRect(bar.x - 2, bar.y - 2, bar.width + 4, bar.height + 4);
    this.world.ctx.fillStyle = "#2d2d2d";
    this.world.ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
    this.world.ctx.fillStyle = "#d92d20";
    this.world.ctx.fillRect(bar.x, bar.y, bar.width * bar.percent, bar.height);
    this.world.ctx.strokeStyle = "#ffffff";
    this.world.ctx.lineWidth = 1;
    this.world.ctx.strokeRect(bar.x, bar.y, bar.width, bar.height);
  }

  /**
   * Runs drawObjectFrame.
   * @param {*} frameSource
   * @param {*} originalObject
   */
  drawObjectFrame(frameSource, originalObject) {
    // Hitbox-Frames (rot/blau) deaktiviert.
  }

  /**
   * Runs drawFrame.
   * @param {*} x
   * @param {*} y
   * @param {*} width
   * @param {*} height
   * @param {*} color
   */
  drawFrame(x, y, width, height, color = "blue") {
    this.world.ctx.beginPath();
    this.world.ctx.lineWidth = 2;
    this.world.ctx.strokeStyle = color;
    this.world.ctx.strokeRect(x, y, width, height);
  }
}


