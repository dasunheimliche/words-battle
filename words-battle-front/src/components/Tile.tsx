import React,{ useEffect} from 'react';
import { Socket  as SocketType} from 'socket.io-client';
import {useState} from 'react';

type Position = [number, number];
interface User {
	username: string,
	color: string,
	health: number,
}

interface TileProps {
    tilePosition: Position,
    lastPosition: Position,
    selection: Position[] | undefined,
    setSelectionAndEmit: (selection: Position[], user: User, room: string, socket: SocketType) => void,
    char:string,
    setLastPositionAndEmit: (position: Position, user: User, room: string, socket: SocketType) => void,
	state: boolean,
	setStateAndEmit: (state: boolean, user: User, room: string, socket: SocketType) => void,
	socket: SocketType,
	user: User,
	room: string,
	userTurn: User,
	block: boolean,
}

const Tile = ({tilePosition, lastPosition, setLastPositionAndEmit, char, selection, setSelectionAndEmit, state, setStateAndEmit, socket, user, userTurn, room, block}: TileProps)=> {
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
			console.log("CLICKEABLE");
			setLastPositionAndEmit(tilePosition, user, room, socket);
			setCheckAndEmit(true, socket, position, user, room);
			setStateAndEmit(true, user, room, socket);
			if (selection) {
				setSelectionAndEmit([...selection, tilePosition], user, room, socket);
			} else {
				setSelectionAndEmit([tilePosition], user, room, socket);
			}
			return;
		}

		if (!isClickeable()) {
			return;
		}

		setLastPositionAndEmit(tilePosition, user, room, socket);
		setCheckAndEmit(true, socket, position, user, room);
		setStateAndEmit(true, user, room, socket);
		if (selection) {
			setSelectionAndEmit([...selection, tilePosition], user, room, socket);
		} else {
			setSelectionAndEmit([tilePosition], user, room, socket);
		}
        
	};
	const isClickeable = ():boolean=> {
		if ((position[0] <= lastPosition[0]+1 && position[0] >= lastPosition[0] - 1) && (position[1] <= lastPosition[1] + 1 && position[1] >= lastPosition[1] - 1)) {
			console.log("CLICKEABLE");
			return true;
		}
		console.log("NOT CLICKEABLE");
		return false;
	};
	const doNothing = ()=> {
		return;
	};

	return (
		<div style={check? {backgroundColor: userTurn.color} : {backgroundColor: "white"}} className='item pointer' onClick={userTurn.username === user.username? !check? handleNewPosition : doNothing : doNothing}>{char}</div>
	);
};

export default Tile;