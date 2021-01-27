class GameModel extends EventEmitter {
  constructor() {
    super();

    this._bestVotes = {};
    this._bestVoteWinner = '';
    this._gamePhase = '';
    this._myId = null;
    this._myPrompt = '';
    this._myResponse = '';
    this._myVote = '';
    this._playerCount = 0;
    this._players = {};
    this._playerTurn = null;
    this._prompt = '';
    this._responses = [];
    this._roundNumber = null;
    this._started = false;
  }

  get bestVotes() { return this._bestVotes; }

  get gamePhase() { return this._gamePhase; }

  get myPrompt() { return this._myPrompt; }

  set myPrompt(prompt) { this._myPrompt = prompt; }

  get myResponse() { return this._myResponse; }

  set myResponse(response) { this._myResponse = response; }

  get myVote() { return this._myVote; }

  set myVote(vote) { this._myVote = vote; }

  get roundNumber() { return this._roundNumber; }

  set roundNumber(roundNumber) { this._roundNumber = roundNumber; }

  get playerCount() { return this._playerCount; }

  set playerCount(playerCount) { this._playerCount = playerCount; }

  get prompt() { return this._prompt; }

  set prompt(prompt) { this._prompt = prompt; }

  get myId() { return this._myId; }

  set myId(id) { this._myId = id; }

  get players() { return this._players; }

  set players(players) { this._players = players; }

  get started() { return this._started; }

  set started(started) { this._started = started; }

  get playerTurn() { return this._playerTurn; }

  set playerTurn(playerTurn) { this._playerTurn = playerTurn; }

  addPlayer(newPlayer, players, playerCount) {
    this._playerCount = playerCount;
    this._players = players;

    this.emit('add player', playerCount);

    if (this._myId === newPlayer.pid) {
      this.emit('show lobby');
    }
  }

  removePlayer(pid) {
    this._playerCount -= 1;
    const { [pid]: _, ...restPlayers } = this._players;
    this._players = restPlayers;

    this.emit('remove player');
  }

  setStart() {
    this._started = true;
    this._roundNumber = 1;
  }

  isMyTurn() {
    return this._myId === this._playerTurn;
  }

  newPrompt(prompt) {
    this._prompt = prompt;
    this.emit('new prompt');
  }

  newResponses(responses) {
    this._responses = responses;
    this.emit('new responses', responses);
  }

  newBestVotes(bestVotes, players) {
    this._bestVotes = bestVotes;
    this._players = players;
    this.emit('new best votes', bestVotes);
  }

  nextTurn(player) {
    if (!this._started) {
      this.setStart();
      this.emit('start game');
    }
    this.emit('next turn', player);
  }

  updateBestVoteWinner(winner) {
    this._bestVoteWinner = winner;
    this.emit('new best vote winner', winner);
  }

  updateGamePhase(gamePhase) {
    this._gamePhase = gamePhase;
    this.emit(gamePhase);
  }
}
