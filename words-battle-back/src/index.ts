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
    console.log(socket.id)
    console.log("user connected")

    socket.on("setBoard", newBoard => {
        console.log("NEW BOARD RECEIVED FROM THE FRONTEND")
        socket.broadcast.emit("setBoard", newBoard)
    })
    socket.on("setLastPosition", lastPosition => {
        console.log("NEW LASTPOSITION RECEIVED FROM THE FRONTEND")
        socket.broadcast.emit("setLastPosition", lastPosition)
    })
    socket.on("setSelection", selection => {
        console.log("NEW SELECTION RECEIVED FROM THE FRONTEND")
        socket.broadcast.emit("setSelection", selection)
    })
    socket.on("setState", state=> {
        console.log("NEW STATE RECEIVED FROM THE FRONTEND")
        socket.broadcast.emit("setState", state)
    })
    socket.on("setCheck", check => {
        console.log("NEW CHECK RECEIVED FROM THE FRONTEND")
        socket.broadcast.emit("setCheck", check)
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