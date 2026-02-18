class World {
  character = new Character();
  enemies = [
    new Monster(), 
    new Monster(), 
    new Monster(), 
    new Monster(),
  ];
  chain = [
    new Chain(),
  ];
  backgroundObjects = [
    new BackgroundObject('../img/Background/back_ruin_spots.png', 0, 0),
    new BackgroundObject('../img/Background/ruins_closer.png', 0, 0),
    new BackgroundObject('../img/Background/ruins_low1.png', 0, 0),
    new BackgroundObject('../img/Background/ruins_main.png', 0, 0),
    new BackgroundObject('../img/Background/chains.png', 0, 0),
    new BackgroundObject('../img/Background/floor_ruins.png', 0, 0),
  ];
  canvas;
  ctx;

  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.addObjectsToMap(this.backgroundObjects);
    this.chain.forEach((chainObject) => this.addLoopingObjectToMap(chainObject));
    this.addToMap(this.character);
    this.addObjectsToMap(this.enemies);

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
    this.ctx.drawImage(
      movableObject.img,
      movableObject.x,
      movableObject.y,
      movableObject.width,
      movableObject.height
    );
  }
}
