const socket = io();

const game = new Game();

const setPlayerCount = () => {
  const { playerCount } = game;
  document.querySelector('#player-count').textContent = playerCount;
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

  socket.on('add player', ({ newPlayer, playerCount }) => {
    game.addPlayer(newPlayer, playerCount);
    setPlayerCount();

    if (game.myId === newPlayer.pid) {
      document.getElementById('login').style.display = 'none';
      document.getElementById('lobby').style.display = 'block';

      Object.values(game.players).forEach((player) => {
        const li = document.createElement('li');
        li.textContent = player.name;

        document.getElementById('player-count').appendChild(li);
      });
    }
  });

  socket.on('remove player', (pid) => {
    game.removePlayer(pid);

    setPlayerCount();
  });
});
