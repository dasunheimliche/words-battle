// DEPENDENCIES
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import { parse } from 'node-html-parser'

import dotenv from 'dotenv';
dotenv.config();

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

// ROOMS

const existingRooms: { [key: string]: boolean } = {};
const salasAbiertas = io.sockets.adapter.rooms as Map<string, Set<string>>;
console.log(existingRooms)
// IO AND EXPRESS EVENT LISTENERS
io.on('connection', (socket) => {
    
    socket.on("disconnect", ()=> {
        console.log("SALAS ABIERTAS ANTES DE FOR", salasAbiertas)
        console.log("EXISTIN ROOMS ANTES DE FOR", existingRooms)
        for (let nombreSala in existingRooms) {
            if (!salasAbiertas.has(nombreSala)) {
              delete existingRooms[nombreSala]
            }
        }
        console.log("SALAS ABIERTAS DESPUES DE FOR", salasAbiertas)
        console.log("EXISTIN ROOMS DESPUES DE FOR", existingRooms)
    })


    socket.on("join room", payload => {
        socket.join(payload.room)
        socket.to(payload.room).emit("join room", payload)
        
    })
    socket.on("create room", payload => {
        console.log("SALAS ABIERTAS", salasAbiertas)
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

app.post('/search', async(req, res)=> {

    const body = req.body;

    // const app_id = process.env.APP_ID;
    // const app_key = process.env.APP_KEY;
	// const strictMatch = "true";
	const wordId = body.word.toLowerCase();
	// const fields = "definitions";
	// const language = "es";

    console.log("WORDDD", wordId)

    let filteredWords: string[] = []
    console.log("ENTRANDO A CONSULTA A WORDREFERENCE")
    try {
        const { data: wordTextList} = await axios.get(`https://www.wordreference.com/autocomplete?dict=eses&query=${wordId}`, {headers: {"Access-Control-Allow-Origin": "http://127.0.0.1:5173"}})
        const lines = wordTextList.split('\n')
        console.log("LINES", lines)
        const words = lines.map((line:String) => {
            const word = line.split('\t')[0].trim()
            return word
        })

        filteredWords = words.filter((word:string) => word !== "")

        if (!filteredWords.includes(wordId)) {
            console.log("LA PALABRA NO EXISTE")
            return res.json([{definitions: "no word found", id: "error"}])
        }
    } catch {
        console.log("ALGUN ERROR RARO EN LA CONSULTA A AUTOCOMPLETE")
        return res.json([{definitions: "no word found", id: "error"}])
    }

    console.log("SALIENDO DE LA CONSULTA A AUTOCOMPLETE")

    try {
        const {data: htmlResult} = await axios.get(`https://www.wordreference.com/definicion/${wordId}`, {headers: {"Access-Control-Allow-Origin": "http://127.0.0.1:5173"}})
        const root = parse(htmlResult)
        const main = root.querySelector('.entry')
        console.log("DEF", main?.text)
        if (!main?.text) {
            console.log("TIRANDO ERROR")
            throw Error;
        }
        return res.json([{definitions: main?.text, id: 1}])
    } catch {
        console.log("TIRANDO ERROR EN CATCH DIRECTAMENTE")
        return res.json([{definitions: "no word found", id: "error"}])
    }

    


    // axios.get(`https://www.wordreference.com/definicion/${wordId}`,{headers: {"Access-Control-Allow-Origin": "http://127.0.0.1:5173"}})
    //     .then(result => {
    //         const html = result.data;
    //         const root = parse(html)
    //         const main = root.querySelector('.entry')
    //         console.log("DEF", main?.text)
    //         if (!main?.text) {
    //             console.log("TIRANDO ERROR")
    //             throw Error;
                
    //         }
    //         res.json([{definitions: main?.text, id: 1}])
                
    //     })
    //     .catch(()=> {
    //         console.log("TIRANDO ERROR EN CATCH DIRECTAMENTE")
    //         res.json([{definitions: "no word found", id: "error"}])
    //     })

	// axios.get(`https://od-api.oxforddictionaries.com:443/api/v2/entries/${language}/${wordId}?fields=${fields}&strictMatch=${strictMatch}`, {
	// 	headers: {
	// 	    'app_id': app_id,
	// 		'app_key': app_key,
	// 		"Access-Control-Allow-Origin": "http://127.0.0.1:5173"
	// 		}
	// 		})
	// 			.then(result => {
    //                 res.json(result.data.results[0]["lexicalEntries"][0]["entries"][0]["senses"])

	// 			})
	// 			.catch(() => {
    //                 res.json([{definitions: "no word found", id: "error"}])
	// 			});
})

// STARTING THE SERVER
const PORT = 4000;

server.listen(PORT, ()=> {
    console.log('App listening on port 4000')
})