'use strict';

// could allow the user to choose the size of their board or pieces
// with scale, can easily change the size of pieces. 

// y axis (up and down)
// x axis (left and right)

const canvas = document.querySelector('#tetris');
const ctx = canvas.getContext('2d');

// const board = new Board(ctx, 20, 10, 24);
// board.drawBoard();


canvas.width = 240;
canvas.height = 480;

ctx.scale(24, 24)

// ctx.fillStyle = 'rgb(200, 0, 0)';
// ctx.fillRect(8, 8, 1, 1);

// ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
// ctx.fillRect(7, 8, 1, 1);

// ctx.fillStyle = 'rgba(0, 200, 0, 0.5)';
// ctx.fillRect(9, 8, 1, 1);

// ctx.fillStyle = 'blue';
// ctx.fillRect(8, 7, 1, 1);

const createBoard = (width, height) => (
  [...new Array(height)].map(() => [...new Array(width).fill(0)])
);

const board = createBoard(10, 20);
board[0][4] = 1;
board[1][3] = 1;
board[1][4] = 1;
board[1][5] = 1;

const fillBoard = (board, position) => {
  board.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctx.fillStyle = 'blue'; // make this color dynamic
        ctx.fillRect(x + position.x, y + position.y, 1, 1);
      }
    })
  })
}

const drawBoard = (board, position) => {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // fillBoard(board, { x: 0, y: 0})
  fillBoard(board, position)
}

// let lastTime = 0;
// let position = { x: 0, y: -4}; // should not be a global variable
// const update = (time = 0) => {
//   if (!lastTime || time - lastTime >= 1000) {
//     lastTime = time;
//     position.y++;
//     console.log(position.y);
//     // fillBoard(board, { x: 0, y: 0})
//     drawBoard(board, position)
//   }

//   requestAnimationFrame(update);
// }

let dropCounter = 0;
let dropInterval = 1000;
let position = { x: 0, y: -4};
let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
  
    dropCounter += deltaTime;
    // console.log(dropCounter)
    if (dropCounter > dropInterval) {
        position.y++;
        dropCounter = 0;
    }

    lastTime = time;

    drawBoard(board, position)
    requestAnimationFrame(update);
}

update();

$(document).on('keydown', e => {
  if (e.keyCode === 37) { // left arrow
    --position.x;
  }
})

// fillBoard(board, {x: 0, y: 0})
console.log(board)













// Board => matrix? 
// Game => score, matrix
// Tetromino => 