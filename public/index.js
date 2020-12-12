const socket = io();

const game = new Game();

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

    playerList.appendChild(li);
  });
};

const setPlayerCount = () => {
  const { playerCount } = game;

  document.getElementById('player-count').textContent = playerCount;
};

const handleStart = () => {
  socket.emit('game start');

  document.getElementById('lobby').style.display = 'none';
  document.getElementById('game').style.display = 'block';
};

const handleFormSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(document.forms['login-form']);
  const name = formData.get('name');
  const color = formData.get('color');

  // TODO: handle invalid input with error message?
  if (name && color) {
    socket.emit('player ready', { name, color });
  }
};

document.addEventListener('DOMContentLoaded', (event) => {
  socket.on('connect', () => {
    game.myId = socket.id;
  });

  const form = document.forms['login-form'];
  form.addEventListener('submit', handleFormSubmit, false);

  socket.on('add player', ({ newPlayer, players, playerCount }) => {
    game.playerCount = playerCount;
    game.players = players;
    setPlayerCount();

    if (game.myId === newPlayer.pid) {
      document.getElementById('login').style.display = 'none';
      document.getElementById('lobby').style.display = 'block';
    }

    updatePlayerList();
  });

  const startButton = document.getElementById('start-button');

  startButton.addEventListener('click', handleStart, false);

  socket.on('next turn', (player) => console.log(player));

  socket.on('remove player', (pid) => {
    game.removePlayer(pid);

    updatePlayerList();
    setPlayerCount();
  });
});
