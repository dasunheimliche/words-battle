import React from "react";
import { User } from "../types/types";
import { reload } from "../utils/functions";

interface RoomPanelProps {
    host: User
    room: string
}

const RoomPanel = ({host, room} : RoomPanelProps)=> {

	return(
		<div className="room-panel">
			<span>HOST: {host.username}</span><span>ROOM: {room}</span>
			<span className="close" onClick={reload}>EXIT</span>
		</div>
	);
};

export default RoomPanel;