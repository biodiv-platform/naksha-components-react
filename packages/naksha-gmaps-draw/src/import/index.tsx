import React, { useRef, useState } from "react";
import { GMAP_FEATURE_TYPES } from "../static/constants";

interface NakshaImportProps {
  addFeature: (feature: any) => void; // Adjust the type as per your feature structure
  InputComponent: React.ReactElement;
  ButtonComponent: React.ReactElement;
}

const NakshaImport: React.FC<NakshaImportProps> = ({
  addFeature,
  InputComponent,
  ButtonComponent,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isPointsValid, setIsPointsValid] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("");
  const [importedPoints, setImportedPoints] = useState<any[]>([]); // Adjust the type as per your feature structure

  const handleOnAddFeature = () => {
    try {
      const txtLatLng = importInputRef.current?.value ?? '';

      // Check if txtLatLng is not an empty string
      if (!txtLatLng.trim()) {
        setIsPointsValid(false);
        setUploadStatus("Invalid Format. Enter Latitude, Longitude.");
        return;
      }

      const numLatLng = txtLatLng.split(",").map(Number)?.reverse();

      if (!isValidLatLng(numLatLng)) {
        setIsPointsValid(false);
        setUploadStatus("Invalid Format. Enter Latitude, Longitude.");
        return;
      }

      const newFeature = {
        type: GMAP_FEATURE_TYPES.POINT,
        properties: {
          id: new Date().getTime(),
          name: txtLatLng,
          formatted_address: txtLatLng,
        },
        coordinates: numLatLng,
      };

      addFeature(newFeature);

      // Update the list of imported points
      setImportedPoints((prevPoints) => [...prevPoints, newFeature]);

      // Reset input field
      if (importInputRef.current) {
        importInputRef.current.value = "";
      }

      // Reset error state
      setIsPointsValid(true);
      setUploadStatus("Point added successfully");
    } catch (e) {
      setIsPointsValid(false);
    } finally {
      // Clear messages after 3 seconds
      setTimeout(() => {
        setUploadStatus("");
        setIsPointsValid(true);
      }, 3000);
    }
  };

  const isValidLatLng = (latLng: number[]): boolean => {
    return (
      Array.isArray(latLng) &&
      latLng.length === 2 &&
      !isNaN(latLng[0]) &&
      !isNaN(latLng[1]) &&
      typeof latLng[0] === "number" &&
      typeof latLng[1] === "number"
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <h2 style={{ marginBottom: "10px", fontWeight: "bold", fontSize: "1.25rem" }}>Points</h2>
      <div style={{ display: "flex", alignItems: "center" }}>
        {React.cloneElement(InputComponent, { ref: importInputRef, width: "300px" })}
        {React.cloneElement(ButtonComponent, { onClick: handleOnAddFeature, type: "button", marginLeft: "10px" })}
      </div>

      {uploadStatus && (
        <div style={{ fontWeight: "bold", color: isPointsValid ? "green" : "red", marginTop: "10px", display: "flex", alignItems: "center" }}>
          {isPointsValid ? (
            <span style={{ marginRight: "5px", fontSize: "1.25rem" }}>✓</span>
          ) : (
            <span style={{ marginRight: "5px", fontSize: "1.25rem", color: "red" }}>✕</span>
          )}
          {uploadStatus}
        </div>
      )}
      {importedPoints.length > 0 && (
        <div style={{ marginTop: "10px", paddingLeft: "20px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>Added Points:</h3>
          <ul style={{ listStyleType: "none", padding: "0" }}>
            {importedPoints.map((point) => (
              <li key={point.properties.id} style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginTop: "10px", overflow: "hidden", whiteSpace: "pre-wrap", textOverflow: "ellipsis", maxWidth: "300px" }}>
                  {point.properties.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NakshaImport;
