import React, { useEffect, useState } from "react";

import useLayers from "../../hooks/use-layers";
import { InfobarButton } from "../core";
import InfoBarContent from "./content";

export default function InfoBar() {
  const { layer, isInfoBarOpen, setIsInfoBarOpen } = useLayers();

  if (!layer.selectedFeatures?.length) return null;

  const toggleOpen = () => setIsInfoBarOpen(!isInfoBarOpen);

  return isInfoBarOpen ? (
    <InfoBarContent onClose={toggleOpen} />
  ) : (
    <InfobarButton onClick={toggleOpen} />
  );
}
