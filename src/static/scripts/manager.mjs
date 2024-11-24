import { Background } from "./background/background.mjs";
import { Player } from "./player.mjs";
import { Leaf } from "./leaf.mjs";
import { GUI } from "./gui.mjs";
import { BasketManager } from "./basket/BasketManager.mjs";

export class Manager {
  // deno-lint-ignore no-window
  isLocalhost = window.location.hostname === "localhost";
  socket = undefined;
  player = undefined;
  players = [];

  assets = {
    background: "/images/background.jpeg",
    basket: "/images/basket/basket_empty.png",
    tileSets: {
      background: "/images/tiles/TX-Tileset-Grass.png",
      foliage: "/images/tiles/TX-Plant.png",
    },
    blower: [
      "/images/blowers/leaf_blower_red.png",
      "/images/blowers/leaf_blower_blue.png",
      "/images/blowers/leaf_blower_yellow.png",
      "/images/blowers/leaf_blower_purple.png",
    ],
    leaves: [
      "/images/leaves/leaf_1.png",
      "/images/leaves/leaf_2.png",
      "/images/leaves/leaf_3.png",
      "/images/leaves/leaf_4.png",
    ],
  };

  gameObjects = {
    assets: {},
    leaves: [],
    baskets: [],
  };

  constructor() {}

  init() {
    this.player = new Player(this);
    this.GUI = new GUI(this);
    this.basketManager = new BasketManager(this);
    this.background = new Background(this, this.onChunkCreated);

    this.initWebsocket();

    for (let i = 0; i < 500; i++) {
      this.gameObjects.leaves.push(new Leaf(this));
    }
  }

  onChunkCreated = (chunk) => {
    this.basketManager.spawnBasketInChunk(chunk);
  };

  initWebsocket() {
    const url = this.isLocalhost ? "ws://localhost:3000" : "wss://leaf.tliy.no";
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.socket.send(
        JSON.stringify({
          event: "player-join",
          data: this.player.data(),
        })
      );
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      //console.log("Received message", message.event, message.data);
      if (message.event === "player-self") this.addSelf(message.data);
      if (message.event === "player-join") this.addPlayer(message.data);
      if (message.event === "player-update") this.updateState(message.data);
      if (message.event === "player-leave") this.removePlayer(message.data);
    };

    this.socket.onclose = () => {
      console.log("Socket closed, reconnecting in 5 seconds");
      setTimeout(() => this.reconnectSocket(), 5000);
    };
  }

  reconnectSocket() {
    this.socket.close();
    this.initWebsocket();
  }

  addSelf(data) {
    this.player.id = data.id;
    this.player.username = data.username;
  }

  addPlayer(data) {
    this.players.push(new Player(this, data.id, data.username, data.pos));
  }

  removePlayer(playerId) {
    console.log("Removing player", playerId, this.players);
    const player = this.players.find((p) => p.id === playerId);
    console.log("Found player", player);

    if (player) {
      this.players = this.players.filter((p) => p.id !== player.id);
    }
  }

  updateState(data) {
    console.log("Updating state", data);
    //console.log("players", this.players);
    for (const player of this.players) {
      if (player.id !== data.id) continue;

      //console.log("Updating remote player", player.id);
      player.receiveUpdate(data);

      if (data.click) {
        const { x, y } = data.pos;
        this.gameObjects.leaves.forEach((l) =>
          l.addCursorImpulse(x, y, player.offset.x, player.offset.y)
        );
      }
    }

    this.GUI.update();
  }
  offset = {
    x: 0,
    y: 0,
  };
  update() {
    this.background.update();
    this.basketManager.update();

    // Update local player
    this.player?.update(this.socket);

    for (const leaf of this.gameObjects.leaves) {
      leaf.update();

      //Remove this dead leaves if there are too many
      if (leaf.isDead && this.gameObjects.leaves.length > 500) {
        const index = this.gameObjects.leaves.indexOf(leaf);
        this.gameObjects.leaves.splice(index, 1);
      }
    }
  }

  draw() {
    push();
    translate(this.player.offset.x, this.player.offset.y);

    this.background.draw();
    this.basketManager.draw();

    this.gameObjects.leaves.forEach((leaf) => leaf.draw());

    pop();

    push();
    translate(this.player.offset.x, this.player.offset.y, 30);
    // Update remote players
    this.players.forEach((player) => {
      player.draw();
    });

    pop();

    push();
    translate(0, 0, 30);
    this.player?.draw();
    pop();

    this.GUI.draw();
  }
}
