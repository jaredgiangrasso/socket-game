import EventEmitter from './EventEmitter.js';

class GameModel extends EventEmitter {
  constructor() {
    super();

    this._bestVotes = {};
    this._bestVoteWinner = {};
    this._gamePhase = '';
    this._isHost = false;
    this._myBestVote = '';
    this._myId = null;
    this._myPrompt = '';
    this._myResponse = '';
    this._myWhoVote = '';
    this._playerCount = 0;
    this._players = {};
    this._playerTurn = null;
    this._points = {};
    this._prompt = '';
    this._responses = [];
    this._roomId = null;
    this._roundNumber = null;
    this._started = false;
    this._whoVoteWinners = [];
  }

  get bestVotes() { return this._bestVotes; }

  get bestVoteWinner() { return this._bestVoteWinner; }

  get gamePhase() { return this._gamePhase; }

  get isHost() { return this._isHost; }

  set isHost(isHost) { this._isHost = isHost; }

  get myBestVote() { return this._myBestVote; }

  set myBestVote(vote) { this._myBestVote = vote; }

  get myId() { return this._myId; }

  set myId(id) { this._myId = id; }

  get myPrompt() { return this._myPrompt; }

  set myPrompt(prompt) { this._myPrompt = prompt; }

  get myResponse() { return this._myResponse; }

  set myResponse(response) { this._myResponse = response; }

  get myWhoVote() { return this._myWhoVote; }

  set myWhoVote(vote) { this._myWhoVote = vote; }

  get playerCount() { return this._playerCount; }

  set playerCount(playerCount) { this._playerCount = playerCount; }

  get players() { return this._players; }

  set players(players) { this._players = players; }

  get playerTurn() { return this._playerTurn; }

  set playerTurn(playerTurn) { this._playerTurn = playerTurn; }

  get points() { return this._points; }

  set points(points) { this._points = points; }

  get prompt() { return this._prompt; }

  set prompt(prompt) { this._prompt = prompt; }

  get roomId() { return this._roomId; }

  set roomId(roomId) { this._roomId = roomId; }

  get roundNumber() { return this._roundNumber; }

  set roundNumber(roundNumber) { this._roundNumber = roundNumber; }

  get started() { return this._started; }

  set started(started) { this._started = started; }

  get whoVoteWinners() { return this._whoVoteWinners; }

  set whoVoteWinners(winners) { this._whoVoteWinners = winners; }

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

  nextRound() {
    this._roundNumber += 1;
    this.emit('next round');
  }

  nextTurn(pid) {
    this._turnNumber += 1;
    this._playerTurn = pid;

    if (!this._started) {
      this.setStart();
      this.emit('start game');
    }
    this.emit('next turn', pid);
  }

  updateBestVotes(bestVotes) {
    this._bestVotes = bestVotes;
    this.emit('update best votes');
  }

  updateBestVoteWinner(winner) {
    this._bestVoteWinner = winner;
    this.emit('new best vote winner');
  }

  updateRoomId(roomId) {
    this._roomId = roomId;
    this.emit('join room');
  }

  updateWhoVoteWinners(winners, points) {
    this._whoVoteWinners = winners;
    this._points = points;
    this.emit('new who vote winners');
  }

  updateGamePhase(gamePhase) {
    this._gamePhase = gamePhase;
    this.emit(gamePhase);
  }
}

export default GameModel;
