import React from "react";
import { reload } from "../utils/functions";

interface RoomPanelProps {
  host: string;
  room: string;
}

const RoomPanel = ({ host, room }: RoomPanelProps) => {
  return (
    <div className="room-panel">
      <span>HOST: {host}</span>
      <span>ROOM: {room}</span>
      <span className="close" onClick={reload}>
        EXIT
      </span>
    </div>
  );
};

export default RoomPanel;
