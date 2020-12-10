class Game {
  constructor() {
    this._playerCount = 0;
    this._players = {};
    this._myId = null;
  }

  get playerCount() { return this._playerCount; }

  set playerCount(playerCount) { this._playerCount = playerCount; }

  get myId() { return this._myId; }

  set myId(id) { this._myId = id; }

  get players() { return this._players; }

  set players(players) { this._players = players; }

  addPlayer(newPlayer, playerCount) {
    this._playerCount = playerCount;
    this._players[newPlayer.pid] = newPlayer;
  }

  removePlayer(pid) {
    this._playerCount -= 1;
    const { [pid]: _, ...restPlayers } = this._players;
    this._players = restPlayers;
  }
}
