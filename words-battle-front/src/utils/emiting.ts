
import { Dispatch } from 'react';
import { Socket  as SocketType} from 'socket.io-client';
import { Position, Board, User } from '../types/types';
import { daño } from './functions';

export const setLastPositionAndEmit = (position: Position, user: User, room: string, socket: SocketType, setLastPosition: Dispatch<Position>)=> {
	setLastPosition(position);
	socket.emit("setLastPosition", {position, user, room});
};

export const setStateAndEmit = (state: boolean, user: User, room: string, socket: SocketType, setState: Dispatch<boolean>)=> {
	setState(state);
	socket.emit("setState", {state, user, room});
};

export const setSelectionAndEmit = (selection: Position[] | undefined, user: User, room: string, socket: SocketType, setSelection: Dispatch<Position[] | undefined>)=> {
	setSelection(selection);
	socket.emit("setSelection", {selection, user, room});
};

export const setBoardAndEmit = (board: Board, user: User, room: string, socket:SocketType, setBoard: Dispatch<Board>)=> {
	setBoard(board);
	socket.emit("setBoard", {board, user, room});
};

export const setUserTurnAndEmit = (userTurn: User, user:User, room:string, socket: SocketType, setUserTurn: Dispatch<User>)=> {
	socket.emit("setUserTurn", {userTurn, user, room});
	setUserTurn(userTurn);
};

export const hitHost = (damage: Position[] | undefined, socket: SocketType, room: string, damages: Record<string, number>, board: Board, host: User, setHost: Dispatch<User>)=> {
	if (!damage) return;
	const hit = daño(damage, board, damages);
	if (!hit) return;

	setHost({ ...host, health: Math.max(0, host.health - hit) });
	socket.emit("hit host", { room: room, damage: hit });
    
};

export const hitGuest = (damage: Position[] | undefined, socket: SocketType, room: string, damages: Record<string, number>, board: Board, guest: User, setGuest: Dispatch<User>)=> {
	if (!damage) return;
	const hit = daño(damage, board, damages);
	if (!hit) return;

	setGuest({ ...guest, health: Math.max(0, guest.health - hit) });
	socket.emit("hit guest", { room: room, damage: hit });
    
};