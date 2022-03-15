import React, { useEffect, useState } from "react";

import useLayers from "../../hooks/use-layers";
import { axGetGeoserverLayers } from "../../services/naksha";
import { LayersButton } from "../core";
import SidebarTabs from "./tabs";

export default function Sidebar() {
  const { mp, layer } = useLayers();
  const [isOpen, setIsOpen] = useState(mp.showToC);

  const toggleOpen = () => setIsOpen(!isOpen);

  const loadToC = async () => {
    const _layers = await axGetGeoserverLayers(
      mp.nakshaEndpointToken,
      mp.nakshaApiEndpoint,
      mp.geoserver,
      mp.selectedLayers
    );

    const _newLayers = [...(mp.layers || []), ..._layers];
    layer.setAll(_newLayers);
  };

  useEffect(() => {
    mp.loadToC && loadToC();
  }, []);

  return isOpen ? (
    <SidebarTabs onClose={toggleOpen} />
  ) : (
    <LayersButton onClick={toggleOpen} />
  );
}
