class Game {
  constructor() {
    this._playerCount = 0;
    this._players = {};
  }

  get playerCount() { return this._playerCount; }

  get players() { return this._players; }

  addPlayer(newPlayer, playerCount) {
    this._playerCount = playerCount;
    this._players[newPlayer.pid] = newPlayer;
    console.log(this._playerCount);
  }

  removePlayer(pid) {
    this._playerCount -= 1;
    const { [pid]: _, ...restPlayers } = this._players;
    this._players = restPlayers;
    console.log(this._playerCount);
  }
}
