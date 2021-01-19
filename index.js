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

const VOTE_POINTS = 50;

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

    const randomPlayer = game.getRandomPlayer();
    game.playerTurn = randomPlayer.pid;
    io.sockets.emit('next turn', randomPlayer);

    await sleep(5000);
    io.sockets.emit('request prompt');
    await sleep(5000);
    io.sockets.emit('request response');
    await sleep(5000);
    io.sockets.emit('request vote');
  });

  socket.on('new prompt', (prompt) => {
    game.prompt = prompt;

    io.sockets.emit('update prompt', prompt);
  });

  socket.on('new response', (response) => {
    game.responses.push(response);

    const responses = Object.keys(game.players)
      .filter((id) => id !== game.playerTurn)
      .map((id) => {
        const gameResponse = game.responses.find((response) => response.pid === id);
        return gameResponse;
      });

    io.sockets.emit('new responses', responses);
  });

  socket.on('new vote', (vote) => {
    const { value, pid } = vote;
    const { roundNumber, votes } = game;

    game.players[pid].points += VOTE_POINTS;
    votes[roundNumber][value] = votes[roundNumber][value] + 1;
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
