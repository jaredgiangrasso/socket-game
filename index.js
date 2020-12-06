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
  game.addPlayer();
  const playerCount = game.playerCount;
  io.sockets.emit('add player', playerCount);

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    game.removePlayer();
    const playerCount = game.playerCount;
    io.sockets.emit('remove player', playerCount);
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
