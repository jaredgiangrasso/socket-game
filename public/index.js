import LobbyView from './views/LobbyView.js';
import GameView from './views/GameView.js';
import GameModel from './GameModel.js';
import GameController from './GameController.js';
import socket from './socket.js';

document.addEventListener('DOMContentLoaded', async (event) => {
  const model = new GameModel();
  const controller = new GameController(model);
  const lobbyView = new LobbyView(model, controller);
  const gameView = new GameView(model, controller);

  const { room: roomId } = Qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });

  const runGame = () => {
    socket.on('add player', ({ newPlayer, players, playerCount }) => {
      model.addPlayer(newPlayer, players, playerCount);
    });

    socket.on('next round', async () => {
      model.nextRound();
    });

    socket.on('next turn', async (pid) => {
      model.nextTurn(pid);
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

    socket.on('update best vote winner', ({ winner, bestVotes }) => {
      model.updateBestVoteWinner(winner);
      model.updateBestVotes(bestVotes);
    });

    socket.on('update who vote winners', ({ whoVoteWinners, points }) => {
      model.updateWhoVoteWinners(whoVoteWinners, points);
    });
  };

  const getGameStatus = () => new Promise((resolve, reject) => {
    socket.once('init', (started) => {
      resolve(!!started);
    });
  });

  socket.on('connect', () => {
    model.myId = socket.id;
  });

  if (roomId) {
    model.updateRoomId(roomId);
    socket.emit('room', roomId);
  }

  const gameStatus = await getGameStatus();
  model.started = gameStatus;

  if (model.started) lobbyView.showInProgress();
  else runGame();
});
