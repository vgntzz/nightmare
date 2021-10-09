import os, random, pathlib

# ==================
# Befunge Program
# ==================
PATH_PROGRAM = pathlib.Path(__file__).parent / "main.be"        # Input Befunge FILE
SIZE_PROGRAM = [20, 20]                                         # SIZE (rows, columns)

stack = list()  # Memory (stack)
pc = [0, 0]     # Program counter
step = [0, 1]   # Direction (step)
program = [[" "]*SIZE_PROGRAM[0] for x in range(SIZE_PROGRAM[1])]
real_program = []

string_mode = False
program_finished = False
debug = False

with open(PATH_PROGRAM, 'r') as f:
    line = True
    row = 0
    lines = f.readlines()
    for _ in range(len(lines)):
        lines[_] = lines[_].replace("\n", "")
        line = lines[_]
        if(row >= len(program)): program.append([""])
        if(row >= len(real_program)): real_program.append([])
        for index in range(len(line)):
            char = line[index]
            if(index >= len(program[row])): program[row].append(char)
            else: program[row][index] = char
            if(index >= len(real_program[row])): real_program[row].append(char)
            else: real_program[row][index] = char
        row += 1

for row in program:
    print(row)

for row in real_program:
    print(row)

def add(*args):
    if len(stack) < 2: return
    a, b = pop_two()
    stack.append(a+b)

def sub(*args):
    if len(stack) < 2: return
    a, b = pop_two()
    stack.append(b-a)

def mul(*args):
    if len(stack) < 2: return
    a, b = pop_two()
    stack.append(a*b)

def div(*args):
    if len(stack) < 2: return
    a, b = pop_two()
    if(a > 0):
        stack.append(b//a)
    else:
        stack.append(0)

def mod(*args):
    if len(stack) < 2: return
    a, b = pop_two()
    if(a > 0):
        stack.append(b%a)
    else:
        stack.append(0)

def lnot(*args):
    if len(stack) < 1: return
    a = stack.pop()
    stack.append(int(not a))

def gt(*args):
    if len(stack) < 2: return
    a, b = pop_two()
    stack.append(int(b>a))

def dup(*args):
    if len(stack) < 1: return
    a = stack[-1]
    stack.append(a)

def swap(*args):
    if len(stack) < 2: return
    a, b = pop_two()
    stack.append(a)
    stack.append(b)

def nop(*args):
    if len(stack) < 1: return
    stack.pop()

def oi(*args):
    if len(stack) < 1: return
    a = stack.pop()
    print(a, end=" ")

def oa(*args):
    if len(stack) < 1: return
    a = stack.pop()
    print(chr(a), end=" ")

def input_number(*args):
    try:
        a = int(input("Enter a number: "))
        stack.append(a)
    except Exception as e:
        print("Error in input_number: " + str(e))

def input_ascii(*args):
    try:
        a = ord(input("Enter a number: "))
        stack.append(a)
    except Exception as e:
        print("Error in input_ascii: " + str(e))

def end(*args):
    globals().update({"program_finished": True})
    if debug: input("Press enter key to exit.")

def push(*args):
    ascii = ord(args[0])
    if string_mode:
        stack.append(ascii)
        return
    if ascii >= ord("0") and ascii <= ord("9"): stack.append(int(args[0]))
    else: stack.append(ascii)

def move(*args):
    caller = args[0]
    map = {">": [0,1], "<": [0,-1], "^": [-1,0], "v": [1,0]}
    globals().update({"step": map[caller]})

def rnd(*args):
    x = random.randint(0,3)
    while(x == 0):
        move("^")
        x = -1
    while(x == 1):
        move("v")
        x = -1
    while(x == 2):
        move("<")
        x = -1
    while(x == 3):
        move(">")
        x = -1

def bridge(*args):
    next_step()

def horizontal_if(*args):
    a = stack.pop() if len(stack) > 0 else 0
    if(not a):
        move(">")
        return
    move("<")

def vertical_if(*args):
    a = stack.pop() if len(stack) > 0 else 0
    if(not a):
        move("v")
        return
    move("^")

def get(*args):
    if len(stack) < 2: return
    a, b = pop_two()
    if(a >= len(real_program)): a = len(real_program)-1
    if(b >= len(real_program[a])): b = len(real_program[a]) - 1
    instruction = program[a][b]
    stack.append(ord(instruction))

def put(*args):
    if len(stack) < 3: return
    a, b, v = (stack.pop(), stack.pop(), stack.pop())
    v = chr(v)
    if(a >= len(real_program)): a = len(real_program)-1
    if(b >= len(real_program[a])): b = len(real_program[a]) - 1
    program[a][b] = v
    real_program[a][b] = v

def stringmode(*args):
    globals().update({"string_mode": not string_mode})

def pop_two():
    return (stack.pop(), stack.pop())

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

def next_step():
    global pc
    pc = [pc[0] + step[0], pc[1] + step[1]]
    pc = [pc[0] % len(program), pc[1] % len(program)]

while(not program_finished):
    if debug: print(F"Program Counter - X: {pc[1]} Y: {pc[0]}")
    instruction = program[pc[0]][pc[1]]
    if(string_mode and not instruction == "\""):
        push(instruction)
    elif instruction in instructions:
        if debug: print(f"Instruction: {instruction}")
        instruction_func = instructions[instruction]
        instruction_func(instruction)
    next_step()
    if debug and not program_finished: input("Continue?")
print(stack)

for row in program:
    print(row)
