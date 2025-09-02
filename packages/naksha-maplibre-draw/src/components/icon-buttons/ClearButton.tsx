import React, { useState, useEffect } from "react";
import { TerraDraw } from "terra-draw";
import { DeleteIcon } from "./icons";

const ClearButton = ({
  draw,
  onFeaturesChange,
}: {
  draw: TerraDraw;
  onFeaturesChange?: (features: any[]) => void;
}) => {
  const [hasFeatures, setHasFeatures] = useState(false);

  useEffect(() => {
    if (!draw) return;

    const updateHasFeatures = () => {
      const snapshot = draw.getSnapshot();
      setHasFeatures(snapshot.length > 0);
    };

    draw.on("finish", updateHasFeatures);
    draw.on("change", updateHasFeatures);

    updateHasFeatures();

    return () => {
      draw.off("finish", updateHasFeatures);
      draw.off("change", updateHasFeatures);
    };
  }, [draw]);

  const handleClear = () => {
    if (!draw) return;
    draw.clear();
    setHasFeatures(false);
    if (onFeaturesChange) onFeaturesChange([]);
  };

  return (
    <button
      type="button"
      onClick={handleClear}
      title="Clear all features"
      disabled={!hasFeatures}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "30px",
        height: "30px",
        padding: "0",
        borderRadius: "4px",
        backgroundColor: hasFeatures ? "#f0f0f0" : "#e0e0e0",
        cursor: hasFeatures ? "pointer" : "not-allowed",
      }}
    >
      <DeleteIcon />
    </button>
  );
};

export default ClearButton;
