class Game {
  constructor() {
    this._players = {};
    this._playerCount = 0;
  }

  get playerCount() { return this.playerCount; }

  addPlayer() {
    this._playerCount += 1;
  }
}

module.exports = Game;
