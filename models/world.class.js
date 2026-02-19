class World {
  character;
  level = level1;
  enemies;
  chain;
  tiles;
  backgroundObjects;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  levelEndX = 720 * 5 ;


  constructor(canvas) {
    this.character = new Character();
    this.level = typeof level1 !== "undefined"
      ? level1
      : new Level(
        Monster.createForLevel(120, 10),
        Chain.createForArea(-720, 720 * 5, 720),
        BackgroundObject.createForArea(-720, 720 * 5, 720, 0),
        Tiles.createPlatformsForArea(-720, 720 * 5, 320, [170, 230, 290, 350])
      );
    this.enemies = this.level.enemies;
    this.chain = this.level.chain;
    this.tiles = this.level.tiles;
    this.backgroundObjects = this.level.backgroundObjects;
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.draw();
    this.setWorld();
  }

  setWorld() {
    this.character.world = this;
    this.enemies.forEach((enemy) => {
      enemy.world = this;
    });
  }


  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.backgroundObjects);
    this.addObjectsToMap(this.chain);
    this.addObjectsToMap(this.tiles);
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);

    this.ctx.translate(-this.camera_x, 0);

    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach((object) => {
      this.addToMap(object);
    });
  }

  addLoopingObjectToMap(movableObject) {
    this.ctx.drawImage(
      movableObject.img,
      movableObject.x,
      movableObject.y,
      movableObject.width,
      movableObject.height
    );

    this.ctx.drawImage(
      movableObject.img,
      movableObject.x + movableObject.width,
      movableObject.y,
      movableObject.width,
      movableObject.height
    );
  }

  addToMap(movableObject) {
    this.ctx.save();

    if (movableObject.othersDirection) {
      this.ctx.translate(movableObject.x + movableObject.width, 0);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(
        movableObject.img,
        0,
        movableObject.y,
        movableObject.width,
        movableObject.height
      );
    } else {
      this.ctx.drawImage(
        movableObject.img,
        movableObject.x,
        movableObject.y,
        movableObject.width,
        movableObject.height
      );
    }

    this.ctx.restore();
  }
}
