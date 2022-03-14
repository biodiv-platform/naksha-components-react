import React, { useState } from "react";

import useLayers from "../../hooks/use-layers";
import { LayersButton } from "../core";
import SidebarTabs from "./tabs";

export default function Sidebar() {
  const { mp } = useLayers();
  const [isOpen, setIsOpen] = useState(mp.showToC);

  const toggleOpen = () => setIsOpen(!isOpen);

  return isOpen ? (
    <SidebarTabs onClose={toggleOpen} />
  ) : (
    <LayersButton onClick={toggleOpen} />
  );
}
