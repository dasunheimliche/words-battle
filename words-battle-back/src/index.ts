// DEPENDENCIES
import express from 'express';
import axios from 'axios';
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
        socket.to(payload.room).emit("setHost", payload)
    })
})

app.post('/search', async(req, res)=> {

    const body = req.body;

    const app_id = "ea0b47e4";
	const app_key = "800dab5c0718ff978bb4f2784b2914db";
	const strictMatch = "true";
	const wordId = body.word.toLowerCase();
	const fields = "definitions";
	const language = "es";

	axios.get(`https://od-api.oxforddictionaries.com:443/api/v2/entries/${language}/${wordId}?fields=${fields}&strictMatch=${strictMatch}`, {
		headers: {
		    'app_id': app_id,
			'app_key': app_key,
			"Access-Control-Allow-Origin": "http://127.0.0.1:5173"
			}
			})
				.then(result => {
					console.log("RESULTADO ",result.data.results[0]["lexicalEntries"][0]["entries"][0]["senses"]);
                    res.json(result.data.results[0]["lexicalEntries"][0]["entries"][0]["senses"])

				})
				.catch(() => {
					console.log("ERROR WORD NOT FOUND");
                    res.json([{definitions: "no word found", id: "error"}])
				});
})

// STARTING THE SERVER
const PORT = 4000;

server.listen(PORT, ()=> {
    console.log('App listening on port 4000')
})