const utils = require('utils');

function checkRoads(room) {
  console.log(`Checking roads layout`);

  if (room.memory.roadLayout) {
    // TODO Check integrity of road network
    return true;
  }

  console.log(`No road layout found. Planning!`);

  const roadLayout = {};
  const sources = room.getSources();
  const consumers = room.find(FIND_MY_STRUCTURES)
    .filter(({ structureType }) => ['spawn', 'controller'].includes(structureType));

  console.log(`Connect ${ sources.length } sources with ${ consumers.length } consumers`);

  consumers.forEach(consumer => {
    sources.forEach(source => {
      const result = PathFinder.search(consumer.pos, source.pos);
      result.path.forEach(pos => {
        const row = (roadLayout[pos.y] = roadLayout[pos.y] || []);
        if (!row.includes(pos.x)) {
          row.push(pos.x);
        }
      });
    });
  });

  Object.keys(roadLayout)
    .forEach(row => {
      roadLayout[row].forEach(col => {
        console.log(`create road tile at [${ col }, ${ row }]`);
        room.createConstructionSite(
          parseInt(col, 10),
          parseInt(row, 10),
          STRUCTURE_ROAD
        );
      });
    });

  room.memory.roadLayout = roadLayout;

  return false;
}

function checkExtensions(room) {
  console.log(`Checking extensions layout`);

  const maxCount = Math.min(Math.max(room.controller.level - 1, 0) * 5, 10) + Math.max(room.controller.level - 3, 0) * 10;

  room.memory.extensionsLayout = room.memory.extensionsLayout || {};

  const extensionsLayedout = Object.keys(room.memory.extensionsLayout).map(row => room.memory.extensionsLayout[row].length).reduce((acc, cur) => acc + cur, 0);

  if (extensionsLayedout >= maxCount) {
    // TODO check integrity of extensions and their count
    return true;
  }

  console.log(`No or insufficient amount of extensions found ${ extensionsLayedout } of ${ maxCount }`);

  const extensions = room.find(FIND_MY_STRUCTURES).filter(structure => structure.structureType === STRUCTURE_EXTENSION);
  const extConstSites = room.find(FIND_CONSTRUCTION_SITES).filter(site => site.structureType === STRUCTURE_EXTENSION);

  [...extensions, ...extConstSites].forEach(({ pos }) => {
    const row = (room.memory.extensionsLayout[pos.y] = room.memory.extensionsLayout[pos.y] || []);
    if (!row.includes(pos.x)) {
      row.push(pos.x);
    }
  });

  const count = extensions.length + extConstSites.length;

  const spawns = room.find(FIND_MY_STRUCTURES, {
    filter: ({ structureType }) => structureType == STRUCTURE_SPAWN
  });
  const spawn = spawns[0];

  if (!spawn) {
    console.log(`No spawn found. Omitting extensions.`);
    return true;
  }

  const freeTiles = room.lookForAtArea(LOOK_TERRAIN, 0, 0, 49, 49, true)
    .filter(tile => tile.terrain == 'plain')
    .filter(pos => room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y).length == 0)
    .filter(pos => room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y).length == 0)
    .map(pos => ({
      x: pos.x,
      y: pos.y,
      range: Math.sqrt(Math.pow(Math.abs(spawn.pos.x - pos.x), 2) + Math.pow(Math.abs(spawn.pos.y - pos.y), 2))
    }))
    .sort((a, b) => a.range - b.range);

  freeTiles.splice(0, maxCount - count)
    .forEach(tile => {
      if (room.createConstructionSite(tile.x, tile.y, STRUCTURE_EXTENSION) == OK) {
        const row = (room.memory.extensionsLayout[tile.y] = room.memory.extensionsLayout[tile.y] || []);
        if (!row.includes(tile.x)) {
          row.push(tile.x);
        }
      }
    });

  return false;
}

function checkContainers(room) {
  console.log(`Check containers layout`);

  const maxCount = Math.min(room.controller.level, 5);
  const containers = room.find(FIND_MY_STRUCTURES, {
    filter: ({ structureType }) => structureType == STRUCTURE_CONTAINER
  });
  const cntConstSites = room.find(FIND_CONSTRUCTION_SITES).filter(site => site.structureType === STRUCTURE_CONTAINER);
  const count = containers.length + cntConstSites.length;

  if (count >= maxCount) {
    // TODO check integrity of extensions and their count
    return true;
  }

  console.log(`No or insufficient amount of containers found ${ count } of ${ maxCount }`);

  // Place containers in a straight line from the nearest source
  const source = room.controller.pos.findClosestByPath(FIND_SOURCES);

  if (!source) {
    console.log(`No source, containers omitted.`);
    return true;
  }

  const result = PathFinder.search(source.pos, room.controller.pos);

  result.path.forEach(pos => {
    room.createConstructionSite(pos, STRUCTURE_CONTAINER);
  });

  return false;
}

function roomHandler(room) {
  console.log(`Managing room "${ room.name }"`);

  checkRoads(room) &&
  checkExtensions(room) &&
  checkContainers(room);
}

module.exports = {
  checkRoads,
  run: roomHandler
};
