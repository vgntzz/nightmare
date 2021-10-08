import os
#config
filename = "main.bf"
input_text = """ """
initial_size = 30000
input_mode = True
#debug
debug = False
clear = True

byte = 1
cell_width = 2 ** (8*byte)

pc = 0
index = 0
celdas = [0] * initial_size

def validate_brackets(program):
    brackets = ["[", "]"]
    stack = []
    brackets_map = {}
    for index, char in enumerate(program):
        if(char in brackets):
            stack.append([char,index])
        if(len(stack) > 1 and stack[-1][0] == "]" and stack[-2][0] == "["):
            r1 = stack.pop()
            r2 = stack.pop() # opening
            brackets_map[r2[1]] = r1[1]

    if(len(stack)):
        raise Exception("Error con los brackets!")
    return brackets_map

def modify(celdas, *args):
    step = args[0]
    celdas[index] += step
    celdas[index] %= cell_width

def move(celdas, *args):
    step = args[0]
    global index
    index += step
    index %= len(celdas)

def bracket(celdas, *args):
    global pc
    if pc in brackets:
        # es opening bracket
        if(celdas[index] == 0):
            pc = brackets[pc] - 1
    elif pc in brackets.values():
        # es closing bracket
        for key, value in brackets.items():
            if pc == brackets[key] and celdas[index] != 0:
                pc = key - 1
                break

def input_bf(celdas, *args):
    global input_text
    if(input_mode):
        celdas[index] = ord(input("")[0]) % cell_width
        return
    else:
        temp = input_text[:1]
        input_text = input_text[1:]
        celdas[index] = ord(temp) % cell_width

def debug_func(celda, *args):
    global debug
    debug = not debug

instructions = {
    "+": [modify,    1],
    "-": [modify,   -1],
    ">": [move,      1],
    "<": [move,     -1],
    "[": [bracket,   5],
    "]": [bracket,   6],
    ".": [lambda celdas, *args: print(chr(celdas[index]), end=""), 7],
    ",": [input_bf,  0],
    "@": [debug_func, 0],
}

with open(filename, 'r') as f:
    program = [char for char in f.read() if char in instructions]
    brackets = validate_brackets(program)
    print(brackets)

while(pc < len(program)):
    if(debug):
        print(f"PC: {pc}")
        print(f"index: {index}")
        print(f"memory: {celdas[:20]}")
        print(program[pc])
        input("")
        if(clear): os.system("cls")
    instruction = instructions[program[pc]]
    instruction_func = instruction[0]
    instruction_arg = instruction[1:]
    result = instruction_func(celdas, *instruction_arg)
    pc += 1
