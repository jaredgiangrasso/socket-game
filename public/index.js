const socket = io();

document.addEventListener('DOMContentLoaded', async (event) => {
  const model = new GameModel();
  const controller = new GameController(model);
  const view = new GameView(model, controller);

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

    socket.on('new best votes', ({ votes, players }) => {
      model.newBestVotes(votes, players);
    });

    socket.on('remove player', (pid) => {
      model.removePlayer(pid);
    });

    socket.on('request prompt', () => {
      model.updateGamePhase('prompt requested');
    });

    socket.on('request response', () => {
      model.updateGamePhase('response requested');
    });

    socket.on('request best vote', () => {
      model.updateGamePhase('best vote requested');
    });

    socket.on('request who vote', () => {
      model.updateGamePhase('who vote requested');
    });

    socket.on('update best vote winner', (winner) => {
      console.log(winner);
      model.updateBestVoteWinner(winner);
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
