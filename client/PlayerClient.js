class Player {
  constructor(name, color, id) {
    this._name = name;
    this._color = color;
    this._pid = id;
  }

  get name() { return this._name; }

  get pid() { return this._pid; }

  get color() { return this._color; }
}
