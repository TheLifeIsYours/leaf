export class Leaf {
  constructor(manager, randomSpawn = true) {
    this.manager = manager;

    this.pos = createVector(0, 0, 0);
    this.size = { x: 50, y: 50 };
    this.scale = 1;
    this.impulse = createVector(0, 0, 0);
    this.rotation = createVector(0, 0, 0);
    this.velocity = createVector(5, 5, 5);

    this.isDead = false;
    this.direction = 0;
    this.allowedOutOfBounds = 150;

    this.leafAsset =
      this.manager.gameObjects.assets.leaves[
        floor(random(this.manager.gameObjects.assets.leaves.length))
      ];

    this.setLeafSize();

    if (randomSpawn) this.randomSpawn();
  }

  setBoundingBox() {
    this.boundingBox = {
      x: this.pos.x - this.size.x / 2 - this.manager.player.offset.x,
      y: this.pos.y - this.size.y / 2 - this.manager.player.offset.y,
      width: this.size.x,
      height: this.size.y,
    };
  }

  setLeafSize() {
    const imgWidth = this.leafAsset.width;
    const imgHeight = this.leafAsset.height;
    //Scaled to max 50x50
    const scale = 50 / max(imgWidth, imgHeight);
    this.size = { x: imgWidth * scale, y: imgHeight * scale };
  }

  randomSpawn() {
    this.isDead = true;
    setTimeout(() => this.spawn(), 4000 * random(4));
  }

  spawn() {
    this.isDead = false;
    this.leafAsset =
      this.manager.gameObjects.assets.leaves[
        floor(random(this.manager.gameObjects.assets.leaves.length))
      ];
    this.setLeafSize();

    this.pos = createVector(
      random(-width / 2, width / 2),
      random(-height / 2, height / 2)
    );

    //Add player offset
    this.pos.x -= this.manager.player.offset.x;
    this.pos.y -= this.manager.player.offset.y;

    this.impulse = createVector(random(-1, 1), random(-1, 1), 0);
    this.rotation = this.impulse.copy();
    this.direction = this.rotation.heading();
  }

  addImpulse(x, y) {
    if (this.isDead) return;
    this.impulse.add(createVector(x, y, 0));
    this.rotation = this.impulse.copy();
    this.direction = this.rotation.heading();
  }

  addCursorImpulse(x, y, offsetX = 0, offsetY = 0) {
    if (this.isDead) return;
    this.pos.z = 0;

    const mousePos = createVector(
      x * width - width / 2,
      y * height - height / 2
    );

    mousePos.x -= offsetX;
    mousePos.y -= offsetY;

    const distance = mousePos.dist(this.pos);

    if (distance < 400) {
      this.pos.z = 0;

      const mouseDir = mousePos.sub(this.pos);
      mouseDir.z = 0;
      mouseDir.rotate(90);

      this.impulse.add(mouseDir.setMag(-map(distance, 400, 0, 0, 0.3, true)));
      this.rotation.add(this.impulse);
    }
  }

  update() {
    if (this.isDead) return;
    this.pos.z = 0;

    //check if out of bounds
    if (
      this.pos.x + this.manager.player.offset.x <
        -width / 2 - this.size.x - this.allowedOutOfBounds ||
      this.pos.y + this.manager.player.offset.y <
        -height / 2 - this.size.y - this.allowedOutOfBounds ||
      this.pos.x + this.manager.player.offset.x >
        width / 2 + this.size.x + this.allowedOutOfBounds ||
      this.pos.y + this.manager.player.offset.y >
        height / 2 + this.size.y + this.allowedOutOfBounds
    ) {
      if (!this.isDead) setTimeout(() => this.spawn(), 4000 * random(4));
      this.isDead = true;
    }

    //add impulse
    if (mouseIsPressed) {
      this.addCursorImpulse(
        mouseX / width - this.manager.player.offset.x / width,
        mouseY / height - this.manager.player.offset.y / height
      );
    }

    //add movement
    this.pos.add(this.impulse.cross(this.velocity));

    //friction
    this.impulse.x = lerp(this.impulse.x, 0, 0.05);
    this.impulse.y = lerp(this.impulse.y, 0, 0.05);

    //rotation
    this.rotation.z = lerp(this.rotation.z, 0, 0.03);
    this.rotation.x = lerp(this.rotation.x, 0, 0.03);
    this.rotation.y = lerp(this.rotation.y, 0, 0.03);

    //scale down if too big
    if (this.scale > 1) {
      this.scale = lerp(this.scale, 1, 0.1);
    }

    //Spread leaves if bunched up
    for (const other of this.manager.gameObjects.leaves) {
      if (other === this || other.isDead) continue;

      const distance = this.pos.dist(other.pos);
      if (distance < 15) {
        this.pos.add(this.pos.copy().sub(other.pos).setMag(0.2));
      }
    }
  }

  draw() {
    if (this.isDead) return;

    push();
    noStroke();
    translate(this.pos.x, this.pos.y, 5);
    rotateZ(this.rotation.z);
    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    rotate(this.direction);
    texture(this.leafAsset);

    plane(this.size.x * this.scale, this.size.y * this.scale, 4, 4);
    pop();
  }
}
