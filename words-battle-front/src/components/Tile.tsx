import React,{ useEffect, Dispatch, useState} from 'react';
import { Position, User } from '../types/types';
import { Socket  as SocketType} from 'socket.io-client';

interface TileProps {
    tilePosition: Position,
    lastPosition: Position,
    selection: Position[] | undefined,
    char:string,
	state: boolean,
	socket: SocketType,
	user: User,
	room: string,
	userTurn: User,
	guest: User,

	setSelection: Dispatch<Position[] | undefined>,
	setState: Dispatch<boolean>,
	setLastPosition: Dispatch<Position>,
	setSelectionAndEmit: (selection: Position[], user: User, room: string, socket: SocketType, setSelection: Dispatch<Position[] | undefined>) => void,
    setLastPositionAndEmit: (position: Position, user: User, room: string, socket: SocketType, setLastPosition: Dispatch<Position>) => void,
	setStateAndEmit: (state: boolean, user: User, room: string, socket: SocketType, setState: Dispatch<boolean>) => void

}

const Tile = ({guest, tilePosition, lastPosition, setLastPosition, setLastPositionAndEmit, char, selection, setSelection, setSelectionAndEmit, state, setState, setStateAndEmit, socket, user, userTurn, room}: TileProps)=> {
	const [position] = useState<Position>(tilePosition);
	const [check, setCheck] = useState<boolean>(false);

	useEffect(()=> {
		if (state === false) {
			setCheckAndEmit(false, socket, position, user, room);
		}
	},[state]);

	useEffect(()=> {
		socket.on("setCheck", payload => {
			if (position[0] === payload.position[0] && position[1] === payload.position[1]) {
				setCheck(payload.check);
			}
		});

		return ()=> {
			socket.off("setCheck", payload => {
				if (position[0] === payload.position[0] && position[1] === payload.position[1]) {
					setCheck(payload.check);
				}
			});
		};
	}, [check]);

	const setCheckAndEmit = (check: boolean, socket: SocketType, position: Position, user: User, room: string) => {
		setCheck(check);
		socket.emit("setCheck", {check, position, user, room});
	};
	const handleNewPosition = ():React.MouseEventHandler<HTMLDivElement> | undefined => {

		if ((lastPosition[0] === -1 && lastPosition[1] === -1)) {
			setLastPositionAndEmit(tilePosition, user, room, socket, setLastPosition);
			setCheckAndEmit(true, socket, position, user, room);
			setStateAndEmit(true, user, room, socket, setState);
			if (selection) {
				setSelectionAndEmit([...selection, tilePosition], user, room, socket, setSelection);
			} else {
				setSelectionAndEmit([tilePosition], user, room, socket, setSelection);
			}
			return;
		}

		if (!isClickeable()) {
			return;
		}

		setLastPositionAndEmit(tilePosition, user, room, socket, setLastPosition);
		setCheckAndEmit(true, socket, position, user, room);
		setStateAndEmit(true, user, room, socket, setState);
		if (selection) {
			setSelectionAndEmit([...selection, tilePosition], user, room, socket, setSelection);
		} else {
			setSelectionAndEmit([tilePosition], user, room, socket, setSelection);
		}
        
	};
	const isClickeable = ():boolean=> {
		if (guest.username === "") {
			return false;
		}

		if ((position[0] <= lastPosition[0]+1 && position[0] >= lastPosition[0] - 1) && (position[1] <= lastPosition[1] + 1 && position[1] >= lastPosition[1] - 1)) {
			return true;
		}
		return false;
	};
	const doNothing = ()=> {
		return;
	};

	return (
		<div style={check? {backgroundColor: userTurn.color} : {backgroundColor: "rgb(142,163,145)"}} className='item pointer' onClick={userTurn.username === user.username? !check? handleNewPosition : doNothing : doNothing}>{char}</div>
	);
};

export default Tile;