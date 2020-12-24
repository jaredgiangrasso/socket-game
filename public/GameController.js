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

const handlePromptSubmit = (e) => {
  // Fix onSubmit function on form
  e.preventDefault();
  const formData = new FormData(document.forms['prompt-form']);
  const prompt = formData.get('prompt');
  socket.emit('new prompt', prompt);

  return false;
};

class GameController extends EventEmitter {
  constructor(model) {
    super();
    this._model = model;

    this._loginForm = document.forms['login-form'];
    this._promptForm = document.getElementById('prompt-form');
    this._responseForm = document.getElementById('response-form');
    this._startButton = document.getElementById('start-button');

    this.handleResponseSubmit = this.handleResponseSubmit.bind(this);

    this._loginForm.addEventListener('submit', handleLoginSubmit, false);
    this._promptForm.addEventListener('submit', handlePromptSubmit, false);
    this._responseForm.addEventListener('submit', this.handleResponseSubmit, false);
    this._startButton.addEventListener('click', handleStart, false);
  }

  handleResponseSubmit(e) {
    e.preventDefault();
    const formData = new FormData(document.forms['response-form']);
    const response = formData.get('response');
    socket.emit('new response', { response, pid: this._model.myId });

    return false;
  }
}
