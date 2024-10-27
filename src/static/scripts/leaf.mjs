// deno-lint-ignore-file no-window
export class Leaf {
  constructor(manager) {
    this.manager = manager;

    this.isDead = true;
    setTimeout(() => this.spawn(), 4000 * random(4));
  }

  spawn() {
    this.isDead = false;
    this.leafAsset =
      this.manager.gameObjects.assets.leaves[
        floor(random(this.manager.gameObjects.assets.leaves.length))
      ];
    this.velocity = createVector(5, 5, 5);

    this.pos = createVector(
      random(-window.innerWidth / 2, window.innerWidth / 2),
      random(-window.innerHeight / 2, window.innerHeight / 2)
    );

    this.impulse = createVector(random(-1, 1), random(-1, 1), 0);
    this.rotation = this.impulse.copy();
  }

  addImpulse(x, y) {
    if (this.isDead) return;
    this.pos.z = 0;

    const mousePos = createVector(
      x * window.innerWidth - window.innerWidth / 2,
      y * window.innerHeight - window.innerHeight / 2
    );

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

    //add impulse
    if (mouseIsPressed) {
      this.addImpulse(mouseX / window.innerWidth, mouseY / window.innerHeight);
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

    if (
      this.pos.x < -window.innerWidth / 2 - 20 ||
      this.pos.y < -window.innerHeight / 2 - 50 ||
      this.pos.x > window.innerWidth / 2 + 20 ||
      this.pos.y > window.innerHeight / 2 + 50
    ) {
      if (!this.isDead) setTimeout(() => this.spawn(), 4000 * random(4));
      this.isDead = true;
    }
  }

  render() {
    if (this.isDead) return;

    push();
    noStroke();
    translate(this.pos.x, this.pos.y, 10);
    rotateZ(this.rotation.z);
    rotateX(this.rotation.x);
    rotateY(this.rotation.y);
    texture(this.leafAsset);
    plane(20, 50, 8);
    pop();
  }
}
