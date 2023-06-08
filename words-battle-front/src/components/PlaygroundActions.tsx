import React from "react";
import { doNothing, winner } from "../utils/functions";
import { User, Position } from "../types/types";

interface PlaygroundActionsProps {
    host: User
    guest: User
    user: User
    userTurn: User
    definitions: ({definitions: string, id:string})[]
    selection: Position[] | undefined
    nextRound: () => void
    send: () => void
    cancel: () => void
}

const PlaygroundActions = ({host, guest, user, userTurn, definitions, selection, nextRound, send, cancel} : PlaygroundActionsProps)=> {

	return(
		<div className="playground-actions">
			<div className="playground-button" onClick={(userTurn.username === user.username) && !(definitions[0].definitions === "no word found") && (selection && selection.length >=2) ? send : doNothing}>SEND</div>
			<div className="playground-button" onClick={userTurn.username === user.username? cancel : doNothing}>CANCEL</div>
			{winner(host, guest) && <div className="playground-button" onClick={nextRound}>NEXT ROUND</div>}
		</div>
	);
};

export default PlaygroundActions;