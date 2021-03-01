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
    this.newBestVoteWinnerUnlisten = this._model.on('new best vote winner', () => this.newBestVoteWinner());
    this.newWhoVoteWinnersUnlisten = this._model.on('new who vote winners', () => this.newWhoVoteWinners());
    this.nextTurnUnlisten = this._model.on('next turn', (player) => this.nextTurn(player));
    this.removePlayerUnlisten = this._model.on('remove player', () => this.removePlayer());
    this.startGameUnlisten = this._model.on('start game', () => this.startGame());
    this.updateBestVotesUnlisten = this._model.on('update best votes', () => this.updateBestVotes());
  }

  _addPlayerVoteList() {
    Object.values(this._model.players).forEach(({ name, pid }) => {
      if (
        pid !== this._model.playerTurn
        && pid !== this._model.myId
        && this._model.bestVoteWinner.pid !== this._model.myId
      ) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between', 'player-vote-list-item-container');

        const nameCell = document.createElement('span');
        nameCell.classList.add('flex-fill');
        const votesCell = document.createElement('span');
        votesCell.classList.add('flex-fill', 'text-center');
        const voteButtonCell = document.createElement('div');
        voteButtonCell.classList.add('flex-fill', 'd-flex', 'justify-content-end');

        nameCell.classList.add('name');
        nameCell.textContent = name;

        votesCell.classList.add('who-votes');

        const button = document.createElement('button');
        button.classList.add('vote-button', 'btn', 'btn-primary');
        button.textContent = 'Vote';
        button.addEventListener('click', this._controller.handleWhoVote.bind(this._controller), false);
        voteButtonCell.appendChild(button);

        listItem.setAttribute('data-id', pid);
        listItem.appendChild(nameCell);
        listItem.appendChild(votesCell);
        listItem.appendChild(voteButtonCell);

        this._playerVoteList.appendChild(listItem);
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

  _updateBestVoteWinner() {
    const { bestVoteWinner } = this._model;

    const bestResponse = this._responseVoteList.querySelector(`[data-id="${bestVoteWinner.pid}"]`);
    bestResponse.classList.add('bg-warning');
  }

  _updateTimer(seconds) {
    const timer = this._timer;
    if (seconds < 0) timer.textContent = '';
    else timer.textContent = `${seconds} ${seconds === 1 ? 'second' : 'seconds'} remaining`;
  }

  bestVoteRequested() {
    this._setTimer(3);
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

    await this._setTimer(3);
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
          listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between', 'response-vote-list-item-container');

          const responseCell = document.createElement('span');
          responseCell.classList.add('flex-fill');
          const votesCell = document.createElement('span');
          votesCell.classList.add('flex-fill', 'text-center');
          const voteButtonCell = document.createElement('div');
          voteButtonCell.classList.add('flex-fill', 'd-flex', 'justify-content-end');

          responseCell.classList.add('response');
          responseCell.textContent = response.value;

          votesCell.classList.add('best-votes');

          listItem.setAttribute('data-id', response.pid);
          listItem.appendChild(responseCell);
          listItem.appendChild(votesCell);
          listItem.appendChild(voteButtonCell);

          if (this._model.myId !== response.pid) {
            const button = document.createElement('button');
            button.classList.add('vote-button', 'btn', 'btn-primary');
            button.textContent = 'Vote';
            button.addEventListener('click', this._controller.handleBestVote.bind(this._controller), false);
            voteButtonCell.appendChild(button);
          }

          this._responseVoteList.appendChild(listItem);
        }
      }
    });

    await this._setTimer(3);
  }

  newBestVoteWinner() {
    // TODO: add text for player whose turn it is
    this._gameHelp.textContent = 'Vote for the player you believe wrote the winning response';

    this._addPlayerVoteList();
    this._updateBestVoteWinner();
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

    this._setTimer(3);
  }

  removePlayer() {
    removePlayerListItem(this._gamePlayerList, this._model.players);
  }

  startGame() {
    addPlayerListItem(this._gamePlayerList, this._model.players, true);
  }

  updateBestVotes() {
    const { bestVotes, roundNumber } = this._model;

    [...this._bestVotes].forEach((vote) => {
      const playerListItem = vote.parentElement;
      const playerListItemId = playerListItem.getAttribute('data-id');

      const voteCount = bestVotes[roundNumber][playerListItemId];
      vote.textContent = `${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}`;
    });
  }
}

export default GameView;
