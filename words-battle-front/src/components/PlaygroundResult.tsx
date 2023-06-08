import React from "react";
import { loadDefinitions } from "../utils/functions";
import { Position, Board } from "../types/types";

interface PlaygroundResultProps {
    selectedWord: (selection: Position[] | undefined, board: Board) => string
    selection: Position[] | undefined
    board: Board
    definitions: ({definitions: string, id:string})[]
}

const PlaygroundResult = ({selectedWord, selection, board, definitions } : PlaygroundResultProps)=> {

	return(
		<div className="playground-result">
			<div className="formed-word">{selectedWord(selection, board)}</div>
			<div className="definitions">
				{selection && loadDefinitions(definitions)}
			</div>
		</div>
	);
};

export default PlaygroundResult;