export class GUI {
  constructor(manager) {
    this.manager = manager;

    this.playerLocationHints = new Map();

    this.init();
  }

  init() {}

  update() {
    for (const otherPlayer of this.manager.players) {
      if (otherPlayer.id === this.manager.player.id) continue;
      const otherPlayerPos = createVector(
        constrain(
          otherPlayer.pos.x + this.manager.player.offset.x,
          60,
          width - 60
        ),
        constrain(
          otherPlayer.pos.y + this.manager.player.offset.y,
          60,
          height - 60
        )
      );

      if (
        otherPlayerPos.x > 60 &&
        otherPlayerPos.x < width - 60 &&
        otherPlayerPos.y > 60 &&
        otherPlayerPos.y < height - 60
      ) {
        this.playerLocationHints.delete(otherPlayer.id);
        continue;
      }

      this.playerLocationHints.set(otherPlayer.id, otherPlayerPos);
    }
  }

  draw() {
    for (const [_, playerPos] of this.playerLocationHints) {
      push();
      translate(0, 0, 60);
      fill(255);

      stroke(255);
      strokeWeight(2);

      //Display dot at the edge of the screen
      ellipse(playerPos.x - width / 2, playerPos.y - height / 2, 20);

      pop();
    }
  }
}
