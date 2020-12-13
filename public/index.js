const socket = io();

const game = new Game();

const showById = (id, show, displayValue = 'block') => {
  document.getElementById(id).style.display = show ? displayValue : 'none';
};

const updateTimer = (seconds) => {
  const timer = document.getElementById('timer');
  if (seconds < 1) timer.textContent = '';
  else timer.textContent = `${seconds} seconds remaining`;
};

const setTimer = (seconds) => new Promise((resolve, reject) => {
  showById('timer', true);
  const timer = document.getElementById('timer');
  let i = seconds;

  const int = setInterval(() => {
    timer.textContent = i;
    updateTimer(i);
    i -= 1;
    if (i < 0) {
      resolve();
      clearInterval(int);
    }
  }, 1000);
});

const handlePromptSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(document.forms['prompt-form']);
  const prompt = formData.get('prompt');
  console.log(prompt);
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

  Object.values(game.players).forEach((player) => {
    const li = document.createElement('li');
    li.textContent = player.name;
    li.id = player.pid;

    playerList.appendChild(li);
  });
};

const updatePlayerTurn = (player) => {
  const { pid } = player;
  game.playerTurn = pid;

  const playerListItems = document.getElementById('player-list').children;
  for (let i = 0; i < playerListItems.length; i += 1) {
    if (playerListItems[i].id === pid) {
      playerListItems[i].classList.add('current-turn');
    }
  }
};

const setPlayerCount = () => {
  const { playerCount } = game;

  document.getElementById('player-count').textContent = playerCount;
};

const setStart = () => {
  game.started = true;

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
    game.playerCount = playerCount;
    game.players = players;
    setPlayerCount();

    if (game.myId === newPlayer.pid) {
      showById('login', false);
      showById('game-lobby', true);
    }

    updatePlayerList();
  });

  const startButton = document.getElementById('start-button');

  startButton.addEventListener('click', handleStart, false);

  socket.on('next turn', async (player) => {
    if (!game.started) setStart();
    updatePlayerTurn(player);

    const isMyTurn = game.isMyTurn();

    if (isMyTurn) {
      showById('prompt', true);
    } else {
      const waitPrompt = document.getElementById('wait-prompt');
      showById('wait-prompt', true);
    }

    await setTimer(5);

    const promptForm = document.forms['prompt-form'];
    promptForm.addEventListener('submit', handlePromptSubmit, false);
    promptForm.dispatchEvent(new Event('submit'));
  });

  socket.on('remove player', (pid) => {
    game.removePlayer(pid);

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
    game.myId = socket.id;
  });

  const gameStatus = await getGameStatus();
  game.started = gameStatus;

  if (game.started) runInProgress();
  else runGame();
});
