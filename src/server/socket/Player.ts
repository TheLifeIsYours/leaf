export class Player {
  socket: WebSocket;
  id: string;
  username: string;
  score: number = 0;
  pos: { x: number; y: number } = { x: 0, y: 0 };
  offset: { x: number; y: number } = { x: 0, y: 0 };

  constructor(socket: WebSocket, id: string) {
    this.socket = socket;
    this.id = id;
    this.username = this.randomUsername();
  }

  data() {
    return {
      id: this.id,
      username: this.username,
      score: this.score,
      pos: this.pos,
      offset: this.offset,
    };
  }

  updateState(data: PlayerUpdateEvent) {
    this.pos = data.pos;
    this.offset = data.offset;
  }

  randomUsername() {
    //Usernames of typical groundskeepers, male and female names
    const path = Deno.cwd() + "/src/server/names.txt";
    const names = Deno.readFileSync(path);
    const decoder = new TextDecoder();
    const namesString = decoder.decode(names);
    const usernames = namesString.split("\n");

    //Randomly select a username from the array
    this.username = usernames[Math.floor(Math.random() * usernames.length)];
    return this.username;
  }
}
