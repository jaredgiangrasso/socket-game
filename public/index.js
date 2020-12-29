const socket = io();

document.addEventListener('DOMContentLoaded', async (event) => {
  const model = new GameModel();
  const view = new GameView(model);
  const controller = new GameController(model);

  const runGame = () => {
    socket.on('add player', ({ newPlayer, players, playerCount }) => {
      model.addPlayer(newPlayer, players, playerCount);
    });

    socket.on('next turn', async (player) => {
      model.nextTurn(player);
    });

    socket.on('update prompt', (prompt) => {
      model.newPrompt(prompt);
    });

    socket.on('new responses', (responses) => {
      model.newResponses(responses);
    });

    socket.on('remove player', (pid) => {
      model.removePlayer(pid);
    });
  };

  const getGameStatus = () => new Promise((resolve, reject) => {
    socket.once('init', (started) => { resolve(!!started); });
  });

  socket.on('connect', () => {
    model.myId = socket.id;
  });

  const gameStatus = await getGameStatus();
  model.started = gameStatus;

  if (model.started) view.showInProgress();
  else runGame();
});
