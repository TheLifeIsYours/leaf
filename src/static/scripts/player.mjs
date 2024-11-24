// deno-lint-ignore-file no-window
export class Player {
  previousMousePressed = false;

  constructor(manager, id = null, username = null, pos = null) {
    this.manager = manager;

    this.lockedView = getItem("locked_viewport") ?? false;

    this.lastWSUpdate = new Date();
    this.blowerRotation = atan2(mouseY - pmouseY, mouseX - pmouseX);
    this.blower =
      this.manager.gameObjects.assets.blower[
        floor(random(this.manager.gameObjects.assets.blower.length - 1))
      ];

    this.username = username;
    this.id = id;
    this.rawPos = {
      x: 0,
      y: 0,
    };

    this.pos = pos ?? {
      x: width / 2,
      y: height / 2,
    };

    this.offset = {
      x: 0,
      y: 0,
    };

    this.edgeSpeed = 10;
    this.edgeBuffer = createVector(width / 7, height / 7, 0);
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

  lockView() {
    this.lockedView = !this.lockedView;
    storeItem("locked_viewport", this.lockedView);
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

    let movedOffset = false;
    if (!this.lockedView) {
      //Transform if mouse is close to edge
      if (mouseX < this.edgeBuffer.x) {
        this.offset.x += this.edgeSpeed;
      } else if (mouseX > width - this.edgeBuffer.x) {
        this.offset.x -= this.edgeSpeed;
      }

      if (mouseY < this.edgeBuffer.y) {
        this.offset.y += this.edgeSpeed;
      } else if (mouseY > height - this.edgeBuffer.y) {
        this.offset.y -= this.edgeSpeed;
      }

      if (
        mouseX < this.edgeBuffer.x ||
        mouseX > width - this.edgeBuffer.x ||
        mouseY < this.edgeBuffer.y ||
        mouseY > height - this.edgeBuffer.y
      ) {
        movedOffset = true;
      }
    }

    if (mouseIsPressed || movedX || movedY || movedOffset) {
      const data = {
        event: "player-update",
        data: this.data(),
      };

      if (
        socket.readyState === 1 &&
        new Date() - this.lastWSUpdate > 1000 / 60
      ) {
        socket.send(JSON.stringify(data));
        this.lastWSUpdate = new Date();
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
    this.rawPos.x = x;
    this.rawPos.y = y;

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
