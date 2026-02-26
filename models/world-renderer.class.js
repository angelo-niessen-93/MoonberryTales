class WorldRenderer {
  constructor(world) {
    this.world = world;
  }

  renderFrame() {
    this.clearCanvas();
    this.moveCamera();

    [
      this.world.backgroundObjects,
      this.world.chain,
      this.world.tiles,
      this.world.items,
      this.world.projectiles,
      [this.world.character],
      this.world.enemies,
    ].forEach((group) => this.addObjectsToMap(group));

    this.resetCamera();
    this.world.hud.draw(this.world.ctx, this.world.character);

    if (this.world.isGameOver) {
      this.drawEndScreen(this.world.gameOverImage);
    } else if (this.world.isVictory) {
      this.drawEndScreen(this.world.victoryImage);
    }
  }

  drawEndScreen(endImage) {
    this.world.ctx.save();

    this.world.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    this.world.ctx.fillRect(0, 0, this.world.canvas.width, this.world.canvas.height);

    const isVictoryImage = endImage === this.world.victoryImage;
    const fallbackWidth = 460;
    const fallbackHeight = isVictoryImage ? 360 : 220;
    let imageWidth = fallbackWidth;
    let imageHeight = fallbackHeight;
    if (endImage && endImage.complete && endImage.naturalWidth > 0 && endImage.naturalHeight > 0) {
      const scaleByHeight = fallbackHeight / endImage.naturalHeight;
      imageHeight = fallbackHeight;
      imageWidth = Math.round(endImage.naturalWidth * scaleByHeight);
    }
    const imageX = (this.world.canvas.width - imageWidth) / 2;
    const imageY = 95;

    if (endImage && endImage.complete) {
      this.world.ctx.drawImage(endImage, imageX, imageY, imageWidth, imageHeight);
    }

    const buttons = this.getEndScreenButtons();
    this.drawGameOverButton(buttons.restart, "#f7b500", "#1c1c1c");
    this.drawGameOverButton(buttons.home, "#e4e4e4", "#1c1c1c");

    this.world.ctx.restore();
  }

  getEndScreenButtons() {
    const gap = 20;
    const restart = this.world.gameOverButtons.restart;
    const home = this.world.gameOverButtons.home;
    const totalWidth = restart.width + gap + home.width;
    const startX = Math.round((this.world.canvas.width - totalWidth) / 2);
    const y = Math.round(this.world.canvas.height - 100);

    return {
      restart: { ...restart, x: startX, y },
      home: { ...home, x: startX + restart.width + gap, y },
    };
  }

  drawGameOverButton(button, bgColor, textColor) {
    this.world.ctx.fillStyle = bgColor;
    this.world.ctx.fillRect(button.x, button.y, button.width, button.height);

    this.world.ctx.strokeStyle = "#1c1c1c";
    this.world.ctx.lineWidth = 2;
    this.world.ctx.strokeRect(button.x, button.y, button.width, button.height);

    this.world.ctx.fillStyle = textColor;
    this.world.ctx.font = "20px sans-serif";
    this.world.ctx.textAlign = "center";
    this.world.ctx.textBaseline = "middle";
    this.world.ctx.fillText(
      button.label,
      button.x + button.width / 2,
      button.y + button.height / 2,
    );
  }

  clearCanvas() {
    this.world.ctx.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
  }

  moveCamera() {
    this.world.ctx.translate(this.world.camera_x, 0);
  }

  resetCamera() {
    this.world.ctx.translate(-this.world.camera_x, 0);
  }

  addObjectsToMap(objects) {
    objects.forEach((obj) => this.addToMap(obj));
  }

  addToMap(obj) {
    if (!obj || !obj.img) {
      return;
    }

    this.world.ctx.save();

    if (obj.othersDirection) {
      this.world.ctx.translate(obj.x + obj.width, 0);
      this.world.ctx.scale(-1, 1);
      this.world.ctx.drawImage(obj.img, 0, obj.y, obj.width, obj.height);
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
      this.world.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
      this.drawObjectFrame(obj, obj);
    }

    this.world.ctx.restore();
  }

  drawObjectFrame(frameSource, originalObject) {
    // Hitbox-Frames (rot/blau) deaktiviert.
    // if (typeof originalObject.getHitbox === "function") {
    //   const hitbox = originalObject.getHitbox();
    //   this.drawFrame(hitbox.x, hitbox.y, hitbox.width, hitbox.height, "red");
    //   return;
    // }
    //
    // this.drawFrame(
    //   frameSource.x,
    //   frameSource.y,
    //   frameSource.width,
    //   frameSource.height,
    //   "blue",
    // );
  }

  drawFrame(x, y, width, height, color = "blue") {
    this.world.ctx.beginPath();
    this.world.ctx.lineWidth = 2;
    this.world.ctx.strokeStyle = color;
    this.world.ctx.strokeRect(x, y, width, height);
  }
}
