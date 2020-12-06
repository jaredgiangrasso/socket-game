class Game {
  constructor() {
    this._playerCount = 0;
  }

  get playerCount() { return this._playerCount };

  addPlayer(playerCount) {
    this._playerCount = playerCount;
  }

  removePlayer(playerCount) {
    this._playerCount = playerCount;
  }
}
