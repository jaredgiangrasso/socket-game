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

  socket.on('add player', (playerCount) => {
    game.addPlayer(playerCount);
    
    setPlayerCount(playerCount);
  });

  socket.on('remove player', (playerCount) => {
    game.removePlayer(playerCount);

    setPlayerCount(playerCount);
  });
});

const setPlayerCount = playerCount => {
  document.querySelector('#playerCount').textContent = playerCount;
}
