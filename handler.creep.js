function cleanup() {
  Object.keys(Memory.creeps)
    .forEach(name => {
      if (Game.creeps[name] == undefined) {
        delete Memory.creeps[name];
      }
    });
}

function creepHandler(creep) {
  if (creep.carry.energy === 0 ||
    (creep.carry.energy < creep.carryCapacity && creep.memory.job === 'harvest')) {
    let source = Game.getObjectById(creep.memory.sourceId);

    if (!source) {
      source = creep.pos.findClosestByRange(FIND_SOURCES);
    }

    creep.assignJob('harvest');

    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source);
    }

    return;
  }

  if (creep.memory.role === 'harvester' || creep.memory.role === 'henchman') {
    const structure = creep.pos.findClosestByPath(
      FIND_MY_STRUCTURES,
      { filter({ structureType, energy, energyCapacity }) {
        return [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER]
          .includes(structureType) && energy < energyCapacity
      } }
    );

    const container = structure || creep.room.extension;

    if (container) {
      if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(container);
      }

      return;
    }
  }

  if (creep.memory.role !== 'upgrader') {
      const repairSite = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: ({ hits, hitsMax }) => hits < hitsMax * 0.5
      });

      creep.assignJob('repair')

      if (repairSite) {
        if (creep.repair(repairSite) == ERR_NOT_IN_RANGE) {
          creep.moveTo(repairSite);
        }

        return;
      }
  }

  if (creep.memory.role !== 'upgrader') {
    const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

    creep.assignJob('build');

    if (constructionSite) {
      if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
        creep.moveTo(constructionSite);
      }

      return;
    }
  }

  creep.assignJob('upgrade');

  if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller);
  }
}

module.exports = {
  cleanup,
  run: creepHandler
};
