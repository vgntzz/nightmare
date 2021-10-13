var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
// var real_program = [];
// let ROWS = 50;
// let COLS = 50;
let gridSize = 24;
let cameraPos = [0,0]
// ==================
// Befunge Program
// ==================
SIZE_PROGRAM = [50, 50]

let stack = []
let pc = [0, 0]
let step = [0, 1]
let program = new Array(SIZE_PROGRAM[0]);
let real_program = [];
let currentSteps = 0;
for(var i=0; i<SIZE_PROGRAM[0]; i++) {
    program[i] = new Array(SIZE_PROGRAM[1]);
}

let string_mode = false
let program_finished = false
let debug = false

// for(var i=0; i<ROWS; i++) {
//     real_program[i] = new Array(COLS);
// }

var drawGrid = function(ctx, w, h, step) {
    w = Math.floor(w / gridSize) * gridSize;
    h = Math.floor(h / gridSize) * gridSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    clampedX = Math.max(0, -cameraPos[0]);
    clampedY = Math.max(0, -cameraPos[1]);
    for (var x=0;x<=w;x+=step) {
            desiredX = x-cameraPos[0];
            ctx.moveTo(desiredX, clampedY);
            ctx.lineTo(desiredX, h-cameraPos[1]);
    }
    ctx.strokeStyle = 'rgb(255,0,0)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    for (var y=0;y<=h;y+=step) {
            ctx.moveTo(clampedX, y-cameraPos[1]);
            ctx.lineTo(w-cameraPos[0], y-cameraPos[1]);
    }
    ctx.strokeStyle = 'rgb(20,20,20)';
    ctx.lineWidth = 1;
    ctx.stroke();
    if(real_program.length){
      ctx.fillStyle = 'rgb(0,0,255)';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(pc[1]*gridSize-cameraPos[0],pc[0]*gridSize-cameraPos[1],gridSize,gridSize);
      ctx.globalAlpha = 1.0;
    }
    ctx.fillStyle = 'rgb(0,0,0)';
};

document.addEventListener('keydown', function (event) {
  if(event.target.nodeName.toLowerCase() === 'textarea') return;
  let speed = 25;

  if(event.key == "f")
    fullscreen();

  if(event.key == "q")
    stepDraw(1);

  if (event.keyCode === 39) { // right arrow
    cameraPos[0] += speed;
    drawGrid(ctx, program[0].length * gridSize, program.length * gridSize, gridSize);
    drawContent();
  }

  if (event.keyCode === 37) { // left arrow
    cameraPos[0] -= speed;
    drawGrid(ctx, program[0].length * gridSize, program.length * gridSize, gridSize);
    drawContent();
  }

  if (event.keyCode === 38) { // up arrow
    cameraPos[1] -= speed;
    drawGrid(ctx, program[0].length * gridSize, program.length * gridSize, gridSize);
    drawContent();
    event.preventDefault();
  }

  if (event.keyCode === 40) { // down arrow
    cameraPos[1] += speed;
    drawGrid(ctx, program[0].length * gridSize, program.length * gridSize, gridSize);
    drawContent();
    event.preventDefault();
  }
});

var drawContent = function(){
  ctx.font = `${gridSize-2}px Calibri`;
  for (var i = 0; i < real_program.length; i++) {
    for (var j = 0; j < real_program[i].length; j++) {
      var width = ctx.measureText(real_program[i][j]).width;
      var height = parseInt(ctx.font.match(/\d+/), 10);
      pos_x = (gridSize * j + gridSize/2) - width/2;
      pos_y = (gridSize * i + gridSize) - height/4;
      ctx.fillText(real_program[i][j], pos_x - cameraPos[0], pos_y - cameraPos[1]);
    }
  }
}

// for (var i = 0; i < real_program.length; i++) {
//   for (var j = 0; j < real_program[i].length; j++) {
//     real_program[i][j] = "a";
//   }
// }


drawGrid(ctx, program[0].length * gridSize, program.length * gridSize, gridSize);

// ctx.font = `8px Calibri`;

var reset = function()
{
    stack = []
    pc = [0, 0]
    step = [0, 1]
    program = new Array(SIZE_PROGRAM[0]);
    real_program = []
    for(var i=0; i<SIZE_PROGRAM[0]; i++) {
        program[i] = new Array(SIZE_PROGRAM[1]);
    }
    string_mode = false
    program_finished = false
    debug = false
}
// real_program[0] = new Array(10);
// console.log(program);
// console.log(real_program);

var load_program = function(lines){

    for (var i = 0; i < lines.length; i++) {

      if(i >= program.length) program[i] = new Array();
      if(i >= real_program.length) real_program[i] = new Array();

      // console.log(program);
      // console.log(real_program);

      for (var j = 0; j < lines[i].length; j++) {
        char = lines[i][j];
        if(j >= program[i].length){
          for(var _=0; _ < program.length; _++)
          {
            program[_].push("");
          }
        }
        program[i][j] = char;

        if(j >= real_program[i].length) real_program[i].push(char);
        else real_program[i][j] = char;
      }
    }
}


var add = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    stack.push(a+b)
  }

var sub = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    stack.push(b-a)
  }

var mul = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    stack.push(a*b)
  }

var div = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    if(a > 0)
        stack.push(~~(b/a))
    else
        stack.push(0)
  }

var mod = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    if(a > 0)
        stack.push(b%a)
    else
        stack.push(0)
  }

var lnot = function(args){
    if(stack.length < 1) return
    a = stack.pop()
    stack.push(int(!a))
  }

var gt = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    stack.push(int(b>a))
  }

var dup = function(args){
    if(stack.length < 1) return;
    a = stack[stack.length-1]
    stack.push(a)
  }

var swap = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    stack.push(a)
    stack.push(b)
  }

var nop = function(args){
    if(stack.length < 1) return
    stack.pop()
}
var oi = function(args){
    if(stack.length < 1) return
    a = stack.pop()
    document.getElementById("stackOutput").value += a;
  }

var oa = function(args){
    if(stack.length < 1) return
    a = stack.pop()
    document.getElementById("stackOutput").value += chr(a);
  }

var input_number = function(args){
    try
    {
      a = parseInt(prompt("Enter a number: "));
      stack.push(a)
    } catch {
      console.log("error en input_number");
    }
}

var ord = function(a){
  return a.charCodeAt(0);
}

var chr = function(a){
  return String.fromCharCode(a);
}

var input_ascii = function(args){
    try{
        a = ord(prompt("Enter a number: "))
        stack.push(a)
    } catch
    {
      console.log("error en input_ascii");
    }
}

var end = function(args){
    program_finished = true;
}

var push = function(args){
    ascii = ord(args[0])
    if(string_mode){
        stack.push(ascii)
        return
    }
    if(ascii >= ord("0") && ascii <= ord("9")) stack.push(parseInt(args[0]))
    else stack.push(ascii)
  }

var move = function(args){
    caller = args[0]
    map = {">": [0,1], "<": [0,-1], "^": [-1,0], "v": [1,0]}
    step = map[caller];
  }

var rnd = function(args){
    // x = random.randint(0,3)
    // while(x == 0):
    //     move("^")
    //     x = -1
    // while(x == 1):
    //     move("v")
    //     x = -1
    // while(x == 2):
    //     move("<")
    //     x = -1
    // while(x == 3):
    //     move(">")
    //     x = -1
}

var bridge = function(args){
    next_step()
  }

var horizontal_if = function(args){
  // if(stack.length < 1) return;
    a = stack.length > 0 ? stack.pop() : 0;
    if(!a){
        move(">")
        return
      }
    move("<")
  }

var vertical_if = function(args){
    a = stack.length > 0 ? stack.pop() : 0

    if(!a){
        move("v")
        return
      }
    move("^")
  }

var get = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    if(a >= real_program.length) a = real_program.length-1
    if(b >= real_program[a].length) b = real_program[a].length - 1
    instruction = program[a][b]
    stack.push(ord(instruction))
  }

var put = function(args){
    if(stack.length < 3) return
    a = stack.pop();
    b = stack.pop();
    v = stack.pop();
    // [a, b], v = (stack.pop(), stack.pop(), stack.pop())
    v = chr(v)
    if(a >= real_program.length) a = len(real_program)-1
    if(b >= real_program[a].length) b = len(real_program[a]) - 1
    program[a][b] = v
    real_program[a][b] = v
  }

var stringmode = function(args){
  string_mode = !string_mode;
}

var pop_two = function(){
    return [stack.pop(), stack.pop()]
}

instructions = {
    "+": add,
    "-": sub,
    "*": mul,
    "/": div,
    "%": mod,
    "!": lnot,
    "`": gt,
    "^": move,
    "<": move,
    ">": move,
    "v": move,
    "?": rnd,
    "_": horizontal_if,
    "|": vertical_if,
    ":": dup,
    "\\": swap,
    "$": nop,
    ".": oi,
    ",": oa,
    "\"": stringmode,
    "#": bridge,
    "g": get,
    "p": put,
    "&": input_number,
    "~": input_ascii,
    "@": end,
    "0": push,
    "1": push,
    "2": push,
    "3": push,
    "4": push,
    "5": push,
    "6": push,
    "7": push,
    "8": push,
    "9": push,
}

var next_step = function(){
    pc = [pc[0] + step[0], pc[1] + step[1]]
    pc = [pc[0] % program.length, pc[1] % program[0].length]
  }

var execute = function ()
{
    while(!program_finished)
      codeStep();
    console.log(stack);
}

var codeStep = function()
{
  instruction = program[pc[0]][pc[1]]
  if(string_mode && instruction != "\""){
      push(instruction)
  } else if(instruction in instructions)
  {
      if(debug) console.log(`Instruction: ${instruction}`)
      instruction_func = instructions[instruction]
      instruction_func(instruction)
  }
  currentSteps++;
  if(!program_finished)
    next_step()
}

var stepDraw = function(steps)
{
    for (var i = 0; i < steps; i++)
    {
      codeStep();
    }
    updateHtml();
    console.log(currentSteps);
}

var draw = function(){
  drawGrid(ctx, program[0].length * gridSize, program.length * gridSize, gridSize);
  drawContent()
}

var updateHtml = function(){
  txtStack.value = stack.join(" ");
  draw();
}

var btnClear = document.getElementById("codeClear");
var btnWalk = document.getElementById("codeWalk");
var btnLoad = document.getElementById("codeLoad");
var btnRun = document.getElementById("codeRun");
var btnStep = document.getElementById("codeStep");
var txtCode = document.getElementById("codeTxt");
var txtStack = document.getElementById("stackTxt");

btnClear.addEventListener('click', () => {
  reset();
  updateHtml();
});

btnWalk.addEventListener('click', () => {
  walk();

});

btnLoad.addEventListener('click', () => {
  var lines = txtCode.value.split('\n');
  reset();
  load_program(lines);
  console.log(program.length);
  console.log(real_program.length);
  console.log(program);
  console.log(real_program);
  updateHtml();
});

btnRun.addEventListener('click', () => {
  console.log(real_program);
  if(!real_program.length) return;
  execute();
  updateHtml();
});

btnStep.addEventListener('click', () => {
  console.log(real_program);
  if(!real_program.length) return;
  codeStep();
  updateHtml();
});

let fullWindowState = false;

canvas.addEventListener('wheel', function(event)
{
 if (event.deltaY < 0)
 {
   gridSize++;
   draw();
 }
 else if (event.deltaY > 0)
 {
   gridSize--;
   draw();
 }
 event.preventDefault();
});

var interval;

function walk(){
  if(!real_program.length) return;
  interval = setInterval(() => {codeStep(); updateHtml();}, 10);
}

function stop(){
  clearInterval(interval);
  updateHtml();
}

function fullscreen() {
    if (!fullWindowState) {
        fullWindowState = true;
        //canvas goes full Window
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.className = "fullscreen"
        ctx = canvas.getContext('2d');

        document.body.scrollTop = 0; // <-- pull the page back up to the top
        // document.body.style.overflow = 'hidden'; // <-- relevant addition
    } else {
        fullWindowState = false;
        //canvas goes normal
        canvas.width = 1280;
        canvas.height = 480;
        canvas.className = "";
        ctx = canvas.getContext('2d');

        document.body.style.overflow = 'visible'; // <-- toggle back to normal mode
    }
    draw();

}
