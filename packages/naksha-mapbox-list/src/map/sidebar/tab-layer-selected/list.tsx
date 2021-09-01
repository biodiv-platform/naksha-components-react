import { Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";

import { useLayers } from "../../../hooks/use-layers";
import { GeoserverLayer } from "../../../interfaces";
import Item from "./item";

export default function LayersList({ q }: { q? }) {
  const { layers = [] } = useLayers();
  const [selectedLayers, setSelectedLayers] = useState<GeoserverLayer[]>([]);
  const [filteredLayers, setFilteredLayers] = useState<GeoserverLayer[]>([]);

  useEffect(() => {
    setSelectedLayers(layers.filter((l) => l.isAdded));
  }, [layers]);

  useEffect(() => {
    const newFilteredLayers = (
      q
        ? selectedLayers.filter((l) =>
            l.title.toLowerCase().includes(q.toLowerCase())
          )
        : selectedLayers
    ).sort((a, b) => (b.ats || 0) - a.ats);

    setFilteredLayers(newFilteredLayers);
  }, [q, selectedLayers]);

  return (
    <AutoSizer disableWidth={true}>
      {(p) => (
        <Box h={p.height}>
          {filteredLayers.map((l) => (
            <Item key={l.id} layer={l} q={q} />
          ))}
        </Box>
      )}
    </AutoSizer>
  );
}
