import EventEmitter from './EventEmitter.js';
import socket from './socket.js';
import { showById } from './helpers.js';

const handleLoginSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(document.forms['login-form']);
  const name = formData.get('name');
  const color = formData.get('color');

  // TODO: handle invalid input with error message?
  if (name && color) {
    socket.emit('player ready', { name, color });
  }
};

class GameController extends EventEmitter {
  constructor(model) {
    super();
    this._model = model;

    this._loginForm = document.forms['login-form'];
    this._prompt = document.getElementById('prompt');
    this._promptForm = document.getElementById('prompt-form');
    this._responseForm = document.getElementById('response-form');
    this._startButton = document.getElementById('start-button');
    this._bestVoteButtons = document.querySelectorAll('.response-vote-list-item-container .vote-button');
    this._gameHelp = document.getElementById('game-help');
    this._whoVoteButtons = document.querySelectorAll('.player-vote-item-container .vote-button');

    this.handleResponseSubmit = this.handleResponseSubmit.bind(this);
    this.handlePromptSubmit = this.handlePromptSubmit.bind(this);
    this.handleStart = this.handleStart.bind(this);

    this.addPromptRequestedUnlisten = this._model.on('prompt requested', () => this.submitPrompt());
    this.addResponseRequestedUnlisten = this._model.on('response requested', () => this.submitResponse());
    this.addBestVoteRequestedUnlisten = this._model.on('best vote requested', () => this.submitBestVote());
    this.addWhoVoteRequestUnlisten = this._model.on('who vote requested', () => this.submitWhoVote());

    this._loginForm.addEventListener('submit', handleLoginSubmit, false);
    this._promptForm.addEventListener('submit', this.handlePromptSubmit, false);
    this._responseForm.addEventListener('submit', this.handleResponseSubmit, false);
    this._startButton.addEventListener('click', this.handleStart, false);
  }

  handlePromptSubmit(e) {
    const { gamePhase, myPrompt } = this._model;

    // Fix onSubmit function on form
    e.preventDefault();
    const formData = new FormData(document.forms['prompt-form']);
    const prompt = formData.get('prompt');

    // If the gamePhase is not 'prompt requested', the prompt has not been requested
    // by the server meaning this is a manual submission
    // and the prompt should only be stored locally for now. Otherwise, the server has
    // requested the prompt and we either send what has been stored locally in myPrompt
    // or the current value of the input.
    if (gamePhase !== 'prompt requested') {
      this._model.myPrompt = prompt;
      this._gameHelp.textContent = 'Prompt submitted';
    } else {
      const promptData = myPrompt || prompt;
      socket.emit('new prompt', promptData);
    }
    showById(this._prompt, false);

    return false;
  }

  handleResponseSubmit(e) {
    const { gamePhase, myResponse } = this._model;

    e.preventDefault();
    const formData = new FormData(document.forms['response-form']);
    const response = formData.get('response');

    // See notes on handleSubmitPrompt
    if (gamePhase !== 'response requested') {
      this._model.myResponse = response;
      this._gameHelp.textContent = 'Response submitted';
    } else {
      const responseData = myResponse || response;
      socket.emit('new response', { value: responseData, pid: this._model.myId });
    }
    showById(this._responseForm, false);

    return false;
  }

  handleStart() {
    if (Object.keys(this._model.players).length > 1) {
      socket.emit('game start');
    }
  }

  handleBestVote(e) {
    e.preventDefault();
    const listItem = e.target.parentElement.parentElement;
    const votePid = listItem.getAttribute('data-id');

    this._model.myBestVote = votePid;
    this.hideBestVoteButtons();
    this._gameHelp.textContent = 'Vote submitted';

    return false;
  }

  handleWhoVote(e) {
    e.preventDefault();
    const listItem = e.target.parentElement.parentElement;
    const votePid = listItem.getAttribute('data-id');

    this._model.myWhoVote = votePid;
    this.hideWhoVoteButtons();

    return false;
  }

  hideBestVoteButtons() {
    // TODO: define this selector in constructor

    const bestVoteButtons = document.querySelectorAll('.response-vote-list-item-container .vote-button');
    [...bestVoteButtons].forEach((button) => {
      showById(button, false);
    });
  }

  hideWhoVoteButtons() {
    // TODO: define this selector in constructor

    const whoVoteButtons = document.querySelectorAll('.player-vote-list-item-container .vote-button');
    [...whoVoteButtons].forEach((button) => {
      showById(button, false);
    });
  }

  submitPrompt() {
    if (this._model.isMyTurn()) {
      // If user has already manually submitted prompt, it will be available in myPrompt.
      // Otherwise, submit the prompt automatically.
      if (this._model.myPrompt) {
        socket.emit('new prompt', this._model.myPrompt);
        this._model.myPrompt = '';
      } else {
        this._promptForm.dispatchEvent(new Event('submit'));
      }
    }
  }

  submitResponse() {
    if (!this._model.isMyTurn()) {
      // See notes on submitPrompt
      if (this._model.myResponse) {
        socket.emit('new response', { value: this._model.myResponse, pid: this._model.myId });
        this._model.myResponse = '';
      } else {
        this._responseForm.dispatchEvent(new Event('submit'));
      }
    }
  }

  submitBestVote() {
    socket.emit('new best vote', { value: this._model.myBestVote, pid: this._model.myId });
    this._model.myBestVote = '';
    this.hideBestVoteButtons();
  }

  submitWhoVote() {
    socket.emit('new who vote', { value: this._model.myWhoVote, pid: this._model.myId });
    this._model.myWhoVote = '';
    this.hideWhoVoteButtons();
  }
}

export default GameController;
