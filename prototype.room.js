Room.prototype.getSources = function getRoomSources() {
  if (this.memory.sourceIds) {
    const fetchedSources = this.memory.sourceIds
      .map(id => Game.getObjectById(id));
    return fetchedSources;
  }

  const sources = this.find(FIND_SOURCES);
  this.memory.sourceIds = sources.map(source => source.id);
  return sources;
};
