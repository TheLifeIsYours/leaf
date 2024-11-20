import { Leaf } from "../leaf.mjs";

export class Basket {
  constructor(manager) {
    this.manager = manager;
    this.leavesCount = 0;
    this.leavesIndex = [];
    this.asset = this.manager.gameObjects.assets.basket;
    this.pos = createVector(0, 0);
    this.size = createVector(100, 100);
    this.scale = createVector(1, 1);

    console.log("Basket created", this);
  }

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }

  spawn() {
    //Baskets will spawn in 2/5
  }

  animateOnFull() {
    //When the bag is full, it will blow up into pieces and the leaves will fly all over the screen
    if (this.isFull) return;

    //Explode with a random amount of leaves
    const leaves = floor(random(20, 50));
    for (let i = 0; i < leaves; i++) {
      const leaf = new Leaf(this.manager, false);

      leaf.pos.x = this.pos.x;
      leaf.pos.y = this.pos.y;

      leaf.pos.x += random(-this.size.x / 2, this.size.x / 2);
      leaf.pos.y += random(-this.size.y / 2, this.size.y / 2);

      leaf.scale = random(1, 3);

      leaf.addImpulse(random(-3, 3), random(-3, 3));

      this.manager.gameObjects.leaves.push(leaf);
      this.leavesIndex.push(this.manager.gameObjects.leaves.length - 1);
    }

    this.isFull = true;
  }

  animateOnFilling() {
    if (this.isFull) return;

    if (this.scale.x > 2.3) {
      this.animateOnFull();
      return;
    }

    //When leaves touch the bag, the bag will expand and grow in size with a rubber band effect
    this.scale.x = this.scale.x + random(0.05, 0.1);
    this.scale.y = this.scale.y + random(0.05, 0.1);
  }

  isColliding(leaf) {
    if (this.isFull) return false;
    if (leaf.isDead) return false;
    const boundingBox = {
      x: this.pos.x - this.size.x / 2 - this.manager.player.offset.x,
      y: this.pos.y - this.size.y / 2 - this.manager.player.offset.y,
      width: this.size.x,
      height: this.size.y,
    };

    const leafBoundingBox = {
      x: leaf.pos.x - leaf.size.x / 2 - this.manager.player.offset.x,
      y: leaf.pos.y - leaf.size.y / 2 - this.manager.player.offset.y,
      width: leaf.size.x,
      height: leaf.size.y,
    };

    const isColliding =
      boundingBox.x < leafBoundingBox.x + leafBoundingBox.width &&
      boundingBox.x + boundingBox.width > leafBoundingBox.x &&
      boundingBox.y < leafBoundingBox.y + leafBoundingBox.height &&
      boundingBox.y + boundingBox.height > leafBoundingBox.y;

    //If the leaf is colliding with the basket, add it to the basket
    if (isColliding) {
      this.leavesCount++;
      leaf.isDead = true;
    }

    return isColliding;
  }

  update() {
    if (!this.isFull && this.leavesCount >= 100) {
      this.animateOnFull();
    }

    this.scale.x = lerp(this.scale.x, 1, 0.075);
    this.scale.y = lerp(this.scale.y, 1, 0.075);
  }

  draw() {
    if (this.isFull) return;
    push();
    translate(this.pos.x, this.pos.y, 5);
    texture(this.asset);
    plane(this.size.x * this.scale.x, this.size.y * this.scale.y);

    //Display count 0 / 100 leaves
    textSize(20);
    fill(255);
    text(
      `${this.leavesCount} / 100`,
      -textWidth(`${this.leavesCount} / 100`) / 2,
      this.size.y / 2 + 20
    );
    pop();
  }
}
