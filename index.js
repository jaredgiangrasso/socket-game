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

  game.addPlayer(pid);
  const newPlayer = game.getPlayer(pid);
  io.sockets.emit('add player', { newPlayer, playerCount: game.playerCount });

  socket.on('player ready', (data) => console.log(data));

  socket.on('disconnect', () => {
    game.removePlayer(pid);
    io.sockets.emit('remove player', pid);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
