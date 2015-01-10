// heading (#, ##, ...)

'use strict';


module.exports = function heading(state, startLine, endLine, silent) {
  var ch, level, tmp,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos >= max) { return false; }

  ch  = state.src.charCodeAt(pos);

  if (ch !== 0x23/* # */ || pos >= max) { return false; }

  // count heading level
  level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23/* # */ && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  if (level > 6 || (pos < max && ch !== 0x20/* space */)) { return false; }

  if (silent) { return true; }

  // Let's cut tails like '    ###  ' from the end of string

  max = state.skipCharsBack(max, 0x20, pos); // space
  tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && state.src.charCodeAt(tmp - 1) === 0x20/* space */) {
    max = tmp;
  }

  state.line = startLine + 1;

  state.push(
    'heading_open',
    state.level,
    {
      hLevel: level,
      lines: [ startLine, state.line ]
    }
  );

  // only if header is not empty
  if (pos < max) {
    state.push(
      'inline',
      state.level + 1,
      {
        content: state.src.slice(pos, max).trim(),
        lines: [ startLine, state.line ],
        children: []
      }
    );
  }
  state.push(
    'heading_close',
    state.level,
    {
      hLevel: level
    }
  );

  return true;
};
