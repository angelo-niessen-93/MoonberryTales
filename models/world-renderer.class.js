class WorldRenderer {
  constructor(world) {
    this.world = world;
    this.endScreenButtonImage = new Image();
    this.endScreenButtonImage.src = "img/14Pause/button_yellow.png";
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

    this.world.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    this.world.ctx.fillRect(0, 0, this.world.canvas.width, this.world.canvas.height);

    const layout = this.getEndScreenLayout(endImage);
    const title = layout.title;

    if (title.image && title.image.complete) {
      this.world.ctx.drawImage(title.image, title.x, title.y, title.width, title.height);
    }

    this.drawGameOverButton(layout.restart);
    this.drawGameOverButton(layout.home);

    this.world.ctx.restore();
  }

  getEndScreenLayout(endImage) {
    const titleToButtonsGap = 14;
    const buttonsGap = 14;
    const restart = this.world.gameOverButtons.restart;
    const home = this.world.gameOverButtons.home;
    const centerX = this.world.canvas.width / 2;

    const maxTitleWidth = Math.round(this.world.canvas.width * 0.9);
    const targetTitleHeight = Math.round(this.world.canvas.height * 0.5);
    const fallbackTitleWidth = 700;
    const fallbackTitleHeight = targetTitleHeight;

    let titleWidth = Math.min(maxTitleWidth, fallbackTitleWidth);
    let titleHeight = fallbackTitleHeight;
    if (endImage && endImage.complete && endImage.naturalWidth > 0 && endImage.naturalHeight > 0) {
      
      titleHeight = targetTitleHeight;
      titleWidth = Math.round((endImage.naturalWidth / endImage.naturalHeight) * titleHeight);

      if (titleWidth > maxTitleWidth) {
        titleWidth = maxTitleWidth;
        titleHeight = Math.round((endImage.naturalHeight / endImage.naturalWidth) * titleWidth);
      }
    }

    const contentHeight = titleHeight + titleToButtonsGap + restart.height + buttonsGap + home.height;
    const startY = Math.round((this.world.canvas.height - contentHeight) / 2);
    const buttonX = Math.round(centerX - restart.width / 2);

    return {
      title: {
        image: endImage,
        width: titleWidth,
        height: titleHeight,
        x: Math.round(centerX - titleWidth / 2),
        y: startY,
      },
      restart: {
        ...restart,
        x: buttonX,
        y: startY + titleHeight + titleToButtonsGap,
      },
      home: {
        ...home,
        x: buttonX,
        y: startY + titleHeight + titleToButtonsGap + restart.height + buttonsGap,
      },
    };
  }

  getEndScreenButtons() {
    const endImage = this.world.isVictory ? this.world.victoryImage : this.world.gameOverImage;
    const layout = this.getEndScreenLayout(endImage);
    return { restart: layout.restart, home: layout.home };
  }

  drawGameOverButton(button) {
    if (this.endScreenButtonImage.complete && this.endScreenButtonImage.naturalWidth > 0) {
      this.world.ctx.drawImage(
        this.endScreenButtonImage,
        button.x,
        button.y,
        button.width,
        button.height,
      );
    } else {
      this.world.ctx.fillStyle = "#f7b500";
      this.world.ctx.fillRect(button.x, button.y, button.width, button.height);
      this.world.ctx.strokeStyle = "#1c1c1c";
      this.world.ctx.lineWidth = 2;
      this.world.ctx.strokeRect(button.x, button.y, button.width, button.height);
    }

    this.world.ctx.fillStyle = "#1c1c1c";
    this.world.ctx.font = "bold 24px sans-serif";
    this.world.ctx.textAlign = "center";
    this.world.ctx.textBaseline = "middle";
    this.world.ctx.fillText(
      String(button.label).toUpperCase(),
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

  //drawFrame(x, y, width, height, color = "blue") {
    //this.world.ctx.beginPath();
    //this.world.ctx.lineWidth = 2;
    //this.world.ctx.strokeStyle = color;
    //this.world.ctx.strokeRect(x, y, width, height);
  //}
}
