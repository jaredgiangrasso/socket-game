class Game {
  constructor() {
    this._players = {};
    this._playerCount = 0;
    this._started = false;
  }

  get playerCount() { return this._playerCount; }

  addPlayer() {
    this._playerCount += 1;
  }

  removePlayer() { 
    this._playerCount -= 1;
  }
}

module.exports = Game;
