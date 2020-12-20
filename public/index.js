const socket = io();

const model = new GameModel();
const view = new GameView(model);

const runGame = () => {
  socket.on('add player', ({ newPlayer, players, playerCount }) => {
    model.addPlayer(newPlayer, players, playerCount);
  });

  socket.on('next turn', async (player) => {
    model.nextTurn(player);
  });

  socket.on('new prompt', (prompt) => {
    model.newPrompt(prompt);
  });

  socket.on('remove player', (pid) => {
    model.removePlayer(pid);
  });
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

  if (model.started) view.showInProgress();
  else runGame();
});
