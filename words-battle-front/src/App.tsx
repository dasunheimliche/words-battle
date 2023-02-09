import io, { Socket  as SocketType} from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import Tile from './components/Tile';
import StartForm from './components/StartForm';
import "./App.css";

type Position = [number, number];
type Board = string[][];

const socket = io("http://localhost:4000");

interface User {
	username: string,
	color: string,
}

// (COLUMNA, FILA)

function App() {
	
	const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

	const grid: (string)[][] = [
		[" "," "," ", " "],
		[" "," "," ", " "],
		[" "," "," ", " "],
		[" "," "," ", " "],
	];

	// SHARES STATES
	const [lastPosition, setLastPosition] = useState<Position>([-1,-1]);
	const [board,        setBoard]        = useState<Board>(grid);
	const [selection,    setSelection]    = useState<Position[] | undefined>(undefined);
	const [state,        setState]        = useState<boolean>(false);
	const [room,         setRoom]         = useState<string>("");
	const [userTurn,     setUserTurn]     = useState<string>("");
	const [host,         setHost]         = useState<User>({username: "", color:""});
	const [guest,        setGuest]        = useState<User>({username: "", color: ""});

	// LOCAL STATES
	const [user,         setUser]         = useState<User>({username: "", color: ""});
	const [startForm,    setStartForm]    = useState<boolean>(true);
	
	console.log("=============================");
	// console.log("LASTPOSITION ", lastPosition);
	// console.log("BOARD ", board);
	// console.log("SELECTION ", selection);
	// console.log("STATE ", state);
	// console.log("ROOM", room);
	console.log("USER TURN", userTurn);
	console.log("HOST", host);
	console.log("GUEST", guest);
	// console.log("USER", user);
	// console.log("STARTFORM", startForm);
	// console.log("=============================");

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



		// socket.on("setHost", payload=> {
		// 	console.log("PAYLOAD SETHOST", payload);
		// 	setHost(payload.host);
		// });

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
				setUserTurn(payload.user.username);
			});


			socket.on("setHost", payload=> {
				console.log("PAYLOAD SETHOST", payload);
				setHost(payload.host);
			});
		};
	},[board, lastPosition, selection, state, userTurn]);

	useEffect(()=> {
		socket.on("join room", payload => {
			console.log("SET HOST", host, room);
			if (host.username !== "") {
				socket.emit("setHost", {host, room});
			}
			setGuest(payload.user);
		});
		return ()=> {
			socket.off("join room", payload => {
				console.log("SET HOST", host, room);
				setGuest(payload.user);
			});
		};
	});

	const joinRoom = (e:React.MouseEvent<HTMLButtonElement>)=> {
		e.preventDefault();
		setStartForm(false);
		initializeBoard();
		setGuest(user);
		socket.emit("join room", {user, room, userTurn});
	};
	const createRoom = (e:React.MouseEvent<HTMLButtonElement>)=> {
		e.preventDefault();
		setUserTurnAndEmit(user.username, user, room, socket);
		setStartForm(false);
		initializeBoard();
		setHost(user);
		socket.emit("create room", {user, room, userTurn});
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
			return <Tile key={`${i},${col-1}`} tilePosition={[i, col - 1]} lastPosition={lastPosition} setLastPositionAndEmit={setLastPositionAndEmit} char={char} selection={selection} setSelectionAndEmit={setSelectionAndEmit} state={state} setStateAndEmit={setStateAndEmit} socket={socket} user={user} userTurn={userTurn} room={room}/>;
		});
	};
	const selectedWord = (selection: Position[] | undefined): string=> {
		let word = "";
		if (selection) {
			for (let i=0; i < selection.length; i++) {
				word = word + board[selection[i][1]][selection[i][0]];
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
		cancel();

		const newGrid = JSON.parse(JSON.stringify(board));
		if (selection) {
			for (const pos of selection) {
				newGrid[pos[1]].splice(pos[0], 1);
				const newLetter = getRandomLetter(letters);
				newGrid[pos[1]].unshift(newLetter);
			}
		}
		if (userTurn === guest.username) {
			setUserTurnAndEmit(host.username, user, room, socket);
		}  else {
			setUserTurnAndEmit(guest.username, user, room, socket);
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
	const setUserTurnAndEmit = (userTurn: string, user:User, room:string, socket: SocketType)=> {
		socket.emit("setUserTurn", {userTurn, user, room});
		setUserTurn(userTurn);
	};
	const doNothing = ()=> {
		console.log("doing nothing");
	};
	
	return (
		<div className="App">
			{startForm && <div className='start-form-container'>
				<StartForm user={user} joinRoom={joinRoom} createRoom={createRoom} setUser={setUser} setRoom={setRoom}/>
			</div>}
			<div>{user.username}</div>
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
				{/* <span id='col-5' className='col'>
					{loadColumn(5)}
				</span>
				<span id='col-6' className='col'>
					{loadColumn(6)}
				</span>
				<span id='col-7' className='col'>
					{loadColumn(7)}
				</span>
				<span id='col-8' className='col'>
					{loadColumn(8)}
				</span> */}
			</div>
			{/* <div className='line set-board-button pointer' onClick={initializeBoard}>SET BOARD</div> */}
			<div className="line formed-word">{selectedWord(selection)}</div>
			<div className="line send" onClick={userTurn === user.username? send : doNothing}>SEND</div>
			<div className="line cancel" onClick={userTurn === user.username? cancel : doNothing}>CANCEL</div>
		</div>
	);
}

export default App;
