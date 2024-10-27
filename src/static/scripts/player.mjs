// deno-lint-ignore-file no-window
export class Player {
  previousMousePressed = false;

  constructor(manager, id = null, username = null, pos = null) {
    this.manager = manager;
    this.blowerRotation = atan2(mouseY - pmouseY, mouseX - pmouseX);
    this.blower = this.manager.gameObjects.assets.blower[0];
    this.username = username;
    this.id = id;
    this.pos = pos ?? {
      x: 0,
      y: 0,
    };
  }

  data() {
    return {
      id: this.id,
      username: this.username,
      pos: {
        x: this.pos.x,
        y: this.pos.y,
      },
    };
  }

  rotateBlower(prevX, prevY, x, y) {
    const rotation = atan2(y - prevY, x - prevX);
    if (abs(rotation) < 0.4) return this.blowerRotation;
    return rotation;
  }

  update(socket) {
    this.pos.x = mouseX;
    this.pos.y = mouseY;

    this.blowerRotation = this.rotateBlower(pmouseX, pmouseY, mouseX, mouseY);

    if (mouseIsPressed || movedX || movedY) {
      const data = {
        event: "player-update",
        data: {
          id: this.id,
          click: mouseIsPressed,
          pos: {
            x: round(mouseX / width, 3),
            y: round(mouseY / height, 3),
          },
        },
      };

      if (socket.readyState === 1) {
        socket.send(JSON.stringify(data));
      }

      this.previousMousePressed = true;
    }

    //Send player stops clicking event
    if (this.previousMousePressed && !mouseIsPressed) {
      const data = {
        event: "player-update",
        data: {
          id: this.id,
          click: false,
          pos: {
            x: round(mouseX / width, 3),
            y: round(mouseY / height, 3),
          },
        },
      };

      if (socket.readyState === 1) {
        socket.send(JSON.stringify(data));
      }
      this.previousMousePressed = false;
    }
  }

  receiveUpdate(data) {
    //console.log("Player update", data);
    this.username = data.username;
    const { x, y } = data.pos;

    this.blowerRotation = this.rotateBlower(
      this.pos.x,
      this.pos.y,
      x * width,
      y * height
    );

    this.pos.x = x * width;
    this.pos.y = y * height;
  }

  draw() {
    fill(255);

    push();
    noStroke();
    translate(this.pos.x - width / 2, this.pos.y - height / 2, 0);
    rotateZ(this.blowerRotation);
    texture(this.blower);
    plane(150, 150, 8);
    pop();

    textSize(20);
    text(
      this.username ?? "Anon",
      this.pos.x - width / 2 - textWidth(this.username) / 2,
      this.pos.y - height / 2 + 100
    );
  }
}
