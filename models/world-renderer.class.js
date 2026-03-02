/**
 * @file models/world-renderer.class.js
 */

/**
 * Repräsentiert WorldRenderer im Spiel.
 */
class WorldRenderer {

  /**
   * Führt constructor aus.
   * @param {*} world
   */
  constructor(world) {
    this.world = world;
    this.endScreenButtonImage = new Image();
    this.endScreenButtonImage.src = "img/14Pause/button_yellow.png";
  }

  /**
   * Führt renderFrame aus.
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
   * Führt getRenderableGroups aus.
   */
  getRenderableGroups() {
    return [
      this.world.backgroundObjects,
      this.world.chain,
      this.world.tiles,
      this.world.items,
      this.world.projectiles,
      [this.world.character],
      this.world.enemies,
    ];
  }

  /**
   * Führt drawEndStateIfNeeded aus.
   */
  drawEndStateIfNeeded() {
    if (this.world.isGameOver) this.drawEndScreen(this.world.gameOverImage);
    if (this.world.isVictory) this.drawEndScreen(this.world.victoryImage);
  }

  /**
   * Führt drawEndScreen aus.
   * @param {*} endImage
   */
  drawEndScreen(endImage) {
    this.world.ctx.save();
    this.drawEndScreenOverlay();
    const layout = this.getEndScreenLayout(endImage);
    this.drawEndScreenTitle(layout.title);
    this.drawGameOverButton(layout.restart);
    this.drawGameOverButton(layout.home);
    this.world.ctx.restore();
  }

  /**
   * Führt drawEndScreenOverlay aus.
   */
  drawEndScreenOverlay() {
    this.world.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.world.ctx.fillRect(0, 0, this.world.canvas.width, this.world.canvas.height);
  }

  /**
   * Führt drawEndScreenTitle aus.
   * @param {*} title
   */
  drawEndScreenTitle(title) {
    if (!title.image || !title.image.complete) return;
    this.world.ctx.drawImage(title.image, title.x, title.y, title.width, title.height);
  }

  /**
   * Führt getEndScreenLayout aus.
   * @param {*} endImage
   */
  getEndScreenLayout(endImage) {
    const cfg = this.getEndLayoutConfig();
    const title = this.getTitleLayout(endImage, cfg);
    const restart = this.getRestartLayout(title, cfg);
    const home = this.getHomeLayout(restart, title, cfg);
    return { title, restart, home };
  }

  /**
   * Führt getEndLayoutConfig aus.
   */
  getEndLayoutConfig() {
    const restart = this.world.gameOverButtons.restart;
    return {
      titleToButtonsGap: 14,
      buttonsGap: 14,
      centerX: this.world.canvas.width / 2,
      maxTitleWidth: Math.round(this.world.canvas.width * 0.9),
      targetTitleHeight: Math.round(this.world.canvas.height * 0.5),
      restart,
      home: this.world.gameOverButtons.home,
    };
  }

  /**
   * Führt getTitleLayout aus.
   * @param {*} endImage
   * @param {*} cfg
   */
  getTitleLayout(endImage, cfg) {
    const size = this.getTitleSize(endImage, cfg.maxTitleWidth, cfg.targetTitleHeight);
    const y = this.getContentStartY(size.height, cfg.restart.height, cfg.home.height, cfg);
    return { image: endImage, width: size.width, height: size.height, x: Math.round(cfg.centerX - size.width / 2), y };
  }

  /**
   * Führt getTitleSize aus.
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
   * Führt scaleImageToHeight aus.
   * @param {*} image
   * @param {*} height
   */
  scaleImageToHeight(image, height) {
    return { width: Math.round((image.naturalWidth / image.naturalHeight) * height), height };
  }

  /**
   * Führt scaleImageToWidth aus.
   * @param {*} image
   * @param {*} width
   */
  scaleImageToWidth(image, width) {
    return { width, height: Math.round((image.naturalHeight / image.naturalWidth) * width) };
  }

  /**
   * Führt getContentStartY aus.
   * @param {*} titleHeight
   * @param {*} restartHeight
   * @param {*} homeHeight
   * @param {*} cfg
   */
  getContentStartY(titleHeight, restartHeight, homeHeight, cfg) {
    const contentHeight = titleHeight + cfg.titleToButtonsGap + restartHeight + cfg.buttonsGap + homeHeight;
    return Math.round((this.world.canvas.height - contentHeight) / 2);
  }

  /**
   * Führt getRestartLayout aus.
   * @param {*} title
   * @param {*} cfg
   */
  getRestartLayout(title, cfg) {
    const x = Math.round(cfg.centerX - cfg.restart.width / 2);
    const y = title.y + title.height + cfg.titleToButtonsGap;
    return { ...cfg.restart, x, y };
  }

  /**
   * Führt getHomeLayout aus.
   * @param {*} restart
   * @param {*} title
   * @param {*} cfg
   */
  getHomeLayout(restart, title, cfg) {
    const x = restart.x;
    const y = title.y + title.height + cfg.titleToButtonsGap + restart.height + cfg.buttonsGap;
    return { ...cfg.home, x, y };
  }

  /**
   * Führt getEndScreenButtons aus.
   */
  getEndScreenButtons() {
    const endImage = this.world.isVictory ? this.world.victoryImage : this.world.gameOverImage;
    const layout = this.getEndScreenLayout(endImage);
    return { restart: layout.restart, home: layout.home };
  }

  /**
   * Führt drawGameOverButton aus.
   * @param {*} button
   */
  drawGameOverButton(button) {
    this.drawButtonBackground(button);
    this.drawButtonLabel(button);
  }

  /**
   * Führt drawButtonBackground aus.
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
   * Führt hasButtonImage aus.
   */
  hasButtonImage() {
    return this.endScreenButtonImage.complete && this.endScreenButtonImage.naturalWidth > 0;
  }

  /**
   * Führt drawButtonLabel aus.
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
   * Führt clearCanvas aus.
   */
  clearCanvas() {
    this.world.ctx.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
  }

  /**
   * Führt moveCamera aus.
   */
  moveCamera() {
    this.world.ctx.translate(this.world.camera_x, 0);
  }

  /**
   * Führt resetCamera aus.
   */
  resetCamera() {
    this.world.ctx.translate(-this.world.camera_x, 0);
  }

  /**
   * Führt addObjectsToMap aus.
   * @param {*} objects
   */
  addObjectsToMap(objects) {
    objects.forEach((obj) => this.addToMap(obj));
  }

  /**
   * Führt addToMap aus.
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
   * Führt drawMirroredObject aus.
   * @param {*} obj
   */
  drawMirroredObject(obj) {
    this.world.ctx.translate(obj.x + obj.width, 0);
    this.world.ctx.scale(-1, 1);
    this.world.ctx.drawImage(obj.img, 0, obj.y, obj.width, obj.height);
    this.drawObjectFrame({ x: 0, y: obj.y, width: obj.width, height: obj.height }, obj);
  }

  /**
   * Führt drawNormalObject aus.
   * @param {*} obj
   */
  drawNormalObject(obj) {
    this.world.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
    this.drawObjectFrame(obj, obj);
  }

  /**
   * Führt drawBossHealthBarInWorld aus.
   */
  drawBossHealthBarInWorld() {
    const boss = this.world.getActiveEndboss();
    if (!boss) return;
    if (!this.isBossVisibleOnScreen(boss)) return;
    const bar = this.getBossHealthBarLayout(boss);
    this.drawBossHealthBar(bar);
  }

  /**
   * Führt isBossVisibleOnScreen aus.
   * @param {*} boss
   */
  isBossVisibleOnScreen(boss) {
    const screenX = boss.x + this.world.camera_x;
    const right = screenX + boss.width;
    return right >= 0 && screenX <= this.world.canvas.width;
  }

  /**
   * Führt getBossHealthBarLayout aus.
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
   * Führt drawBossHealthBar aus.
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
   * Führt drawObjectFrame aus.
   * @param {*} frameSource
   * @param {*} originalObject
   */
  drawObjectFrame(frameSource, originalObject) {
    // Hitbox-Frames (rot/blau) deaktiviert.
    // if (typeof originalObject.getHitbox === "function") {
    //   const hitbox = originalObject.getHitbox();
    //   this.drawFrame(hitbox.x, hitbox.y, hitbox.width, hitbox.height, "red");
    //   return;
    // }
    // this.drawFrame(frameSource.x, frameSource.y, frameSource.width, frameSource.height, "blue");
  }

  //drawFrame(x, y, width, height, color = "blue") {
  //  this.world.ctx.beginPath();
  //  this.world.ctx.lineWidth = 2;
  //  this.world.ctx.strokeStyle = color;
  //  this.world.ctx.strokeRect(x, y, width, height);
  //}
}
