import { CheckCircleIcon, CloseIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Icon, List, ListItem, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import FileIcon from "../icons/file";

const GeojsonImport = ({ addFeature, ButtonComponent }) => {
  const [isGeoJSONValid, setIsGeoJSONValid] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("");
  const [filesToUpload, setFilesToUpload] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
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

  const handleError = (message: string) => {
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      marginTop="10px"
    >
      <Text marginBottom="10px" fontWeight="bold" fontSize="lg">
        GeoJSON
      </Text>

      <Box display="flex" flexDirection="row" alignItems="center">
        <Box
          border="2px solid #519895"
          borderRadius="4px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          padding="10px"
          cursor="pointer"
          marginLeft="15px"
          width="350px"
          height="100px"
          {...getRootProps()}
        >
          <input {...getInputProps()} />

          {filesToUpload.length > 0 ? (
            <Box display="flex" alignItems="center">
              <Box ml="10px" display="flex" alignItems="center">
                <Icon
                  as={FileIcon}
                  boxSize={30}
                  color="gray.500"
                  style={{ marginRight: "5px" }}
                />
                <Text
                  marginTop="10px"
                  overflow="hidden"
                  whiteSpace="pre-wrap"
                  textOverflow="ellipsis"
                  maxWidth="200px"
                >
                  {filesToUpload[0].name}
                </Text>
                <DeleteIcon
                  boxSize={20}
                  color="red"
                  onClick={removeFile}
                  ml="10px"
                  mt="10px"
                >
                  Remove
                </DeleteIcon>
              </Box>
            </Box>
          ) : (
            <>
              <Text>
                {"Drag 'n' drop GeoJSON file here, or click to select a file"}
              </Text>
              {isDragActive && <Text>Drop the file here...</Text>}
            </>
          )}
        </Box>

        {React.cloneElement(ButtonComponent, {
          type: "button",
          ml: "30px",
          style: { paddingLeft: "15px" },
          onClick: handleAddFeature,
        })}
      </Box>

      {uploadStatus && (
        <Text
          fontWeight="bold"
          color={isGeoJSONValid ? "green" : "red"}
          height="20px"
        >
          {isGeoJSONValid ? (
            <CheckCircleIcon boxSize={20} mr={2} />
          ) : (
            <CloseIcon boxSize={15} mr={2} />
          )}
          {uploadStatus}
        </Text>
      )}

      {/* Display the list of successfully uploaded files */}
      {uploadedFiles.length > 0 && (
        <Box mt="10px" pl="15px">
          <Text fontSize="sm">Added GeoJSONs:</Text>
          <List styleType="none" padding="0">
            {uploadedFiles.map((file, index) => (
              <ListItem key={index} display="flex" alignItems="center">
                <Icon
                  as={FileIcon}
                  boxSize={20}
                  color="teal"
                  mr="3px"
                  style={{ marginTop: "5px" }}
                />
                <Text
                  mt="10px"
                  overflow="hidden"
                  whiteSpace="pre-wrap"
                  textOverflow="ellipsis"
                  maxWidth="300px"
                >
                  {file.name}
                </Text>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default GeojsonImport;
