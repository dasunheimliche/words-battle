import React, { useState } from 'react';
import Tile from './components/Tile';

import "./App.css";

type position = [number, number];


// (COLUMNA, FILA)

function App() {
	const grid: (string)[][] = [
		["?","?","?","?","?","?","?"],
		["?","?","?","?","?","?","?","?"],
		["?","?","?","?","?","?","?"],
		["?","?","?","?","?","?","?","?"],
		["?","?","?","?","?","?","?"],
		["?","?","?","?","?","?","?","?"],
		["?","?","?","?","?","?","?"],
	];

	const [lastPosition, setLastPosition] = useState<position>([-1,-1]);
	const [board, setBoard] = useState<string[][]>(grid);
	const [selection, setSelection] = useState<position[] | undefined>(undefined);

	const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";


	function getRandomLetter(str: string) {
		return str.charAt(Math.floor(Math.random() * str.length));
	}

	const initializeBoard = ()=> {

		const newGrid = JSON.parse(JSON.stringify(grid));

		for (let i=0; i < newGrid.length; i++) {
			for (let b = 0; b< newGrid[i].length; b++) {
				const value = getRandomLetter(letters);
				newGrid[i][b] = value;
			}
		}
		setBoard(newGrid);
	};

	const loadColumn = (col:number) : React.ReactNode[]=> {
		return board[col-1].map((char, i) => {
			return <Tile key={`${i},${col-1}`} tilePosition={[i, col - 1]} lastPosition={lastPosition} setLastPosition={setLastPosition} char={char} selection={selection} setSelection={setSelection} />;
		});
	};



	const selectedWord = (selection: position[] | undefined): string=> {
		let word = "";
		if (selection) {
			for (let i=0; i < selection.length; i++) {
				word = word + board[selection[i][1]][selection[i][0]];
			}
			return word;
		}
		return word;
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
				<span id='col-4' className='col'>
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
			</div>
			<div className='set-board-button pointer' onClick={initializeBoard}>SET BOARD</div>
			<div className='current-tile'>{lastPosition}</div>
			<div className="current-selection">{selection}</div>
			<div className="formed-word">{selectedWord(selection)}</div>
		</div>
	);
}

export default App;
