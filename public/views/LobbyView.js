import { removeChildren, showById } from '../helpers.js';
import EventEmitter from '../EventEmitter.js';

class LobbyView extends EventEmitter {
  constructor(model, controller) {
    super();
    this._model = model;
    this._controller = controller;

    this._game = document.getElementById('game');
    this._inProgress = document.getElementById('in-progress');
    this._lobby = document.getElementById('lobby');
    this._login = document.getElementById('login');
    this._playerCount = document.getElementById('player-count');
    this._playerList = document.getElementById('player-list');
    this._roundNumber = document.getElementById('round-number');
    this._startButtonWrapper = document.getElementById('start-button-wrapper');

    this.addPlayerUnlisten = this._model.on('add player', () => this.addPlayer());
    this.nextTurnUnlisten = this._model.on('next turn', (player) => this.nextTurn(player));
    this.showLobbyUnlisten = this._model.on('show lobby', () => this.showLobby());
    this.startGameUnlisten = this._model.on('start game', () => this.startGame());
    this.removePlayerUnlisten = this._model.on('removePlayer', () => this.removePlayer());
  }

  _addPlayerListItem() {
    removeChildren(this._playerList);
    Object.values(this._model.players).forEach((player) => {
      const name = document.createElement('span');
      name.classList.add('name');
      name.textContent = player.name;

      const points = document.createElement('span');
      points.classList.add('points');
      points.textContent = player.points;

      const container = document.createElement('div');
      container.id = 'player-list-item-container';
      container.appendChild(name);
      container.appendChild(points);

      const li = document.createElement('li');
      li.id = player.pid;
      li.appendChild(container);

      this._playerList.appendChild(li);
    });
  }

  _updatePlayerCount() {
    const { playerCount } = this._model;
    this._playerCount.textContent = playerCount;
  }

  _updatePoints() {
    const { players } = this._model;

    const playerListItems = document.querySelectorAll('#player-list li');
    [...playerListItems].forEach((player) => {
      const { points } = players[player.id];

      const pointsElement = document.querySelector(`#player-list #${player.id} .points`);
      pointsElement.textContent = points;
    });
  }

  _updatePlayerTurn(player) {
    const { pid } = player;
    this._model.playerTurn = pid;

    const playerListItems = this._playerList.children;
    for (let i = 0; i < playerListItems.length; i += 1) {
      if (playerListItems[i].id === pid) {
        playerListItems[i].classList.add('current-turn');
      }
    }
  }

  _updateRoundNumber() {
    this._roundNumber.textContent = this._model.roundNumber;
  }

  addPlayer() {
    this._updatePlayerCount();
    this._addPlayerListItem();
  }

  nextTurn(player) {
    this._updatePlayerTurn(player);
  }

  removePlayer() {
    this._updatePlayerList();
    this._updatePlayerCount();
  }

  showLobby() {
    showById(this._login, false);
    showById(this._lobby, true);
  }

  showInProgress() {
    showById(this._login, false);
    showById(this._inProgress, true);
  }

  startGame() {
    this._updateRoundNumber();
    showById(this._startButtonWrapper, false);
    showById(this._game, true);
  }
}

export default LobbyView;
