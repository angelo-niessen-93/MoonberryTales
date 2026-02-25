class HUD {
  constructor() {
    this.coinsCollected = 0;
    this.heartHudImage = new Image();
    this.heartHudImage.src = "img/Items/heart1.png";
    this.coinHudImage = new Image();
    this.coinHudImage.src = "img/Items/coin1.png";
  }

  addCoin(amount = 1) {
    this.coinsCollected += amount;
  }

  draw(ctx, character) {
    if (!ctx || !character) {
      return;
    }

    const maxHealth = 100;
    const currentHealth = Math.max(0, Math.min(maxHealth, character.energy ?? 0));
    const healthPercent = currentHealth / maxHealth;

    const barX = 20;
    const barY = 18;
    const barWidth = 220;
    const barHeight = 24;

    ctx.save();

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(10, 10, 300, 78);

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(barX, barY + 8, barWidth, barHeight);

    ctx.fillStyle = healthPercent > 0.35 ? "#39d353" : "#ef4444";
    ctx.fillRect(barX, barY + 8, barWidth * healthPercent, barHeight);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY + 8, barWidth, barHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "15px sans-serif";
    const heartIconSize = 16;
    const heartIconX = barX + 8;
    const heartIconY = barY + 13;
    if (this.heartHudImage.complete) {
      ctx.drawImage(
        this.heartHudImage,
        heartIconX,
        heartIconY,
        heartIconSize,
        heartIconSize,
      );
    }
    ctx.fillText(`${Math.round(currentHealth)}/${maxHealth}`, heartIconX + heartIconSize + 6, barY + 21);

    const coinIconSize = 24;
    const coinIconX = barX;
    const coinIconY = 60;
    if (this.coinHudImage.complete) {
      ctx.drawImage(
        this.coinHudImage,
        coinIconX,
        coinIconY,
        coinIconSize,
        coinIconSize,
      );
    }

    ctx.font = "18px sans-serif";
    ctx.fillText(`${this.coinsCollected}`, coinIconX + coinIconSize + 8, 72);

    ctx.restore();
  }
}
