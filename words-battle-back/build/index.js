"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.damages = exports.daño = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let rooms = {};
const existingRooms = {};
const salasAbiertas = io.sockets.adapter.rooms;
const getRandomLetter = (str) => {
    return str.charAt(Math.floor(Math.random() * str.length));
};
const grid = [
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " "],
];
const letters = "AAAAAAAAAAAAABCCCCCDDDDDDEEEEEEEEEEEEEEFGHIIIIIIJKLLLLLMMMNNNNNNNÑOOOOOOOOOPPPQRRRRRRRSSSSSSSSTTTTTUUUUVWXYZ";
const daño = (selection, board, damages) => {
    if (!selection)
        return null;
    return selection.reduce((acc, [x, y]) => acc + damages[board[y][x]], 0);
};
exports.daño = daño;
exports.damages = {
    A: 1,
    B: 8,
    C: 4,
    D: 2,
    E: 1,
    F: 16,
    G: 16,
    H: 16,
    I: 2,
    J: 32,
    K: 64,
    L: 4,
    M: 4,
    N: 2,
    Ñ: 64,
    O: 2,
    P: 4,
    Q: 16,
    R: 2,
    S: 2,
    T: 4,
    U: 4,
    V: 16,
    W: 120,
    X: 64,
    Y: 16,
    Z: 32,
};
//** -------------------------------------------------------------------------------------------------------------------
io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        for (let nombreSala in existingRooms) {
            if (!salasAbiertas.has(nombreSala)) {
                delete existingRooms[nombreSala];
            }
        }
    });
    //** JOIN ROOM
    socket.on("join room", (payload) => {
        const sala = salasAbiertas.get(payload.room);
        if (sala && sala.size !== undefined && sala.size < 2) {
            socket.join(payload.room);
            rooms[payload.room].guest = {
                username: payload.user.username,
                health: 100,
                color: "paleturquoise",
            };
            io.to(payload.room).emit("join room", rooms[payload.room]);
        }
    });
    //** CREAR ROOM
    socket.on("create room", (payload) => {
        if (!existingRooms)
            return;
        if (existingRooms[`${payload.room}`]) {
            socket.emit("create room error", `El nombre de la sala ${payload.room} ya está en uso.`);
            return;
        }
        let newBoard = JSON.parse(JSON.stringify(grid));
        for (let i = 0; i < newBoard.length; i++) {
            for (let b = 0; b < newBoard[i].length; b++) {
                const value = getRandomLetter(letters);
                newBoard[i][b] = value;
            }
        }
        rooms = {
            [payload.room]: {
                name: payload.room,
                userTurn: Object.assign(Object.assign({}, payload.user), { color: "lightgreen" }),
                board: newBoard,
                host: {
                    username: payload.user.username,
                    health: 100,
                    color: "lightgreen",
                },
            },
        };
        socket.emit("create room success", rooms[payload.room]);
        socket.join(payload.room);
        socket.to(payload.room).emit("create room", payload);
        existingRooms[payload.room] = true;
    });
    socket.on("setBoard", (payload) => {
        socket.to(payload.room).emit("setBoard", payload);
    });
    socket.on("setLastPosition", (payload) => {
        socket.to(payload.room).emit("setLastPosition", payload);
    });
    //** SETS SELECTION
    socket.on("setSelection", (payload) => {
        rooms[payload.room] = Object.assign(Object.assign({}, rooms[payload.room]), { selection: payload.selection });
        socket.to(payload.room).emit("setSelection", rooms[payload.room].selection);
    });
    //** HIT
    socket.on("hit", (payload) => {
        const newGrid = JSON.parse(JSON.stringify(rooms[payload.room].board));
        for (const pos of rooms[payload.room].selection) {
            newGrid[pos[1]].splice(pos[0], 1);
            const newLetter = getRandomLetter(letters);
            newGrid[pos[1]].unshift(newLetter);
        }
        if (payload.userTurn.username === rooms[payload.room].host.username) {
            rooms[payload.room].guest.health =
                rooms[payload.room].guest.health -
                    (0, exports.daño)(rooms[payload.room].selection, rooms[payload.room].board, exports.damages);
            rooms[payload.room].userTurn = rooms[payload.room].guest;
        }
        else {
            rooms[payload.room].host.health =
                rooms[payload.room].host.health -
                    (0, exports.daño)(rooms[payload.room].selection, rooms[payload.room].board, exports.damages);
            rooms[payload.room].userTurn = rooms[payload.room].host;
        }
        io.to(payload.room).emit("hit", rooms[payload.room]);
    });
    socket.on("next round", (payload) => {
        let newBoard = JSON.parse(JSON.stringify(grid));
        for (let i = 0; i < newBoard.length; i++) {
            for (let b = 0; b < newBoard[i].length; b++) {
                const value = getRandomLetter(letters);
                newBoard[i][b] = value;
            }
        }
        rooms[payload.room].host.health = 100;
        rooms[payload.room].guest.health = 100;
        rooms[payload.room].board = newBoard;
        io.to(payload.room).emit("next round", rooms[payload.room]);
    });
});
app.get("/despertar", (_req, res) => {
    res.send("El servidor ha sido despertado.");
});
const PORT = 4000;
server.listen(PORT, () => {
    console.log("App listening on port 4000");
});
