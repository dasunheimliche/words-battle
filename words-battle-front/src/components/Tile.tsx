import React,{ useEffect} from 'react';
import { Socket  as SocketType} from 'socket.io-client';
import {useState} from 'react';

type Position = [number, number];


interface props {
    tilePosition: Position,
    lastPosition: Position,
    selection: Position[] | undefined,
    setSelectionAndEmit: (selection: Position[], socket: SocketType) => void,
    char:string,
    setLastPositionAndEmit: (position: Position, socket: SocketType) => void,
	state: boolean,
	setStateAndEmit: (state: boolean, socket: SocketType) => void;
	socket: SocketType;
}

const Tile = ({tilePosition, lastPosition, setLastPositionAndEmit, char, selection, setSelectionAndEmit, state, setStateAndEmit, socket}: props)=> {
	const [position] = useState<Position>(tilePosition);
	const [check, setCheck] = useState<boolean>(false);

	useEffect(()=> {
		if (state === false) {
			setCheckAndEmit(false, socket, position);
		}
	},[state]);

	useEffect(()=> {
		socket.on("setCheck", check => {
			if (position[0] === check.position[0] && position[1] === check.position[1]) {
				setCheck(check.check);
			}
		});

		return ()=> {
			socket.on("setCheck", check => {
				if (position[0] === check.position[0] && position[1] === check.position[1]) {
					setCheck(check.check);
				}
			});
		};
	}, [check]);

	const setCheckAndEmit = (check: boolean, socket: SocketType, position: Position) => {
		setCheck(check);
		socket.emit("setCheck", {check, position});
	};


	const handleNewPosition = ():React.MouseEventHandler<HTMLDivElement> | undefined => {

		if ((lastPosition[0] === -1 && lastPosition[1] === -1)) {
			console.log("CLICKEABLE");
			setLastPositionAndEmit(tilePosition, socket);
			setCheckAndEmit(true, socket, position);
			setStateAndEmit(true, socket);
			if (selection) {
				setSelectionAndEmit([...selection, tilePosition], socket);
			} else {
				setSelectionAndEmit([tilePosition], socket);
			}
			return;
		}

		if (!isClickeable()) {
			return;
		}

		setCheckAndEmit(true, socket, position);

		setLastPositionAndEmit(tilePosition, socket);
		setStateAndEmit(true, socket);
		if (selection) {
			setSelectionAndEmit([...selection, tilePosition], socket);
		} else {
			setSelectionAndEmit([tilePosition], socket);
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
		<div style={check? {backgroundColor: "pink"} : {backgroundColor: "white"}} className='item' onClick={!check? handleNewPosition : doNothing}>{char}</div>
	);
};

export default Tile;