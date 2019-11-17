'use strict';

// used to start/stop requestAnimationFrame
let requestId = null;

// The game's canvas
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

canvas.width = 240;
canvas.height = 400;

context.scale(20, 20);

// The preview's canvas
const cvs = document.getElementById('preview');
const ctx = cvs.getContext('2d');

ctx.scale(20, 20);

// Game data
const GAME = {
  board: null,
  start: Date.now(),
  coords: { x: 0, y: 0 },
  tetromino: null,
  preview: null,
  over: false,
  score: 0,
  level: 1,
  lines: 0,
  linesToNextLevel: 10,
  dropSpeed: 1000,
  dropCounter: 0,
  dropStart: 0,
  colors: [
    'cyan',
    'blue',
    'darkorange',
    'gold',
    'green',
    'red',
    'purple'
  ]
}

const clearGame = () => {
  GAME.board = createBoard(12, 20);
  GAME.start = Date.now();
  GAME.coords = { x: 5, y: -1 };
  GAME.tetromino = GAME.preview ? GAME.preview : generateTetromino();
  GAME.preview = generateTetromino();
  GAME.over = false;
  GAME.score = 0;
  GAME.level = 1;
  GAME.lines = 0;
  GAME.linesToNextLevel = 10;
  GAME.dropSpeed = 1000;
  GAME.dropCounter = 0;
  GAME.dropStart = 0;

  updateScore();
  updateLines();
  updateLevel();
  showPreview();
  startAnimation();
}

const generateTetromino = () => (
  tetrominoes['ILJOZST'[Math.floor(Math.random() * 7)]]
)

const createBoard = (width, height) => (
  // create board based on width/height of canvas, fill with 0 initially
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

  drawBoard(GAME.board, { x: 0, y: 0 });
  drawBoard(GAME.tetromino, GAME.coords);
}

const move = offset => {
  GAME.coords.x += offset;
  if (collisionDetected()) {
    GAME.coords.x -= offset;
  }
}

const rotate = () => {
  const { tetromino } = GAME;

  // transpose and reverse the pieces
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

  tetromino.forEach(row => row.reverse());

  while (collisionDetected()) {
    GAME.coords.x += 1;
  }
}

const merge = board => {
  // Add new piece to board if no collision detected
  GAME.tetromino.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + GAME.coords.y][x + GAME.coords.x] = value;
      }
    });
  });
}

const collisionDetected = () => {
  const { board, tetromino, coords } = GAME;
  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      // if it is not a valid position in the array, there is a collision
      if (tetromino[y][x] !== 0 &&
        (board[y + coords.y] && board[y + coords.y][x + coords.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

const drop = () => {
  GAME.coords.y++;
  if (collisionDetected()) {
    GAME.coords.y--;
    merge(GAME.board);
    resetGame();
    tallyRows();
    updateScore();
  }
  GAME.dropCounter = 0;
}

const tallyRows = () => {
  let rowCount = 1;
  outer: for (let y = GAME.board.length - 1; y > 0; --y) {
    for (let x = 0; x < GAME.board[y].length; ++x) {
      if (GAME.board[y][x] === 0) {
        continue outer;
      }
    }

    const row = GAME.board.splice(y, 1)[0].fill(0);
    GAME.board.unshift(row);
    ++y;

    GAME.lines++;
    updateLines();

    if (GAME.lines >= GAME.linesToNextLevel) {
      GAME.level = Math.floor(GAME.lines / 10 + 1);
      updateLevel();
      GAME.dropSpeed -= 30;
      GAME.linesToNextLevel = GAME.level * 10;
    }

    if (rowCount >= 4) {
      GAME.score += rowCount * 800;
    } else {
      GAME.score += rowCount * 100;
    }
    rowCount *= 2;
  }
}

const resetGame = () => {
  // Drop new piece, generate new preview piece
  GAME.tetromino = GAME.preview ? GAME.preview : generateTetromino();
  GAME.preview = generateTetromino();
  GAME.coords.y = 0;
  GAME.coords.x = 5;            
  if (collisionDetected()) {
    GAME.over = true;
    cancelAnimationFrame(requestId);
    requestId = null;

    $('.modal-body').text('Game over!');
    $('.modal-footer').html(
      `<button class="btn btn-info modal-btn play" data-dismiss="modal" style="width: 140px">Play again?</button>`
    );
    
    setTimeout(() => {
      $('#modal').modal({
        show: true,
        keyboard: false,
        backdrop: 'static',
      });
    }, 1500);
  }
  !GAME.over && showPreview();
}

const startAnimation = (time = 0) => {
  const delta = time - GAME.dropStart;

  GAME.dropCounter += delta;
  if (GAME.dropCounter > GAME.dropSpeed) {
    drop();
  }

  GAME.dropStart = time;

  // Stopping condition for requestAnimationFrame
  if (!GAME.over) {
    draw();
    requestId = requestAnimationFrame(startAnimation);
  }
}

const updateScore = () => $('#score').text(`Score: ${GAME.score}`);
const updateLines = () => $('#lines').text(`Lines: ${GAME.lines}`);
const updateLevel = () => $('#level').text(`Level: ${GAME.level}`);

const showPreview = () => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  GAME.preview.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = GAME.colors[value - 1];
        ctx.fillRect(x + 1, y + 1, 1, 1);
      }
    });
  });
};

const readKeyInput = () => {
  $(document).on('keydown', ({code}) => {
    switch (code) {
      case 'ArrowUp':
        rotate();
        break;
      case 'ArrowDown':
        requestId && drop();
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

const readTouchInput = () => {
  let intervalId = null;

  $(document).on('mousedown', '.mb-up', () => {
    intervalId = setInterval(() => rotate(), 90);
  }).mouseup(function() {
    clearInterval(intervalId);
    intervalId = null;
  }).click(() => {
    clearInterval(intervalId);
    intervalId = null;
    rotate();
  });

  $(document).on('mousedown', '.mb-down', () => {
    intervalId = setInterval(() => requestId && drop(), 90);
  }).mouseup(function() {
    clearInterval(intervalId);
    intervalId = null;
  }).clic(() => {
    clearInterval(intervalId);
    intervalId = null;
    requestId && drop()
  });

  $(document).on('mousedown', '.mb-right', () => {
    intervalId = setInterval(() => move(1), 100);
  }).mouseup(function() {
    clearInterval(intervalId);
    intervalId = null;
  }).click(() => {
    clearInterval(intervalId);
    intervalId = null;
    move(1);
  });

  $(document).on('mousedown', '.mb-left', () => {
    intervalId = setInterval(() => move(-1), 100);
  }).mouseup(function() {
    clearInterval(intervalId);
    intervalId = null;
  }).click(() => {
    clearInterval(intervalId);
    intervalId = null;
    move(-1);
  });
}

const init = () => {
  readKeyInput();
  readTouchInput();

  $('body').css('background-color', 'black');

  $('#modal').modal({
    show: true,
    keyboard: false,
    backdrop: 'static',
  })

  // App event listeners
  $(document).on('click', '.play', () => clearGame());

  $(document).on('click', '.resume', () => {
    GAME.coords.y--;
    GAME.over = false;
    startAnimation();
  })

  $('.pause').on('click', () => {
    GAME.over = true;
    $('.modal-footer').html(
      '<button class="btn btn-success modal-btn resume" data-dismiss="modal">Resume</button>'
    );
    $('.modal-body').text('Click below to resume your game!');
    $('#modal').modal({
      show: true,
      keyboard: false,
      backdrop: 'static',
    });
  })
}

$(init);
