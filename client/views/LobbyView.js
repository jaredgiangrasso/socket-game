import { addPlayerListItem, removePlayerListItem, showById } from '../helpers.js';
import EventEmitter from '../EventEmitter.js';

class LobbyView extends EventEmitter {
  constructor(model, controller) {
    super();
    this._model = model;
    this._controller = controller;

    this._game = document.getElementById('game');
    this._gameHeader = document.getElementById('game-header');
    this._inProgress = document.getElementById('in-progress');
    this._lobby = document.getElementById('lobby');
    this._login = document.getElementById('login');
    this._playerCount = document.getElementById('player-count');
    this._lobbyPlayerList = document.getElementById('lobby-player-list');
    this._roundNumber = document.getElementById('round-number');
    this._startButtonWrapper = document.getElementById('start-button');

    this.addPlayerUnlisten = this._model.on('add player', () => this.addPlayer());
    this.nextRoundUnlisten = this._model.on('next round', () => this.nextRound());
    this.showLobbyUnlisten = this._model.on('show lobby', () => this.showLobby());
    this.startGameUnlisten = this._model.on('start game', () => this.startGame());
    this.removePlayerUnlisten = this._model.on('remove player', () => this.removePlayer());
  }

  addPlayer() {
    addPlayerListItem(this._lobbyPlayerList, this._model.players, false);
  }

  nextRound() {
    this._roundNumber.textContent = `Round: ${this._model.roundNumber}`;
  }

  removePlayer() {
    removePlayerListItem(this._lobbyPlayerList, this._model.players);
  }

  showLobby() {
    showById(this._login, false);
    showById(this._lobby, true);
    showById(this._gameHeader, true);

    if (this._model.isHost) {
      showById(this._startButtonWrapper, true);
    }
  }

  showInProgress() {
    showById(this._login, false);
    showById(this._inProgress, true);
  }

  startGame() {
    showById(this._lobby, false);
    showById(this._game, true, 'flex');
  }
}

export default LobbyView;
