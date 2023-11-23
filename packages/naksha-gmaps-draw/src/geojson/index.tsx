import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function GeojsonImport({ addFeature }) {
  const [isGeoJSONValid, setIsGeoJSONValid] = useState(true);
  const [geoJSONErrorMessage, setGeoJSONErrorMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");

      reader.onload = () => {
        try {
          const geojsonInput = reader.result;
          const geojsonObject = JSON.parse(geojsonInput);

          let featuresToAdd = [];

          if (Array.isArray(geojsonObject.features) && geojsonObject.features.length > 0) {
            featuresToAdd = geojsonObject.features.map((feature) => ({
              ...feature,
              isGeojson: true,
            }));
          } else {
            featuresToAdd.push({
              ...geojsonObject,
              isGeojson: true,
            });
          }

          // Call addFeature for each feature individually
          featuresToAdd.forEach((featureToAdd) => {
            console.log("feature to add", featureToAdd);
            addFeature([featureToAdd]);
          });

          // Set uploaded file details
          setUploadedFiles((prevFiles) => [
            ...prevFiles,
            {
              name: file.name,
              features: featuresToAdd,
            },
          ]);
        } catch (e) {
          console.error(e);

          // Set error state
          setIsGeoJSONValid(false);
          setGeoJSONErrorMessage("Invalid GeoJSON format. Please check your GeoJSON.");
        }
      };

      reader.readAsText(file);
    });
    // Clear error state when new files are added
    setIsGeoJSONValid(true);
    setGeoJSONErrorMessage("");
  }, [addFeature]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/geo+json': ['.geojson'],
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
       {!isGeoJSONValid && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {geoJSONErrorMessage}
        </p>
      )}
      <div style={dropzoneStyle} {...getRootProps()}>
        <input {...getInputProps()} />
        <p>
            "Drag 'n' drop GeoJSON file here, or click to select a file"
        </p>
        {isDragActive && <p>Drop the file here...</p>}
      </div>

      {uploadedFiles.length > 0 && (
        <div style={filePreviewStyle}>
          {uploadedFiles.map((file, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <p>{file.name}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

const dropzoneStyle = {
  border: "2px dashed #0087F7",
  borderRadius: "4px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  cursor: "pointer",
  margin: "0 10px",
};

const filePreviewStyle = {
  border: "2px solid #0087F7",
  borderRadius: "4px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  marginTop: "20px",
};
