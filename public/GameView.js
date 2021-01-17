const showById = (element, show, displayValue = 'block') => {
  element.style.display = show ? displayValue : 'none';
};

const removeChildren = (element) => {
  while (element.lastChild) {
    element.removeChild(element.lastChild);
  }
};

class GameView extends EventEmitter {
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
    this._prompt = document.getElementById('prompt');
    this._promptForm = document.getElementById('prompt-form');
    this._promptTitle = document.getElementById('prompt-title');
    this._response = document.getElementById('response');
    this._responseForm = document.getElementById('response-form');
    this._roundNumber = document.getElementById('round-number');
    this._startButtonWrapper = document.getElementById('start-button-wrapper');
    this._timer = document.getElementById('timer');
    this._waitPrompt = document.getElementById('wait-prompt');

    this.addPlayerUnlisten = this._model.on('add player', () => this.addPlayer());
    this.newPromptUnlisten = this._model.on('new prompt', () => this.newPrompt());
    this.newResponsesUnlisten = this._model.on('new responses', (responses) => this.newResponses(responses));
    this.nextTurnUnlisten = this._model.on('next turn', (player) => this.nextTurn(player));
    this.showLobbyUnlisten = this._model.on('show lobby', () => this.showLobby());
    this.startGameUnlisten = this._model.on('start game', () => this.startGame());
    this.removePlayerUnlisten = this._model.on('removePlayer', () => this.removePlayer());
  }

  _updateTimer(seconds) {
    const timer = this._timer;
    if (seconds < 0) timer.textContent = '';
    else timer.textContent = `${seconds} ${seconds === 1 ? 'second' : 'seconds'} remaining`;
  }

  _setTimer(seconds) {
    return new Promise((resolve, reject) => {
      this._updateTimer(seconds);
      showById(this._timer, true);
      let i = seconds;

      const int = setInterval(() => {
        i -= 1;
        this._updateTimer(i);
        if (i < 0) {
          resolve();
          clearInterval(int);
        }
      }, 1000);
    });
  }

  _updatePlayerCount() {
    const { playerCount } = this._model;
    this._playerCount.textContent = playerCount;
  }

  _updatePlayerList() {
    removeChildren(this._playerList);
    Object.values(this._model.players).forEach((player) => {
      const name = document.createElement('span');
      name.classList.add('name');
      name.textContent = player.name;

      const response = document.createElement('span');
      response.classList.add('response');

      const container = document.createElement('div');
      container.id = 'player-list-item-container';
      container.appendChild(name);
      container.appendChild(response);

      const li = document.createElement('li');
      li.id = player.pid;
      li.appendChild(container);

      this._playerList.appendChild(li);
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
    this._updatePlayerList();
  }

  async newPrompt() {
    this._promptTitle.textContent = this._model.prompt;

    if (!this._model.isMyTurn()) {
      showById(this._response, true);
    }

    await this._setTimer(5);
  }

  newResponses(responses) {
    responses.forEach((response) => {
      if (response.pid !== this._model.playerTurn) {
        const listItem = document.querySelector(`#player-list #${response.pid} #player-list-item-container`);
        const buttonElement = document.querySelector(`#player-list #${response.pid} #player-list-item-container #vote-button`);
        const responseElement = document.querySelector(`#player-list #${response.pid} .response`);

        const button = document.createElement('button');
        button.classList.add('vote-button');
        button.textContent = 'Vote';
        button.addEventListener('click', this._controller.handleVote.bind(this._controller), false)

        if (!buttonElement) {
          listItem.appendChild(button);
        }
        responseElement.textContent = response.value;
      }
    });
  }

  nextTurn(player) {
    this._updatePlayerTurn(player);

    if (this._model.isMyTurn()) {
      showById(this._prompt, true);
    } else {
      showById(this._waitPrompt, true);
    }

    this._setTimer(5);
  }

  removePlayer() {
    this._updatePlayerList();
    this._updatePlayerCount();
  }

  showInProgress() {
    showById(this._login, false);
    showById(this._inProgress, true);
  }

  showLobby() {
    showById(this._login, false);
    showById(this._lobby, true);
  }

  startGame() {
    this._updateRoundNumber();
    showById(this._startButtonWrapper, false);
    showById(this._game, true);
  }
}
