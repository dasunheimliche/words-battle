import React from "react";
import { User } from "../types/types";

interface RoomPanelProps {
    host: User
    reload: ()=>void
    room: string
}

const RoomPanel = ({host, reload, room} : RoomPanelProps)=> {

	return(
		<div className="room-panel">
			<span>HOST: {host.username}</span><span>ROOM: {room}</span>
			<span className="close" onClick={reload}>EXIT</span>
		</div>
	);
};

export default RoomPanel;