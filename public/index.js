const socket = io();

const game = new Game();

// const handleFormSubmission = () => {
//   const logSubmit = (e) => {
//     e.preventDefault();
//     socket.emit('chat message', document.querySelector('#m').value);
//     document.querySelector('#m').value;
//     return false;
//   };

//   const form = document.querySelector('form');
//   form.addEventListener('submit', logSubmit);
// }

const setPlayerCount = () => {
  const { playerCount } = game;
  document.querySelector('#playerCount').textContent = playerCount;
};

document.addEventListener('DOMContentLoaded', (event) => {
  // handleFormSubmission();

  socket.on('add player', ({ newPlayer, playerCount }) => {
    game.addPlayer(newPlayer, playerCount);

    setPlayerCount();
  });

  socket.on('remove player', (pid) => {
    game.removePlayer(pid);

    setPlayerCount();
  });
});
