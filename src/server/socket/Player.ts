export class Player {
  socket: WebSocket;
  id: string;
  username: string;
  score: number = 0;
  pos: { x: number; y: number } = { x: 0, y: 0 };

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
    };
  }

  updateState(data: PlayerUpdateEvent) {
    this.pos = data.pos;
  }

  randomUsername() {
    //Usernames of typical groundskeepers, male and female names
    const usernames = [
      "Hodgens the Groundskeeper",
      "Caddyshack Fan",
      "Carl Spackler",
      "Danny Leafblower",
      "Bill Roots",
      "Sandy Shovel",
      "Molly Mower",
      "Alice Aerator",
      "Randy Rake",
      "Pamela Pruner",
      "George Grass",
      "Linda Lawnmower",
      "Tommy Topdresser",
      "Sally Sod",
      "David Dethatcher",
      "Betty Bunker",
      "Frank Fairway",
      "Wendy Water",
      "Oscar Overseed",
      "Mary Mulch",
      "Charlie Compost",
      "Jenny Jockey",
      "Sam Seed",
      "Nancy Nutrient",
      "Peter Pesticide",
      "Ella Earthworm",
      "Roger Root",
      "Gina Green",
      "Timmy Turf",
      "Sue Soil",
      "Henry Hole",
      "Vicky Vent",
      "Larry Lawn",
      "Penny Pitch",
    ];

    //Randomly select a username from the array
    this.username = usernames[Math.floor(Math.random() * usernames.length)];
    return this.username;
  }
}
