import "./App.css";

import io, { Socket  as SocketType} from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Tile from './components/Tile';
import StartForm from './components/StartForm';

type Position = [number, number];
type Board = string[][];

// const socket = io("http://localhost:4000");
const socket = io("https://words-battle-api.onrender.com");

interface User {
	username: string,
	color: string,
	health: number
}

function App() {
	
	/* VARIABLES */

	const letters = "AAAAAAAAAAAAABCCCCCDDDDDDEEEEEEEEEEEEEEFGHIIIIIIJKLLLLLMMMNNNNNNNÑOOOOOOOOOPPPQRRRRRRRSSSSSSSSTTTTTUUUUVWXYZ";
	const damages: Record<string, number> = {
		"A": 1,
		"B": 8,
		"C": 4,
		"D": 2,
		"E": 1,
		"F": 16,
		"G": 16,
		"H": 16,
		"I": 2,
		"J": 32,
		"K": 64,
		"L": 4,
		"M": 4,
		"N": 2,
		"Ñ": 64,
		"O": 2,
		"P": 4,
		"Q": 16,
		"R": 2,
		"S": 2,
		"T": 4,
		"U": 4,
		"V": 16,
		"W": 120,
		"X": 64,
		"Y": 16,
		"Z": 32
	};

	const grid: (string)[][] = [
		[" "," "," "," "," "," "],
		[" "," "," "," "," "," "],
		[" "," "," "," "," "," "],
		[" "," "," "," "," "," "],
		[" "," "," "," "," "," "],
		[" "," "," "," "," "," "]
	];

	// SHARES STATES
	const [lastPosition, setLastPosition] = useState<Position>([-1,-1]);
	const [board,        setBoard]        = useState<Board>(grid);
	const [selection,    setSelection]    = useState<Position[] | undefined>(undefined);
	const [state,        setState]        = useState<boolean>(false);
	const [room,         setRoom]         = useState<string>("");
	const [userTurn,     setUserTurn]     = useState<User>({username: "", color:"", health: 0});
	const [host,         setHost]         = useState<User>({username: "", color:"", health: 0});
	const [guest,        setGuest]        = useState<User>({username: "", color:"", health: 0});

	// LOCAL STATES
	const [user,         setUser]         = useState<User>({username: "", color: "", health:0});
	const [startForm,    setStartForm]    = useState<boolean>(true);
	const [block,        setBlock]        = useState<boolean>(false);
	const [definitions,  setDefinitions]  = useState<({definitions: string, id:string})[]>([{definitions:"", id: ""}]);
	
	
	/** CONSOLE LOGS */

	console.log("=============================");

	// console.log("HOST", host);
	// console.log("GUEST", guest);
	console.log("USER TURN", userTurn);
	console.log("SELECTION", selection);
	console.log("DEFINITIOS", definitions);
	console.log("=============================");

	/** USE EFFECTS */

	

	useEffect(()=> {
		if (selection) {
			setBlock(true);
			let word = "";
			for (let i=0; i < selection.length; i++) {
				word = word + board[selection[i][1]][selection[i][0]];
			}

			axios.get(`https://www.wordreference.com/autocomplete?dict=eses&query=hola`)
				.then(res => {
					const lines = res.data.split('\n');
					console.log("LINES", lines);
				});
			
			
			

			const delayDebounceFn = setTimeout(()=> {
				axios.post("https://words-battle-api.onrender.com/search", {word})
					.then(res => {
						console.log("RES", res);
						setBlock(false);
						setDefinitions(res.data);
						console.log(res.data);
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
			console.log("NEXT ROUND USE EFFECT");
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
				console.log("PAYLOAD SETHOST", payload);
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
				console.log("NEXT ROUND USE EFFECT");
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

			setUserTurnAndEmit({...user, color: "lightgreen"}, user, room, socket);
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
	
				setUserTurnAndEmit({...user, color: "lightgreen"}, user, room, socket);
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

	/** FUNCIONES */

	const joinRoom = (e:React.MouseEvent<HTMLButtonElement>)=> {
		e.preventDefault();
		if (userTurn.color === "") {
			setUserTurn({...userTurn, color: "lightgreen"});
		}
		setStartForm(false);
		initializeBoard();
		setGuest({...user, color:"paleturquoise"});
		socket.emit("join room", {user, room, userTurn});
	};
	const createRoom = async(e:React.MouseEvent<HTMLButtonElement>)=> {
		socket.emit("create room", {user, room, userTurn});
		e.preventDefault();
		// setUserTurnAndEmit({...user, color: "lightgreen"}, user, room, socket);
		// initializeBoard();
		// setHost({...user, color:"lightgreen"});

		// setStartForm(false);
	};
	const getRandomLetter = (str: string)=> {
		return str.charAt(Math.floor(Math.random() * str.length));
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
		setStateAndEmit(true,user, room, socket);
		setBoardAndEmit(newBoard, user, room, socket);
	};
	const loadColumn = (col:number) : React.ReactNode[]=> {
		return board[col-1].map((char, i) => {
			return <Tile key={`${i},${col-1}`} tilePosition={[i, col - 1]} lastPosition={lastPosition} setLastPositionAndEmit={setLastPositionAndEmit} char={char} selection={selection} setSelectionAndEmit={setSelectionAndEmit} state={state} setStateAndEmit={setStateAndEmit} socket={socket} user={user} userTurn={userTurn} room={room} block={block}/>;
		});
	};
	const loadDefinitions = (defs:({definitions: string, id:string})[]) => {
	
		return defs.map((def, i) => (
			<div className="definition" key={i}>{def.definitions}</div>
		));
	};
	const selectedWord = (selection: Position[] | undefined): string=> {
		let word = "";
		if (selection) {
			for (let i=0; i < selection.length; i++) {
				const letter = board[selection[i][1]][selection[i][0]];
				word = word + letter;
			}
			return word;
		}
		return word;
	};
	const cancel = ():void => {
		setStateAndEmit(false,user, room, socket);
		setLastPositionAndEmit([-1,-1],user, room, socket);
		setSelectionAndEmit(undefined, user, room, socket);
	};
	const send = ()=> {

		if (block === true) {
			return;
		}

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
			hitHost(selection, socket, room);
			setUserTurnAndEmit({...host, color: "lightgreen"}, user, room, socket);
		}  else {
			hitGuest(selection, socket, room);
			setUserTurnAndEmit({...guest, color: "paleturquoise"}, user, room, socket);
		}
		setBoardAndEmit(newGrid,user,room, socket);
	};

	// SET AND EMIT

	const setLastPositionAndEmit = (position: Position, user: User, room: string, socket: SocketType)=> {
		setLastPosition(position);
		socket.emit("setLastPosition", {position, user, room});
	};
	const setStateAndEmit = (state: boolean, user: User, room: string, socket: SocketType)=> {
		setState(state);
		socket.emit("setState", {state, user, room});
	};
	const setSelectionAndEmit = (selection: Position[] | undefined, user: User, room: string, socket: SocketType)=> {
		setSelection(selection);
		socket.emit("setSelection", {selection, user, room});
	};
	const setBoardAndEmit = (board: Board, user: User, room: string, socket:SocketType)=> {
		setBoard(board);
		socket.emit("setBoard", {board, user, room});
	};
	const setUserTurnAndEmit = (userTurn: User, user:User, room:string, socket: SocketType)=> {
		socket.emit("setUserTurn", {userTurn, user, room});
		setUserTurn(userTurn);
	};
	const doNothing = ()=> {
		console.log("doing nothing");
	};
	const hitHost = (damage: Position[] | undefined, socket: SocketType, room: string)=> {
		if (damage) {
			let hit = 0;
			for (let i=0; i < damage.length; i++) {
				const letter = board[damage[i][1]][damage[i][0]];
				const daño = damages[letter];
				hit = hit + daño;
			}

			if ((host.health - hit) < 0) {
				setHost({...host, health: 0});
			} else {
				setHost({...host, health: host.health - hit});
			}

			// setHost({...host, health: host.health - hit});
			socket.emit("hit host", {room: room, damage: hit});
		}
		
	};
	const hitGuest = (damage: Position[] | undefined, socket: SocketType, room: string)=> {
		if (damage) {
			let hit = 0;
			for (let i=0; i < damage.length; i++) {
				const letter = board[damage[i][1]][damage[i][0]];
				const daño = damages[letter];
				hit = hit + daño;
			}

			if ((guest.health - hit) < 0) {
				setGuest({...guest, health: 0});
			} else {
				setGuest({...guest, health: guest.health - hit});
			}

			// setGuest({...guest, health: guest.health - hit});
			socket.emit("hit guest", {room: room, damage: hit});
		}
		
	};

	const nextRound = ()=> {
		socket.emit("next round", {no: "no"});
	};

	/** RENDER */

	const daño = ()=> {
		if (selection) {
			let hit = 0;
			for (let i=0; i < selection.length; i++) {
				const letter = board[selection[i][1]][selection[i][0]];
				const daño = damages[letter];
				hit = hit + daño;
			}

			return hit;
		}
	};

	const winner = ()=> {
		if (host.username === "" || guest.username === "") {
			return undefined;
		}

		if (host.health <= 0) return (<div>{`${guest.username} wins!`}</div>);
		if (guest.health <= 0) return (<div>{`${host.username} wins!`}</div>);
		return undefined;
	};
	
	return (
		<div className="App">
			{startForm && <div className='start-form-container'>
				<StartForm user={user} joinRoom={joinRoom} createRoom={createRoom} setUser={setUser} setRoom={setRoom}/>
			</div>}
			<div className="room-panel">
				<span>HOST: {host.username}</span><span>ROOM: {room}</span>
			</div>
			<div className="versus-panel">
				<div id="host" className="player-panel">
					<div className="player-health host-health">
						<div className="host-counter">{`${host.health}/100`}</div>
						<div style={{width: `${((100 - host.health)*100)/100}%`}} className="health-red"></div>
					</div>
				</div>
				<div id="guest" className="player-panel">
					<div className="player-health guest-health">
						<div className="guest-counter">{`${guest.health}/100`}</div>
						<div style={{width: `${((100 - guest.health)*100)/100}%`}} className="health-red"></div>
					</div>
				</div>
			</div>
			<div className={"names"}>
				<div className={"name host-name"}>{host.username} (host) 
					{((host.username === userTurn.username) || (userTurn.username === "")) && <span className="host-arrow arrow"></span>}
				</div>
				<div className={"name guest-name"}>
					{guest.username === userTurn.username && <span className="guest-arrow arrow"></span>}
					{guest.username !== "" && `${guest.username} (guest)`}
					{guest.username === "" && <div className="parpadeo">{"Waiting for a guest..."}</div>}
				</div>
			</div>
			<div className="damage-count">
				<div className="host-damage-count">
					<div>{host.username === userTurn.username && selectedWord(selection)}</div>
					<div className="daño">{host.username === userTurn.username && daño()}</div>
					
				</div>
				<div className="guest-damage-count">
					<div>{guest.username === userTurn.username && selectedWord(selection)}</div>
					{<div className="daño">{guest.username === userTurn.username && daño()}</div>}
				</div>
			</div>
			<div className="winner">
				{<div>{winner()}</div>}
			</div>
			<div className="playground">
				<div className='grid'>
					<span id='col-1' className='col'>
						{loadColumn(1)}
					</span>
					<span id='col-2' className='col'>
						{loadColumn(2)}
					</span>
					<span id='col-3' className='col'>
						{loadColumn(3)}
					</span>
					<span id='col-4' className='col'>
						{loadColumn(4)}
					</span>
					<span id='col-5' className='col'>
						{loadColumn(5)}
					</span>
					<span id='col-6' className='col'>
						{loadColumn(6)}
					</span>
					{/* <span id='col-7' className='col'>
						{loadColumn(7)}
					</span>
					<span id='col-8' className='col'>
						{loadColumn(8)}
					</span> */}
				</div>
				<div className="playground-actions">
					<div className="playground-button" onClick={(userTurn.username === user.username) && !(definitions[0].definitions === "no word found") && (selection && selection.length >=2) ? send : doNothing}>SEND</div>
					<div className="playground-button" onClick={userTurn.username === user.username? cancel : doNothing}>CANCEL</div>
					{winner() && <div className="playground-button" onClick={nextRound}>NEXT ROUND</div>}
				</div>
				<div className="playground-result">
					<div className="formed-word">{selectedWord(selection)}</div>
					<div className="definitions">
						{selection && loadDefinitions(definitions)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
