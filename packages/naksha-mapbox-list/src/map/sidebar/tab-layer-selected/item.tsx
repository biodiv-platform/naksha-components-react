import {
  Box,
  Button,
  Image,
  Select,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useT } from "@ibp/naksha-commons";
import React from "react";
import Highlight from "react-highlighter";

import useLayerManager from "../../../hooks/use-layer-manager";
import { GeoserverLayer } from "../../../interfaces";
import { FALLBACK_THUMB, overflowStyle } from "../../../static/constants";
import { IconChevronDown, IconChevronUp, IconRemoveCircle } from "../../icons";
import ItemInfo from "../tab-layer-list/item-info";
import Legend from "./legend";

interface ItemProps {
  layer: GeoserverLayer;
  q?;
}

const Item = ({ layer, q }: ItemProps) => {
  const { toggleLayer, handleOnLayerDownload } = useLayerManager();
  const { isOpen, onToggle } = useDisclosure();
  const showLegend = layer.source.type !== "grid";
  const { t } = useT();

  const removeLayer = () => toggleLayer(layer.id, false);

  const updateLayerStyle = (e) =>
    toggleLayer(layer.id, true, Number(e.target.value), false);

  return (
    <Box p={4} key={layer.id} borderBottom="1px" borderColor="gray.300">
      <Stack isInline={true} spacing={4} mb={4}>
        <Image
          borderRadius="md"
          border="1px"
          borderColor="gray.300"
          objectFit="contain"
          flexShrink={0}
          boxSize="4.5rem"
          src={layer.thumbnail}
          fallbackSrc={FALLBACK_THUMB}
        />
        <div>
          <Text mb={1}>
            <Highlight search={q}>{layer.title}</Highlight>
          </Text>
          <Box
            fontSize="sm"
            color="gray.600"
            style={overflowStyle}
            title={layer.description}
          >
            {layer.description}
          </Box>
        </div>
      </Stack>

      <ItemInfo
        layer={layer}
        onDownload={() => handleOnLayerDownload(layer.id, layer.title)}
        mb={4}
      />

      {showLegend && (
        <Select mb={4} onChange={updateLayerStyle}>
          {layer?.data?.styles?.map((s, index) => (
            <option key={index} value={index}>
              {s.styleTitle}
            </option>
          ))}
        </Select>
      )}

      <Stack
        isInline
        spacing={4}
        justifyContent={showLegend ? "space-between" : "flex-end"}
      >
        <Button
          colorScheme="blue"
          size="sm"
          variant="outline"
          hidden={!showLegend}
          onClick={onToggle}
          leftIcon={isOpen ? <IconChevronUp /> : <IconChevronDown />}
        >
          {t("legend")}
        </Button>
        <Button
          size="sm"
          colorScheme="red"
          variant="outline"
          onClick={removeLayer}
          leftIcon={<IconRemoveCircle />}
        >
          {t("remove")}
        </Button>
      </Stack>
      {showLegend && isOpen && <Legend layer={layer} />}
    </Box>
  );
};

export default Item;
