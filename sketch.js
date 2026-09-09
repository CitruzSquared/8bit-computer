var MEMORY = new Array(256).fill("00000000");
var REGISTERS = new Array(4).fill("00000000");
var EXECUTE = false;
var PC = 0;
var IR = "00000000";
var NZP = [0, 0, 0];

var hexadecimal = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
var OPCODES = ["NOT", "AND", "ANDI", "OR", "ORI", "ADD", "ADDI", "SUB", "CMP", "LD", "LDR", "ST", "STR", "BR", "HALT"];

function setup() {
    let w = Math.max(windowWidth / 1.5, 600);
    createCanvas(w / 1.2, w / 1.5);
    textFont('Courier New');
    textAlign(LEFT, TOP);
    var memory_table = document.getElementById("memory");
    for (let i = 0; i < 256; i++) {
        memory_table.innerHTML += `
        <tr>
            <th> 0x${binary_to_hex(unsigned_to_binary(i))} </th>
            <td class="inputbox"> <input id="inputbox${i}">
            </input>
            </td>
            <td id="databox${i}"> 
            0x00
            </td>
        </tr>`
    }
    frameRate(2);
}

function draw() {
    background(0);
    noStroke();
    fill(255);
    textSize(30);
    text("R0", 20, 20);
    draw_register(REGISTERS[0], 70, 20, 255, 0, 0, 30);
    text("R1", width - 270, 20);
    draw_register(REGISTERS[1], width - 220, 20, 255, 0, 0, 30);
    text("R2", 20, 60);
    draw_register(REGISTERS[2], 70, 60, 255, 0, 0, 30);
    text("R3", width - 270, 60);
    draw_register(REGISTERS[3], width - 220, 60, 255, 0, 0, 30);
    text("IR", 20, 100);
    draw_register(IR, 70, 100, 0, 255, 0, 30);
    text("PC", width - 270, 100);
    draw_register(unsigned_to_binary(PC), width - 220, 100, 0, 0, 255, 30);

    text("N", width / 2 - 27, 70);
    text("Z", width / 2 - 7, 70);
    text("P", width / 2 + 13, 70);
    for (let i = 0; i < 3; i++) {
        if (NZP[i] == 1) {
            fill(0, 255, 0);
        } else {
            fill(0, 255 / 4, 0);
        }
        stroke(0);
        strokeWeight(2);
        rect(width / 2 - 30 + i * 20, 100, 20, 30);
    }
    noStroke();
    fill(255);

    if (EXECUTE) {
        fill(255, 0, 0);
        text("ON", width / 2 - 17, 20);
    }
    else {
        fill(255 / 4, 0, 0);
        text("OFF", width / 2 - 25, 20);
        for (let i = 0; i < MEMORY.length; i++) {
            document.getElementById(`databox${i}`).innerHTML = `0x${binary_to_hex(MEMORY[i])}`;
        }
        noLoop();
    }
    textSize(14);
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            var str = "0x" + binary_to_hex(MEMORY[i * 16 + j]);
            if (str == "0x00") {
                fill(255 / 4);
            }
            else {
                fill(255);
            }
            text(str, (width - 10) / 16 * j + 12, (height - 160) / 16 * i + 165);
        }
    }
    if (EXECUTE) {
        CPU_step();
    }
    if (PC >= 256) {
        EXECUTE = false;
    }
}


function CPU_step() {
    IR = MEMORY[PC];
    PC += 1;
    var one_register = [1, 3, 5, 7, 10, 12];
    var reg1 = 0;
    var reg2 = 0;
    var condition = [];
    var opcode = binary_to_unsigned(IR.substring(0, 4));
    if (one_register.indexOf(opcode) >= 0) {
        reg1 = binary_to_unsigned(IR.substring(6));
    }
    else if (opcode == 14) {
        condition[0] = Number(IR.substring(5, 6));
        condition[1] = Number(IR.substring(6, 7));
        condition[2] = Number(IR.substring(7));
        if ((NZP[0] * condition[0] == 1) || (NZP[1] * condition[1] == 1) || (NZP[2] * condition[2] == 1)) {
            PC = binary_to_unsigned(MEMORY[PC]);
        }
        else {
            PC += 1;
        }
    }
    else if (opcode == 15) {
        EXECUTE = false;
        return;
    }
    else {
        reg1 = binary_to_unsigned(IR.substring(4, 6));
        reg2 = binary_to_unsigned(IR.substring(6));
    }
    var result = ""
    switch (opcode) {
        case 0:
            break;
        case 1: //NOT
            var data = REGISTERS[reg1];
            for (i = 0; i < 8; i++) {
                if (data[i] == 1) {
                    result += "0";
                }
                else {
                    result += "1";
                }
            }
            REGISTERS[reg1] = result;
            break;
        case 2: //AND
            var data1 = REGISTERS[reg1];
            var data2 = REGISTERS[reg2];
            for (i = 0; i < 8; i++) {
                if (data1[i] == 1 && data2[i] == 1) {
                    result += "1";
                }
                else {
                    result += "0";
                }
            }
            REGISTERS[reg1] = result;
            break;
        case 3: //ANDI
            var data1 = REGISTERS[reg1];
            var data2 = MEMORY[PC];
            for (i = 0; i < 8; i++) {
                if (data1[i] == 1 && data2[i] == 1) {
                    result += "1";
                }
                else {
                    result += "0";
                }
            }
            REGISTERS[reg1] = result;
            PC += 1;
            break;
        case 4: //OR
            var data1 = REGISTERS[reg1];
            var data2 = REGISTERS[reg2];
            for (i = 0; i < 8; i++) {
                if (data1[i] == 1 || data2[i] == 1) {
                    result += "1";
                }
                else {
                    result += "0";
                }
            }
            REGISTERS[reg1] = result;
            break;
        case 5: //ORI
            var data1 = REGISTERS[reg1];
            var data2 = MEMORY[PC];
            for (i = 0; i < 8; i++) {
                if (data1[i] == 1 || data2[i] == 1) {
                    result += "1";
                }
                else {
                    result += "0";
                }
            }
            REGISTERS[reg1] = result;
            PC += 1;
            break;
        case 6: //ADD
            var data1 = binary_to_int(REGISTERS[reg1]);
            var data2 = binary_to_int(REGISTERS[reg2]);
            result = int_to_binary(data1 + data2);
            REGISTERS[reg1] = result;
            break;
        case 7: //ADDI
            var data1 = binary_to_int(REGISTERS[reg1]);
            var data2 = binary_to_int(MEMORY[PC]);
            result = int_to_binary(data1 + data2);
            REGISTERS[reg1] = result;
            PC += 1;
            break;
        case 8: //SUB
            var data1 = binary_to_int(REGISTERS[reg1]);
            var data2 = binary_to_int(REGISTERS[reg2]);
            result = int_to_binary(data1 - data2);
            REGISTERS[reg1] = result;
            break;
        case 9: //CMP
            var data1 = binary_to_int(REGISTERS[reg1]);
            var data2 = binary_to_int(REGISTERS[reg2]);
            result = int_to_binary(data1 - data2);
            break;
        case 10: //LD
            var data2 = binary_to_unsigned(MEMORY[PC]);
            result = MEMORY[data2];
            REGISTERS[reg1] = result;
            PC += 1;
            break;
        case 11: //LDR
            var data2 = binary_to_unsigned(REGISTERS[reg2]);
            result = MEMORY[data2];
            REGISTERS[reg1] = result;
            break;
        case 12: //ST
            var data1 = REGISTERS[reg1];
            var data2 = binary_to_unsigned(MEMORY[PC]);
            MEMORY[data2] = data1;
            result = data1;
            PC += 1;
            break;
        case 13: //STR
            var data1 = REGISTERS[reg1];
            var data2 = binary_to_unsigned(REGISTERS[reg2]);
            MEMORY[data2] = data1;
            result = data1;
            break;
    }
    if (result[0] == "1") {
        NZP = [1, 0, 0];
    }
    else if (result == "00000000" || result === "") {
        NZP = [0, 1, 0];
    }
    else {
        NZP = [0, 0, 1];
    }
}

function draw_register(data, x, y, r, g, b, size) {
    stroke(0);
    strokeWeight(2);
    for (let i = 0; i < 8; i++) {
        if (data[i] == 1) {
            fill(r, g, b);
            rect(x + i * size / 2, y, size / 2, size);
        } else {
            fill(r / 4, g / 4, b / 4);
            rect(x + i * size / 2, y, size / 2, size);
        }
    }
    noStroke();
    fill(255);
    text("0x" + binary_to_hex(data), x + size * 4 + 10, y);
}


function unsigned_to_binary(n) {
    var result = "";
    var number = n;
    if (number > 255) {
        number -= 256;
    }
    if (number < 0) {
        number += 256;
    }
    for (let i = 7; i >= 0; i--) {
        if (number >= Math.pow(2, i)) {
            result += "1";
            number -= Math.pow(2, i);
        }
        else {
            result += "0";
        }
    }
    return result;
}

function binary_to_unsigned(bin) {
    var result = 0;
    for (let i = bin.length - 1; i >= 0; i--) {
        if (bin[(bin.length - 1) - i] == 1) {
            result += Math.pow(2, i);
        }
    }
    return result;
}

function int_to_binary(n) {
    var result = "0";
    var number = n;
    if (number > 127) {
        number -= 256;
    }
    if (number < -128) {
        number += 256;
    }
    if (number < 0) {
        result = "1";
        number += 128;
    }
    for (let i = 6; i >= 0; i--) {
        if (number >= Math.pow(2, i)) {
            result += "1";
            number -= Math.pow(2, i);
        }
        else {
            result += "0";
        }
    }
    return result;
}

function binary_to_int(bin) {
    var result = 0;
    if (bin[0] == "1") {
        result = -Math.pow(2, bin.length - 1);
    }
    for (let i = (bin.length - 2); i >= 0; i--) {
        if (bin[(bin.length - 1) - i] == 1) {
            result += Math.pow(2, i);
        }
    }
    return result;
}

function binary_to_hex(bin) {
    var top_half = binary_to_unsigned(bin.substring(0, 4));
    var bottom_half = binary_to_unsigned(bin.substring(4));
    return `${hexadecimal[top_half]}${hexadecimal[bottom_half]}`;
}

function hex_to_binary(hex) {
    hex = hex.toUpperCase();
    if (hex.length == 1) {
        hex = "0" + hex;
    }
    if (hex.length > 2) {
        hex = hex.substring(hex.length - 2);
    }
    var top_half = hexadecimal.indexOf(hex[0]);
    var bottom_half = hexadecimal.indexOf(hex[1]);
    return `${unsigned_to_binary(top_half).substring(4)}${unsigned_to_binary(bottom_half).substring(4)}`;
}

function assemble() {
    for (let i = 0; i < 256; i++) {
        var result = "00000000";
        var code = document.getElementById(`inputbox${i}`).value;
        code = code.toUpperCase();
        if (code === "") {
            result = "00000000";
        }
        else {
            // code is number?
            if (code[0] == "0" && code.length >= 3 && code.indexOf(' ') < 0 && isNumeric(code.substring(2))) {
                result = unsigned_to_binary(parse_integer(code));
            }
            // code is not number
            else {
                var opcode = "";
                var opcode_bin = "0000";
                if (code[2] == " ") {
                    opcode = code.substring(0, 2);
                    code = code.substring(3)
                }
                else if (code[3] == " ") {
                    opcode = code.substring(0, 3);
                    code = code.substring(4)
                }
                else {
                    opcode = code.substring(0, 4);
                    code = code.substring(5);
                }
                var index = OPCODES.indexOf(opcode) + 1;
                var valid = false;
                if (index > 0) {
                    opcode_bin = unsigned_to_binary(index).substring(4);
                }
                if (opcode_bin != "0000") {
                    code = code.replaceAll(' ', '')
                    var words = code.split(",");
                    var args = "";
                    if (index == 15) {
                        valid = true;
                        args = "1111";
                    }
                    var one_argument = [1, 3, 5, 7, 10, 12, 14];
                    if (one_argument.indexOf(index) >= 0) {
                        args += "0";
                        if (index == 14) {
                            if (words[0].indexOf("N") >= 0) {
                                valid = true;
                                args += "1";
                            }
                            else {
                                args += "0";
                            }
                            if (words[0].indexOf("Z") >= 0) {
                                valid = true;
                                args += "1";
                            }
                            else {
                                args += "0";
                            }
                            if (words[0].indexOf("P") >= 0) {
                                valid = true;
                                args += "1";
                            }
                            else {
                                args += "0";
                            }
                        }
                        else if (words.length == 1 && isRegister(words[0])) {
                            valid = true;
                            args = `00${unsigned_to_binary(words[0][1]).substring(6)}`;
                        }
                    }
                    else {
                        if (words.length == 2 && isRegister(words[0]) && isRegister(words[1])) {
                            valid = true;
                            args = `${unsigned_to_binary(words[0][1]).substring(6)}${unsigned_to_binary(words[1][1]).substring(6)}`;
                        }

                    }
                }
                if (valid) {
                    result = opcode_bin + args;
                }
            }
        }
        MEMORY[i] = result;
        document.getElementById(`databox${i}`).innerHTML = `0x${binary_to_hex(MEMORY[i])}`;
        redraw();
    }
}

function isNumeric(str) {
    str = str.toUpperCase();
    var allowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '-'];
    for (let i = 0; i < str.length; i++) {
        if (allowed.indexOf(str[i]) < 0) {
            return false;
        }
    }
    return true;
}

function isRegister(word) {
    return word[0] == "R" && Number(word[1]) >= 0 && Number(word[1]) <= 3
}

function parse_integer(code) {
    var result = 0;
    if (code[1] == "D") {
        result = Number(code.substring(2));
    }
    else if (code[1] == "B") {
        result = binary_to_unsigned(code.substring(2));
    }
    else if (code[1] == "X") {
        result = binary_to_unsigned(hex_to_binary(code.substring(2)));
    }
    return result;
}

function execute() {
    for (let i = 0; i < REGISTERS.length; i++) {
        REGISTERS[i] = "00000000";
    }
    NZP = [0, 0, 0];
    PC = 0;
    EXECUTE = true;
    var fps = Number(document.getElementById("speed").value);
    if (fps <= 0) {
        fps = 2;
    }
    frameRate(fps);
    redraw();
    loop();
}

function halt() {
    EXECUTE = false;
}