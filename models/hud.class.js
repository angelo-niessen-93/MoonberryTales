/**
 * @file models/hud.class.js
 */
/**
 * Zeichnet und verwaltet das Heads-up-Display (Leben und MÃ¼nzen).
 */
class HUD {
  /**
   * Initialisiert Anzeigezustand und HUD-Assets.
   */
  constructor() {
    this.coinsCollected = 0;
    this.heartHudImage = new Image();
    this.heartHudImage.src = "img/Items/heart1.png";
    this.coinHudImage = new Image();
    this.coinHudImage.src = "img/Items/coin1.png";
  }

  /**
   * ErhÃ¶ht den MÃ¼nzstand.
   *
   * @param {number} [amount=1] Anzahl gesammelter MÃ¼nzen.
   * @returns {void}
   */
  addCoin(amount = 1) {
    this.coinsCollected += amount;
  }

  /**
   * Rendert das HUD auf dem Canvas.
   *
   * @param {CanvasRenderingContext2D} ctx Rendering-Kontext.
   * @param {{energy?: number}} character Aktueller Spielerstatus.
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
   * Führt getHealthData aus.
   * @param {*} character
   */
  getHealthData(character) {
    const maxHealth = 100;
    const currentHealth = Math.max(0, Math.min(maxHealth, character.energy ?? 0));
    return { maxHealth, currentHealth, healthPercent: currentHealth / maxHealth };
  }

  /**
   * Führt getHudLayout aus.
   */
  getHudLayout() {
    return { barX: 20, barY: 18, barWidth: 220, barHeight: 24, heartIconSize: 16, coinIconSize: 24 };
  }

  /**
   * Führt drawHudBackground aus.
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
   * Führt drawHealthSection aus.
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
   * Führt drawHealthBar aus.
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
   * Führt drawHeartIcon aus.
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
   * Führt drawCoinSection aus.
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



