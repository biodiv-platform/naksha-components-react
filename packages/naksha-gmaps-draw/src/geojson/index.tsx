import React, { useRef } from "react";

export default function GeojsonImport({
  addFeature,
  InputComponent,
  ButtonComponent,
}) {
  const importInputRef = useRef<any>();

  const handleOnAddFeature = () => {
    try {
      // Get the GeoJSON input from the ref
      const geojsonInput = importInputRef?.current?.value;
      // Parse the GeoJSON input into an object
      const geojsonObject = JSON.parse(geojsonInput);

      // Check if the input GeoJSON is complex (multiple types)
      if (
        Array.isArray(geojsonObject.features) &&
        geojsonObject.features.length > 0
      ) {
        // Iterate through each feature
        geojsonObject.features.forEach((feature) => {
          // Add the "isGeojson" key-value pair
          const modifiedFeature = {
            ...feature,
            isGeojson: true,
          };

          // Add the GeoJSON feature to the map
          addFeature([modifiedFeature]);
        });
      } else {
        // Add the "isGeojson" key-value pair to the entire GeoJSON object
        const modifiedGeojsonObject = {
          ...geojsonObject,
          features: geojsonObject.features.map((feature) => ({
            ...feature,
            isGeojson: true,
          })),
        };


        // Add the GeoJSON feature to the map
        addFeature(modifiedGeojsonObject.features);
      }
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
