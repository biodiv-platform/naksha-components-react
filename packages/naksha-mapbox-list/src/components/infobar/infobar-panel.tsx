import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import { axGexGetRasterInfoWithLonLat } from "../../services/naksha";
import { DownIcon, UpIcon } from "../core";

export default function InfoBarPanel({ data: payload }) {
  const [isOpen, setIsOpen] = useState(true);
  const [layerInfo, setLayerInfo] = useState({
    title: payload.sourceLayer,
    properties: [] as any,
  });
  const { layer, mp } = useLayers();

  const getPropertyData = async () => {
    let properties;
    const currentLayer: any = layer.selectedLayers.find(
      (l) => l.id === (payload.sourceLayer || payload.source)
    );

    if (currentLayer.layerType.toLowerCase() === "raster") {
      const { data } = await axGexGetRasterInfoWithLonLat(
        mp.geoserver?.endpoint,
        mp.geoserver?.workspace,
        {
          bbox: payload.bbox.toString(),
          query_layers: `${mp.geoserver?.workspace}:${currentLayer.id}`,
          layers: `${mp.geoserver?.workspace}:${currentLayer.id}`,
        }
      );
      properties = data?.features[0]
        ? Object.entries(data.features[0]?.properties).map(([v, k]) => [
            v,
            k || "-",
          ])
        : [];
    } else {
      properties = Object.entries(currentLayer?.data?.propertyMap || {}).map(
        ([k, v]) => [v, payload?.properties?.[k]] || "-"
      );
    }

    setLayerInfo({ title: currentLayer.title, properties });
  };

  useEffect(() => {
    getPropertyData();
  }, []);

  return (
    <div className={tw`bg-gray-100 rounded-lg`}>
      <button
        className={tw(
          clsx([
            `px-4 h-10 flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer w-full focus:outline-none focus:ring`,
            { "bg-gray-200 rounded-t-lg": isOpen, "rounded-lg": !isOpen },
          ])
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {layerInfo.title} {isOpen ? <UpIcon /> : <DownIcon />}
      </button>
      {isOpen && (
        <div className={tw`px-4 py-3 flex flex-col gap-3`}>
          {layerInfo.properties.map(([k, v], index) => (
            <div key={k + v + index}>
              <div className={tw`text-gray-600`}>{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
