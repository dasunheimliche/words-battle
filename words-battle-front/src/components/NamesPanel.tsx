import React from "react";
import { User } from "../types/types";

interface NamesPanelProps {
  host: User;
  guest: User;
  userTurn: User;
}

const NamesPanel = ({ host, guest, userTurn }: NamesPanelProps) => {
  const isHostTurn =
    host.username === userTurn.username || userTurn.username === "";
  const isGuestTurn = guest.username === userTurn.username;

  const guestExists = guest.username !== "";

  return (
    <div className={"names"}>
      <div className={"name host-name"}>
        {host.username} (host)
        {isHostTurn && <span className="host-arrow arrow"></span>}
      </div>
      <div className={"name guest-name"}>
        {isGuestTurn && <span className="guest-arrow arrow"></span>}
        {guestExists && `${guest.username} (guest)`}
        {!guestExists && (
          <div className="waiting parpadeo">{"Waiting for a guest..."}</div>
        )}
      </div>
    </div>
  );
};

export default NamesPanel;
