const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

const GAME = {
  board: null,
  start: Date.now(),
  coords: { x: 0, y: 0 },
  tetromino: null,
  score: 0,
  dropSpeed: 1000,
  dropCounter: 0,
  dropStart: 0,
  colors: [
    'cyan',
    'blue',
    'orange',
    'yellow',
    'green',
    'red',
    'purple'
  ]
}

const arenaSweep = () => {
  let rowCount = 1;
  outer: for (let y = GAME.board.length -1; y > 0; y--) {
    for (let x = 0; x < GAME.board[y].length; x++) {
        if (GAME.board[y][x] === 0) {
            continue outer;
        }
    }

    const row = GAME.board.splice(y, 1)[0].fill(0);
    GAME.board.unshift(row);
    y--;

    GAME.score += rowCount * 10;
    rowCount *= 2;
  }
}

const collide = board => {
  const { tetromino, coords } = GAME;
  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      if (tetromino[y][x] !== 0 && 
         (board[y + coords.y] && 
          board[y + coords.y][x + coords.x]) !== 0) {
          return true;
      }
    }
  }
  return false;
}

const createBoard = (width, height) => (
	[...new Array(height)].map(() => [...new Array(width).fill(0)])
)

const drawBoard = (tetromino, offset) => {
  tetromino.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = GAME.colors[value - 1];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

const draw = () => {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawBoard(GAME.board, {x: 0, y: 0});
  drawBoard(GAME.tetromino, GAME.coords);
}

const merge = board => {
    GAME.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + GAME.coords.y][x + GAME.coords.x] = value;
            }
        });
    });
}

const rotate = (tetromino, dir) => {
  for (let y = 0; y < tetromino.length; ++y) {
    for (let x = 0; x < y; ++x) {
        [
            tetromino[x][y],
            tetromino[y][x],
        ] = [
            tetromino[y][x],
            tetromino[x][y],
        ];
    }
  }

  if (dir > 0) {
      tetromino.forEach(row => row.reverse());
  } else {
      tetromino.reverse();
  }
}

const drop = () => {
  GAME.coords.y++;
  if (collide(GAME.board)) {
      GAME.coords.y--;
      merge(GAME.board);
      resetGame();
      arenaSweep();
      updateScore();
  }
  GAME.dropCounter = 0;
}

const move = offset => {
  GAME.coords.x += offset;
  if (collide(GAME.board)) {
    GAME.coords.x -= offset;
  }
}

const generateTetromino = () => (
    tetrominoes['ILJOZST'[Math.floor(Math.random() * 7)]]
)

const resetGame = () => {
  GAME.tetromino = generateTetromino();
  GAME.coords.y = 0;
  GAME.coords.x = 5;            
  if (collide(GAME.board)) {
      GAME.board.forEach(row => row.fill(0));
      GAME.score = 0;
      updateScore();
  }
}

const playerRotate = dir => {
  const pos = GAME.coords.x;
  let offset = 1;
  rotate(GAME.tetromino, dir);
  while (collide(arena)) {
    GAME.coords.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > GAME.tetromino[0].length) {
        rotate(GAME.tetromino, -dir);
        GAME.coords.x = pos;
        return;
    }
  }
}

const update = (time = 0) => {
  const deltaTime = time - GAME.dropStart;

  GAME.dropCounter += deltaTime;
  if (GAME.dropCounter > GAME.dropSpeed) {
    drop();
  }

  GAME.dropStart = time;

  draw();
  requestAnimationFrame(update);
}

const updateScore = () => $('#score').text(GAME.score);

const listen = () => {
  $(document).on('keydown', ({code}) => {
    switch (code) {
      case 'ArrowUp':
        playerRotate(1);
        break;
      case 'ArrowDown':
        drop();
        break;
      case 'ArrowRight':
        move(1);
        break;
      case 'ArrowLeft':
        move(-1);
        break;
    }
  })
}

const init = () => {
  GAME.board = createBoard(12, 20);
  listen()
  resetGame();
  updateScore();
  update();
}

$(init);
