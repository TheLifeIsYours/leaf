import { Foliage } from "./foliage.mjs";

export class Background {
  constructor(manager, onChunkCreated) {
    this.manager = manager;
    this.foliage = new Foliage(this.manager);

    this.tiles = [];
    this.tileCount = 0;

    this.chunks = [];
    this.background = null;

    this.tileSize = 32;
    this.scale = 2;

    this.chunkWidth =
      width -
      (width % (this.tileSize * this.scale)) +
      this.tileSize * this.scale;

    this.chunkHeight =
      height -
      (height % (this.tileSize * this.scale)) +
      this.tileSize * this.scale;

    this.chunkEdgeBuffer = Math.max(this.chunkWidth / 4, this.chunkHeight / 4); // Distance from the edge to trigger chunk creation
    this.currentChunk = null;
    this.onChunkCreated = onChunkCreated;

    this.showTileList = false;

    //Operations
    this.splitTiles();
    this.init();
  }

  init() {
    this.createInitialChunk();
    this.setCurrentChunk(0, 0);
    this.createAllSurroundingChunks();

    globalThis.addEventListener("keydown", (e) => {
      if (e.key === "t") {
        this.showTileList = !this.showTileList;
      }
    });
  }

  //clear and start over
  windowResized() {
    const { x, y } = this.currentChunk;
    for (const chunk of this.chunks) {
      chunk.image.remove();
    }

    this.chunks = [];
    this.createChunk(x, y);
    this.setCurrentChunk(x, y);
    this.createAllSurroundingChunks();
  }

  splitTiles() {
    const { width, height } =
      this.manager.gameObjects.assets.tileSets.background;
    const tilesX = width / this.tileSize;
    const tilesY = height / this.tileSize;

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
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

    // Remove the last two tiles
    // this.tiles.pop();
    // this.tiles.pop();

    this.tileCount = this.tiles.length;
  }

  displayTileList() {
    let x = 0;
    let y = 0;

    //Black background
    fill(0);
    rect(-40, -40, this.chunkWidth / 2 + 40, this.chunkHeight / 2 + 40);

    for (const tile of this.tiles) {
      image(tile, x, y, this.tileSize, this.tileSize);
      text(`${this.tiles.indexOf(tile)}`, x, y + this.tileSize + 20);

      x += this.tileSize + 20;
      if (x >= this.chunkWidth / 2) {
        x = 0;
        y += this.tileSize + 40;
      }
    }
  }

  createInitialChunk() {
    this.createChunk(0, 0);
  }

  setCurrentChunk(x, y) {
    this.currentChunk = this.chunks.find(
      (chunk) => chunk.x === x && chunk.y === y
    );
  }

  createChunk(x, y) {
    const chunk = {
      x,
      y,
      width: 0,
      height: 0,
      image: null,
    };

    const chunkImage = createFramebuffer({
      width: this.chunkWidth,
      height: this.chunkHeight,
    });

    chunkImage.begin();
    translate(-this.chunkWidth / 2, -this.chunkHeight / 2);
    background(255);
    this.fillChunkWithTiles();
    this.addFoliageToChunk(chunkImage);
    chunkImage.end();

    chunk.image = chunkImage.get();
    chunk.width = chunk.image.width;
    chunk.height = chunk.image.height;

    chunkImage.remove();
    this.chunks.push(chunk);

    if (this.onChunkCreated !== undefined) this.onChunkCreated(chunk);
  }

  fillChunkWithTiles() {
    noiseDetail(4, 0.6);
    const xScale = 0.0035;
    const yScale = 0.002;

    for (let x = 0; x < this.chunkWidth; x += this.tileSize * this.scale) {
      for (let y = 0; y < this.chunkHeight; y += this.tileSize * this.scale) {
        const noiseWithOffset = noise(
          (x + this.manager.player.offset.x) * xScale,
          (y + this.manager.player.offset.y) * yScale
        );

        let index = 0;
        if (noiseWithOffset > 0.4) {
          index = Math.floor(random(0, 22));
        } else {
          index = Math.floor(random(23, 47));
        }

        image(
          this.tiles[index],
          x,
          y,
          this.tileSize * this.scale,
          this.tileSize * this.scale
        );
      }
    }
  }

  addFoliageToChunk() {
    this.foliage.createFoliage();
    image(
      this.foliage.foliage,
      0,
      0,
      this.foliage.foliage.width,
      this.foliage.foliage.height
    );
  }

  update() {
    const player = this.manager.player;
    const pPos = player.pos;
    const pOffset = player.offset;

    if (this.isPlayerOutOfCurrentChunk(pPos, pOffset)) {
      this.updateCurrentChunk(pPos, pOffset);
      this.deleteFarAwayChunks();
    } else return;

    if (!this.currentChunk) return;
    this.checkAndCreateSurroundingChunks(pPos, pOffset);
  }

  isPlayerOutOfCurrentChunk(pPos, pOffset) {
    return (
      !this.currentChunk ||
      pPos.x - pOffset.x < this.currentChunk.x ||
      pPos.x - pOffset.x > this.currentChunk.x + this.chunkWidth ||
      pPos.y - pOffset.y < this.currentChunk.y ||
      pPos.y - pOffset.y > this.currentChunk.y + this.chunkHeight
    );
  }

  updateCurrentChunk(pPos, pOffset) {
    const nextCurrentChunk = this.chunks.find(
      (chunk) =>
        pPos.x - pOffset.x >= chunk.x &&
        pPos.x - pOffset.x <= chunk.x + this.chunkWidth &&
        pPos.y - pOffset.y >= chunk.y &&
        pPos.y - pOffset.y <= chunk.y + this.chunkHeight
    );

    if (nextCurrentChunk) {
      this.currentChunk = nextCurrentChunk;
      this.createNeighboringChunks();
    }
  }

  createNeighboringChunks() {
    const { x: currentChunkX, y: currentChunkY } = this.currentChunk;

    this.createChunkIfNotExists(currentChunkX - this.chunkWidth, currentChunkY);
    this.createChunkIfNotExists(currentChunkX + this.chunkWidth, currentChunkY);
    this.createChunkIfNotExists(
      currentChunkX,
      currentChunkY - this.chunkHeight
    );
    this.createChunkIfNotExists(
      currentChunkX,
      currentChunkY + this.chunkHeight
    );
  }

  createChunkIfNotExists(x, y) {
    if (!this.chunks.some((chunk) => chunk.x === x && chunk.y === y)) {
      this.createChunk(x, y);
    }
  }

  createAllSurroundingChunks() {
    const { x: currentChunkX, y: currentChunkY } = this.currentChunk;

    this.createChunkIfNotExists(currentChunkX - this.chunkWidth, currentChunkY);
    this.createChunkIfNotExists(currentChunkX + this.chunkWidth, currentChunkY);
    this.createChunkIfNotExists(
      currentChunkX,
      currentChunkY - this.chunkHeight
    );
    this.createChunkIfNotExists(
      currentChunkX,
      currentChunkY + this.chunkHeight
    );
    this.createChunkIfNotExists(
      currentChunkX - this.chunkWidth,
      currentChunkY - this.chunkHeight
    );
    this.createChunkIfNotExists(
      currentChunkX + this.chunkWidth,
      currentChunkY - this.chunkHeight
    );
    this.createChunkIfNotExists(
      currentChunkX - this.chunkWidth,
      currentChunkY + this.chunkHeight
    );
    this.createChunkIfNotExists(
      currentChunkX + this.chunkWidth,
      currentChunkY + this.chunkHeight
    );
  }

  checkAndCreateSurroundingChunks(pPos, pOffset) {
    const { x: currentChunkX, y: currentChunkY } = this.currentChunk;

    if (pPos.x - pOffset.x < currentChunkX + this.chunkEdgeBuffer) {
      this.createChunkIfNotExists(
        currentChunkX - this.chunkWidth,
        currentChunkY
      );
      this.createChunkIfNotExists(
        currentChunkX - this.chunkWidth,
        currentChunkY - this.chunkHeight
      );
      this.createChunkIfNotExists(
        currentChunkX - this.chunkWidth,
        currentChunkY + this.chunkHeight
      );
    }

    if (
      pPos.x - pOffset.x >
      currentChunkX + this.chunkWidth - this.chunkEdgeBuffer
    ) {
      this.createChunkIfNotExists(
        currentChunkX + this.chunkWidth,
        currentChunkY
      );
      this.createChunkIfNotExists(
        currentChunkX + this.chunkWidth,
        currentChunkY - this.chunkHeight
      );
      this.createChunkIfNotExists(
        currentChunkX + this.chunkWidth,
        currentChunkY + this.chunkHeight
      );
    }

    if (pPos.y - pOffset.y < currentChunkY + this.chunkEdgeBuffer) {
      this.createChunkIfNotExists(
        currentChunkX,
        currentChunkY - this.chunkHeight
      );
      this.createChunkIfNotExists(
        currentChunkX - this.chunkWidth,
        currentChunkY - this.chunkHeight
      );
      this.createChunkIfNotExists(
        currentChunkX + this.chunkWidth,
        currentChunkY - this.chunkHeight
      );
    }

    if (
      pPos.y - pOffset.y >
      currentChunkY + this.chunkHeight - this.chunkEdgeBuffer
    ) {
      this.createChunkIfNotExists(
        currentChunkX,
        currentChunkY + this.chunkHeight
      );
      this.createChunkIfNotExists(
        currentChunkX - this.chunkWidth,
        currentChunkY + this.chunkHeight
      );
      this.createChunkIfNotExists(
        currentChunkX + this.chunkWidth,
        currentChunkY + this.chunkHeight
      );
    }
  }

  deleteFarAwayChunks() {
    if (this.chunks.length < 25) return;
    const { x: currentChunkX, y: currentChunkY } = this.currentChunk;

    //Delete chunks that are 5 chunks away from the current chunk
    this.chunks = this.chunks.filter(
      (chunk) =>
        chunk.x >= currentChunkX - this.chunkWidth * 5 &&
        chunk.x <= currentChunkX + this.chunkWidth * 5 &&
        chunk.y >= currentChunkY - this.chunkHeight * 5 &&
        chunk.y <= currentChunkY + this.chunkHeight * 5
    );
  }

  draw() {
    noStroke();
    for (const chunk of this.chunks) {
      image(
        chunk.image,
        chunk.x - this.chunkWidth / 2,
        chunk.y - this.chunkHeight / 2
      );
    }

    if (this.showTileList) {
      push();
      translate(0, 0, 90);
      this.displayTileList();
      pop();
    }
  }
}
