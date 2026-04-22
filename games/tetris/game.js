const COLS = 10;
const ROWS = 20;
const SIZE = 30;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));

let score = 0;
let level = 1;
let dropSpeed = 800;
let lastTime = 0;
let paused = false;
let gameOver = false;

const pieces = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]]
];

function newPiece() {
  const shape = pieces[Math.floor(Math.random()*pieces.length)];
  return {
    shape,
    x: 3,
    y: 0
  };
}

let piece = newPiece();

function drawBlock(x,y,color="cyan") {
  ctx.fillStyle = color;
  ctx.fillRect(x*SIZE, y*SIZE, SIZE-1, SIZE-1);
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // board
  for(let y=0;y<ROWS;y++){
    for(let x=0;x<COLS;x++){
      if(board[y][x]) drawBlock(x,y,"#667eea");
    }
  }

  // current piece
  piece.shape.forEach((row,dy)=>{
    row.forEach((val,dx)=>{
      if(val){
        drawBlock(piece.x+dx, piece.y+dy);
      }
    });
  });
}

function collide() {
  return piece.shape.some((row,dy)=>
    row.some((val,dx)=>{
      if(!val) return false;
      let x = piece.x+dx;
      let y = piece.y+dy;
      return x<0 || x>=COLS || y>=ROWS || (y>=0 && board[y][x]);
    })
  );
}

function merge() {
  piece.shape.forEach((row,dy)=>{
    row.forEach((val,dx)=>{
      if(val){
        board[piece.y+dy][piece.x+dx]=1;
      }
    });
  });
}

function clearLines() {
  let lines=0;
  outer: for(let y=ROWS-1;y>=0;y--){
    for(let x=0;x<COLS;x++){
      if(!board[y][x]) continue outer;
    }
    board.splice(y,1);
    board.unshift(Array(COLS).fill(0));
    lines++;
    y++;
  }

  if(lines){
    score += lines*100;
    level = Math.floor(score/500)+1;
    dropSpeed = Math.max(100, 800 - level*60);
  }

  document.getElementById("score").textContent=score;
  document.getElementById("level").textContent=level;
}

function rotate() {
  const m = piece.shape;
  const rotated = m[0].map((_,i)=>m.map(row=>row[i]).reverse());
  const old = piece.shape;
  piece.shape = rotated;
  if(collide()) piece.shape = old;
}

function drop() {
  piece.y++;
  if(collide()){
    piece.y--;
    merge();
    clearLines();
    piece = newPiece();
    if(collide()){
      gameOver=true;
      alert("Game Over");
      location.reload();
    }
  }
}

function update(time=0){
  if(paused || gameOver) return;

  if(time-lastTime>dropSpeed){
    drop();
    lastTime=time;
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener("keydown",(e)=>{
  if(e.key==="ArrowLeft"){ piece.x--; if(collide()) piece.x++; }
  if(e.key==="ArrowRight"){ piece.x++; if(collide()) piece.x--; }
  if(e.key==="ArrowDown"){ drop(); }
  if(e.key==="ArrowUp"){ rotate(); }
});

function togglePause(){
  paused = !paused;
  if(!paused) update();
}

update();
