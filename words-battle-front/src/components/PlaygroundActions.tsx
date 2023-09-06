import React from "react";
import { winner } from "../utils/functions";
import { User } from "../types/types";

interface PlaygroundActionsProps {
  host: User | null;
  guest: User | null;
  onStartNextRound: () => void;
  onSend: () => void;
  onCancel: () => void;
}

const PlaygroundActions = ({
  host,
  guest,
  onStartNextRound,
  onSend,
  onCancel,
}: PlaygroundActionsProps) => {
  return (
    <div className="playground-actions">
      <button className="playground-button" onClick={onSend}>
        SEND
      </button>
      <button className="playground-button" onClick={onCancel}>
        CANCEL
      </button>
      {winner(host, guest) && (
        <button className="playground-button" onClick={onStartNextRound}>
          NEXT ROUND
        </button>
      )}
    </div>
  );
};

export default PlaygroundActions;
