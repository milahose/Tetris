'use strict';

class Board {
  constructor(ctx, row, column, square) {
    this.state = {
      ctx: ctx,
      row: row,
      column: column,
      square, square,
      board: [],
    }
  }

  drawSquare = (x, y, color) => {
    const { square } = this.state;
    const ss = ctx.strokeStyle;

    ctx.fillStyle = color;
    ctx.fillRect(x * square, y * square, square, square);
    ctx.strokeStyle = "#555";
    ctx.strokeRect(x * square, y * square, square, square);
    ctx.strokeStyle = "#888";
    ctx.strokeRect(x * square + 3 * square / 8, y * square + 3 * square / 8, square / 4, square / 4);
    ctx.strokeStyle = ss;
  }
  
  createBoard = () => {
    for (let row = 0; row < this.state.row; row++) {
      this.state.board[row] = [];
      for (let col = 0; col < this.state.column; col++) {
        this.state.board[row][col] = '';
      }
    }
  }

  drawBoard = () => {
    this.createBoard();
    for (let row = 0; row < this.state.row; row++) {
      for (let col = 0; col < this.state.column; col++) {
        this.drawSquare(col, row, '#fff');
      }
    }
  }
}