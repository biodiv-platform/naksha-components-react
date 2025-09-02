import React from "react";

const MapButton = ({
  mode,
  currentMode,
  changeMode,
  icon,
  tooltip,
}: {
  mode: string;
  currentMode: string;
  changeMode: (mode: string) => void;
  icon: React.ReactNode; // icon is required
  tooltip?: string;
}) => {
  return (
    <button
      onClick={() => changeMode(mode)}
      title={tooltip}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "30px",
        height: "30px",
        padding: "0",
        borderRadius: "4px",
        // border: currentMode === mode ? "2px solid #02cf87" : "1px solid #555",
        backgroundColor: currentMode === mode ? "#02cf87" : "#f0f0f0",
        cursor: "pointer",
      }}
    >
      {icon}
    </button>
  );
};

export default MapButton;
