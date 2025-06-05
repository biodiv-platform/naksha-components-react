import { useT } from "@biodiv-platform/naksha-commons";
import React, { useMemo, useState } from "react";
import { RWebShare } from "react-web-share";
import { tw } from "twind";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import useLayers from "../../../hooks/use-layers";
import { GeoserverLayer } from "../../../interfaces";
import { axDownloadLayer } from "../../../services/naksha";
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
  ShareIcon,
  ZoomExtentIcon,
} from "../../core";
import { Highlighted } from "../../core/highlighter";
import GridLegend from "./grid-legend";
import { PopoverWrapper } from "./info-popover";
import LayerItemStyle from "./layer-item-style";

interface LayerItemProps {
  item: GeoserverLayer;
  extended?: boolean;
}

declare const window;

export default function LayerItem({ item, extended = false }: LayerItemProps) {
  const { t } = useT();
  const {
    layer,
    query,
    mp,
    query: { setClickedLngLat },
    setIsInfoBarOpen,
  } = useLayers();
  const [isAdded, setIsAdded] = useState(layer.selectedIds.includes(item.id));
  const [isLoading, setIsLoading] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const shareData = useMemo(
    () =>
      mp.canLayerShare
        ? {
            url: `${window.location.href.split("?")[0]}?layers=${item.id}`,
            title: item.title,
          }
        : undefined,
    [item.id]
  );

  const onToggleLayer = async () => {
    setIsLoading(true);
    setIsInfoBarOpen(true);
    layer.setSelectedFeatures([]);
    setClickedLngLat(null);
    await layer.toggle({ layerId: item.id, add: !isAdded });
    setIsAdded(!isAdded);
    setIsLoading(false);
  };

  const onDownloadLayer = async () => {
    await axDownloadLayer(
      mp.nakshaApiEndpoint,
      mp.nakshaEndpointToken,
      item.id,
      item.title
    );
    mp?.onLayerDownload(item.id);
  };

  const handleOnZoom = () => layer.zoomToExtent(item.id);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={tw`z-20 p-3 bg-white`}
      style={{ borderTop: "1px solid #e5e7eb", ...style }}
    >
      <div className={tw`flex gap-3`}>
        <div className={tw`flex-shrink-0`}>
          <CheckboxInput
            name={item.id}
            checked={isAdded}
            onChange={onToggleLayer}
            isLoading={isLoading}
          />
          {extended && (
            <div className={tw`mt-1 w-6 text-center cursor-move`}>
              <GrabberIcon />
            </div>
          )}
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
        <Button onClick={onDownloadLayer} disabled={!item.isDownloadable}>
          <DownloadIcon /> {t("download")}
        </Button>

        <div className={tw`flex gap-3`}>
          {shareData && (
            <RWebShare data={shareData}>
              <Button title="Share" children={<ShareIcon />} />
            </RWebShare>
          )}
          {extended && (
            <Button
              onClick={handleOnZoom}
              title="Zoom To Extent"
              children={<ZoomExtentIcon />}
            />
          )}
          <PopoverWrapper item={item} />
        </div>
      </div>

      {extended && <LayerItemStyle item={item} />}
      {extended && item.source.type === "grid" && <GridLegend item={item} />}
    </div>
  );
}
