Creep.prototype.assignJob = function(job) {
  if (this.memory.job !== job) {
    this.memory.job = job;
    this.say(job);
  }
};
