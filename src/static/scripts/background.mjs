import { Foliage } from "./foliage.mjs";
export class Background {
  tiles = [];
  background = null;
  tileSize = 64;
  scale = 2;

  constructor(manager) {
    this.manager = manager;
    this.foliage = new Foliage(this.manager);

    this.init();
  }

  //Split tiles
  init() {
    const tilesX =
      this.manager.gameObjects.assets.tileSets.background.width / this.tileSize;
    const tilesY =
      this.manager.gameObjects.assets.tileSets.background.height /
      this.tileSize;

    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        const tile = createGraphics(this.tileSize, this.tileSize);
        tile.image(
          this.manager.gameObjects.assets.tileSets.background,
          0,
          0,
          this.tileSize,
          this.tileSize,
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );

        this.tiles.push(tile);
      }
    }

    //remove the two last tiles
    this.tiles.pop();
    this.tiles.pop();

    this.createBackground();
  }

  createBackground() {
    this.background = createGraphics(width, height);
    //Create random background that fills the screen
    for (let i = 0; i < width; i += this.tileSize) {
      for (let j = 0; j < height; j += this.tileSize) {
        const tileIndex = floor(random(this.tiles.length));
        const tile = this.tiles[tileIndex];
        this.background.image(
          tile,
          i,
          j,
          this.tileSize * this.scale,
          this.tileSize * this.scale
        );
      }
    }

    this.foliage.createFoliage();

    this.background.image(
      this.foliage.foliage,
      0,
      0,
      this.foliage.foliage.width,
      this.foliage.foliage.height
    );
  }

  draw() {
    image(
      this.background,
      -width / 2,
      -height / 2,
      width,
      height,
      0,
      0,
      this.background.width,
      this.background.height,
      COVER
    );
  }
}
