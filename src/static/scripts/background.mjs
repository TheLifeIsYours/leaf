import { Foliage } from "./foliage.mjs";

export class Background {
  constructor(manager) {
    this.manager = manager;
    this.foliage = new Foliage(this.manager);
    this.tiles = [];
    this.chunks = [];
    this.background = null;
    this.tileSize = 64;
    this.scale = 2;
    this.chunkEdgeBuffer = Math.max(width / 4, height / 4); // Distance from the edge to trigger chunk creation
    this.currentChunk = null;

    this.init();
  }

  init() {
    this.splitTiles();
    this.createInitialChunk();
    this.setCurrentChunk(0, 0);
  }

  splitTiles() {
    const { width, height } =
      this.manager.gameObjects.assets.tileSets.background;
    const tilesX = width / this.tileSize;
    const tilesY = height / this.tileSize;

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

    // Remove the last two tiles
    this.tiles.pop();
    this.tiles.pop();
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
    const chunk = { x, y, image: null };
    const chunkImage = createGraphics(width, height);
    chunkImage.background(0);

    this.fillChunkWithTiles(chunkImage);
    this.addFoliageToChunk(chunkImage);

    chunk.image = chunkImage.get();
    chunkImage.remove();
    this.chunks.push(chunk);
  }

  fillChunkWithTiles(chunkImage) {
    const xScale = 0.015;
    const yScale = 0.02;

    for (let x = 0; x < width; x += this.tileSize) {
      for (let y = 0; y < height; y += this.tileSize) {
        const noiseWithOffset = noise(
          (x + this.manager.player.offset.x) * xScale,
          (y + this.manager.player.offset.y) * yScale
        );
        const index = Math.floor(noiseWithOffset * this.tiles.length);
        chunkImage.image(
          this.tiles[index],
          x,
          y,
          this.tileSize * this.scale,
          this.tileSize * this.scale
        );
      }
    }
  }

  addFoliageToChunk(chunkImage) {
    this.foliage.createFoliage();
    chunkImage.image(
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
    console.log("Creating surrounding chunks");

    if (!this.currentChunk) return;

    this.checkAndCreateSurroundingChunks(pPos, pOffset);
  }

  isPlayerOutOfCurrentChunk(pPos, pOffset) {
    return (
      !this.currentChunk ||
      pPos.x - pOffset.x < this.currentChunk.x ||
      pPos.x - pOffset.x > this.currentChunk.x + width ||
      pPos.y - pOffset.y < this.currentChunk.y ||
      pPos.y - pOffset.y > this.currentChunk.y + height
    );
  }

  updateCurrentChunk(pPos, pOffset) {
    const nextCurrentChunk = this.chunks.find(
      (chunk) =>
        pPos.x - pOffset.x >= chunk.x &&
        pPos.x - pOffset.x <= chunk.x + width &&
        pPos.y - pOffset.y >= chunk.y &&
        pPos.y - pOffset.y <= chunk.y + height
    );

    if (nextCurrentChunk) {
      this.currentChunk = nextCurrentChunk;
      this.createNeighboringChunks();
    }
  }

  createNeighboringChunks() {
    const { x: currentChunkX, y: currentChunkY } = this.currentChunk;

    this.createChunkIfNotExists(currentChunkX - width, currentChunkY);
    this.createChunkIfNotExists(currentChunkX + width, currentChunkY);
    this.createChunkIfNotExists(currentChunkX, currentChunkY - height);
    this.createChunkIfNotExists(currentChunkX, currentChunkY + height);
  }

  createChunkIfNotExists(x, y) {
    if (!this.chunks.some((chunk) => chunk.x === x && chunk.y === y)) {
      this.createChunk(x, y);
    }
  }

  checkAndCreateSurroundingChunks(pPos, pOffset) {
    const { x: currentChunkX, y: currentChunkY } = this.currentChunk;

    if (pPos.x - pOffset.x < currentChunkX + this.chunkEdgeBuffer) {
      this.createChunkIfNotExists(currentChunkX - width, currentChunkY);
      this.createChunkIfNotExists(
        currentChunkX - width,
        currentChunkY - height
      );
      this.createChunkIfNotExists(
        currentChunkX - width,
        currentChunkY + height
      );
    }

    if (pPos.x - pOffset.x > currentChunkX + width - this.chunkEdgeBuffer) {
      this.createChunkIfNotExists(currentChunkX + width, currentChunkY);
      this.createChunkIfNotExists(
        currentChunkX + width,
        currentChunkY - height
      );
      this.createChunkIfNotExists(
        currentChunkX + width,
        currentChunkY + height
      );
    }

    if (pPos.y - pOffset.y < currentChunkY + this.chunkEdgeBuffer) {
      this.createChunkIfNotExists(currentChunkX, currentChunkY - height);
      this.createChunkIfNotExists(
        currentChunkX - width,
        currentChunkY - height
      );
      this.createChunkIfNotExists(
        currentChunkX + width,
        currentChunkY - height
      );
    }

    if (pPos.y - pOffset.y > currentChunkY + height - this.chunkEdgeBuffer) {
      this.createChunkIfNotExists(currentChunkX, currentChunkY + height);
      this.createChunkIfNotExists(
        currentChunkX - width,
        currentChunkY + height
      );
      this.createChunkIfNotExists(
        currentChunkX + width,
        currentChunkY + height
      );
    }
  }

  deleteFarAwayChunks() {
    if (this.chunks.length < 25) return;
    const { x: currentChunkX, y: currentChunkY } = this.currentChunk;

    //Delete chunks that are 5 chunks away from the current chunk
    this.chunks = this.chunks.filter(
      (chunk) =>
        chunk.x >= currentChunkX - width * 5 &&
        chunk.x <= currentChunkX + width * 5 &&
        chunk.y >= currentChunkY - height * 5 &&
        chunk.y <= currentChunkY + height * 5
    );
  }

  draw() {
    for (const chunk of this.chunks) {
      image(chunk.image, chunk.x - width / 2, chunk.y - height / 2);
    }
  }
}
