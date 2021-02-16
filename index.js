const express = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const Game = require('./Game');

const game = new Game();

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const BEST_VOTE_POINTS = 50;
const WHO_VOTE_POINTS = 50;

io.on('connection', (socket) => {
  const pid = socket.id;
  io.sockets.emit('init', game.started);

  socket.on('player ready', (data) => {
    const { name, color } = data;
    // TODO: first, check for an existing user with this name, if they exist, return an error event
    game.addPlayer({ name, color, pid });
    const newPlayer = game.getPlayer(pid);

    io.sockets.emit('add player', { newPlayer, players: game.players, playerCount: game.playerCount });
  });

  socket.on('game start', async () => {
    game.started = true;
    game.nextRound();
    const WAIT_TIME = 3000;

    const randomPlayer = game.getRandomPlayer();
    game.playerTurn = randomPlayer.pid;
    io.sockets.emit('next turn', randomPlayer);

    await sleep(WAIT_TIME);
    io.sockets.emit('request prompt');
    await sleep(WAIT_TIME);
    io.sockets.emit('request response');
    await sleep(WAIT_TIME);
    io.sockets.emit('request best vote');
    await sleep(500);
    io.sockets.emit('update best vote winner', game.bestVoteWinner);
    await sleep(WAIT_TIME);
    io.sockets.emit('request who vote');
    await sleep(500);
    io.sockets.emit('update who vote winners', { whoVoteWinners: game.whoVoteWinners, players: game.players });
    await sleep(WAIT_TIME + 2000);
  });

  socket.on('new prompt', (prompt) => {
    game.prompt = prompt;

    io.sockets.emit('update prompt', prompt);
  });

  socket.on('new response', (response) => {
    const { value, pid: responsePid } = response;
    const {
      roundNumber, responses, players, playerTurn,
    } = game;

    responses[roundNumber][responsePid] = value;

    const responsesResponse = Object.keys(players)
      .filter((id) => id !== playerTurn)
      .map((id) => ({
        pid: id,
        value: responses[roundNumber][id],
      }));

    io.sockets.emit('new responses', responsesResponse);
  });

  socket.on('new best vote', (vote) => {
    const { value } = vote;
    const {
      roundNumber, bestVotes, players, responses,
    } = game;

    if (value) {
      players[value].points += BEST_VOTE_POINTS;
      bestVotes[roundNumber][value] += 1;
      io.sockets.emit('new best votes', bestVotes);
    }

    const currentBestVoteWinner = Object.entries(bestVotes[roundNumber]).reduce((accu, curr) => {
      const [currPid, points] = curr;

      if (points > accu.points) {
        return { pid: currPid, response: responses[roundNumber][currPid] };
      }
      return accu;
      // TODO: What if no one has voted?
    }, { pid: '', points: -Infinity });
    game.bestVoteWinner = currentBestVoteWinner;
  });

  socket.on('new who vote', (vote) => {
    const { value, pid: votePid } = vote;
    const {
      roundNumber, whoVotes, bestVoteWinner, whoVoteWinners, players,
    } = game;

    if (value) {
      if (value === bestVoteWinner.pid) {
        players[value].points += WHO_VOTE_POINTS;
        whoVotes[roundNumber][votePid] = value;
        whoVoteWinners.push(votePid);
      }
    }
  });

  socket.on('disconnect', () => {
    const player = game.getPlayer(pid);
    if (player) {
      game.removePlayer(pid);
      io.sockets.emit('remove player', pid);
    }
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
