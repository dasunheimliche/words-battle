import React from 'react';
import { User } from '../types/types';

interface NamesPanelProps {
    host: User
    guest: User
    userTurn: User
}

const NamesPanel = ({host, guest, userTurn} : NamesPanelProps)=> {

	return(
		<div className={"names"}>
			<div className={"name host-name"}>{host.username} (host)
				{((host.username === userTurn.username) || (userTurn.username === "")) && <span className="host-arrow arrow"></span>}
			</div>
			<div className={"name guest-name"}>
				{guest.username === userTurn.username && <span className="guest-arrow arrow"></span>}
				{guest.username !== "" && `${guest.username} (guest)`}
				{guest.username === "" && <div className="waiting parpadeo">{"Waiting for a guest..."}</div>}
			</div>
		</div>
	);
};

export default NamesPanel;