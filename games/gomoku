const SIZE = 15;
const CELL = 30;
const EMPTY=0, BLACK=1, WHITE=2;

let board, history, gameOver, current;
let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");

function resetGame(){
  board = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  history=[];
  gameOver=false;
  current = Math.random()<0.5?BLACK:WHITE;

  draw();

  if(current===WHITE){
    setStatus("AI先手");
    setTimeout(aiMove,200);
  }else{
    setStatus("你先手");
  }
}

function setStatus(s){
  document.getElementById("status").innerText=s;
}

canvas.onclick = e=>{
  if(gameOver || current!==BLACK) return;

  let x=Math.floor(e.offsetX/CELL);
  let y=Math.floor(e.offsetY/CELL);

  if(board[y][x]) return;

  place(x,y,BLACK);

  if(win(x,y)){
    setStatus("你赢了");
    gameOver=true;return;
  }

  current=WHITE;
  setStatus("AI思考中...");
  setTimeout(aiMove,50);
};

function place(x,y,p){
  board[y][x]=p;
  history.push([x,y]);
  draw();
}

function undo(){
  if(history.length<2) return;
  for(let i=0;i<2;i++){
    let [x,y]=history.pop();
    board[y][x]=0;
  }
  draw();
  current=BLACK;
}

function draw(){
  ctx.clearRect(0,0,450,450);

  // grid
  for(let i=0;i<SIZE;i++){
    ctx.beginPath();
    ctx.moveTo(15,15+i*30);
    ctx.lineTo(435,15+i*30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(15+i*30,15);
    ctx.lineTo(15+i*30,435);
    ctx.stroke();
  }

  // pieces
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]){
        ctx.beginPath();
        ctx.arc(x*30+15,y*30+15,10,0,Math.PI*2);
        ctx.fillStyle = board[y][x]==BLACK?"black":"white";
        ctx.fill();
      }
    }
  }
}

function aiMove(){
  if(gameOver) return;

  let level=document.getElementById("level").value;
  let depth = level==="简单"?2:level==="中"?3:4;

  let move = search(depth);

  if(!move){
    move=[7,7];
  }

  place(move[0],move[1],WHITE);

  if(win(move[0],move[1])){
    setStatus("AI赢了");
    gameOver=true;return;
  }

  current=BLACK;
  setStatus("你的回合");
}

// ===== AI（简化版negamax）=====
function search(depth){
  let best=-1e9, bestMove=null;

  for(let [x,y] of moves()){
    board[y][x]=WHITE;
    let val = -negamax(depth-1,-1e9,1e9,BLACK);
    board[y][x]=0;

    if(val>best){
      best=val;
      bestMove=[x,y];
    }
  }
  return bestMove;
}

function negamax(depth,a,b,player){
  if(depth===0) return evaluate();

  let best=-1e9;

  for(let [x,y] of moves()){
    board[y][x]=player;
    let val = -negamax(depth-1,-b,-a,3-player);
    board[y][x]=0;

    best=Math.max(best,val);
    a=Math.max(a,val);
    if(a>=b) break;
  }
  return best;
}

function moves(){
  let list=[];
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(!board[y][x] && near(x,y)){
        list.push([x,y]);
      }
    }
  }
  return list.slice(0,10);
}

function near(x,y){
  for(let dx=-1;dx<=1;dx++){
    for(let dy=-1;dy<=1;dy++){
      let nx=x+dx, ny=y+dy;
      if(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE){
        if(board[ny][nx]) return true;
      }
    }
  }
  return false;
}

function evaluate(){
  return score(WHITE)-score(BLACK);
}

function score(p){
  let s=0;
  let dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]!==p) continue;

      for(let [dx,dy] of dirs){
        let cnt=1;
        let nx=x+dx, ny=y+dy;
        while(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===p){
          cnt++; nx+=dx; ny+=dy;
        }
        if(cnt>=5) s+=10000;
        else if(cnt===4) s+=1000;
        else if(cnt===3) s+=200;
      }
    }
  }
  return s;
}

function win(x,y){
  let p=board[y][x];

  function count(dx,dy){
    let i=0,nx=x+dx,ny=y+dy;
    while(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===p){
      i++; nx+=dx; ny+=dy;
    }
    return i;
  }

  return [[1,0],[0,1],[1,1],[1,-1]]
    .some(([dx,dy])=>count(dx,dy)+count(-dx,-dy)+1>=5);
}

resetGame();
