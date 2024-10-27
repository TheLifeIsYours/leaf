import { uuidV4 } from "../../static/scripts/utils.mjs";
import { Player } from "./Player.ts";

export class SocketBase {
  players: Array<Player> = [];

  addListeners(socket: WebSocket) {
    const playerId = uuidV4();

    socket.addEventListener("message", (message) => {
      const { event, data } = JSON.parse(message.data);

      switch (event) {
        case "player-update":
          this.updatePlayer(data);
          break;
        case "player-join":
          this.onPlayerJoin(socket, playerId);
          break;
      }
    });

    socket.addEventListener("close", () => {
      this.onPlayerLeave(playerId);
    });
  }

  onPlayerJoin(socket: WebSocket, playerId: string) {
    const newPlayer = new Player(socket, playerId);

    for (const player of this.players) {
      //Broadcast existing players to new player
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            event: "player-join",
            data: player.data(),
          })
        );
      }

      //Broadcast new player to all other players
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(
          JSON.stringify({
            event: "player-join",
            data: newPlayer.data(),
          })
        );
      }
    }

    //Send player data to new player
    this.players.push(newPlayer);
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          event: "player-self",
          data: newPlayer.data(),
        })
      );
    }
  }

  onPlayerLeave(playerId: string) {
    this.players = this.players.filter((player) => player.id !== playerId);

    //Broadcast player leave to all other players
    for (const player of this.players) {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(
          JSON.stringify({
            event: "player-leave",
            data: playerId,
          })
        );
      }
    }
  }

  updatePlayer(data: PlayerUpdateEvent) {
    const player = this.players.find((player) => player.id === data.id);

    if (player) {
      player.updateState(data);

      for (const otherPlayer of this.players) {
        if (otherPlayer.id === data.id) continue;

        if (otherPlayer.socket.readyState === WebSocket.OPEN) {
          otherPlayer.socket.send(
            JSON.stringify({
              event: "player-update",
              data: { click: data.click, ...player.data() },
            })
          );
        }
      }
    }
  }
}
