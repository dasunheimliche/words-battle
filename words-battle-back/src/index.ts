// DEPENDENCIES
import express from 'express';
import cors from 'cors';
import { Server as SocketServer } from 'socket.io';
import http from 'http';

// CREATING SERVER INSTANCES
const app = express();
const server = http.createServer(app)
const io = new SocketServer(server, {
    cors: {
        origin: "*",
    }
})

// APLYING MIDDLEWARES
app.use(cors())
app.use(express.json())

// IO AND EXPRESS EVENT LISTENERS
io.on('connection', (socket) => {
    socket.on("join room", payload => {
        socket.join(payload.room)
        socket.to(payload.room).emit("join room", payload)
    })
    socket.on("create room", payload => {
        socket.join(payload.room)
        socket.to(payload.room).emit("create room", payload)
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
        console.log("PAYLOAD SETHOST", payload)
        socket.to(payload.room).emit("setHost", payload)
    })
})

app.get('/ping', (_req, res)=> {
    res.send('pong')
})

// STARTING THE SERVER
const PORT = 4000;

server.listen(PORT, ()=> {
    console.log('App listening on port 4000')
})