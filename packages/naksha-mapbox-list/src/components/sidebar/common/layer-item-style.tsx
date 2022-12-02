import React from "react";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";
import { GeoserverLayer } from "../../../interfaces";
import { SelectInput } from "../../core";
import MoreLess from "./moreless";
import { StyleLegend } from "./style-legend";

export default function LayerItemStyle({ item }: { item: any }) {
  if (!item.data?.styles) return null;

  const { layer } = useLayers();

  const onStyleChange = (e) => {
    layer.updateStyle(item.id, Number(e.target.value));
  };

  return (
    <div className={tw`flex flex-col gap-4 pt-2`}>
      {item.layerType !== "RASTER" && (
        <SelectInput onChange={onStyleChange}>
          {item.data?.styles.map((opt, idx) => (
            <option key={idx} value={idx}>
              {opt.styleTitle}
            </option>
          ))}
        </SelectInput>
      )}

      <MoreLess>
        <StyleLegend item={item} />
      </MoreLess>
    </div>
  );
}
