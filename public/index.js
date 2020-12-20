const socket = io();

const model = new GameModel();
const view = new GameView(model);

class EventEmitter {
  constructor() {
    this._events = {};
  }

  _removeListener(name, listenerToRemove) {
    if (!this._events[name]) {
      throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
    }

    const filterListeners = (listener) => listener !== listenerToRemove;

    this._events[name] = this._events[name].filter(filterListeners);
  }

  on(name, listener) {
    if (!this._events[name]) {
      this._events[name] = [];
    }

    this._events[name].push(listener);

    return () => this._removeListener(name, listener);
  }

  emit(name, data) {
    if (!this._events[name]) {
      throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
    }

    const fireCallbacks = (callback) => {
      callback(data);
    };

    this._events[name].forEach(fireCallbacks);
  }
}

const event = new EventEmitter();

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
