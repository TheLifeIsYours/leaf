import { Basket } from "./Basket.mjs";

export class BasketManager {
  constructor(manager) {
    console.log("BasketManager created");

    this.manager = manager;

    this.baskets = new Map();
  }

  init() {}

  spawnBasketInChunk(chunk) {
    if (this.baskets.has(`${chunk.x}-${chunk.y}`)) {
      return;
    }

    const basket = new Basket(this.manager);
    console.log("Basket spawned in chunk", basket, chunk);
    basket.setPos(
      random(chunk.x, chunk.x + chunk.width),
      random(chunk.y, chunk.y + chunk.height)
    );

    this.baskets.set(`${chunk.x}-${chunk.y}`, basket);
  }

  update() {
    this.manager.gameObjects.leaves.forEach((leaf) => {
      if (leaf.isDead) return;

      for (const [_, basket] of this.baskets) {
        if (basket.isColliding(leaf)) {
          basket.animateOnFilling();
          leaf.spawn();
        }
      }
    });

    for (const [_, basket] of this.baskets) {
      basket.update();
    }
  }

  draw() {
    for (const [_, basket] of this.baskets) {
      basket.draw();
    }
  }
}
