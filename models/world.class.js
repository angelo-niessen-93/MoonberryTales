class World {
  camera_x = 0;
  levelEndX = 720 * 5;

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;

    this.character = new Character();
    this.level = this.createLevel();

    this.enemies = this.level.enemies;
    this.chain = this.level.chain;
    this.tiles = this.level.tiles;
    this.backgroundObjects = this.level.backgroundObjects;

    this.setWorld();
    this.draw();
  }

  createLevel() {
    if (typeof level1 !== "undefined") return level1;

    return new Level(
      Monster.createForLevel(120, 10),
      Chain.createForArea(-720, 720 * 5, 720),
      BackgroundObject.createForArea(-720, 720 * 5, 720, 0),
      Tiles.createPlatformsForArea(-720, 720 * 5, 320, [170, 230, 290, 350])
    );
  }

  setWorld() {
    this.character.world = this;
    this.enemies.forEach(enemy => enemy.world = this);
  }

  draw = () => {
    this.clearCanvas();
    this.moveCamera();

    [
      this.backgroundObjects,
      this.chain,
      this.tiles,
      [this.character],
      this.enemies
    ].forEach(group => this.addObjectsToMap(group));

    this.resetCamera();
    requestAnimationFrame(this.draw);
  };

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
    objects.forEach(obj => this.addToMap(obj));
  }

  addToMap(obj) {
    this.ctx.save();

    if (obj.othersDirection) {
      this.ctx.translate(obj.x + obj.width, 0);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(obj.img, 0, obj.y, obj.width, obj.height);
      this.drawFrame(0, obj.y, obj.width, obj.height);
    } else {
      this.ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
      this.drawFrame(obj.x, obj.y, obj.width, obj.height);
    }

    this.ctx.restore();
  }

  drawFrame(x, y, width, height) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(x, y, width, height);
  }
}
