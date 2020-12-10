class Game {
  constructor() {
    this._players = {};
    this._playerCount = 0;
    this._started = false;
  }

  get players() { return this._players; }

  get playerCount() { return this._playerCount; }

  getPlayer(pid) {
    return this._players[pid];
  }

  addPlayer(data) {
    const existingPlayer = this.getPlayer(data.pid);
    if (!existingPlayer) {
      this._playerCount += 1;

      const { name, color, pid } = data;
      this._players[pid] = { name, color, pid };
    }
  }

  removePlayer(pid) {
    this._playerCount -= 1;
    const { [pid]: _, ...restPlayers } = this._players;
    this._players = restPlayers;
  }
}

module.exports = Game;
