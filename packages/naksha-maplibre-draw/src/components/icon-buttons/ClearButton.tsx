import React from "react";
import { TerraDraw } from "terra-draw";
import { DeleteIcon } from "./icons";

const ClearButton = ({
  draw,
  onFeaturesChange,
}: {
  draw: TerraDraw;
  onFeaturesChange?: (features: any[]) => void;
}) => {
  if (!draw) return null;

  const handleClear = () => {
    draw.clear();
    if (onFeaturesChange) {
      onFeaturesChange([]);
    }
  };

  return (
    <button
      onClick={handleClear}
      title="Delete"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "30px",
        height: "30px",
        padding: "0",
        borderRadius: "4px",
        backgroundColor: "#f0f0f0",
        cursor: "pointer",
      }}
    >
      <DeleteIcon />
    </button>
  );
};

export default ClearButton;
