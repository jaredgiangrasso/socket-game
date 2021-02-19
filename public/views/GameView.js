import { showById, addPlayerListItem, removePlayerListItem } from '../helpers.js';
import EventEmitter from '../EventEmitter.js';

class GameView extends EventEmitter {
  constructor(model, controller) {
    super();
    this._model = model;
    this._controller = controller;

    this._bestVotes = document.getElementsByClassName('best-votes');
    this._gamePlayerList = document.getElementById('game-player-list');
    this._playerVoteList = document.getElementById('player-vote-list');
    this._prompt = document.getElementById('prompt');
    this._promptForm = document.getElementById('prompt-form');
    this._promptTitle = document.getElementById('prompt-title');
    this._response = document.getElementById('response');
    this._responseForm = document.getElementById('response-form');
    this._responseVoteList = document.getElementById('response-vote-list');
    this._timer = document.getElementById('timer');
    this._gameHelp = document.getElementById('game-help');

    this.bestVoteRequestedUnlisten = this._model.on('best vote requested', () => this.bestVoteRequested());
    this.newPromptUnlisten = this._model.on('new prompt', () => this.newPrompt());
    this.newResponsesUnlisten = this._model.on('new responses', (responses) => this.newResponses(responses));
    this.newBestVotesUnlisten = this._model.on('new best votes', (bestVotes) => this.newBestVotes(bestVotes));
    this.newBestVoteWinnerUnlisten = this._model.on('new best vote winner', () => this.newBestVoteWinner());
    this.newWhoVoteWinnersUnlisten = this._model.on('new who vote winners', () => this.newWhoVoteWinners());
    this.nextTurnUnlisten = this._model.on('next turn', (player) => this.nextTurn(player));
    this.removePlayerUnlisten = this._model.on('remove player', () => this.removePlayer());
    this.startGameUnlisten = this._model.on('start game', () => this.startGame());
  }

  _addPlayerVoteList() {
    Object.values(this._model.players).forEach(({ name, pid }) => {
      if (pid !== this._model.playerTurn) {
        const container = document.createElement('div');
        container.classList.add('player-vote-list-item-container');

        const nameEl = document.createElement('span');
        nameEl.classList.add('name');
        nameEl.textContent = name;

        const button = document.createElement('button');
        button.classList.add('vote-button', 'btn', 'btn-primary');
        button.textContent = 'Vote';
        button.addEventListener('click', this._controller.handleWhoVote.bind(this._controller), false);

        container.appendChild(nameEl);
        if (pid !== this._model.myId || this._model.bestVoteWinner.pid !== this._model.myId) {
          container.appendChild(button);
        }

        const li = document.createElement('li');
        li.setAttribute('data-id', pid);
        li.classList.add('list-group-item');
        li.appendChild(container);

        this._playerVoteList.appendChild(li);
      }
    });
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

  _updateBestVotes() {
    const { bestVotes, roundNumber } = this._model;

    [...this._bestVotes].forEach((vote) => {
      const playerListItem = vote.parentElement.parentElement;
      // TODO: I don't think I should be using className to store this data
      const voteCount = bestVotes[roundNumber][playerListItem.className];
      vote.textContent = voteCount;
    });
  }

  _updateTimer(seconds) {
    const timer = this._timer;
    if (seconds < 0) timer.textContent = '';
    else timer.textContent = `${seconds} ${seconds === 1 ? 'second' : 'seconds'} remaining`;
  }

  bestVoteRequested() {
    this._setTimer(10);
    // showById(this._responseVoteList, false);
  }

  async newPrompt() {
    this._promptTitle.textContent = `Prompt: ${this._model.prompt}`;

    if (!this._model.isMyTurn()) {
      showById(this._response, true);
      this._gameHelp.textContent = 'Write a response';
    } else {
      this._gameHelp.textContent = 'Players are writing their responses...';
    }

    await this._setTimer(10);
  }

  // TODO: use document fragment for better performance
  async newResponses(responses) {
    showById(this._responseVoteList, true);
    this._gameHelp.textContent = 'Vote for your favorite response';

    responses.forEach((response) => {
      if (response.pid !== this._model.playerTurn) {
        const existingListItem = this._responseVoteList.querySelector(`[data-id="${response.pid}"]`);

        if (!existingListItem) {
          const listItem = document.createElement('li');
          listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');

          const responseCell = document.createElement('span');
          const votesCell = document.createElement('span');
          const voteButtonCell = document.createElement('span');

          responseCell.classList.add('response');
          responseCell.textContent = response.value;

          votesCell.classList.add('best-votes');
          votesCell.textContent = '0';

          const button = document.createElement('button');
          button.classList.add('vote-button', 'btn', 'btn-primary');
          button.textContent = 'Vote';
          button.addEventListener('click', this._controller.handleBestVote.bind(this._controller), false);
          voteButtonCell.appendChild(button);

          listItem.classList.add('response-vote-list-item-container');
          listItem.setAttribute('data-id', response.pid);
          listItem.appendChild(responseCell);
          listItem.appendChild(votesCell);
          listItem.appendChild(voteButtonCell);

          this._responseVoteList.appendChild(listItem);
        }
      }
    });

    await this._setTimer(10);
  }

  async newBestVotes() {
    this._updateBestVotes();
  }

  newBestVoteWinner() {
    this._addPlayerVoteList();
  }

  newWhoVoteWinners() {
    const { players, whoVoteWinners } = this._model;

    console.log(players, whoVoteWinners);
  }

  nextTurn() {
    if (this._model.isMyTurn()) {
      showById(this._prompt, true);

      this._gameHelp.textContent = 'Write a prompt';
    } else {
      const { players, playerTurn } = this._model;

      const playerTurnName = players[playerTurn].name;
      this._gameHelp.textContent = `${playerTurnName} is writing a prompt...`;
      showById(this._gameHelp, true);
    }

    this._setTimer(10);
  }

  removePlayer() {
    removePlayerListItem(this._gamePlayerList, this._model.players);
  }

  startGame() {
    addPlayerListItem(this._gamePlayerList, this._model.players, true);
  }
}

export default GameView;
