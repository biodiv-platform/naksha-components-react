import React from "react";
import { IconButton } from "../setup-draw";

type MapButtonProps = {
  mode?: string;
  currentMode: string;
  onClick: (mode: string) => void;
  icon: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
};

const BUTTON_STYLE: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 30,
  height: 30,
  padding: 0,
  borderRadius: 4,
};

const MapButton = ({
  mode,
  currentMode,
  onClick,
  icon,
  tooltip,
  disabled,
}: MapButtonProps) => (
  <IconButton
    type="button"
    title={tooltip}
    disabled={disabled}
    onClick={() => !disabled && onClick(mode ?? "")}
    style={{
      ...BUTTON_STYLE,
      backgroundColor: disabled
        ? "#d3d3d3"
        : currentMode === mode
        ? "#02cf87"
        : "#f0f0f0",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      width: 40,
      height: 40,
    }}
  >
    {icon}
  </IconButton>
);

export default MapButton;
