import { Foliage } from "./foliage.mjs";
export class Background {
  tiles = [];
  chunks = [];
  background = null;
  tileSize = 64;
  scale = 2;
  chunkEdgeBuffer = max(width / 4, height / 4); // Distance from the edge to trigger chunk creation

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

    //Create the first chunk
    this.createChunk(0, 0);

    //Set the current chunk to the center  one
    this.currentChunk = this.chunks.find((c) => {
      return c.x === 0 && c.y === 0;
    });
  }

  createBackground() {}

  //Procedural generation of background chunks
  createChunk(x, y) {
    const chunk = {
      x: x,
      y: y,
      image: null,
    };

    //console.log("Current chunk", this.currentChunk);
    //console.log("Creating chunk", chunk);

    const chunkImage = createGraphics(width, height);
    chunkImage.background(0);

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

    this.foliage.createFoliage();

    chunkImage.image(
      this.foliage.foliage,
      0,
      0,
      this.foliage.foliage.width,
      this.foliage.foliage.height
    );

    chunk.image = chunkImage.get();
    chunkImage.remove();

    this.chunks.push(chunk);
  }

  update() {
    const player = this.manager.player;
    const pPos = player.pos;
    const pOffset = player.offset;

    //Check if player is close to the edge of the current chunk, if so update the current chunk
    if (
      !this.currentChunk ||
      pPos.x - pOffset.x < this.currentChunk.x ||
      pPos.x - pOffset.x > this.currentChunk.x + width ||
      pPos.y - pOffset.y < this.currentChunk.y ||
      pPos.y - pOffset.y > this.currentChunk.y + height
    ) {
      //console.log("Updating current chunk");
      //console.log("Player pos", pPos);
      //console.log("Player offset", pOffset);
      //console.log("Current chunk", this.currentChunk);
      //Find the current chunk
      const nextCurrentChunk = this.chunks.find((chunk) => {
        return (
          pPos.x - pOffset.x >= chunk.x &&
          pPos.x - pOffset.x <= chunk.x + width &&
          pPos.y - pOffset.y >= chunk.y &&
          pPos.y - pOffset.y <= chunk.y + height
        );
      });

      //console.log("Next current chunk", nextCurrentChunk);

      if (nextCurrentChunk) {
        this.currentChunk = nextCurrentChunk;

        //Check the new current chunk for neighboring chunks and create them if they don't exist
        const currentChunkX = this.currentChunk.x;
        const currentChunkY = this.currentChunk.y;

        if (
          !this.chunks.some(
            (chunk) =>
              chunk.x === currentChunkX - width && chunk.y === currentChunkY
          )
        ) {
          //console.log("Creating chunk to the left");
          this.createChunk(currentChunkX - width, currentChunkY);
        }

        if (
          !this.chunks.some(
            (chunk) =>
              chunk.x === currentChunkX + width && chunk.y === currentChunkY
          )
        ) {
          //console.log("Creating chunk to the right");
          this.createChunk(currentChunkX + width, currentChunkY);
        }

        if (
          !this.chunks.some(
            (chunk) =>
              chunk.x === currentChunkX && chunk.y === currentChunkY - height
          )
        ) {
          //console.log("Creating chunk to the top");
          this.createChunk(currentChunkX, currentChunkY - height);
        }

        if (
          !this.chunks.some(
            (chunk) =>
              chunk.x === currentChunkX && chunk.y === currentChunkY + height
          )
        ) {
          //console.log("Creating chunk to the bottom");
          this.createChunk(currentChunkX, currentChunkY + height);
        }
      }
    }

    if (!this.currentChunk) return;

    //If player is close to the edge of the current chunk,
    // make sure there is a chunk surrounding it, if not create them
    const currentChunkX = this.currentChunk.x;
    const currentChunkY = this.currentChunk.y;

    // Check for neighboring chunks before creating new ones
    if (pPos.x - pOffset.x < currentChunkX + this.chunkEdgeBuffer) {
      if (
        !this.chunks.some(
          (chunk) =>
            chunk.x === currentChunkX - width && chunk.y === currentChunkY
        )
      ) {
        //console.log("Creating chunk to the left");
        this.createChunk(currentChunkX - width, currentChunkY);

        //Create chunk above the new chunk
        this.createChunk(currentChunkX - width, currentChunkY - height);

        //Create chunk below the new chunk
        this.createChunk(currentChunkX - width, currentChunkY + height);
      }
    }

    if (pPos.x - pOffset.x > currentChunkX + width - this.chunkEdgeBuffer) {
      if (
        !this.chunks.some(
          (chunk) =>
            chunk.x === currentChunkX + width && chunk.y === currentChunkY
        )
      ) {
        //console.log("Creating chunk to the right");
        this.createChunk(currentChunkX + width, currentChunkY);

        //Create chunk above the new chunk
        this.createChunk(currentChunkX + width, currentChunkY - height);

        //Create chunk below the new chunk
        this.createChunk(currentChunkX + width, currentChunkY + height);
      }
    }

    if (pPos.y - pOffset.y < currentChunkY + this.chunkEdgeBuffer) {
      if (
        !this.chunks.some(
          (chunk) =>
            chunk.x === currentChunkX && chunk.y === currentChunkY - height
        )
      ) {
        //console.log("Creating chunk to the top");
        this.createChunk(currentChunkX, currentChunkY - height);

        //Create chunk to the left of the new chunk
        this.createChunk(currentChunkX - width, currentChunkY - height);

        //Create chunk to the right of the new chunk
        this.createChunk(currentChunkX + width, currentChunkY - height);
      }
    }

    if (pPos.y - pOffset.y > currentChunkY + height - this.chunkEdgeBuffer) {
      if (
        !this.chunks.some(
          (chunk) =>
            chunk.x === currentChunkX && chunk.y === currentChunkY + height
        )
      ) {
        //console.log("Creating chunk to the bottom");
        this.createChunk(currentChunkX, currentChunkY + height);

        //Create chunk to the left of the new chunk
        this.createChunk(currentChunkX - width, currentChunkY + height);

        //Create chunk to the right of the new chunk
        this.createChunk(currentChunkX + width, currentChunkY + height);
      }
    }
  }

  draw() {
    for (const chunk of this.chunks) {
      image(chunk.image, chunk.x - width / 2, chunk.y - height / 2);
    }
  }
}
