class Game {
  constructor() {
    this._players = {};
    this._playerCount = 0;
    this._started = false;
  }

  get playerCount() { return this._playerCount; }

  getPlayer(pid) { 
    return this._players[pid];
  }

  addPlayer(pid) {
    this._playerCount += 1;
    this._players[pid] = { name: '', pid };
  }

  removePlayer(pid) { 
    this._playerCount -= 1;
    const { [pid]: _, ...restPlayers } = this._players;
    this._players = restPlayers;
  }
}

module.exports = Game;
