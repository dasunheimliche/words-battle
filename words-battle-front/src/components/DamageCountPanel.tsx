import React from "react";
import { winner, selectedWord, daño } from "../utils/functions";
import { Position, User, Board } from "../types/types";
import { damages } from "../utils/variables";

interface DamageCountProps {
    host: User
    guest: User
    userTurn: User
    selection: Position[] | undefined
    board: Board
}

const DamageCountPanel = ({host, guest, userTurn, selection, board } : DamageCountProps)=> {

	return(
		<div className="damage-count">
			{!winner(host, guest) && <div className="host-damage-count">
				<div>{host.username === userTurn.username && selectedWord(selection, board)}</div>
				<div className="daño">{host.username === userTurn.username && daño(selection, board, damages)}</div>
			</div>}
			{!winner(host, guest) && <div className="guest-damage-count">
				<div>{guest.username === userTurn.username && selectedWord(selection, board)}</div>
				{<div className="daño">{guest.username === userTurn.username && daño(selection, board, damages)}</div>}
			</div>}
			{winner(host, guest) && <div className="winner">
				{<div>{winner(host, guest)}</div>}
			</div>}
		</div>
	);
};

export default DamageCountPanel;