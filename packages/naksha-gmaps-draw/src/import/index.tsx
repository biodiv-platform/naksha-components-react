import React, { useRef } from "react";
import { GMAP_FEATURE_TYPES } from "../static/constants";

export default function NakshaImport({
  addFeature,
  InputComponent,
  ButtonComponent,
}) {
  const importInputRef = useRef<any>();

  const handleOnAddFeature = () => {
    try {
      const txtLatLng = importInputRef?.current?.value;
      const numLatLng = txtLatLng.split(",").map(Number)?.reverse();

      addFeature({
        type: GMAP_FEATURE_TYPES.POINT,
        properties: {
          id: new Date().getTime(),
          name: txtLatLng,
          formatted_address: txtLatLng,
        },
        coordinates: numLatLng,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {React.cloneElement(InputComponent, { ref: importInputRef })}
      {React.cloneElement(ButtonComponent, {
        onClick: handleOnAddFeature,
        type: "button",
      })}
    </div>
  );
}
