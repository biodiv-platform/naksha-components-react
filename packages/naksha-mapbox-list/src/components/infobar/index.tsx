import React, { useEffect, useState } from "react";

import useLayers from "../../hooks/use-layers";
import { InfobarButton } from "../core";
import InfoBarContent from "./content";

export default function InfoBar() {
  const { layer, isInfoBarOpen, setIsInfoBarOpen, markerDetails } = useLayers();

  if (!layer.selectedFeatures?.length && markerDetails.values.length <= 0) {
    return null;
  }

  const toggleOpen = () => setIsInfoBarOpen(!isInfoBarOpen);

  useEffect(() => {
    setIsInfoBarOpen(true);
  }, [markerDetails.values, layer.selectedFeatures]);

  return isInfoBarOpen ? (
    <InfoBarContent onClose={toggleOpen} />
  ) : (
    <InfobarButton onClick={toggleOpen} />
  );
}
