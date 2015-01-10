'use strict';


module.exports = function Token(name, level, data) {
  this.type = name;
  this.level = level;
  this.d = data;
};
