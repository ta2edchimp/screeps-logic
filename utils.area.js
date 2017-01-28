module.exports = {
  withinMapBounds(pos, range) {
    const _pos = pos.pos != undefined ? pos.pos : pos;
    const _range = typeof range === 'number' ? Math.max(range, 1) : 1;
    return {
      top: Math.max(_pos.y - _range, 0),
      bottom: Math.min(_pos.y + _range, 49),
      left: Math.max(_pos.x - _range, 0),
      right: Math.min(_pos.x + _range, 49)
    };
  }
};
