import React from "react";
import { User } from "../types/types";

interface NamesPanelProps {
  host: string | undefined;
  guest: string | undefined;
  userTurn: string | undefined;
}

const NamesPanel = ({
  host = "",
  guest = "",
  userTurn = "",
}: NamesPanelProps) => {
  const isHostTurn = host === userTurn || userTurn === "";
  const isGuestTurn = guest === userTurn;

  const guestExists = guest !== "";

  return (
    <div className={"names"}>
      <div className={"name host-name"}>
        {host} (host)
        {isHostTurn && <span className="host-arrow arrow"></span>}
      </div>
      <div className={"name guest-name"}>
        {isGuestTurn && <span className="guest-arrow arrow"></span>}
        {guestExists && `${guest} (guest)`}
        {!guestExists && (
          <div className="waiting parpadeo">{"Waiting for a guest..."}</div>
        )}
      </div>
    </div>
  );
};

export default NamesPanel;
