import express from "express";
import cors from "cors";
import { Server as SocketServer } from "socket.io";
import http from "http";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

let rooms: any = {};

const existingRooms: { [key: string]: boolean } = {};
const salasAbiertas = io.sockets.adapter.rooms as Map<string, Set<string>>;

const getRandomLetter = (str: string) => {
  return str.charAt(Math.floor(Math.random() * str.length));
};

const grid: string[][] = [
  [" ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " "],
  [" ", " ", " ", " ", " ", " "],
];

const letters =
  "AAAAAAAAAAAAABCCCCCDDDDDDEEEEEEEEEEEEEEFGHIIIIIIJKLLLLLMMMNNNNNNNÑOOOOOOOOOPPPQRRRRRRRSSSSSSSSTTTTTUUUUVWXYZ";

export const daño = (selection: any, board: any, damages: any) => {
  if (!selection) return null;
  return selection.reduce(
    (acc: any, [x, y]: any) => acc + damages[board[y][x]],
    0
  );
};

export const damages: Record<string, number> = {
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

  socket.on("join room", (payload: any) => {
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
    if (!existingRooms) return;
    if (existingRooms[`${payload.room}`]) {
      socket.emit(
        "create room error",
        `El nombre de la sala ${payload.room} ya está en uso.`
      );
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
        userTurn: { ...payload.user, color: "lightgreen" },
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
    rooms[payload.room] = {
      ...rooms[payload.room],
      selection: payload.selection,
    };

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
        daño(rooms[payload.room].selection, rooms[payload.room].board, damages);
      rooms[payload.room].userTurn = rooms[payload.room].guest;
    } else {
      rooms[payload.room].host.health =
        rooms[payload.room].host.health -
        daño(rooms[payload.room].selection, rooms[payload.room].board, damages);
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
