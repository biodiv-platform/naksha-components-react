import React from "react";
import { tw } from "twind";
import { LayerList } from "./layer-list";
import LayerSearch from "./search";

export default function LayersTabPanel() {
  return (
    <div className={tw`flex flex-col w-full`}>
      <LayerSearch />
      <LayerList />
    </div>
  );
}
