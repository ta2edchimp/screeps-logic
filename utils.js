const utils = {
  cpu: require('utils.cpu'),

  area: require('utils.area'),

  allOf(parent) {
    return Object.keys(parent)
      .map(name => parent[name]);
  },

  forEach(parent, functor) {
    return utils.allOf(parent)
      .forEach(functor);
  }
};

module.exports = utils;
