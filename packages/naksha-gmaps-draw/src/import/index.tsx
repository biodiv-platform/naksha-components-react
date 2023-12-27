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
  const [isValidPoints, setIsValidPoints] = useState<boolean | undefined>(undefined);
  const [importedPoints, setImportedPoints] = useState<any[]>([]);

  const handleOnAddFeature = () => {
    try {
      const txtLatLng = importInputRef.current?.value ?? '';

      if (!txtLatLng.trim()) {
        setIsValidPoints(false);
        return;
      }

      const numLatLng = txtLatLng.split(",").map(Number)?.reverse();

      if (!isValidLatLng(numLatLng)) {
        setIsValidPoints(false);
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

      setIsValidPoints(true);
    } catch (e) {
      setIsValidPoints(false);
    } finally {
      setTimeout(() => {
        setIsValidPoints(undefined);
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

      {isValidPoints !== undefined && (
        <Text fontWeight="bold" color={isValidPoints ? "green" : "red"} mt="10px" display="flex" alignItems="center">
          {isValidPoints ? (
            <CheckCircleIcon boxSize={20} mr={2} />
          ) : (
            <CloseIcon boxSize={15} color="red.500" mr={2} />
          )}
          {isValidPoints ? POINT_ADDED_MESSAGE : INVALID_FORMAT_MESSAGE}
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
