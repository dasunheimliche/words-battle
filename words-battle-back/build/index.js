"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const existingRooms = {};
const salasAbiertas = io.sockets.adapter.rooms;
io.on('connection', (socket) => {
    socket.on("disconnect", () => {
        for (let nombreSala in existingRooms) {
            if (!salasAbiertas.has(nombreSala)) {
                delete existingRooms[nombreSala];
            }
        }
    });
    socket.on("join room", payload => {
        const sala = salasAbiertas.get(payload.room);
        if (sala && sala.size !== undefined && sala.size < 2) {
            socket.join(payload.room);
            socket.to(payload.room).emit("join room", payload);
        }
    });
    socket.on("create room", payload => {
        if (!existingRooms)
            return;
        if (existingRooms[`${payload.room}`]) {
            socket.emit('create room error', `El nombre de la sala ${payload.room} ya está en uso.`);
            return;
        }
        socket.emit('create room success', `Sala ${payload.room} creada con éxito.`);
        socket.join(payload.room);
        socket.to(payload.room).emit("create room", payload);
        existingRooms[payload.room] = true;
    });
    socket.on("setBoard", payload => {
        socket.to(payload.room).emit("setBoard", payload);
    });
    socket.on("setLastPosition", payload => {
        socket.to(payload.room).emit("setLastPosition", payload);
    });
    socket.on("setSelection", payload => {
        socket.to(payload.room).emit("setSelection", payload);
    });
    socket.on("setState", payload => {
        socket.to(payload.room).emit("setState", payload);
    });
    socket.on("setCheck", payload => {
        socket.to(payload.room).emit("setCheck", payload);
    });
    socket.on("setUserTurn", payload => {
        socket.to(payload.room).emit("setUserTurn", payload);
        socket.emit("setUserTurn", payload);
    });
    socket.on("setHost", payload => {
        socket.to(payload.room).emit("setHost", payload);
    });
    socket.on("hit host", payload => {
        socket.to(payload.room).emit("hit host", payload.damage);
    });
    socket.on("hit guest", payload => {
        socket.to(payload.room).emit("hit guest", payload.damage);
    });
    socket.on("next round", payload => {
        socket.to(payload.room).emit("next round", payload);
        socket.emit("next round", payload);
    });
});
app.get('/despertar', (_req, res) => {
    res.send('El servidor ha sido despertado.');
});
const PORT = 4000;
server.listen(PORT, () => {
    console.log('App listening on port 4000');
});
