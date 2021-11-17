import React, { CSSProperties } from "react";

const ButtonStyle: CSSProperties = {
  background: "white",
  position: "absolute",
  top: "5px",
  left: "106px",
  padding: "0.4rem",
  borderRadius: "0.15rem",
  outline: 0,
  boxShadow: "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px",
};

export default function ClearFeatures({ onClick }) {
  return (
    <button type="button" title="Clear" onClick={onClick} style={ButtonStyle}>
      <svg viewBox="0 0 24 24" width="12" height="12">
        <g fill="#E53E3E">
          <path d="M19.452 7.5H4.547a.5.5 0 00-.5.545l1.287 14.136A2 2 0 007.326 24h9.347a2 2 0 001.992-1.819L19.95 8.045a.5.5 0 00-.129-.382.5.5 0 00-.369-.163zm-9.2 13a.75.75 0 01-1.5 0v-9a.75.75 0 011.5 0zm5 0a.75.75 0 01-1.5 0v-9a.75.75 0 011.5 0zM22 4h-4.75a.25.25 0 01-.25-.25V2.5A2.5 2.5 0 0014.5 0h-5A2.5 2.5 0 007 2.5v1.25a.25.25 0 01-.25.25H2a1 1 0 000 2h20a1 1 0 000-2zM9 3.75V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5v1.25a.25.25 0 01-.25.25h-5.5A.25.25 0 019 3.75z"></path>
        </g>
      </svg>
    </button>
  );
}
