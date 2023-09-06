import React, { useEffect, useState } from "react";
import io from "socket.io-client";

import {
  setLastPositionAndEmit,
  setSelectionAndEmit,
} from "../src/utils/emiting";

import {
  selectedWord,
  searchDefs,
  isSelectionValid,
  isClickeable,
} from "../src/utils/functions";
import { grid } from "./utils/variables";
import { Position, Board, User, Definitions } from "./types/types";

import RoomPanel from "./components/RoomPanel";
import VersusPanel from "./components/VersusPanel";
import Tile from "./components/Tile";
import StartForm from "./components/StartForm";
import NamesPanel from "./components/NamesPanel";
import DamageCountPanel from "./components/DamageCountPanel";
import Grid from "./components/Grid";
import PlaygroundActions from "./components/PlaygroundActions";
import PlaygroundResult from "./components/PlaygroundResult";

import "./App.css";

// const socket = io("http://localhost:4000");
const socket = io("https://words-battle-api.onrender.com");

function App() {
  //** SHARED STATES
  const [board, setBoard] = useState<Board>(grid);

  const [lastPosition, setLastPosition] = useState<Position>([-1, -1]);
  const [selection, setSelection] = useState<Position[] | undefined>(undefined);

  const [room, setRoom] = useState<string>("");

  const [userTurn, setUserTurn] = useState<User | null>(null);
  const [host, setHost] = useState<User | null>(null);
  const [guest, setGuest] = useState<User | null>(null);

  //** LOCAL STATES
  const [user, setUser] = useState<User | null>(null);
  const [startForm, setStartForm] = useState<boolean>(true);
  const [fetching, setFetching] = useState<boolean>(false);
  const [definitions, setDefinitions] = useState<Definitions>([
    { definitions: "", id: "" },
  ]);

  useEffect(() => {
    setDefinitions([{ definitions: "", id: "" }]);
    if (!selection) return;

    setFetching(true);

    const delayDebounceFn = setTimeout(() => {
      searchDefs(selection, board).then((res) => {
        if (!res) {
          return;
        }
        setFetching(false);
        setDefinitions(res);
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [selection]);

  useEffect(() => {
    socket.on("hit", (payload) => {
      setHost(payload.host);
      setGuest(payload.guest);
      setBoard(payload.board);

      setUserTurn(payload.userTurn);
    });

    socket.on("setLastPosition", (payload) => {
      setLastPosition(payload.position);
    });

    socket.on("setSelection", (payload) => {
      setSelection(payload);
    });

    socket.on("next round", (payload) => {
      setHost(payload.host);
      setGuest(payload.guest);
      setBoard(payload.board);
    });

    return () => {
      socket.off("setLastPosition", (payload) => {
        setLastPosition(payload.lastPosition);
      });

      socket.off("setSelection", (payload) => {
        setSelection(payload.selection);
      });

      socket.off("next round", () => {
        if (!host || !guest) return;
        setHost({ ...host, health: 100 });
        setGuest({ ...guest, health: 100 });
      });
    };
  }, [board, lastPosition, selection, userTurn]);

  useEffect(() => {
    socket.on("create room error", () => {
      setStartForm(true);
    });

    socket.on("create room success", (payload) => {
      if (!user) return;
      setBoard(payload.board);
      setStartForm(false);
      setUserTurn(payload.userTurn);
      setHost({ ...user, color: "lightgreen" });
    });

    socket.on("join room", (payload) => {
      setHost(payload.host);
      setGuest(payload.guest);
      setBoard(payload.board);
      setUserTurn(payload.userTurn);
    });

    return () => {
      socket.off("create room error", () => {
        setStartForm(true);
      });
      socket.off("create room success", (payload) => {
        if (!user) return;
        setBoard(payload.board);
        setStartForm(false);
        setUserTurn(payload.userTurn);
        setHost({ ...user, color: "lightgreen" });
      });
      socket.off("join room", (payload) => {
        setHost(payload.host);
        setGuest(payload.guest);
        setBoard(payload.board);
      });
    };
  });

  //** FUNCIONES

  const joinRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!user) return;
    if (room.length <= 0 || user.username.length <= 0) return;

    setStartForm(false);
    setGuest({ ...user, color: "paleturquoise" });
    socket.emit("join room", { user, room, userTurn });
  };

  const createRoom = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) return;

    if (room.length <= 0 || user.username.length <= 0) return;

    socket.emit("create room", { user, room, userTurn });
  };

  const loadColumn = (col: number): React.ReactNode[] => {
    return board[col - 1].map((char, i) => {
      const isChecked = selection?.some(
        (item) => item[0] === [i, col - 1][0] && item[1] === [i, col - 1][1]
      );
      const isTileDisabled = userTurn?.username !== user?.username || isChecked;

      const onClickTile = ():
        | React.MouseEventHandler<HTMLDivElement>
        | undefined => {
        if (!isClickeable(guest, [i, col - 1], lastPosition)) return;

        setLastPositionAndEmit(
          [i, col - 1],
          user,
          room,
          socket,
          setLastPosition
        );
        if (selection) {
          setSelectionAndEmit(
            [...selection, [i, col - 1]],
            user,
            room,
            socket,
            setSelection
          );
        } else {
          setSelectionAndEmit([[i, col - 1]], user, room, socket, setSelection);
        }
      };

      return (
        <Tile
          key={`${i},${col - 1}`}
          char={char}
          userTurn={userTurn}
          onClickTile={onClickTile}
          isChecked={isChecked}
          isTileDisabled={isTileDisabled}
        />
      );
    });
  };

  const cancel = (): void => {
    if (userTurn?.username !== user?.username) return;
    setLastPositionAndEmit([-1, -1], user, room, socket, setLastPosition);
    setSelectionAndEmit(undefined, user, room, socket, setSelection);
  };

  const send = () => {
    if (!isSelectionValid(fetching, selection, userTurn, user, definitions))
      return;

    setDefinitions([{ definitions: "", id: "" }]);

    socket.emit("hit", { userTurn, selection, room });

    cancel();
  };

  const nextRound = () => {
    socket.emit("next round", { room });
  };

  if (startForm) {
    return (
      <StartForm
        joinRoom={joinRoom}
        createRoom={createRoom}
        setUser={setUser}
        setRoom={setRoom}
      />
    );
  } else {
    return (
      <div className={"App scanlines"}>
        <RoomPanel host={host?.username} room={room} />
        <VersusPanel hostHealth={host?.health} guestHealth={guest?.health} />
        <NamesPanel
          host={host?.username}
          guest={guest?.username}
          userTurn={userTurn?.username}
        />
        <DamageCountPanel
          host={host}
          guest={guest}
          userTurn={userTurn}
          selection={selection}
          board={board}
        />
        <div className="playground">
          <Grid loadColumn={loadColumn} />
          <PlaygroundActions
            host={host}
            guest={guest}
            onStartNextRound={nextRound}
            onSend={send}
            onCancel={cancel}
          />
          <PlaygroundResult
            selectedWord={selectedWord}
            selection={selection}
            board={board}
            definitions={definitions}
          />
        </div>
      </div>
    );
  }
}

export default App;
