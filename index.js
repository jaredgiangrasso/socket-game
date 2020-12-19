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

  socket.on('game start', () => {
    game.roundNumber = 1;
    game.started = true;

    const randomPlayer = game.getRandomPlayer();
    io.sockets.emit('next turn', randomPlayer);
  });

  socket.on('new prompt', (prompt) => {
    game.prompt = prompt;

    io.sockets.emit('new prompt', prompt);
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
