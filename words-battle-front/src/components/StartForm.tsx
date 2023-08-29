import React, { Dispatch, useState, useEffect } from "react";
import axios from "axios";

import { isServerSleeping } from "../utils/functions";

import style from "../styles/startForm.module.css";

interface User {
  username: string;
  color: string;
  health: number;
}

interface Props {
  user: User;
  joinRoom: (e: React.MouseEvent<HTMLButtonElement>) => void;
  createRoom: (e: React.MouseEvent<HTMLButtonElement>) => void;
  setUser: Dispatch<User>;
  setRoom: Dispatch<string>;
}

type Mode = "join" | "create";

interface OptionsProps {
  mode: Mode;
  onSelectCreate: () => void;
  onSelectJoin: () => void;
}

interface InputsProps {
  onTypeUsername: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeRoomname: (e: React.ChangeEvent<HTMLInputElement>) => void;
  username: string;
}

interface EnterButtonProps {
  mode: Mode;
  onCreateRoom: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onJoinRoom: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function Logo() {
  return <div className={style.title}>WORDS BATTLE</div>;
}

function Tabs({ mode, onSelectCreate, onSelectJoin }: OptionsProps) {
  return (
    <div className={style.options}>
      <div
        className={
          mode === "create" ? `${style.option} ${style.selected}` : style.option
        }
        onClick={onSelectCreate}
      >
        CREATE ROOM
      </div>
      <div
        className={
          mode === "join" ? `${style.option} ${style.selected}` : style.option
        }
        onClick={onSelectJoin}
      >
        JOIN ROOM
      </div>
    </div>
  );
}

function Inputs({ onTypeUsername, onTypeRoomname, username }: InputsProps) {
  return (
    <div className={style.inputs}>
      <label>
        USERNAME:
        <input
          type="text"
          placeholder="username"
          onChange={onTypeUsername}
          value={username}
          required
        />
      </label>

      <label>
        ROOM:
        <input
          type="text"
          placeholder="room"
          onChange={onTypeRoomname}
          required
        />
      </label>
    </div>
  );
}

function EnterButton({ mode, onCreateRoom, onJoinRoom }: EnterButtonProps) {
  const isServerSlept = isServerSleeping();

  if (mode === "create") {
    return (
      <button type="submit" onClick={onCreateRoom} disabled={isServerSlept}>
        CREATE ROOM
      </button>
    );
  } else {
    return (
      <button type="submit" onClick={onJoinRoom} disabled={isServerSlept}>
        JOIN ROOM
      </button>
    );
  }
}

function ServerStatus() {
  const isServerSlept = isServerSleeping();

  return (
    <div className={isServerSlept ? style["server-off"] : style["server-on"]}>
      {isServerSlept
        ? "Sorry, free host, server is sleeping."
        : "Server is awake!"}
    </div>
  );
}

const StartForm = ({ user, joinRoom, createRoom, setUser, setRoom }: Props) => {
  const [mode, setMode] = useState<Mode>("create");
  const [woke, setWoke] = useState<boolean>(false);

  const handleTypeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ username: e.target.value, color: "", health: 100 });
  };

  const handleTypeRoomname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoom(e.target.value);
  };

  useEffect(() => {
    axios
      .get("https://words-battle-api.onrender.com/despertar")
      .then((_response) => {
        setWoke(!woke);
        sessionStorage.setItem("sleep", "false");
      })
      .catch((error) => {
        console.error("Error al despertar el servidor:", error);
        sessionStorage.setItem("sleep", "true");
      });
  }, []);

  return (
    <div className={style["start-form-background"]}>
      <form className={style["start-form"]}>
        <Logo />
        <Tabs
          mode={mode}
          onSelectCreate={() => setMode("create")}
          onSelectJoin={() => setMode("join")}
        />
        <Inputs
          username={user.username}
          onTypeUsername={handleTypeUsername}
          onTypeRoomname={handleTypeRoomname}
        />
        <EnterButton
          mode={mode}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
        />
        <ServerStatus />
      </form>
    </div>
  );
};

export default StartForm;
