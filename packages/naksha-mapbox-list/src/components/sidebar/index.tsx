import React, { useState } from "react";

import { LayersButton } from "../core";
import SidebarTabs from "./tabs";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return isOpen ? (
    <SidebarTabs onClose={toggleOpen} />
  ) : (
    <LayersButton onClick={toggleOpen} />
  );
}
