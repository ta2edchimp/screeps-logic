module.exports = {
  remaining() {
    return Game.cpu.tickLimit - Game.cpu.getUsed();
  }
};
