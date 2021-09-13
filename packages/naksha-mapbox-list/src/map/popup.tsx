import { Box, Table, TableCaption, Tbody, Td, Tr } from "@chakra-ui/react";
import React from "react";
import { Popup } from "react-map-gl";

interface IPopupContainerProps {
  data;
  set;
  closeButton?: boolean;
}

const VectorLayerInfo = React.memo(function (props: any) {
  return (
    <Box maxW="250px" zIndex={5}>
      <Table size="sm" variant="striped">
        <TableCaption
          mt={0}
          pt={0}
          fontWeight="bold"
          fontSize="lg"
          placement="top"
          color="blue.500"
        >
          {props.layerId}
        </TableCaption>
        <Tbody>
          {props.feature.map(([k, v]) => (
            <Tr key={k}>
              <Td fontWeight="bold">{k}</Td>
              <Td>{v}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
});

export default function PopupContainer({
  data,
  set,
  closeButton,
}: IPopupContainerProps) {
  if (!data.element) return null;

  const Element = data?.element === 1 ? VectorLayerInfo : data?.element;

  return (
    <Popup
      onClose={() => set(null)}
      closeButton={closeButton ?? true}
      closeOnClick={false}
      key={data?.layerId}
      latitude={data.lngLat[1]}
      longitude={data.lngLat[0]}
    >
      <Element key={data?.layerId} {...data} />
    </Popup>
  );
}
