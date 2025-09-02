import React from "react";
import { TerraDraw } from "terra-draw";
import { DeleteIcon } from "./icons";

const ClearButton = ({ draw }: { draw: TerraDraw }) => {
  if (!draw) return null;

  return (
    <button
      onClick={() => draw.clear()}
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
      <DeleteIcon  />
    </button>
  );
};

export default ClearButton;
