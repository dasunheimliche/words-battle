
import express from 'express';
import cors from 'cors';
import { Server as SocketServer } from 'socket.io';
import http from 'http';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app)
const io = new SocketServer(server, {
    cors: {
        origin: "*",
    }
})

app.use(cors())
app.use(express.json())

const existingRooms: { [key: string]: boolean } = {};
const salasAbiertas = io.sockets.adapter.rooms as Map<string, Set<string>>;


io.on('connection', (socket) => {
    
    socket.on("disconnect", ()=> {
        for (let nombreSala in existingRooms) {
            if (!salasAbiertas.has(nombreSala)) {
              delete existingRooms[nombreSala]
            }
        }
    })


    socket.on("join room", payload => {
        const sala = salasAbiertas.get(payload.room);

        if (sala && sala.size !== undefined && sala.size < 2) {
            socket.join(payload.room);
            socket.to(payload.room).emit("join room", payload);
        }
    })

    socket.on("create room", payload => {
        if (!existingRooms) return
        if (existingRooms[`${payload.room}`]) {
            socket.emit('create room error', `El nombre de la sala ${payload.room} ya está en uso.`);
            return;
        }
        socket.emit('create room success', `Sala ${payload.room} creada con éxito.`);

        socket.join(payload.room)
        socket.to(payload.room).emit("create room", payload)

        existingRooms[payload.room] = true;
    })
    socket.on("setBoard", payload => {
        socket.to(payload.room).emit("setBoard", payload)
    })
    socket.on("setLastPosition", payload => {
        socket.to(payload.room).emit("setLastPosition", payload)
    })
    socket.on("setSelection", payload => {
        socket.to(payload.room).emit("setSelection", payload)
    })
    socket.on("setState", payload=> {
        socket.to(payload.room).emit("setState", payload)
    })
    socket.on("setCheck", payload => {
        socket.to(payload.room).emit("setCheck", payload)
    })
    socket.on("setUserTurn", payload => {
        socket.to(payload.room).emit("setUserTurn", payload)
        socket.emit("setUserTurn", payload)
    })
    socket.on("setHost", payload => {
        socket.to(payload.room).emit("setHost", payload)
    })
    socket.on("hit host", payload => {
        socket.to(payload.room).emit("hit host", payload.damage)
    })
    socket.on("hit guest", payload => {
        socket.to(payload.room).emit("hit guest", payload.damage)
    })

    socket.on("next round", payload => {
        socket.to(payload.room).emit("next round", payload)
        socket.emit("next round", payload)
    })
})

app.get('/despertar', (_req, res) => {
    res.send('El servidor ha sido despertado.');
});


const PORT = 4000;

server.listen(PORT, ()=> {
    console.log('App listening on port 4000')
})