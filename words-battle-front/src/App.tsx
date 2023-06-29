import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

import { 
	setLastPositionAndEmit, 
	setStateAndEmit, 
	setSelectionAndEmit, 
	setBoardAndEmit, 
	setUserTurnAndEmit, 
	hitHost, 
	hitGuest 
} from '../src/utils/emiting';

import { getRandomLetter, selectedWord, searchDefs} from '../src/utils/functions';
import { letters, damages, grid } from './utils/variables';
import { Position, Board, User, Definitions } from './types/types';

import RoomPanel         from './components/RoomPanel';
import VersusPanel       from './components/VersusPanel';
import Tile              from './components/Tile';
import StartForm         from './components/StartForm';
import NamesPanel        from './components/NamesPanel';
import DamageCountPanel  from './components/DamageCountPanel';
import Grid              from './components/Grid';
import PlaygroundActions from './components/PlaygroundActions';
import PlaygroundResult  from './components/PlaygroundResult';

import "./App.css";

// const socket = io("http://localhost:4000");
const socket = io("https://words-battle-api.onrender.com");

function App() {
	
	//** SHARED STATES
	const [lastPosition, setLastPosition] = useState<Position>([-1,-1]);
	const [board,        setBoard]        = useState<Board>(grid);
	const [selection,    setSelection]    = useState<Position[] | undefined>(undefined);
	const [state,        setState]        = useState<boolean>(false);
	const [room,         setRoom]         = useState<string>("");
	const [userTurn,     setUserTurn]     = useState<User>({username: "", color:"", health: 0});
	const [host,         setHost]         = useState<User>({username: "", color:"", health: 0});
	const [guest,        setGuest]        = useState<User>({username: "", color:"", health: 0});

	//** LOCAL STATES
	const [user,         setUser]         = useState<User>({username: "", color: "", health:0});
	const [startForm,    setStartForm]    = useState<boolean>(true);
	const [block,        setBlock]        = useState<boolean>(false);
	const [definitions,  setDefinitions]  = useState<Definitions>([{definitions:"", id: ""}]);
	
	//** USE EFFECTS

	useEffect(()=> {
		setDefinitions([{definitions:"", id: ""}]);
		if (selection) {
			setBlock(true);

			const delayDebounceFn = setTimeout(()=> {

				searchDefs(selection, board, setBlock)
					.then(res=> {
						if (!res) {
							return;
						}
						setBlock(false);
						setDefinitions(res);
					});
			}, 500);

			return ()=> clearTimeout(delayDebounceFn);
		}
		
	},[selection]);

	useEffect(()=> {
		socket.on("setBoard", payload => {
			setBoard(payload.board);
		});
		socket.on("setLastPosition", payload=> {
			setLastPosition(payload.position);
		});
		socket.on("setSelection", payload=> {
			setSelection(payload.selection);
		});
		socket.on("setState", payload => {
			setState(payload.state);
		});
		socket.on("setUserTurn", payload => {
			setUserTurn(payload.userTurn);
		});
		socket.on("setHost", payload=> {
			setHost(payload.host);
		});
		socket.on("hit host", damage => {
			setDefinitions([{definitions:"", id: ""}]);
			if ((host.health - damage) < 0) {
				setHost({...host, health: 0});
			} else {
				setHost({...host, health: host.health - damage});
			}
		});
		socket.on("hit guest", damage => {
			setDefinitions([{definitions:"", id: ""}]);
			if ((guest.health - damage) < 0) {
				setGuest({...guest, health: 0});
			} else {
				setGuest({...guest, health: guest.health - damage});
			}

		});

		socket.on("next round", () => {
			setHost({...host, health:100});
			setGuest({...guest, health:100});

		});

		return ()=> {
			socket.off("setBoard", payload => {
				setBoard(payload.board);
			});
			socket.off("setLastPosition", payload=> {
				setLastPosition(payload.lastPosition);
			});
			socket.off("setSelection", payload=> {
				setSelection(payload.selection);
			});
			socket.off("setState", payload => {
				setState(payload.state);
			});
			socket.off("setUserTurn", payload => {
				setUserTurn(payload.userTurn);
			});
			socket.off("setHost", payload=> {
				setHost(payload.host);
			});
			socket.off("hit host", damage => {
				setDefinitions([{definitions:"", id: ""}]);
				if (host.health - damage < 0) {
					setHost({...host, health: 0});
				} else {
					setHost({...host, health: host.health - damage});
				}
			});
			socket.off("hit guest", damage => {
				setDefinitions([{definitions:"", id: ""}]);
				if (guest.health - damage < 0) {
					setGuest({...guest, health: 0});
				} else {
					setGuest({...guest, health: guest.health - damage});
				}
			});
			socket.off("next round", () => {
				setHost({...host, health:100});
				setGuest({...guest, health:100});

			});
		};
	},[board, lastPosition, selection, state, userTurn]);

	useEffect(()=> {
		socket.on("create room error", ()=> {
			setStartForm(true);
		});
		socket.on("create room success", ()=> {
			setStartForm(false);

			setUserTurnAndEmit({...user, color: "lightgreen"}, user, room, socket, setUserTurn);
			initializeBoard();
			setHost({...user, color:"lightgreen"});
		});
		socket.on("join room", payload => {
			if (host.username !== "") {
				socket.emit("setHost", {host, room});
			}
			setGuest(payload.user);
		});

		return ()=> {
			socket.off("create room error", ()=> {
				setStartForm(true);
			});
			socket.off("create room success", ()=> {
				setStartForm(false);
	
				setUserTurnAndEmit({...user, color: "lightgreen"}, user, room, socket, setUserTurn);
				initializeBoard();
				setHost({...user, color:"lightgreen"});
			});
			socket.off("join room", payload => {
				if (host.username !== "") {
					socket.emit("setHost", {host, room});
				}
				setGuest(payload.user);
			});
		};
	});

	useEffect(()=> {
		window.scrollTo({top: 0, left: 0});
	}, [startForm]);

	//** FUNCIONES

	const joinRoom = (e:React.MouseEvent<HTMLButtonElement>)=> {
		e.preventDefault();
		if (room.length <= 0 || user.username.length <= 0) return;
		
		if (userTurn.color === "") {
			setUserTurn({...userTurn, color: "lightgreen"});
		}
		setStartForm(false);
		initializeBoard();
		setGuest({...user, color:"paleturquoise"});
		socket.emit("join room", {user, room, userTurn});
	};
	const createRoom = async(e:React.MouseEvent<HTMLButtonElement>)=> {
		e.preventDefault();
		if (room.length <= 0 || user.username.length <= 0) return;
		
		socket.emit("create room", {user, room, userTurn});
	};
	const initializeBoard = ()=> {

		const newBoard = JSON.parse(JSON.stringify(grid));

		for (let i=0; i < newBoard.length; i++) {
			for (let b = 0; b< newBoard[i].length; b++) {
				const value = getRandomLetter(letters);
				newBoard[i][b] = value;
			}
		}
		socket.emit("setBoard", newBoard);
		setStateAndEmit(true,user, room, socket, setState);
		setBoardAndEmit(newBoard, user, room, socket, setBoard);
	};
	const loadColumn = (col:number) : React.ReactNode[]=> {
		return board[col-1].map((char, i) => {
			return <Tile key={`${i},${col-1}`} tilePosition={[i, col - 1]} lastPosition={lastPosition} setLastPosition={setLastPosition} setLastPositionAndEmit={setLastPositionAndEmit} char={char} selection={selection} setSelection={setSelection} setSelectionAndEmit={setSelectionAndEmit} state={state} setState={setState} setStateAndEmit={setStateAndEmit} socket={socket} user={user} userTurn={userTurn} room={room} guest={guest}/>;
		});
	};
	const cancel = ():void => {
		setStateAndEmit(false,user, room, socket, setState);
		setLastPositionAndEmit([-1,-1],user, room, socket, setLastPosition);
		setSelectionAndEmit(undefined, user, room, socket, setSelection);
	};
	const send = ()=> {

		if (block === true) return;
		

		setDefinitions([{definitions:"", id: ""}]);
		cancel();

		const newGrid = JSON.parse(JSON.stringify(board));
		if (selection) {
			for (const pos of selection) {
				newGrid[pos[1]].splice(pos[0], 1);
				const newLetter = getRandomLetter(letters);
				newGrid[pos[1]].unshift(newLetter);
			}
		}
		if (userTurn.username === guest.username) {
			hitHost(selection, socket, room, damages, board, host, setHost);
			setUserTurnAndEmit({...host, color: "lightgreen"}, user, room, socket, setUserTurn);
		}  else {
			hitGuest(selection, socket, room, damages, board, guest, setGuest);
			setUserTurnAndEmit({...guest, color: "paleturquoise"}, user, room, socket, setUserTurn);
		}
		setBoardAndEmit(newGrid,user,room, socket, setBoard);
	};
	const nextRound = ()=> {
		socket.emit("next round", {no: "no"});
	};

	if (startForm) {
		return <StartForm user={user} joinRoom={joinRoom} createRoom={createRoom} setUser={setUser} setRoom={setRoom}/>;
	} else {
		return (
			<div className={"App scanlines"}>
				<RoomPanel   host={host} room={room} />
				<VersusPanel host={host} guest={guest} />
				<NamesPanel  host={host} guest={guest} userTurn={userTurn} />
				<DamageCountPanel 
					host      = {host} 
					guest     = {guest} 
					userTurn  = {userTurn} 
					selection = {selection} 
					board     = {board}  
				/>
	
				<div className="playground">
					<Grid loadColumn={loadColumn} />
					<PlaygroundActions 
						host        = {host} 
						guest       = {guest} 
						user        = {user} 
						userTurn    = {userTurn} 
						definitions = {definitions} 
						selection   = {selection} 
						nextRound   = {nextRound} 
						send        = {send} 
						cancel      = {cancel} />
					<PlaygroundResult 
						selectedWord = {selectedWord} 
						selection    = {selection} 
						board        = {board} 
						definitions  = {definitions} 
					/>
				</div>
			</div>
		);
	}
}

export default App;
