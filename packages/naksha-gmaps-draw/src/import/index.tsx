import React, { useRef, useState } from "react";
import { GMAP_FEATURE_TYPES } from "../static/constants";

export default function NakshaImport({
  addFeature,
  InputComponent,
  ButtonComponent,
}) {
  const importInputRef = useRef<any>();
  const [isPointsValid, setIsPointsValid] = useState(true);
  const [pointsErrorMessage, setPointsErrorMessage] = useState("");

  const handleOnAddFeature = () => {
    try {
      const txtLatLng = importInputRef?.current?.value;
      const numLatLng = txtLatLng.split(",").map(Number)?.reverse();

      if (!isValidLatLng(numLatLng)) {
        setIsPointsValid(false);
        setPointsErrorMessage("Invalid point format. Please enter valid latitude and longitude.");
        return;
      }

      addFeature({
        type: GMAP_FEATURE_TYPES.POINT,
        properties: {
          id: new Date().getTime(),
          name: txtLatLng,
          formatted_address: txtLatLng,
        },
        coordinates: numLatLng,
      });

      // Reset error state
      setIsPointsValid(true);
      setPointsErrorMessage("");
    } catch (e) {
      console.error(e);

      // Set error state
      setIsPointsValid(false);
      setPointsErrorMessage("Invalid point format. Please enter valid latitude and longitude.");
    }
  };

  const isValidLatLng = (latLng) => {

    return (
      Array.isArray(latLng) &&
      latLng.length === 2 &&
      !isNaN(latLng[0]) &&
      !isNaN(latLng[1]) &&
      typeof latLng[0] === 'number' &&
      typeof latLng[1] === 'number'
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      {React.cloneElement(InputComponent, { ref: importInputRef })}
      {!isPointsValid && (
        <p style={{ color: "red", marginLeft: "10px" }}>{pointsErrorMessage}</p>
      )}
      {React.cloneElement(ButtonComponent, {
        onClick: handleOnAddFeature,
        type: "button",
        marginLeft: "10px",
      })}
    </div>
  );
}
