import React, { Dispatch } from "react";
import { Position, User } from "../types/types";
import { Socket as SocketType } from "socket.io-client";
import { isClickeable } from "../utils/functions";

interface TileProps {
  onClickTile: any;
  isChecked: boolean | undefined;
  isTileDisabled: boolean | undefined;
  char: string;
  userTurn: User | null;
}

export default function Tile({
  char,
  userTurn,
  onClickTile,
  isChecked,
  isTileDisabled,
}: TileProps) {
  return (
    <button
      style={
        isChecked
          ? { backgroundColor: userTurn?.color }
          : { backgroundColor: "rgb(142,163,145)" }
      }
      className="item pointer"
      onClick={onClickTile}
      disabled={isTileDisabled}
    >
      {char}
    </button>
  );
}
