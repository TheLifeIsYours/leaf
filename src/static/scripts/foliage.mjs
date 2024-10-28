export class Foliage {
  tiles = [];
  amount = 100;
  scale = 1.7;
  edgeBuffer = 200;

  constructor(manager) {
    this.manager = manager;

    this.init();
  }

  init() {
    const spriteMap = {
      largeTree: {
        x: 24,
        y: 14,
        width: 113,
        height: 139,
      },
      mediumTree: {
        x: 161,
        y: 17,
        width: 97,
        height: 136,
      },
      smallTree: {
        x: 295,
        y: 31,
        width: 79,
        height: 120,
      },
      bush_1: {
        x: 38,
        y: 198,
        width: 22,
        height: 19,
      },
      bush_2: {
        x: 98,
        y: 195,
        width: 27,
        height: 25,
      },
      bush_3: {
        x: 156,
        y: 190,
        width: 38,
        height: 32,
      },
      bush_4: {
        x: 216,
        y: 186,
        width: 47,
        height: 42,
      },
      bush_5: {
        x: 282,
        y: 186,
        width: 39,
        height: 45,
      },
      bush_6: {
        x: 346,
        y: 190,
        width: 40,
        height: 35,
      },
      grass_1: {
        x: 0,
        y: 386,
        width: 32,
        height: 32,
      },
      grass_2: {
        x: 32,
        y: 386,
        width: 32,
        height: 32,
      },
      grass_3: {
        x: 64,
        y: 386,
        width: 32,
        height: 32,
      },
      grass_4: {
        x: 96,
        y: 386,
        width: 32,
        height: 32,
      },
      grass_5: {
        x: 0,
        y: 418,
        width: 32,
        height: 32,
      },
      grass_6: {
        x: 32,
        y: 418,
        width: 32,
        height: 32,
      },
      grass_7: {
        x: 64,
        y: 418,
        width: 32,
        height: 32,
      },
      grass_8: {
        x: 96,
        y: 418,
        width: 32,
        height: 32,
      },
      grass_9: {
        x: 0,
        y: 450,
        width: 32,
        height: 32,
      },
      grass_10: {
        x: 32,
        y: 450,
        width: 32,
        height: 32,
      },
      grass_11: {
        x: 64,
        y: 450,
        width: 32,
        height: 32,
      },
      grass_12: {
        x: 96,
        y: 450,
        width: 32,
        height: 32,
      },
      grass_13: {
        x: 0,
        y: 482,
        width: 32,
        height: 32,
      },
      grass_14: {
        x: 32,
        y: 482,
        width: 32,
        height: 32,
      },
      grass_15: {
        x: 64,
        y: 482,
        width: 32,
        height: 32,
      },
      grass_16: {
        x: 96,
        y: 482,
        width: 32,
        height: 32,
      },
    };

    for (const spriteCord of Object.values(spriteMap)) {
      const { x, y, width, height } = spriteCord;
      const sprite = createGraphics(width, height);
      sprite.image(
        this.manager.gameObjects.assets.tileSets.foliage,
        0,
        0,
        width,
        height,
        x,
        y,
        width,
        height
      );
      this.tiles.push(sprite);
    }

    this.createFoliage();
  }

  createFoliage() {
    const foliage = createGraphics(
      width + this.edgeBuffer,
      height + this.edgeBuffer
    );

    //Place random foliage on the screen, from bottom to top
    let y = 0;

    for (let i = 0; i < this.amount; i++) {
      const tileIndex = floor(random(this.tiles.length));
      const tile = this.tiles[tileIndex];

      const x = random(width - this.edgeBuffer);
      y += random(10, 20);
      y = constrain(y, 0, height + this.edgeBuffer);

      foliage.image(
        tile,
        x,
        y,
        tile.width * this.scale,
        tile.height * this.scale
      );
    }

    this.foliage = foliage.get();
    foliage.remove();
  }
}
