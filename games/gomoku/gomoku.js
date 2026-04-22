const SIZE = 15;
const EMPTY=0, BLACK=1, WHITE=2;

let board, current, gameOver, history=[];
let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");

// ===== Zobrist =====
const zob = [];
for(let y=0;y<SIZE;y++){
  zob[y]=[];
  for(let x=0;x<SIZE;x++){
    zob[y][x]=[
      Math.random()*1e9|0,
      Math.random()*1e9|0,
      Math.random()*1e9|0
    ];
  }
}
let hash=0;
let cache = new Map();

// ===== 初始化 =====
function resetGame(){
  board = Array.from({length:SIZE},()=>Array(SIZE).fill(0));
  history=[];
  gameOver=false;
  hash=0;

  current = Math.random()<0.5?BLACK:WHITE;
  draw();

  if(current===WHITE){
    setStatus("AI先手");
    setTimeout(aiMove,200);
  }else{
    setStatus("你先手");
  }
}

// ===== UI =====
function setStatus(s){
  document.getElementById("status").innerText=s;
}

canvas.onclick = e=>{
  if(gameOver || current!==BLACK) return;

  let x=Math.floor(e.offsetX/30);
  let y=Math.floor(e.offsetY/30);

  if(board[y][x]) return;

  put(x,y,BLACK);

  if(win(x,y)){
    setStatus("你赢了"); gameOver=true; return;
  }

  current=WHITE;
  setStatus("AI思考中...");
  setTimeout(aiMove,50);
};

function draw(){
  ctx.clearRect(0,0,450,450);

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

// ===== 落子 =====
function put(x,y,p){
  board[y][x]=p;
  hash ^= zob[y][x][p];
  history.push([x,y]);
  draw();
}

function undo(){
  if(history.length<2) return;
  for(let i=0;i<2;i++){
    let [x,y]=history.pop();
    hash ^= zob[y][x][board[y][x]];
    board[y][x]=0;
  }
  draw();
  current=BLACK;
}

// ===== AI =====
function aiMove(){
  if(gameOver) return;

  let depth = 4;

  // 必胜
  let m = findWin(WHITE);
  if(m){ put(m[0],m[1],WHITE); end("AI赢了"); return; }

  // 防守
  m = findWin(BLACK);
  if(m){ put(m[0],m[1],WHITE); next(); return; }

  let best=null, bestScore=-1e9;

  for(let [x,y] of moves()){
    put(x,y,WHITE);
    let val = -negamax(depth-1,-1e9,1e9,BLACK);
    undoMove(x,y);

    if(val>bestScore){
      bestScore=val;
      best=[x,y];
    }
  }

  if(!best) best=[7,7];

  put(best[0],best[1],WHITE);

  if(win(best[0],best[1])){ end("AI赢了"); return; }

  next();
}

function next(){
  current=BLACK;
  setStatus("你的回合");
}

function end(msg){
  setStatus(msg);
  gameOver=true;
}

// ===== 搜索 =====
function negamax(depth,a,b,player){
  let key = hash+"_"+depth+"_"+player;
  if(cache.has(key)) return cache.get(key);

  if(depth===0) return evaluate();

  let best=-1e9;

  for(let [x,y] of moves()){
    put(x,y,player);
    let val = -negamax(depth-1,-b,-a,3-player);
    undoMove(x,y);

    best=Math.max(best,val);
    a=Math.max(a,val);
    if(a>=b) break;
  }

  cache.set(key,best);
  return best;
}

function undoMove(x,y){
  hash ^= zob[y][x][board[y][x]];
  board[y][x]=0;
}

// ===== 候选点 =====
function moves(){
  let list=[];
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(!board[y][x] && near(x,y)){
        list.push([scorePos(x,y),x,y]);
      }
    }
  }
  list.sort((a,b)=>b[0]-a[0]);
  return list.slice(0,25).map(i=>[i[1],i[2]]);
}

function near(x,y){
  for(let dx=-2;dx<=2;dx++){
    for(let dy=-2;dy<=2;dy++){
      let nx=x+dx, ny=y+dy;
      if(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE){
        if(board[ny][nx]) return true;
      }
    }
  }
  return false;
}

// ===== 评分 =====
function evaluate(){
  return score(WHITE)-score(BLACK);
}

function scorePos(x,y){
  board[y][x]=WHITE;
  let s = score(WHITE) + score(BLACK)*0.8;
  board[y][x]=0;
  return s;
}

function score(p){
  let s=0;
  let dirs=[[1,0],[0,1],[1,1],[1,-1]];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(board[y][x]!==p) continue;

      for(let [dx,dy] of dirs){
        let cnt=1, open=0;

        let nx=x+dx, ny=y+dy;
        while(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===p){
          cnt++; nx+=dx; ny+=dy;
        }
        if(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===EMPTY) open++;

        nx=x-dx; ny=y-dy;
        while(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===p){
          cnt++; nx-=dx; ny-=dy;
        }
        if(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===EMPTY) open++;

        if(cnt>=5) s+=1000000;
        else if(cnt===4&&open===2) s+=100000;
        else if(cnt===4) s+=10000;
        else if(cnt===3&&open===2) s+=5000;
        else if(cnt===3) s+=500;
        else if(cnt===2&&open===2) s+=200;
      }
    }
  }
  return s;
}

// ===== 胜负 =====
function findWin(p){
  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(!board[y][x]){
        board[y][x]=p;
        if(win(x,y)){
          board[y][x]=0;
          return [x,y];
        }
        board[y][x]=0;
      }
    }
  }
  return null;
}

function win(x,y){
  let p=board[y][x];

  function c(dx,dy){
    let i=0,nx=x+dx,ny=y+dy;
    while(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===p){
      i++; nx+=dx; ny+=dy;
    }
    return i;
  }

  return [[1,0],[0,1],[1,1],[1,-1]]
    .some(([dx,dy])=>c(dx,dy)+c(-dx,-dy)+1>=5);
}

resetGame();
