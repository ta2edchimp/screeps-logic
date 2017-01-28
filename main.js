require('prototype.room');
require('prototype.creep');

const roomHandler = require('handler.room');
const spawnHandler = require('handler.spawn');
const creepHandler = require('handler.creep');

const utils = require('utils');

module.exports.loop = function mainLoop() {
  creepHandler.cleanup();

  utils.forEach(Game.rooms, roomHandler.run);
  utils.forEach(Game.spawns, spawnHandler.run);
  utils.forEach(Game.creeps, creepHandler.run);
};
