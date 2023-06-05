import React from "react";
import { User } from "../types/types";

interface VersusPanelProps {
    host: User
    guest: User
}

const VersusPanel = ({host, guest} : VersusPanelProps)=> {

	return(
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
	);
};

export default VersusPanel;