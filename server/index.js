const express = require('express');
const path = require('path');

const app = express();
const http = require('http');

const server = http.createServer(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '../client')));

const Game = require('./Game');

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./dist/client/index.html'));
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const rooms = {};

const BEST_VOTE_POINTS = 50;
const WHO_VOTE_POINTS = 50;
const ROUNDS = 2;

io.on('connection', (socket) => {
  console.log(socket);
  const pid = socket.id;
  let currentRoom = null;

  socket.on('room', (roomId) => {
    const room = rooms[roomId];
    if (!room) {
      rooms[roomId] = new Game();
    }
    currentRoom = roomId;
    socket.join(roomId);

    const game = rooms[roomId];
    io.sockets.in(roomId).emit('init', game.started);
  });

  socket.on('player ready', (data) => {
    const { name, color, roomId } = data;

    const room = rooms[roomId];

    // TODO: first, check for an existing user with this name, if they exist, return an error event
    room.addPlayer({
      name, color, pid,
    });
    const newPlayer = room.getPlayer(pid);
    io.sockets.in(roomId).emit('add player', { newPlayer, players: room.players, playerCount: room.playerCount });
  });

  socket.on('game start', async ({ roomId }) => {
    const game = rooms[roomId];
    game.started = true;
    const WAIT_TIME = 3000;

    for (let i = 0; i < ROUNDS; i++) {
      game.nextRound();
      io.sockets.in(roomId).emit('next round');

      for (let j = 0; j < game.playerCount; j++) {
        game.nextTurn();

        io.sockets.in(roomId).emit('next turn', game.playerTurn);
        await sleep(WAIT_TIME * 2);
        io.sockets.in(roomId).emit('request prompt');
        await sleep(WAIT_TIME);
        io.sockets.in(roomId).emit('request response');
        await sleep(WAIT_TIME);
        io.sockets.in(roomId).emit('request best vote');
        await sleep(500);
        io.sockets.in(roomId).emit('update best vote winner', { winner: game.bestVoteWinner, bestVotes: game.bestVotes });
        await sleep(WAIT_TIME);
        io.sockets.in(roomId).emit('request who vote');
        await sleep(500);
        io.sockets.in(roomId).emit('update who vote winners', { whoVoteWinners: game.whoVoteWinners, points: game.points });
        await sleep(WAIT_TIME);

        io.sockets.in(roomId).emit('new turn');
      }
    }
  });

  socket.on('new prompt', ({ roomId, data: { prompt } }) => {
    const game = rooms[roomId];
    game.prompt = prompt;

    io.sockets.emit('update prompt', prompt);
  });

  socket.on('new response', ({ roomId, data: { response } }) => {
    const game = rooms[roomId];
    const { value, pid: responsePid } = response;
    const {
      playerTurn, responses, roundNumber,
    } = game;

    responses[roundNumber][playerTurn][responsePid] = value;

    const responsesResponse = Object.entries(responses[roundNumber][playerTurn])
      .filter(([resPid, responseValue]) => responseValue !== '')
      .map(([resPid, responseValue]) => ({
        pid: resPid,
        value: responseValue,
      }));

    io.sockets.emit('new responses', responsesResponse);
  });

  socket.on('new best vote', ({ roomId, data: { vote } }) => {
    const game = rooms[roomId];
    const { value } = vote;
    const {
      playerTurn, bestVotes, points, roundNumber,
    } = game;

    if (value) {
      points[roundNumber][playerTurn][value] += BEST_VOTE_POINTS;
      bestVotes[roundNumber][playerTurn][value] += 1;
    }

    const currentBestVoteWinner = Object.entries(bestVotes[roundNumber][playerTurn])
      .reduce((accu, curr) => {
        const [currPid, votes] = curr;

        if (votes > accu.votes) {
          return { pid: currPid, votes };
        }
        return accu;
        // TODO: What if no one has voted?
      }, { pid: '', votes: -Infinity });

    game.bestVoteWinner = currentBestVoteWinner;
  });

  socket.on('new who vote', ({ roomId, data: { vote } }) => {
    const game = rooms[roomId];
    const { value, pid: votePid } = vote;
    const {
      playerTurn, whoVotes, bestVoteWinner, whoVoteWinners, points, roundNumber,
    } = game;

    if (value) {
      if (value === bestVoteWinner.pid) {
        points[roundNumber][playerTurn][value] += WHO_VOTE_POINTS;
        whoVotes[roundNumber][playerTurn][value] += 1;
        whoVoteWinners.push(votePid);
      }
    }
  });

  socket.on('disconnect', () => {
    const game = rooms[currentRoom];
    if (game) {
      const player = game.getPlayer(pid);
      if (player) {
        game.removePlayer(pid);
        io.sockets.in(currentRoom).emit('remove player', pid);
        socket.leave(currentRoom);
      }
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
