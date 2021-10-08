import os, random
filename = "main.be"

SIZE = [20, 20]
stack = []
pc = [0, 0]
step = [0, 1]
program = [  [" "] * SIZE[0] for x in range(SIZE[1])]

with open(filename, 'r') as f:
    line = True
    row = 0
    lines = f.readlines()
    for _ in range(len(lines)):
        lines[_] = lines[_].replace("\n", "")
        line = lines[_]
        if(row >= len(program)): program.append([""])
        for index in range(len(line)):
            char = line[index]
            if(index >= len(program[row])): program[row].append(char)
            else: program[row][index] = char
        row += 1

for row in program:
    print(row)

def add(*args):
    a = stack.pop() if len(stack) > 0 else 0
    b = stack.pop() if len(stack) > 0 else 0
    stack.append(a+b)

def sub(*args):
    a = stack.pop() if len(stack) > 0 else 0
    b = stack.pop() if len(stack) > 0 else 0
    stack.append(b-a)

def mul(*args):
    a = stack.pop() if len(stack) > 0 else 0
    b = stack.pop() if len(stack) > 0 else 0
    stack.append(a*b)

def div(*args):
    a = stack.pop() if len(stack) > 0 else 0
    b = stack.pop() if len(stack) > 0 else 0
    if(a > 0):
        stack.append(b//a)
    else:
        stack.append(0)

def mod(*args):
    a = stack.pop() if len(stack) > 0 else 0
    b = stack.pop() if len(stack) > 0 else 0
    if(a > 0):
        stack.append(b%a)
    else:
        stack.append(0)

def lnot(*args):
    a = stack.pop() if len(stack) > 0 else 0
    stack.append(int(not a))

def gt(*args):
    a = stack.pop() if len(stack) > 0 else 0
    b = stack.pop() if len(stack) > 0 else 0
    if(b>a):
        stack.append(1)
    else:
        stack.append(0)
def dup(*args):
    a = stack.pop() if len(stack) > 0 else 0
    stack.append(a)
    stack.append(a)

def swap(*args):
    a = stack.pop() if len(stack) > 0 else 0
    b = stack.pop() if len(stack) > 0 else 0
    stack.append(a)
    stack.append(b)

def nop(*args):
    a = stack.pop() if len(stack) > 0 else 0


def oi(*args):
    a = stack.pop() if len(stack) > 0 else 0
    print(a, end="")

def oa(*args):
    a = stack.pop() if len(stack) > 0 else 0
    print(chr(a), end="")

def ii(*args):
    a = int(input())
    stack.append(a)

def ii(*args):
    a = ord(input())
    stack.append(a)

def end(*args):
    input("Press enter key to exit.")
    globals().update({"done": True})

def push(*args):
    stack.append(ord(args[0]))

def move(*args):
    caller = args[0]
    map = {">": [0,1], "<": [0,-1], "^": [-1,0], "v": [1,0]}
    globals().update({"step": map[caller]})

def rnd(*args):
    x = random.randint(0,3)
    while(x == 0):
        up()
        x = -1
    while(x == 1):
        down()
        x = -1
    while(x == 2):
        left()
        x = -1
    while(x == 3):
        right()
        x = -1

def hif(*args):
    a = stack.pop() if len(stack) > 0 else 0
    if(not value):
        right()
        return
    left()

def vif(*args):
    a = stack.pop() if len(stack) > 0 else 0
    if(not value):
        down()
        return
    up()

def brg(*args):
    pc[0] += step[0]
    pc[1] += step[1]

def get(*args):
    y = stack.pop() if len(stack) > 0 else 0
    x = stack.pop() if len(stack) > 0 else 0
     # = program[y][x]

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
    "_": hif,
    "|": vif,
#     "\"": str,
    ":": dup,
    "\\": swap,
    "$": nop,
    ".": oi,
    ",": oa,
    "#": brg,
#     "g": get,
#     "p": put,
    "&": ii,
    # "~": ia,
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

done = False
debug = True

while(not done):
    if debug: print(F"Program Counter - X: {pc[1]} Y: {pc[0]}")
    instruction = program[pc[0]][pc[1]]
    if instruction in instructions:
        if debug: print(f"Instruction: {instruction}")
        instruction_func = instructions[instruction]
        instruction_func(instruction)
    # Y Program Counter
    pc[0] += step[0]
    pc[0] %= len(program)
    # X Program Counter
    pc[1] += step[1]
    pc[1] %= len(program[0])
    if debug and not done: input("Continue?")
