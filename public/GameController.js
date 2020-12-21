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

const handleResponseSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(document.forms['prompt-form']);
  const response = formData.get('response');
  console.log(response);
  // socket.emit('new responses', {response});

  return false;
};

class GameController extends EventEmitter {
  constructor() {
    super();

    this._loginForm = document.forms['login-form'];
    this._promptForm = document.getElementById('prompt-form');
    this._responseForm = document.getElementById('response-form');
    this._startButton = document.getElementById('start-button');

    this._loginForm.addEventListener('submit', handleLoginSubmit, false);
    this._promptForm.addEventListener('submit', handlePromptSubmit, false);
    this._responseForm.addEventListener('submit', handleResponseSubmit, false);
    this._startButton.addEventListener('click', handleStart, false);
  }
}
