import React from "react";
import { winner, selectedWord, daño } from "../utils/functions";
import { Position, User, Board } from "../types/types";
import { damages } from "../utils/variables";

interface DamageCountProps {
  host: User | null;
  guest: User | null;
  userTurn: User | null;
  selection: Position[] | undefined;
  board: Board;
}

const DamageCountPanel = ({
  host,
  guest,
  userTurn,
  selection,
  board,
}: DamageCountProps) => {
  const sessionWinner: string | undefined = winner(host, guest);
  const isGuestTurn = guest?.username === userTurn?.username;
  const isHostTurn = guest?.username !== userTurn?.username;

  return (
    <div className="damage-count">
      {!sessionWinner && (
        <div className="host-damage-count">
          <div>{isHostTurn && selectedWord(selection, board)}</div>
          <div className="daño">
            {isHostTurn && daño(selection, board, damages)}
          </div>
        </div>
      )}
      {!sessionWinner && (
        <div className="guest-damage-count">
          <div>{isGuestTurn && selectedWord(selection, board)}</div>
          <div className="daño">
            {isGuestTurn && daño(selection, board, damages)}
          </div>
        </div>
      )}
      {sessionWinner && (
        <div className="winner">{<div>{sessionWinner}</div>}</div>
      )}
    </div>
  );
};

export default DamageCountPanel;
