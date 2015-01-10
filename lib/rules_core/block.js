'use strict';


var Token = require('../token');


module.exports = function block(state) {

  if (state.inlineMode) {
    state.tokens.push(new Token(
      'inline',
      0,
      {
        content: state.src,
        lines: [ 0, 1 ],
        children: []
      }
    ));

  } else {
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
};
