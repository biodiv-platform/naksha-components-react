import { useT } from "@ibp/naksha-commons";
import React, { useState } from "react";
import { SortableHandle } from "react-sortable-hoc";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";
import { GeoserverLayer } from "../../../interfaces";
import {
  FALLBACK_THUMB,
  overflowStyle,
  overflowStyle2,
} from "../../../static/constants";
import {
  Button,
  CheckboxInput,
  DownloadIcon,
  GrabberIcon,
  InfoIcon,
  ZoomExtentIcon,
} from "../../core";
import { Highlighted } from "../../core/highlighter";
import GridLegend from "./grid-legend";
import { PopoverWrapper } from "./info-popover";
import LayerItemStyle from "./layer-item-style";

const DragHandle = SortableHandle(() => (
  <div className={tw`mt-1 w-6 text-center cursor-move`}>
    <GrabberIcon />
  </div>
));

interface LayerItemProps {
  item: GeoserverLayer;
  extended?: boolean;
}

export default function LayerItem({ item, extended }: LayerItemProps) {
  const { t } = useT();
  const { layer, query, mp } = useLayers();
  const [isAdded, setIsAdded] = useState(layer.selectedIds.includes(item.id));
  const [isLoading, setIsLoading] = useState(false);

  const onToggleLayer = async () => {
    setIsLoading(true);
    await layer.toggle({ layerId: item.id, add: !isAdded });
    setIsAdded(!isAdded);
    setIsLoading(false);
  };

  const handleOnZoom = () => layer.zoomToExtent(item.id);

  return (
    <div
      className={tw`z-20 p-3 bg-white`}
      style={{ borderTop: "1px solid #e5e7eb" }}
    >
      <div className={tw`flex gap-3`}>
        <div className={tw`flex-shrink-0`}>
          <CheckboxInput
            name={item.id}
            checked={isAdded}
            onChange={onToggleLayer}
            isLoading={isLoading}
          />
          {extended && <DragHandle />}
        </div>
        <img
          className={tw`flex-shrink-0 overflow-hidden h-16 w-16 p-1 mb-2 object-cover border border-gray-200 rounded`}
          src={item.thumbnail || FALLBACK_THUMB}
        />
        <div>
          <div
            title={item.title}
            className={tw`mb-1 leading-tight`}
            style={overflowStyle}
          >
            <Highlighted text={item.title} highlight={query.term} />
          </div>
          <p
            title={item.description}
            className={tw`text-gray-600 text-sm`}
            style={overflowStyle2}
          >
            {item.description}
          </p>
        </div>
      </div>

      <div className={tw`flex justify-between`}>
        <Button
          onClick={() => mp?.onLayerDownload(item.id)}
          disabled={!item.isDownloadable}
        >
          <DownloadIcon /> {t("download")}
        </Button>

        <div className={tw`flex gap-3`}>
          {extended && (
            <Button onClick={handleOnZoom} title="Zoom To Extent" children={<ZoomExtentIcon />} />
          )}

          <PopoverWrapper item={item} />
        </div>
      </div>

      {extended && <LayerItemStyle item={item} />}
      {extended && item.source.type === "grid" && <GridLegend item={item} />}
    </div>
  );
}
