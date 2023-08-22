import React from "react";
import { winner } from "../utils/functions";
import { User, Position } from "../types/types";

interface PlaygroundActionsProps {
    host: User
    guest: User
    user: User
    userTurn: User
    definitions: ({definitions: string, id:string})[]
    selection: Position[] | undefined
    onStartNextRount: () => void
    onSend: () => void
    onCancel: () => void
}

const PlaygroundActions = ({host, guest, user, userTurn, definitions, selection, onStartNextRount, onSend, onCancel} : PlaygroundActionsProps)=> {

	const isButtonEnabled = (userTurn.username === user.username) && !(definitions[0].definitions === "no word found") && (selection && selection.length >=2);
	const isMyTurn = userTurn.username === user.username;

	return(
		<div className="playground-actions">
			<button className="playground-button" onClick={onSend} disabled={!isButtonEnabled}>SEND</button>
			<button className="playground-button" onClick={onCancel} disabled={!isMyTurn}>CANCEL</button>
			{winner(host, guest) && <button className="playground-button" onClick={onStartNextRount}>NEXT ROUND</button>}
		</div>
	);
};

export default PlaygroundActions;