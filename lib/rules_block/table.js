// GFM table, non-standard

'use strict';


function getLine(state, line) {
  var pos = state.bMarks[line] + state.blkIndent,
      max = state.eMarks[line];

  return state.src.substr(pos, max - pos);
}


module.exports = function table(state, startLine, endLine, silent) {
  var ch, lineText, pos, i, nextLine, rows,
      aligns, t, tableLines, tbodyLines;

  // should have at least three lines
  if (startLine + 2 > endLine) { return false; }

  nextLine = startLine + 1;

  if (state.tShift[nextLine] < state.blkIndent) { return false; }

  // first character of the second line should be '|' or '-'

  pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) { return false; }

  ch = state.src.charCodeAt(pos);
  if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */) { return false; }

  lineText = getLine(state, startLine + 1);
  if (!/^[-:| ]+$/.test(lineText)) { return false; }

  rows = lineText.split('|');
  if (rows <= 2) { return false; }
  aligns = [];
  for (i = 0; i < rows.length; i++) {
    t = rows[i].trim();
    if (!t) {
      // allow empty columns before and after table, but not in between columns;
      // e.g. allow ` |---| `, disallow ` ---||--- `
      if (i === 0 || i === rows.length - 1) {
        continue;
      } else {
        return false;
      }
    }

    if (!/^:?-+:?$/.test(t)) { return false; }
    if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
      aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
    } else if (t.charCodeAt(0) === 0x3A/* : */) {
      aligns.push('left');
    } else {
      aligns.push('');
    }
  }

  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf('|') === -1) { return false; }
  rows = lineText.replace(/^\||\|$/g, '').split('|');
  if (aligns.length !== rows.length) { return false; }
  if (silent) { return true; }

  state.push(
    'table_open',
    state.level++,
    {
      lines: tableLines = [ startLine, 0 ]
    }
  );
  state.push(
    'thead_open',
    state.level++,
    {
      lines: [ startLine, startLine + 1 ]
    }
  );

  state.push(
    'tr_open',
    state.level++,
    {
      lines: [ startLine, startLine + 1 ]
    }
  );
  for (i = 0; i < rows.length; i++) {
    state.push(
      'th_open',
      state.level++,
      {
        align: aligns[i],
        lines: [ startLine, startLine + 1 ]
      }
    );
    state.push(
      'inline',
      state.level,
      {
        content: rows[i].trim(),
        lines: [ startLine, startLine + 1 ],
        children: []
      }
    );
    state.push(
      'th_close',
      --state.level,
      {}
    );
  }
  state.push(
    'tr_close',
    --state.level,
    {}
  );
  state.push(
    'thead_close',
    --state.level,
    {}
  );

  state.push(
    'tbody_open',
    state.level++,
    {
      lines: tbodyLines = [ startLine + 2, 0 ]
    }
  );

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.tShift[nextLine] < state.blkIndent) { break; }

    lineText = getLine(state, nextLine).trim();
    if (lineText.indexOf('|') === -1) { break; }
    rows = lineText.replace(/^\||\|$/g, '').split('|');

    state.push(
      'tr_open',
      state.level++,
      {}
    );
    for (i = 0; i < rows.length; i++) {
      state.push(
        'td_open',
        state.level++,
        {
          align: aligns[i]
        }
      );
      state.push(
        'inline',
        state.level,
        {
          content: rows[i].replace(/^\|? *| *\|?$/g, ''),
          children: []
        }
      );
      state.push(
        'td_close',
        --state.level,
        {}
      );
    }
    state.push(
      'tr_close',
      --state.level,
      {}
    );
  }
  state.push(
    'tbody_close',
    --state.level,
    {}
  );
  state.push(
    'table_close',
    --state.level,
    {}
  );

  tableLines[1] = tbodyLines[1] = nextLine;
  state.line = nextLine;
  return true;
};
