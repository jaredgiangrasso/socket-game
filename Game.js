class Game {
  constructor() {
    this._players = {};
    this._playerCount = 0;
    this._playerTurn = 0;
    this._responses = [];
    this._roundNumber = 0;
    this._started = false;
  }

  get players() { return this._players; }

  get playerCount() { return this._playerCount; }

  get responses() { return this._responses; }

  set roundNumber(roundNumber) { this._roundNumber = roundNumber; }

  get playerTurn() { return this._playerTurn; }

  set playerTurn(playerTurn) { this._playerTurn = playerTurn; }

  addResponse(response) {
    this._responses.push(response);
  }

  getPlayer(pid) {
    return this._players[pid];
  }

  getRandomPlayer() {
    const playersArr = Object.values(this._players);
    const randomInt = Math.floor(Math.random() * playersArr.length);
    return playersArr[randomInt];
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
