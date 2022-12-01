import React, { useMemo, useState } from "react";
import { useT } from "@biodiv-platform/naksha-commons";

import { tw } from "twind";
import useLayers from "../../../hooks/use-layers";

export function StyleLegend({ item }) {
  const [showImage, setShowImage] = useState<boolean>(true);
  const { mp } = useLayers();
  const { t } = useT();

  const legendStyles = useMemo(
    () =>
      item?.data?.styles?.[item.data.styleIndex]?.colors?.paint?.["fill-color"]
        ?.stops ||
      item?.data?.styles?.[item.data.styleIndex]?.colors?.paint?.[
        "circle-color"
      ]?.stops ||
      [],
    [item]
  );

  const vectorLegend = () => {
    return legendStyles.map(([title, color]) => (
      <li className={tw`flex gap-2 items-center mb-1`} key={color}>
        <svg viewBox="0 0 24 24" height="14" width="14" focusable="false">
          <circle cx="12" fill={color} cy="12" r="12" stroke="none"></circle>
        </svg>
        <div>{title}</div>
      </li>
    ));
  };

  return (
    <ul style={{ margin: 0, padding: 0 }}>
      {item.layerType !== "RASTER" ? (
        vectorLegend()
      ) : showImage ? (
        <li>
          <img
          style={{margin:"5px"}}
            onError={() => setShowImage(false)}
            src={`${mp?.geoserver?.endpoint}/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&WIDTH=20&HEIGHT=20&STRICT=false&layer=biodiv:${item.id}`}
          />
        </li>
      ) : (
        <div>{t("raster_style_not_found")}</div>
      )}
    </ul>
  );
}
