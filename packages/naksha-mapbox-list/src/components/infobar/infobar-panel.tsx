import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import { DownIcon, UpIcon } from "../core";

export default function InfoBarPanel({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [layerInfo, setLayerInfo] = useState({
    title: data.sourceLayer,
    properties: [] as any,
  });
  const { layer } = useLayers();

  const getPropertyData = async () => {
    const currentLayer: any = layer.selectedLayers.find(
      (l) => l.id === (data.sourceLayer || data.source)
    );

    const properties = Object.entries(
      currentLayer?.data?.propertyMap || {}
    ).map(([k, v]) => [v, data?.properties?.[k]] || "-");

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
          {layerInfo.properties.map(([k, v]) => (
            <div key={k + v}>
              <div className={tw`text-gray-600`}>{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
