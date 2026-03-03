/**
 * @file models/hud.class.js
 */
/**
 * Draws and manages the heads-up display (health and coins).
 */
class HUD {
  /**
   * Initializes display state and HUD assets.
   */
  constructor() {
    this.coinsCollected = 0;
    this.heartHudImage = new Image();
    this.heartHudImage.src = "img/Items/heart1.png";
    this.coinHudImage = new Image();
    this.coinHudImage.src = "img/Items/coin1.png";
  }

  /**
   * Increases the coin count.
   *
   * @param {number} [amount=1] Number of collected coins.
   * @returns {void}
   */
  addCoin(amount = 1) {
    this.coinsCollected += amount;
  }

  /**
   * Renders the HUD on the canvas.
   *
   * @param {CanvasRenderingContext2D} ctx Rendering context.
   * @param {{energy?: number}} character Current player state.
   * @returns {void}
   */
  draw(ctx, character) {
    if (!ctx || !character) return;
    const health = this.getHealthData(character);
    const layout = this.getHudLayout();
    ctx.save();
    this.drawHudBackground(ctx);
    this.drawHealthSection(ctx, health, layout);
    this.drawCoinSection(ctx, layout);
    ctx.restore();
  }

  /**
   * Runs getHealthData.
   * @param {*} character
   */
  getHealthData(character) {
    const maxHealth = 100;
    const currentHealth = Math.max(0, Math.min(maxHealth, character.energy ?? 0));
    return { maxHealth, currentHealth, healthPercent: currentHealth / maxHealth };
  }

  /**
   * Runs getHudLayout.
   */
  getHudLayout() {
    return { barX: 20, barY: 18, barWidth: 220, barHeight: 24, heartIconSize: 16, coinIconSize: 24 };
  }

  /**
   * Runs drawHudBackground.
   * @param {*} ctx
   */
  drawHudBackground(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(10, 10, 300, 78);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
  }

  /**
   * Runs drawHealthSection.
   * @param {*} ctx
   * @param {*} health
   * @param {*} layout
   */
  drawHealthSection(ctx, health, layout) {
    this.drawHealthBar(ctx, health, layout);
    this.drawHeartIcon(ctx, layout);
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px sans-serif";
    const textX = layout.barX + layout.heartIconSize + 14;
    ctx.fillText(`${Math.round(health.currentHealth)}/${health.maxHealth}`, textX, layout.barY + 21);
  }

  /**
   * Runs drawHealthBar.
   * @param {*} ctx
   * @param {*} health
   * @param {*} layout
   */
  drawHealthBar(ctx, health, layout) {
    const y = layout.barY + 8;
    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(layout.barX, y, layout.barWidth, layout.barHeight);
    ctx.fillStyle = health.healthPercent > 0.35 ? "#39d353" : "#ef4444";
    ctx.fillRect(layout.barX, y, layout.barWidth * health.healthPercent, layout.barHeight);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(layout.barX, y, layout.barWidth, layout.barHeight);
  }

  /**
   * Runs drawHeartIcon.
   * @param {*} ctx
   * @param {*} layout
   */
  drawHeartIcon(ctx, layout) {
    if (!this.heartHudImage.complete) return;
    const x = layout.barX + 8;
    const y = layout.barY + 13;
    ctx.drawImage(this.heartHudImage, x, y, layout.heartIconSize, layout.heartIconSize);
  }

  /**
   * Runs drawCoinSection.
   * @param {*} ctx
   * @param {*} layout
   */
  drawCoinSection(ctx, layout) {
    const coinX = layout.barX;
    const coinY = 60;
    if (this.coinHudImage.complete) {
      ctx.drawImage(this.coinHudImage, coinX, coinY, layout.coinIconSize, layout.coinIconSize);
    }
    ctx.font = "18px sans-serif";
    ctx.fillText(`${this.coinsCollected}`, coinX + layout.coinIconSize + 8, 72);
  }

}




