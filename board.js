function format(board) {
  const dimensions = Math.sqrt(board.length);
  let output = '';
  let row = [];
  for (let i = 0; i < board.length; i++) {
    if (i !== 0 && i % dimensions === 0) {
      output += row.join(' ') + '\n';
      row = [];
    }
    row.push(board[i]);
  }
  return output + row.join(' ');
}

function locate(board, piece) {
  return board.indexOf(piece);
}

function coordinates(board, location) {
  const dimensions = Math.sqrt(board.length);
  return {
    row: Math.floor(location / dimensions),
    col: location % dimensions
  };
}

function coordinatesToLocation(board, row, col) {
  const dimensions = Math.sqrt(board.length);
  return (row * dimensions) + col;
}

function swap(board, from, to) {
  const newBoard = [...board];
  const tmp = newBoard[from];
  newBoard[from] = newBoard[to];
  newBoard[to] = tmp;
  return newBoard;
}

function move(board, direction) {
  const dimensions = Math.sqrt(board.length);
  const loc = locate(board, 0);
  const {row, col} = coordinates(board, loc);

  switch (direction) {
    case 'up':
      if (row === 0) return false;
      return swap(board, loc, coordinatesToLocation(board, row - 1, col));

    case 'right':
      if (col === dimensions - 1) return false;
      return swap(board, loc, coordinatesToLocation(board, row, col + 1));

    case 'down':
      if (row === dimensions - 1) return false;
      return swap(board, loc, coordinatesToLocation(board, row + 1, col));

    case 'left':
      if (col === 0) return false;
      return swap(board, loc, coordinatesToLocation(board, row, col - 1));

    default:
      return false;
  }
}

module.exports = {
  format,
  locate,
  coordinates,
  coordinatesToLocation,
  swap,
  move
};
