class Game {
  constructor() {
    this._players = {};
    this._playerCount = 0;
    this._playerTurn = 0;
    this._responses = [];
    this._roundNumber = 0;
    this._started = false;
    this._votes = {};
  }

  get players() { return this._players; }

  get playerCount() { return this._playerCount; }

  get playerTurn() { return this._playerTurn; }

  set playerTurn(playerTurn) { this._playerTurn = playerTurn; }

  get responses() { return this._responses; }

  get roundNumber() { return this._roundNumber; }

  set roundNumber(roundNumber) { this._roundNumber = roundNumber; }

  get votes() { return this._votes; }

  set votes(votes) { this._votes = votes; }

  addPlayer(data) {
    const existingPlayer = this.getPlayer(data.pid);
    if (!existingPlayer) {
      this._playerCount += 1;

      const { name, color, pid } = data;
      this._players[pid] = {
        name, color, pid, points: 0,
      };
    }
  }

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

  nextRound() {
    this._roundNumber++;
    this._votes[this._roundNumber] = Object.keys(this._players).reduce((accu, curr) => ({
      ...accu,
      [curr]: 0,
    }), {});
  }

  removePlayer(pid) {
    this._playerCount -= 1;
    const { [pid]: _, ...restPlayers } = this._players;
    this._players = restPlayers;
  }
}

module.exports = Game;
