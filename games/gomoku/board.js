class Board {
    constructor(size) {
        this.size = size;
        this.board = this.createBoard();
    }

    createBoard() {
        const board = [];
        for (let i = 0; i < this.size; i++) {
            board[i] = Array(this.size).fill(null);
        }
        return board;
    }

    placeMarker(x, y, marker) {
        if (this.board[x][y] === null) {
            this.board[x][y] = marker;
            return true;
        }
        return false;
    }

    clearBoard() {
        this.board = this.createBoard();
    }

    printBoard() {
        this.board.forEach(row => {
            console.log(row);
        });
    }
}