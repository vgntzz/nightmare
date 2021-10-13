var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
let gridSize = 24;
let cameraPos = [25,25]
let mouseX = 0;
let mouseY = 0;
let dragStart, dragEnd;
let drag = false;
let fullWindowState = false;

let edit_mode = true;
let selected_cell = [-1, -1];

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
let interval;

let should_follow = true;

var drawGrid = function(ctx, w, h) {
    w = Math.floor(w / gridSize) * gridSize;
    h = Math.floor(h / gridSize) * gridSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    clampedX = Math.max(0, -cameraPos[0]);
    clampedY = Math.max(0, -cameraPos[1]);
    for (var x=0;x<=w;x+=gridSize)
    {
      if(x < cameraPos[0] || -cameraPos[0] > canvas.width) continue;
      desiredX = x-cameraPos[0];
      ctx.moveTo(desiredX, clampedY);
      ctx.lineTo(desiredX, h-cameraPos[1]);
    }
    ctx.strokeStyle = 'rgb(255,0,0)';
    ctx.stroke();

    ctx.beginPath();
    for (var y=0;y<=h;y+=gridSize) {
        if(y < cameraPos[1] || -cameraPos[1] > canvas.height) continue;
        ctx.moveTo(clampedX, y-cameraPos[1]);
        ctx.lineTo(w-cameraPos[0], y-cameraPos[1]);
    }
    ctx.stroke();

    if(real_program.length){
      ctx.fillStyle = 'rgb(0,0,255)';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(pc[1]*gridSize-cameraPos[0],pc[0]*gridSize-cameraPos[1],gridSize,gridSize);
      ctx.globalAlpha = 1.0;
    }

    if(edit_mode && selected_cell[0] != -1)
    {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "rgb(0,255,0)";
      ctx.fillRect(selected_cell[0] * gridSize - cameraPos[0], selected_cell[1] * gridSize - cameraPos[1], gridSize, gridSize);
      ctx.globalAlpha = 1;
    }


    ctx.fillStyle = 'rgb(0,0,0)';
};

let speed = 25;

document.addEventListener('keydown', function (event) {
  if(event.target.nodeName.toLowerCase() === 'textarea') return;

  if (event.keyCode === 9) { // tab
    $('#modalCheatSheet').modal('toggle');
    event.preventDefault();
  }
  if($('#modalCheatSheet').hasClass('show')) return;

  if(event.key == "f")
    canvas_fullscreen();

  if(event.key == "q")
    stepDraw(1);

  if (event.keyCode === 32) { // spacebar
    centerToActiveCell();
    draw();
    event.preventDefault();
  }


  if (event.keyCode === 39) { // right arrow
    cameraPos[0] += speed;
    draw();
  }

  if (event.keyCode === 37) { // left arrow
    cameraPos[0] -= speed;
    draw();
  }

  if (event.keyCode === 38) { // up arrow
    cameraPos[1] -= speed;
    draw();
    event.preventDefault();
  }

  if (event.keyCode === 40) { // down arrow
    cameraPos[1] += speed;
    draw();
    event.preventDefault();
  }
});

var drawContent = function(){
  ctx.font = `${gridSize-2}px Calibri`;
  ctx.fillStyle = "rgb(255,255,255)";
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

drawGrid(ctx, program[0].length * gridSize, program.length * gridSize);

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
    currentSteps = 0;
    centerToActiveCell();
    clearInterval(interval);
}

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
    stack.push((!a)|0)
  }

var gt = function(args){
    if(stack.length < 2) return
    [a, b] = pop_two()
    stack.push((b>a)|0)
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
    document.getElementById("outputTxt").value += a;
  }

var oa = function(args){
    if(stack.length < 1) return
    a = stack.pop()
    document.getElementById("outputTxt").value += chr(a);
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
}

var codeStep = function()
{
  if(!real_program.length) return;
  if(program_finished) return;
  instruction = program[pc[0]][pc[1]]
  if(string_mode && instruction && instruction != "\""){
      push(instruction)
  } else if(instruction in instructions)
  {
      if(debug) console.log(`Instruction: ${instruction}`)
      instruction_func = instructions[instruction]
      instruction_func(instruction)
  }


  if(!program_finished)
  {
    next_step()
    currentSteps++;
    if(should_follow)
      centerToActiveCell();
  }

}

var centerToActiveCell = function()
{
  cameraPos[0] = pc[1] * gridSize + Math.round(gridSize/2) - Math.round(canvas.width / 2);
  cameraPos[1] = pc[0] * gridSize + Math.round(gridSize/2) - Math.round(canvas.height / 2);
}

var stepDraw = function(steps)
{
    for (var i = 0; i < steps; i++)
    {
      codeStep();
    }
    updateHtml();
}

var draw = function(){
  drawGrid(ctx, program[0].length * gridSize, program.length * gridSize);
  drawContent()
}

var updateHtml = function(){
  txtStack.value = stack.join(" ");
  draw();
}

var rewind = function(){
  if(!real_program.length) return;
  if(currentSteps - 1 < 0) return;
  targetSteps = currentSteps - 1;
  clear();
  load();
  stepDraw(targetSteps);

}

var clear = function()
{
  txtOutput.value = "";
  reset();
  updateHtml();
}

var load = function(){
  if(!txtCode.value) return;
  var lines = txtCode.value.split('\n');
  clear();
  load_program(lines);
  // console.log(program.length);
  // console.log(real_program.length);
  // console.log(program);
  // console.log(real_program);
  updateHtml();
}

var btnClear = document.getElementById("codeClear");
var btnWalk = document.getElementById("codeWalk");
var btnRewind = document.getElementById("codeRewind");
var btnStop = document.getElementById("codeStop");
var btnLoad = document.getElementById("codeLoad");
var btnRun = document.getElementById("codeRun");
var btnStep = document.getElementById("codeStep");
var txtCode = document.getElementById("codeTxt");
var txtStack = document.getElementById("stackTxt");
var txtOutput = document.getElementById("outputTxt");
var cbFollow = document.getElementById("cbFollow");

cbFollow.addEventListener('click', () => {should_follow = cbFollow.checked;});
btnClear.addEventListener('click', clear);
btnWalk.addEventListener('click', walk);
btnStop.addEventListener('click', stop);
btnRewind.addEventListener('click', rewind);
btnLoad.addEventListener('click', load);

btnRun.addEventListener('click', () => {
  if(!real_program.length) return;
  execute();
  updateHtml();
});

btnStep.addEventListener('click', () => stepDraw(1));


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



canvas.addEventListener('mouseleave', canvas_mouseUp);
canvas.addEventListener('mousedown', canvas_mouseDown);
canvas.addEventListener('mousemove', canvas_mouseMove);
canvas.addEventListener('mouseup', canvas_mouseUp);

function getMouseWorld(){
  var rect = canvas.getBoundingClientRect();
  let mouse = [(event.clientX - rect.left) / (rect.right - rect.left) * canvas.width, (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height];
  mouse[0] = cameraPos[0] + mouse[0];
  mouse[1] = cameraPos[1] + mouse[1];
  return mouse;
}

function canvas_mouseDown(event){
  dragStart = [event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop];
  drag = true;
}

function canvas_mouseMove(event){
  dragEnd = [event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop];
  if(drag)
    requestAnimationFrame(update);
}

function canvas_mouseUp(event){
  drag = false;
  if(edit_mode)
  {
    let mouse = getMouseWorld();
    tileX = Math.floor(mouse[0] / gridSize);
    tileY = Math.floor(mouse[1] / gridSize);
    if(tileX < 0 || tileX >= program[0].length || tileY < 0 || tileY >= program.length){selected_cell = [-1,-1]; return;};
    console.log(tileX + ":" + tileY);
    selected_cell = [tileX, tileY];
    draw();
  }
}

function update()
{
  cameraPos[0] -= (dragEnd[0] - dragStart[0]);
  cameraPos[1] -= (dragEnd[1] - dragStart[1]);
  dragStart = dragEnd;
  draw();
}


function walk(){
  if(!real_program.length) return;
  clearInterval(interval);
  interval = setInterval(() => {codeStep(); updateHtml(); if(program_finished){clearInterval(interval);} }, 10);
}

function stop(){
  clearInterval(interval);
  updateHtml();
}

function canvas_fullscreen() {
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

    var docElm = canvas;
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

window.onresize = function() {
  fullWindowState = window.innerHeight == screen.height
  canvas.width = fullWindowState ? window.innerWidth : 1280;
  canvas.height = fullWindowState ? window.innerHeight : 480;
  ctx = canvas.getContext('2d');
  centerToActiveCell();
  draw();
}
