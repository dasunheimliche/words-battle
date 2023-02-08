import io, { Socket  as SocketType} from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import Tile from './components/Tile';
import "./App.css";

type Position = [number, number];

const socket = io("http://localhost:4000");

// interface User {
// 	username: string,
// 	color: string,
// }

// (COLUMNA, FILA)

function App() {
	
	const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

	// const grid: (string)[][] = [
	// 	[" "," "," "," "," "," "," "," "],
	// 	[" "," "," "," "," "," "," "," "],
	// 	[" "," "," "," "," "," "," "," "],
	// 	[" "," "," "," "," "," "," "," "],
	// 	[" "," "," "," "," "," "," "," "],
	// 	[" "," "," "," "," "," "," "," "],
	// 	[" "," "," "," "," "," "," "," "],
	// 	[" "," "," "," "," "," "," "," "]
	// ];

	const grid: (string)[][] = [
		[" "," "," "],
		[" "," "," "],
		[" "," "," "],
	];

	const [lastPosition, setLastPosition] = useState<Position>([-1,-1]);
	const [board,        setBoard]        = useState<string[][]>(grid);
	const [selection,    setSelection]    = useState<Position[] | undefined>(undefined);
	const [state,        setState]        = useState<boolean>(false);

	console.log("LASTPOSITION ", lastPosition);
	console.log("BOARD ", board);
	console.log("SELECTION ", selection);
	console.log("STATE ", state);

	// const [user,         setUser]         = useState<User>({username:"", color: ""});

	useEffect(()=> {
		socket.on("setBoard", newBoard => {
			console.log("BOARD RECEIVEN FROM THE BACKEND");
			setBoard(newBoard);
		});
		socket.on("setLastPosition", lastPosition=> {
			console.log("LASTPOSITION RECEIVEN FROM THE BACKEND");
			setLastPosition(lastPosition);
		});
		socket.on("setSelection", selection=> {
			console.log("SELECTION RECEIVEN FROM THE BACKEND");
			setSelection(selection);
		});
		socket.on("setState", state => {
			console.log("STATE RECEIVEN FROM THE BACKEND");
			setState(state);
		});

		return ()=> {
			console.log("RETURN");
			socket.off("setBoard", newBoard => {
				setBoard(newBoard);
			});
			socket.off("setLastPosition", lastPosition=> {
				setLastPosition(lastPosition);
			});
			socket.off("setSelection", selection=> {
				setSelection(selection);
			});
			socket.off("setState", state => {
				setState(state);
			});
		};
	},[board, lastPosition, selection, state]);


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
		setStateAndEmit(true, socket);
		setBoardAndEmit(newBoard, socket);
	};
	const loadColumn = (col:number) : React.ReactNode[]=> {
		return board[col-1].map((char, i) => {
			return <Tile key={`${i},${col-1}`} tilePosition={[i, col - 1]} lastPosition={lastPosition} setLastPositionAndEmit={setLastPositionAndEmit} char={char} selection={selection} setSelectionAndEmit={setSelectionAndEmit} state={state} setStateAndEmit={setStateAndEmit} socket={socket}/>;
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
		setStateAndEmit(false, socket);
		setLastPositionAndEmit([-1,-1], socket);
		setSelectionAndEmit(undefined, socket);
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
		setBoardAndEmit(newGrid, socket);
	};


	// SET AND EMIT
	const setLastPositionAndEmit = (position: Position, socket: SocketType)=> {
		setLastPosition(position);
		socket.emit("setLastPosition", position);
	};
	const setStateAndEmit = (state: boolean, socket: SocketType)=> {
		setState(state);
		socket.emit("setState", state);
	};
	const setSelectionAndEmit = (selection: Position[] | undefined, socket: SocketType)=> {
		setSelection(selection);
		socket.emit("setSelection", selection);
	};
	const setBoardAndEmit = (board: string[][], socket: SocketType)=> {
		setBoard(board);
		socket.emit("setBoard", board);
	};
	
	return (
		<div className="App">
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
				{/* <span id='col-4' className='col'>
					{loadColumn(4)}
				</span>
				<span id='col-5' className='col'>
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
			<div className='line set-board-button pointer' onClick={initializeBoard}>SET BOARD</div>
			<div className='line current-tile'>{lastPosition}</div>
			<div className="line current-selection">{selection}</div>
			<div className="line formed-word">{selectedWord(selection)}</div>
			<div className="line send" onClick={send}>SEND</div>
			<div className="line cancel" onClick={cancel}>CANCEL</div>
		</div>
	);
}

export default App;
