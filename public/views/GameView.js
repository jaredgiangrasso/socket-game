import { showById } from '../helpers.js';
import EventEmitter from '../EventEmitter.js';

class GameView extends EventEmitter {
  constructor(model, controller) {
    super();
    this._model = model;
    this._controller = controller;

    this._bestVotes = document.getElementsByClassName('best-votes');
    this._bestVoteWinner = document.getElementById('best-vote-winner');
    this._prompt = document.getElementById('prompt');
    this._promptForm = document.getElementById('prompt-form');
    this._promptTitle = document.getElementById('prompt-title');
    this._response = document.getElementById('response');
    this._responseForm = document.getElementById('response-form');
    this._responseVoteList = document.getElementById('response-vote-list');
    this._responseVoteListWrapper = document.getElementById('response-vote-list-wrapper');
    this._timer = document.getElementById('timer');
    this._waitPrompt = document.getElementById('wait-prompt');

    this.newPromptUnlisten = this._model.on('new prompt', () => this.newPrompt());
    this.newResponsesUnlisten = this._model.on('new responses', (responses) => this.newResponses(responses));
    this.newBestVotesUnlisten = this._model.on('new best votes', (bestVotes) => this.newBestVotes(bestVotes));
    this.newBestVoteWinnerUnlisten = this._model.on('new best vote winner', (winner) => this.newBestVoteWinner(winner));
    this.nextTurnUnlisten = this._model.on('next turn', (player) => this.nextTurn(player));
    this.bestVoteRequestedUnlisten = this._model.on('best vote requested', () => this.bestVoteRequested());
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
      const voteCount = bestVotes[roundNumber][playerListItem.id];
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
    showById(this._responseVoteListWrapper, false);
  }

  async newPrompt() {
    this._promptTitle.textContent = this._model.prompt;

    if (!this._model.isMyTurn()) {
      showById(this._response, true);
    }

    await this._setTimer(2);
  }

  // TODO: use document fragment for better performance
  async newResponses(responses) {
    responses.forEach((response) => {
      if (response.pid !== this._model.playerTurn) {
        const existingListItem = document.querySelector(`#response-list .${response.pid}`);

        if (!existingListItem) {
          const responseEl = document.createElement('span');
          responseEl.classList.add('response');
          responseEl.textContent = response.value;

          const bestVotes = document.createElement('span');
          bestVotes.classList.add('best-votes');
          bestVotes.textContent = '0';

          const button = document.createElement('button');
          button.classList.add('vote-button');
          button.textContent = 'Vote';
          button.addEventListener('click', this._controller.handleVote.bind(this._controller), false);

          const container = document.createElement('div');
          container.classList.add('response-item-container');
          container.appendChild(responseEl);
          container.appendChild(bestVotes);
          container.appendChild(button);

          const listItem = document.createElement('li');
          listItem.classList.add(response.pid);
          listItem.appendChild(container);

          this._responseVoteList.appendChild(listItem);
        }
      }
    });

    await this._setTimer(5);
  }

  async newBestVotes() {
    this._updateBestVotes();
    this._updatePoints();
  }

  newBestVoteWinner(winner) {
    this._bestVoteWinner.textContent = `Best Response: ${winner.response}`;
    Object.values(this._model.players).forEach(({ name, pid }) => {
      const nameEl = document.createElement('span');
      nameEl.classList.add('name');
      nameEl.textContent = name;
    });
  }

  nextTurn() {
    if (this._model.isMyTurn()) {
      showById(this._prompt, true);
    } else {
      showById(this._waitPrompt, true);
    }

    this._setTimer(2);
  }
}

export default GameView;
