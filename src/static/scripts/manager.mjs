import { Leaf } from "./leaf.mjs";
import { Player } from "./player.mjs";

export class Manager {
  // deno-lint-ignore no-window
  isLocalhost = window.location.hostname === "localhost";
  socket = undefined;
  player = undefined;
  players = [];

  assets = {
    background: "https://i.imgur.com/9m07MT8.jpeg",
    blower: ["/images/leaf_blower.png"],
    leaves: [
      "https://i.imgur.com/hnPorWf.png",
      "https://i.imgur.com/SxAwOSz.png",
      "https://i.imgur.com/g9KBUR1.png",
    ],
  };

  gameObjects = {
    leaves: [],
    assets: {
      background: undefined,
      leaves: [],
    },
    playerManager: undefined,
  };

  constructor() {}

  init() {
    this.player = new Player(this);
    this.initWebsocket();

    for (let i = 0; i < 500; i++) {
      this.gameObjects.leaves.push(new Leaf(this));
    }
  }

  initWebsocket() {
    const url = this.isLocalhost ? "ws://localhost:8000" : "wss://leaf.tliy.no";
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
    //console.log("Updating state", data);
    //console.log("players", this.players);
    for (const player of this.players) {
      if (player.id !== data.id) continue;

      //console.log("Updating remote player", player.id);
      player.receiveUpdate(data);

      if (data.click) {
        const { x, y } = data.pos;
        this.gameObjects.leaves.forEach((l) => l.addImpulse(x, y));
      }
    }
  }

  update() {
    for (const leaf of this.gameObjects.leaves) {
      leaf.update();
      leaf.render();
    }

    // Update remote players
    this.players.forEach((player) => {
      player.draw();
    });

    // Update local player
    this.player?.update(this.socket);
    this.player?.draw();
  }
}
