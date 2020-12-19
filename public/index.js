const socket = io();

const model = new GameModel();
const view = new GameView();

class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(name, listener) {
    if (!this._events[name]) {
      this._events[name] = [];
    }

    this._events[name].push(listener);
  }

  removeListener(name, listenerToRemove) {
    if (!this._events[name]) {
      throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
    }

    const filterListeners = (listener) => listener !== listenerToRemove;

    this._events[name] = this._events[name].filter(filterListeners);
  }

  emit(name, data) {
    if (!this._events[name]) {
      throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
    }

    const fireCallbacks = (callback) => {
      callback(data);
    };

    this._events[name].forEach(fireCallbacks);
  }
}

/*
///////////
REFACTORING:
///////////
*/

const showById = (id, show, displayValue = 'block') => {
  document.getElementById(id).style.display = show ? displayValue : 'none';
};

const updateRoundNumber = () => {
  const roundNumber = document.getElementById('round-number');
  roundNumber.textContent = model.roundNumber;
};

const updateTimer = (seconds) => {
  const timer = document.getElementById('timer');
  if (seconds < 0) timer.textContent = '';
  else timer.textContent = `${seconds} ${seconds === 1 ? 'second' : 'seconds'} remaining`;
};

const setTimer = (seconds) => new Promise((resolve, reject) => {
  updateTimer(seconds);
  showById('timer', true);
  let i = seconds;

  const int = setInterval(() => {
    i -= 1;
    updateTimer(i);
    if (i < 0) {
      resolve();
      clearInterval(int);
    }
  }, 1000);
});

const handlePromptSubmit = (e) => {
  // Fix onSubmit function on form
  e.preventDefault();
  const formData = new FormData(document.forms['prompt-form']);
  const prompt = formData.get('prompt');
  socket.emit('new prompt', prompt);

  return false;
};

const removeChildren = (element) => {
  while (element.lastChild) {
    element.removeChild(element.lastChild);
  }
};

const updatePlayerList = () => {
  const playerList = document.getElementById('player-list');

  removeChildren(playerList);

  Object.values(model.players).forEach((player) => {
    const li = document.createElement('li');
    li.textContent = player.name;
    li.id = player.pid;

    playerList.appendChild(li);
  });
};

const updatePlayerTurn = (player) => {
  const { pid } = player;
  model.playerTurn = pid;

  const playerListItems = document.getElementById('player-list').children;
  for (let i = 0; i < playerListItems.length; i += 1) {
    if (playerListItems[i].id === pid) {
      playerListItems[i].classList.add('current-turn');
    }
  }
};

const setPlayerCount = () => {
  const { playerCount } = model;

  document.getElementById('player-count').textContent = playerCount;
};

const setStart = () => {
  model.setStart();

  updateRoundNumber();
  showById('lobby', false);
  showById('game', true);
};

const handleStart = () => {
  socket.emit('game start');
};

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

const runGame = () => {
  const form = document.forms['login-form'];
  form.addEventListener('submit', handleLoginSubmit, false);

  socket.on('add player', ({ newPlayer, players, playerCount }) => {
    model.playerCount = playerCount;
    model.players = players;
    setPlayerCount();

    if (model.myId === newPlayer.pid) {
      showById('login', false);
      showById('game-lobby', true);
    }

    updatePlayerList();
  });

  const startButton = document.getElementById('start-button');

  startButton.addEventListener('click', handleStart, false);

  socket.on('next turn', async (player) => {
    if (!model.started) setStart();
    updatePlayerTurn(player);

    const isMyTurn = model.isMyTurn();

    if (isMyTurn) {
      showById('prompt', true);
    } else {
      showById('wait-prompt', true);
    }

    await setTimer(3);

    if (isMyTurn) {
      showById('prompt', false);
    } else {
      showById('response', true);
    }

    const promptForm = document.getElementById('prompt-form');
    promptForm.addEventListener('submit', handlePromptSubmit, false);
    if (model.myId === model.playerTurn) promptForm.dispatchEvent(new Event('submit'));
  });

  socket.on('new prompt', (prompt) => {
    model.prompt = prompt;

    const promptTitle = document.getElementById('prompt-title');
    promptTitle.textContent = prompt;
  });

  socket.on('remove player', (pid) => {
    model.removePlayer(pid);

    updatePlayerList();
    setPlayerCount();
  });
};

const runInProgress = () => {
  showById('login', false);
  showById('in-progress', true);
};

const getGameStatus = () => new Promise((resolve, reject) => {
  socket.once('init', (started) => { resolve(!!started); });
});

document.addEventListener('DOMContentLoaded', async (event) => {
  socket.on('connect', () => {
    model.myId = socket.id;
  });

  const gameStatus = await getGameStatus();
  model.started = gameStatus;

  if (model.started) runInProgress();
  else runGame();
});
