import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl/maplibre";

import useLayers from "../../hooks/use-layers";
import { axGetGeoserverLayers } from "../../services/naksha";
import { LayersButton } from "../core";
import SidebarTabs from "./tabs";

export default function Sidebar() {
  const { mp, layer } = useLayers();
  const [isOpen, setIsOpen] = useState(mp.showToC);
  const { mapl } = useMap();
  const loadedRef = useRef(false);

  const toggleOpen = React.useCallback(() => setIsOpen((prev) => !prev), []);

  const loadToC = React.useCallback(async () => {
    const _layers = await axGetGeoserverLayers(
      mp.nakshaEndpointToken,
      mp.nakshaApiEndpoint,
      mp.geoserver,
      mp.selectedLayers
    );

    const _newLayers = [...(mp.layers || []), ..._layers];
    layer.setAll(_newLayers);

    // if any layer is selected at first it will try to zoom to bounds
    if (layer.selectedIds.length) {
      const _layer = _newLayers.find((l) => l.id === layer.selectedIds[0]);
      _layer?.bbox &&
        mapl?.fitBounds(_layer.bbox, { padding: 40, duration: 1000 });
    }
  }, [
    mp.nakshaEndpointToken,
    mp.nakshaApiEndpoint,
    mp.geoserver,
    mp.selectedLayers,
    mp.layers,
    layer.setAll,
    layer.selectedIds,
    mapl,
  ]);

  useEffect(() => {
    if (mp.loadToC && !loadedRef.current) {
      loadedRef.current = true;
      loadToC();
    }
  }, [mp.loadToC]);

  useEffect(() => {
    if (mapl && layer.selectedIds.length && layer.all?.length) {
      const _layer = layer.all.find((l) => l.id === layer.selectedIds[0]);
      _layer?.bbox &&
        mapl.fitBounds(_layer.bbox as any, { padding: 40, duration: 1000 });
    }
  }, [mapl]);

  return isOpen ? (
    <SidebarTabs onClose={toggleOpen} />
  ) : (
    <LayersButton onClick={toggleOpen} />
  );
}
