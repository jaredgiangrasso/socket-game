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

document.addEventListener('DOMContentLoaded', (event) => {
  // handleFormSubmission();

  socket.on('add player', (newPlayer) => {
    game.addPlayer(newPlayer);

    setPlayerCount();
  });

  socket.on('remove player', (pid) => {
    game.removePlayer(pid);
    
    setPlayerCount();
  });
});

const setPlayerCount = () => {
  const playerCount = game.playerCount;
  document.querySelector('#playerCount').textContent = playerCount;
}
