const SIZE = 15;
const EMPTY=0, BLACK=1, WHITE=2;

let board, current, gameOver, history=[];
let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");

// ===== 初始化 =====
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

// ===== 点击 =====
canvas.onclick = e=>{
  if(gameOver || current!==BLACK) return;

  let x=Math.floor(e.offsetX/30);
  let y=Math.floor(e.offsetY/30);

  if(board[y][x]) return;

  put(x,y,BLACK);

  if(win(x,y)){
    end("你赢了"); return;
  }

  current=WHITE;
  setStatus("AI思考中...");
  setTimeout(aiMove,30);
};

// ===== 落子 =====
function put(x,y,p){
  board[y][x]=p;
  history.push([x,y]);
  draw();
}

function undoMove(x,y){
  board[y][x]=0;
}

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

// ===== AI =====
function aiMove(){
  if(gameOver) return;

  let depth = 5;

  // 必胜
  let m = findWin(WHITE);
  if(m){ put(m[0],m[1],WHITE); end("AI赢了"); return; }

  // 防守
  m = findWin(BLACK);
  if(m){ put(m[0],m[1],WHITE); next(); return; }

  let best=null, bestScore=-1e9;

  let list = moves();

  for(let [x,y] of list){
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
  if(depth===0) return evaluate();

  let best=-1e9;

  let list = moves();

  for(let [x,y] of list){
    put(x,y,player);
    let val = -negamax(depth-1,-b,-a,3-player);
    undoMove(x,y);

    best=Math.max(best,val);
    a=Math.max(a,val);
    if(a>=b) break;
  }

  return best;
}

// ===== 候选点（强化排序）=====
function moves(){
  let list=[];

  for(let y=0;y<SIZE;y++){
    for(let x=0;x<SIZE;x++){
      if(!board[y][x] && near(x,y)){
        let s = scorePos(x,y);
        list.push([s,x,y]);
      }
    }
  }

  list.sort((a,b)=>b[0]-a[0]);

  return list.slice(0,30).map(i=>[i[1],i[2]]);
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

// ===== 评分（强化版）=====
function evaluate(){
  return score(WHITE)*1.2 - score(BLACK);
}

function scorePos(x,y){
  board[y][x]=WHITE;
  let s = score(WHITE)*1.2 + score(BLACK);
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
        if(inBoard(nx,ny)&&board[ny][nx]===EMPTY) open++;

        nx=x-dx; ny=y-dy;
        while(nx>=0&&ny>=0&&nx<SIZE&&ny<SIZE&&board[ny][nx]===p){
          cnt++; nx-=dx; ny-=dy;
        }
        if(inBoard(nx,ny)&&board[ny][nx]===EMPTY) open++;

        if(cnt>=5) s+=1000000;
        else if(cnt===4&&open===2) s+=200000; // 活四
        else if(cnt===4) s+=50000;           // 冲四
        else if(cnt===3&&open===2) s+=10000; // 活三
        else if(cnt===3) s+=1000;
        else if(cnt===2&&open===2) s+=300;
      }
    }
  }
  return s;
}

function inBoard(x,y){
  return x>=0&&y>=0&&x<SIZE&&y<SIZE;
}

// ===== 必胜检测 =====
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

// ===== 胜负 =====
function win(x,y){
  let p=board[y][x];

  function c(dx,dy){
    let i=0,nx=x+dx,ny=y+dy;
    while(inBoard(nx,ny)&&board[ny][nx]===p){
      i++; nx+=dx; ny+=dy;
    }
    return i;
  }

  return [[1,0],[0,1],[1,1],[1,-1]]
    .some(([dx,dy])=>c(dx,dy)+c(-dx,-dy)+1>=5);
}

resetGame();
