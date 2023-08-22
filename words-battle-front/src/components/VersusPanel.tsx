import React from "react";

interface VersusPanelProps {
    hostHealth: number
    guestHealth: number
}

const VersusPanel = ({hostHealth, guestHealth} : VersusPanelProps)=> {

	return(
		<div className="versus-panel">
			<div id="host" className="player-panel">
				<div className="player-health host-health">
					<div className="host-counter">{`${hostHealth}/100`}</div>
					<div style={{width: `${((100 - hostHealth)*100)/100}%`}} className="health-red"></div>
				</div>
			</div>
			<div id="guest" className="player-panel">
				<div className="player-health guest-health">
					<div className="guest-counter">{`${guestHealth}/100`}</div>
					<div style={{width: `${((100 - guestHealth)*100)/100}%`}} className="health-red"></div>
				</div>
			</div>
		</div>
	);
};

export default VersusPanel;