const {shuffle} = require('lodash/collection');
const board = require('./board');

/**
 * Calculates how many city blocks the movement piece is away from its expected
 * position.
 */
function manhattan_distance(current, expected) {
  const fromLoc = board.locate(current, 0);
  const toLoc = board.locate(expected, 0);

  const {row: fromRow, col: fromCol} = board.coordinates(current, fromLoc);
  const {row: toRow, col: toCol} = board.coordinates(expected, toLoc);

  return Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol);
}

/**
 * Calculates the raw number of pieces that are not in their expected position
 */
function out_of_place(current, expected) {
  let total = 0;
  for (let i = 0; i < current.length; i++) {
    if (current[i] !== expected[i]) total++;
  }
  return total;
}

/**
 * Combines both manhattan distance and out of place heuristics into a single
 * number to give us a more accurate estimation of "incorrectness" of a current
 * position. We can use this "incorrectness" number to compare the likelihood
 * that a given move is futile or not
 */
function heuristic(current, expected) {
  return manhattan_distance(current, expected) + out_of_place(current, expected);
}

/**
 * Takes a move and returns an array of all possible valid moves with their
 * heuristics (and move history) in place
 */
function expand(current, moves, expected) {
  return ['up', 'down', 'left', 'right'].map(dir => {
    const next = board.move(current, dir);

    if (!next) return false;

    return {
      current: next,
      heuristic: heuristic(next, expected),
      moves: [...moves, dir]
    };
  }).filter(a => a);
}

/**
 * Performs the A* search algorithm!
 *
 *  A* ->
 *    queue = expand(initial)
 *
 *    while queue is not empty:
 *    dequeue move from queue
 *
 *    if move is solution:
 *    return move
 *
 *    concat expand(move) to queue
 *    sort queue by heuristic
 */
function a_star(start, expected) {
  // Allows us to keep track of boards we've already seen
  // This is a cheap way to prevent us from going in circles chasing paths we've
  // already seen
  let visited = [];

  // We initialize our queue of "moves to inspect" by expanding initial state
  let queue = [...expand(start, [], expected)];
  // Ensure the "least incorrect" move is visited first
  queue.sort((a, b) => a.heuristic - b.heuristic);

  let iterations = 0;

  while (queue.length > 0) {
    // We grab the next move with the lowest heuristic (least incorrect)
    const {current, heuristic, moves} = queue.shift();
    const hash = JSON.stringify(current);

    // This board is actually the final answer!
    if (JSON.stringify(current) === JSON.stringify(expected)) {
      console.log(`Inspected ${iterations + 1} moves`)
      return {
        current,
        moves
      };
    }

    // Check if we have visited this board already, if so skip it
    if (visited.indexOf(hash) !== -1) {
      continue;
    } else {
      visited.push(hash);
    }

    iterations++;

    // Expand the board we're currently visiting
    const nextMoves = expand(current, moves, expected).map(move => {
      // Do not add any moves that we know we have visited to keep the queue
      // size down
      const newHash = JSON.stringify(move.current);

      if (visited.indexOf(newHash) !== -1) {
        return false;
      }

      return move;
    }).filter(a => a);

    // Fill the queue with new moves
    queue = [...queue, ...nextMoves];
    // Ensure the least incorrect move is at the top
    queue.sort((a, b) => a.heuristic - b.heuristic);
  }
}

const expected = [
  1, 2, 3,
  4, 5, 6,
  7, 8, 0
];

// const expected = [
//   1,   2,   3,   4,
//   5,   6,   7,   8,
//   9,   'A', 'B', 'C',
//   'D', 'E', 'F', 0
// ];

// const start = [
//   1, 2, 0,
//   4, 6, 3,
//   7, 5, 8
// ];

const start = [
  5, 2, 7,
  8, 3, 6,
  1, 4, 0
];

// const start = [
//   1,   2,   3,   4,
//   5,   6,   7,   8,
//   9,   'A', 'F', 'B',
//   'D', 'E', 0, 'C'
// ]

// Shuffle cannot guarantee the jumble is actually solvable
// const start = shuffle(expected);

console.log('To solve the board...');
console.log(board.format(start));

const solution = a_star(start, expected);

console.log('You should make the moves:', solution.moves.join(' -> '));
