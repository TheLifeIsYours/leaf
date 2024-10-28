export class Player {
  previousMousePressed = false;

  constructor(manager, id = null, username = null, pos = null) {
    this.manager = manager;
    this.blowerRotation = atan2(mouseY - pmouseY, mouseX - pmouseX);
    this.blower =
      this.manager.gameObjects.assets.blower[
        floor(random(this.manager.gameObjects.assets.blower.length - 1))
      ];
    this.username = username;
    this.id = id;
    this.pos = pos ?? {
      x: width / 2,
      y: height / 2,
    };
    this.offset = {
      x: 0,
      y: 0,
    };
  }

  data() {
    return {
      id: this.id,
      username: this.username,
      click: mouseIsPressed,
      pos: {
        x: round(this.pos.x / width, 3),
        y: round(this.pos.y / height, 3),
      },
      offset: {
        x: this.offset.x,
        y: this.offset.y,
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

    //Transform if mouse is close to edge
    if (mouseX < 150) {
      this.offset.x += 5;
    } else if (mouseX > width - 150) {
      this.offset.x -= 5;
    }

    if (mouseY < 150) {
      this.offset.y += 5;
    } else if (mouseY > height - 150) {
      this.offset.y -= 5;
    }

    let movedOffset = false;
    if (
      mouseX < 150 ||
      mouseX > width - 150 ||
      mouseY < 150 ||
      mouseY > height - 150
    ) {
      movedOffset = true;
    }

    if (mouseIsPressed || movedX || movedY || movedOffset) {
      const data = {
        event: "player-update",
        data: this.data(),
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
        data: this.data(),
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
      this.pos.x - this.offset.x,
      this.pos.y - this.offset.y,
      x * width,
      y * height
    );

    this.offset.x = data.offset.x;
    this.offset.y = data.offset.y;

    this.pos.x = x * width - this.offset.x;
    this.pos.y = y * height - this.offset.y;
  }

  draw() {
    fill(255);

    push();
    noStroke();
    translate(this.pos.x - width / 2, this.pos.y - height / 2, 0);
    rotateZ(this.blowerRotation);
    texture(this.blower);
    plane(150, 150, 4);
    pop();

    textSize(20);
    text(
      this.username ?? "Anon",
      this.pos.x - width / 2 - textWidth(this.username) / 2,
      this.pos.y - height / 2 + 100
    );
  }
}
