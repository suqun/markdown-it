// lheading (---, ===)

'use strict';


module.exports = function lheading(state, startLine, endLine/*, silent*/) {
  var marker, pos, max,
      next = startLine + 1;

  if (next >= endLine) { return false; }
  if (state.tShift[next] < state.blkIndent) { return false; }

  // Scan next line

  if (state.tShift[next] - state.blkIndent > 3) { return false; }

  pos = state.bMarks[next] + state.tShift[next];
  max = state.eMarks[next];

  if (pos >= max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x2D/* - */ && marker !== 0x3D/* = */) { return false; }

  pos = state.skipChars(pos, marker);

  pos = state.skipSpaces(pos);

  if (pos < max) { return false; }

  pos = state.bMarks[startLine] + state.tShift[startLine];

  state.line = next + 1;
  state.push(
    'heading_open',
    state.level,
    {
      hLevel: marker === 0x3D/* = */ ? 1 : 2,
      lines: [ startLine, state.line ]
    }
  );
  state.push(
    'inline',
    state.level + 1,
    {
      content: state.src.slice(pos, state.eMarks[startLine]).trim(),
      lines: [ startLine, state.line - 1 ],
      children: []
    }
  );
  state.push(
    'heading_close',
    state.level,
    {
      hLevel: marker === 0x3D/* = */ ? 1 : 2
    }
  );

  return true;
};
