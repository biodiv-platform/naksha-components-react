import React, { useState } from "react";

import useLayers from "../../hooks/use-layers";
import { InfobarButton } from "../core";
import InfoBarContent from "./content";

export default function InfoBar() {
  const { layer } = useLayers();
  const [isOpen, setIsOpen] = useState(true);

  if (!layer.selectedFeatures?.length) return null;

  const toggleOpen = () => setIsOpen(!isOpen);

  return isOpen ? (
    <InfoBarContent onClose={toggleOpen} />
  ) : (
    <InfobarButton onClick={toggleOpen} />
  );
}
