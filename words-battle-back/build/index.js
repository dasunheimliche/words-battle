"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// DEPENDENCIES
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// CREATING SERVER INSTANCES
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    }
});
// APLYING MIDDLEWARES
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ROOMS
const existingRooms = {};
const salasAbiertas = io.sockets.adapter.rooms;
console.log(existingRooms);
// IO AND EXPRESS EVENT LISTENERS
io.on('connection', (socket) => {
    socket.on("disconnect", () => {
        for (let nombreSala in existingRooms) {
            if (!salasAbiertas.has(nombreSala)) {
                delete existingRooms[nombreSala];
            }
        }
    });
    socket.on("join room", payload => {
        socket.join(payload.room);
        socket.to(payload.room).emit("join room", payload);
    });
    socket.on("create room", payload => {
        console.log("SALAS ABIERTAS", salasAbiertas);
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
app.post('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    // const app_id = "ea0b47e4";
    const app_id = process.env.APP_ID;
    // const app_key = "800dab5c0718ff978bb4f2784b2914db";
    const app_key = process.env.APP_KEY;
    const strictMatch = "true";
    const wordId = body.word.toLowerCase();
    const fields = "definitions";
    const language = "es";
    axios_1.default.get(`https://od-api.oxforddictionaries.com:443/api/v2/entries/${language}/${wordId}?fields=${fields}&strictMatch=${strictMatch}`, {
        headers: {
            'app_id': app_id,
            'app_key': app_key,
            "Access-Control-Allow-Origin": "http://127.0.0.1:5173"
        }
    })
        .then(result => {
        res.json(result.data.results[0]["lexicalEntries"][0]["entries"][0]["senses"]);
    })
        .catch(() => {
        res.json([{ definitions: "no word found", id: "error" }]);
    });
}));
// STARTING THE SERVER
const PORT = 4000;
server.listen(PORT, () => {
    console.log('App listening on port 4000');
});
