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
          120,
          width - 120
        ),
        constrain(
          otherPlayer.pos.y + this.manager.player.offset.y,
          120,
          height - 120
        )
      );

      if (
        otherPlayerPos.x > 120 &&
        otherPlayerPos.x < width - 120 &&
        otherPlayerPos.y > 120 &&
        otherPlayerPos.y < height - 120
      ) {
        this.playerLocationHints.delete(otherPlayer.id);
        continue;
      }

      this.playerLocationHints.set(otherPlayer.id, otherPlayerPos);
    }

    //Remove old player hints the map
    for (const [id, _] of this.playerLocationHints) {
      if (!this.manager.players.some((player) => player.id === id)) {
        this.playerLocationHints.delete(id);
      }
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
