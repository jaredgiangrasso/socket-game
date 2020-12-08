const socket = io();

const game = new Game();

const setPlayerCount = () => {
  const { playerCount } = game;
  document.querySelector('#playerCount').textContent = playerCount;
};

const handleFormSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(document.forms['login-form']);
  const name = formData.get('name');
  const color = formData.get('color');

  socket.emit('player ready', { name, color });
};

document.addEventListener('DOMContentLoaded', (event) => {
  const form = document.forms['login-form'];
  form.addEventListener('submit', handleFormSubmit, false);

  socket.on('add player', ({ newPlayer, playerCount }) => {
    game.addPlayer(newPlayer, playerCount);

    setPlayerCount();
  });

  socket.on('remove player', (pid) => {
    game.removePlayer(pid);

    setPlayerCount();
  });
});
