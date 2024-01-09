import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

const GeojsonImport = ({ addFeature, ButtonComponent,FileIcon,SuccessIcon,FailureIcon,DeleteIcon}) => {
  const [isGeoJSONValid, setIsGeoJSONValid] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("");
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    setFilesToUpload(acceptedFiles);
  };

  const handleAddFeature = () => {
    try {
      filesToUpload.forEach((file) => {
        const reader = new FileReader();

        reader.onabort = () =>
          handleError("File reading was aborted. Please try again.");
        reader.onerror = () =>
          handleError("File reading has failed. Please try again.");

        reader.onload = () => {
          const result = reader.result;

          if (result) {
            const jsonString =
              typeof result === "string"
                ? result
                : new TextDecoder().decode(result);

            try {
              const geojsonObject = JSON.parse(jsonString);

              const featuresToAdd = Array.isArray(geojsonObject.features)
                ? geojsonObject.features.map((feature) => ({
                    ...feature,
                    isGeojson: true,
                  }))
                : [{ ...geojsonObject, isGeojson: true }];

              featuresToAdd.forEach((featureToAdd) => {
                addFeature([featureToAdd]);
              });

              setUploadStatus("Geojson added successfully");
              setIsGeoJSONValid(true);

              // Update the list of successfully uploaded files
              setUploadedFiles((prevFiles) => [
                ...prevFiles,
                { name: file.name },
              ]);

              // Reset the dropzone content
              setFilesToUpload([]);
            } catch (error) {
              console.error(error);
              handleError("Upload failed. Invalid GeoJSON format.");
            }
          } else {
            handleError("File reading result is null.");
          }
        };

        reader.readAsText(file);
      });
    } catch (error) {
      console.error(error);
      handleError("File upload failed. Please try again.");
    } finally {
      setTimeout(() => {
        setUploadStatus("");
        setIsGeoJSONValid(true);
      }, 2000);
    }
  };

  const handleError = (message) => {
    setUploadStatus(message);
    setIsGeoJSONValid(false);
  };

  const removeFile = () => {
    setFilesToUpload([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/geo+json": [".geojson"],
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginTop: "10px" }}>
      <h1
        style={{
          marginBottom: "10px",
          fontWeight: "bold",
          fontSize: "1.25rem",
        }}
      >
        GeoJSON
      </h1>

      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <div
          style={{
            border: "2px solid #519895",
            borderRadius: "4px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "10px",
            cursor: "pointer",
            marginLeft: "15px",
            width: "300px",
            height: "100px",
          }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />

          {filesToUpload.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ marginLeft: "10px", display: "flex", alignItems: "center" }}>
                <div style={{ marginTop: "10px", overflow: "hidden", whiteSpace: "pre-wrap", textOverflow: "ellipsis", maxWidth: "200px" }}>
                  {filesToUpload[0].name}
                </div>
                <div style={{ color: "red", marginLeft: "10px", marginTop: "10px", cursor: "pointer" }} onClick={removeFile}>
                {React.cloneElement(DeleteIcon, { boxSize: 6 }) }
                  </div>
              </div>
            </div>
          ) : (
            <>
              <div>Drag 'n' drop GeoJSON file here, or click to select a file</div>
              {isDragActive && <div>Drop the file here...</div>}
            </>
          )}
        </div>

        {React.cloneElement(ButtonComponent, {
          type: "button",
          marginLeft: "30px",
          style: { paddingLeft: "15px" },
          onClick: handleAddFeature,
        })}
      </div>

      {uploadStatus && (
        <div style={{ fontWeight: "bold", color: isGeoJSONValid ? "green" : "red", marginTop: "10px", display: "flex", alignItems: "center" }}>
          {isGeoJSONValid ? (
            <span style={{ marginRight: "5px", fontSize: "1.25rem" }}>
              {React.cloneElement(SuccessIcon, { boxSize: 6})}
            </span>
          ) : (
            <span style={{ marginRight: "5px", fontSize: "1.25rem", color: "red" }}>
              {React.cloneElement(FailureIcon, { boxSize: 4 })}
            </span>
          )}
          {uploadStatus}
        </div>
      )}

      {/* Display the list of successfully uploaded files */}
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: "10px", paddingLeft: "15px" }}>
          <div style={{ fontSize: "sm" }}>Added GeoJSONs:</div>
          <ul style={{ listStyleType: "none", padding: "0" }}>
            {uploadedFiles.map((file, index) => (
              <li key={index} style={{ display: "flex", alignItems: "center" }}>
              {React.cloneElement(FileIcon, { boxSize: 6, marginRight: 2 })}
                <div style={{ marginTop: "10px", overflow: "hidden", whiteSpace: "pre-wrap", textOverflow: "ellipsis", maxWidth: "300px" }}>
                  {file.name}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GeojsonImport;
