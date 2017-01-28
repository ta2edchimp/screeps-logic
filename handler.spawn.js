const utils = require('utils');

function createHarvesterCreep(spawn, sourceId) {
  return spawn.createCreep(
    [WORK, CARRY, MOVE],
    undefined,
    { role: 'harvester', sourceId }
  );
}

// TODO create designated builder creeps!
// function createBuilderCreep(spawn) {
// }

function createUpgraderCreep(spawn) {
  return spawn.createCreep(
    [WORK, CARRY, MOVE],
    undefined,
    { role: 'upgrader' }
  );
}

function createHenchmanCreep(spawn) {
  return spawn.createCreep(
    [WORK, CARRY, MOVE],
    undefined,
    { role: 'henchman' }
  );
}

function checkHarvesterCreeps(spawn) {
  const harvestersInRoom = spawn.room.find(FIND_MY_CREEPS)
    .filter(creep => creep.memory.role == 'harvester');

  spawn.room.memory.harvesterTiles = spawn.room.memory.harvesterTiles || [];

  spawn.room.getSources()
    .forEach(source => {
      let harvesterTiles = source.room.memory.harvesterTiles[source.id];

      if (!harvesterTiles) {
        const area = utils.area.withinMapBounds(source);
        const tiles = source.room.lookForAtArea(
          LOOK_TERRAIN,
          area.top, area.left, area.bottom, area.right,
          true
        ).filter(tile => tile.terrain == 'plain');

        harvesterTiles = tiles.length;
        source.room.memory.harvesterTiles[source.id] = tiles.length;
      }

      const harvestersForSource = harvestersInRoom
        .filter(creep => creep.memory.sourceId == source.id);

      if (harvestersForSource.length < harvesterTiles) {
        console.log(`Spawning harvester (${ harvestersForSource.length }/${ harvesterTiles })`)
        createHarvesterCreep(spawn, source.id);
      }
    });
}

function checkUpgraderCreeps(spawn) {
  const upgradersInRoom = spawn.room.find(FIND_MY_CREEPS)
    .filter(creep => creep.memory.role == 'upgrader');

  let upgraderTiles = spawn.room.memory.upgraderTiles;

  if (!upgraderTiles) {
    const area = utils.area.withinMapBounds(spawn.room.controller, 3);
    const tiles = [];

    for (let row = area.top; row <= area.bottom; row++) {
      for (let col = area.left; col <= area.right; col++) {
        // Only test the area's outline ...
        if (row != area.top && row != area.bottom &&
          col != area.left && col != area.right) {
          continue;
        }

        const terrain = spawn.room.lookForAt(LOOK_TERRAIN, col, row);

        if (terrain.includes('plain')) {
          tiles.push({ x: col, y: row });
        }
      }
    }

    upgraderTiles = tiles.length;
    spawn.room.memory.upgraderTiles = tiles.length;
  }

  if (upgradersInRoom.length < upgraderTiles) {
    console.log(`Spawning upgrader (${ upgradersInRoom.length }/${ upgraderTiles })`)
    createUpgraderCreep(spawn);
  }
}

function checkHenchmanCreeps(spawn) {
  const henchmenInRoom = spawn.room.find(FIND_MY_CREEPS)
    .filter(creep => creep.memory.role == 'henchman');

  const constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
  const decayedStructures = spawn.room.find(FIND_MY_STRUCTURES, {
    filter: ({ hits, hitsMax }) => hits < hitsMax * 0.5
  });
  const requiredHenchmen = Math.min(constructionSites.length + decayedStructures.length, 10);

  if (henchmenInRoom.length < requiredHenchmen) {
    console.log(`Spawning henchman (${ henchmenInRoom.length }/${ requiredHenchmen })`)
    createHenchmanCreep(spawn);
  }
}

function spawnHandler(spawn) {
  console.log(`Managing spawn "${ spawn.name }"`);

  checkHarvesterCreeps(spawn);
  checkUpgraderCreeps(spawn);
  checkHenchmanCreeps(spawn);
}

module.exports = {
  run: spawnHandler
};
