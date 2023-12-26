import { CheckCircleIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  Icon,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import LocationIcon from "../icons/location";
import {
  GMAP_FEATURE_TYPES,
  INVALID_FORMAT_MESSAGE,
  POINT_ADDED_MESSAGE,
} from "../static/constants";

interface NakshaImportProps {
  addFeature: (feature: any) => void;
  InputComponent: React.ReactElement;
  ButtonComponent: React.ReactElement;
}

const NakshaImport = ({
  addFeature,
  InputComponent,
  ButtonComponent,
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isPointsValid, setIsPointsValid] = useState(true);
  const [uploadStatus, setUploadStatus] = useState("");
  const [importedPoints, setImportedPoints] = useState<any[]>([]);

  const handleOnAddFeature = () => {
    try {
      const txtLatLng = importInputRef.current?.value ?? '';

      if (!txtLatLng.trim()) {
        setIsPointsValid(false);
        setUploadStatus(INVALID_FORMAT_MESSAGE);
        return;
      }

      const numLatLng = txtLatLng.split(",").map(Number)?.reverse();

      if (!isValidLatLng(numLatLng)) {
        setIsPointsValid(false);
        setUploadStatus(INVALID_FORMAT_MESSAGE);
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

      setImportedPoints((prevPoints) => [...prevPoints, newFeature]);

      if (importInputRef.current) {
        importInputRef.current.value = "";
      }

      setIsPointsValid(true);
      setUploadStatus(POINT_ADDED_MESSAGE);
    } catch (e) {
      setIsPointsValid(false);
    } finally {
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
    <Box display="flex" flexDirection="column" alignItems="flex-start">
      <Heading mb="10px" fontWeight="bold" size="lg">
        Points
      </Heading>
      <Flex alignItems="center">
        {React.cloneElement(InputComponent, { ref: importInputRef, width: "350px" })}
        {React.cloneElement(ButtonComponent, { onClick: handleOnAddFeature, type: "button", marginLeft: "10px" })}
      </Flex>

      {uploadStatus && (
        <Text fontWeight="bold" color={isPointsValid ? "green" : "red"} mt="10px" display="flex" alignItems="center">
          {isPointsValid ? (
            <CheckCircleIcon boxSize={20} mr={2} />
          ) : (
            <CloseIcon boxSize={15} color="red.500" mr={2} />
          )}
          {uploadStatus}
        </Text>
      )}
      {importedPoints.length > 0 && (
        <Box mt="10px" pl="20px">
          <Heading size="sm">Added Points:</Heading>
          <List styleType="none" padding="0">
            {importedPoints.map((point) => (
              <ListItem key={point.properties.id} display="flex" alignItems="center">
                <Icon as={LocationIcon} color="teal" mr="3px" />
                {point.properties.name}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default NakshaImport;