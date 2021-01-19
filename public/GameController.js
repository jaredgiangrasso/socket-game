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

const handleStart = () => {
  socket.emit('game start');
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
    this._voteButtons = document.getElementsByClassName('vote-button');

    this.handleResponseSubmit = this.handleResponseSubmit.bind(this);
    this.handlePromptSubmit = this.handlePromptSubmit.bind(this);

    this.addPromptRequestedUnlisten = this._model.on('prompt requested', () => this.submitPrompt());
    this.addResponseRequestedUnlisten = this._model.on('response requested', () => this.submitResponse());
    this.addVoteRequestedUnlisten = this._model.on('vote requested', () => this.submitVote());

    this._loginForm.addEventListener('submit', handleLoginSubmit, false);
    this._promptForm.addEventListener('submit', this.handlePromptSubmit, false);
    this._responseForm.addEventListener('submit', this.handleResponseSubmit, false);
    this._startButton.addEventListener('click', handleStart, false);
  }

  handlePromptSubmit(e) {
    const { gamePhase, myPrompt } = this._model;

    // Fix onSubmit function on form
    e.preventDefault();
    const formData = new FormData(document.forms['prompt-form']);
    const prompt = formData.get('prompt');

    // If the gamePhase is not 'prompt requested', the prompt has not been requested by the server meaning this is a manual submission
    // and the prompt should only be stored locally for now. Otherwise, the server has requested the prompt and we either send
    // what has been stored locally in myPrompt or the current value of the input.
    if (gamePhase !== 'prompt requested') {
      this._model.myPrompt = prompt;
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
    } else {
      const responseData = myResponse || response;
      socket.emit('new response', { value: responseData, pid: this._model.myId });
    }
    showById(this._responseForm, false);

    return false;
  }

  handleVote(e) {
    const { myVote, gamePhase } = this._model;

    e.preventDefault();
    const listItem = e.target.parentElement.parentElement;
    const pid = listItem.id;

    // See notes on handleSubmitPrompt
    if (gamePhase !== 'vote requested') {
      this._model.myVote = pid;
    } else {
      const voteData = myVote || pid;
      socket.emit('new vote', { value: voteData, pid: this._model.myId });
    }
    [...this._voteButtons].forEach((button) => {
      showById(button, false);
    });

    return false;
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

  submitVote() {
    socket.emit('new vote', { value: this._model.myVote, pid: this._model.myId });
    this._model.myVote = '';
  }
}
