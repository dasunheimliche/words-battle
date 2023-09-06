import { Dispatch } from "react";
import { Socket as SocketType } from "socket.io-client";
import { Position, Board, User } from "../types/types";

export const setLastPositionAndEmit = (
  position: Position,
  user: User | null,
  room: string,
  socket: SocketType,
  setLastPosition: Dispatch<Position>
) => {
  if (!user) return;
  setLastPosition(position);
  socket.emit("setLastPosition", { position, user, room });
};

export const setSelectionAndEmit = (
  selection: Position[] | undefined,
  user: User | null,
  room: string,
  socket: SocketType,
  setSelection: Dispatch<Position[] | undefined>
) => {
  setSelection(selection);
  socket.emit("setSelection", { selection, user, room });
};
