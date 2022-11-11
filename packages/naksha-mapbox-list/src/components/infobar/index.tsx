import React, { useEffect, useState } from "react";

import useLayers from "../../hooks/use-layers";
import { InfobarButton } from "../core";
import InfoBarContent from "./content";

export default function InfoBar() {
  const {
    layer,
    query: { clickedLngLat },
  } = useLayers();
  const [isOpen, setIsOpen] = useState(true);

  if (!layer.selectedFeatures?.length) return null;

  const toggleOpen = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (layer.selectedFeatures[0]?.layerType === "raster") {
      toggleOpen();
    }
  }, [clickedLngLat]);

  return isOpen ? (
    <InfoBarContent onClose={toggleOpen} />
  ) : (
    <InfobarButton onClick={toggleOpen} />
  );
}
