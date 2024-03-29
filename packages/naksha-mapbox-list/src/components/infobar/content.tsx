import { useT } from "@biodiv-platform/naksha-commons";
import React from "react";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import { PROPERTY_ID, SELECTION_STYLE } from "../../static/constants";
import { CloseButton, CrossHairIcon } from "../core";
import LayerSelection from "../sidebar/settings/layer-selection";
import InfoBarPanel from "./infobar-panel";

export default function InfoBarContent({ onClose }) {
  const {
    layer: { selectedFeatures, selectedLayers, selectionStyle },
  } = useLayers();
  const { t } = useT();

  return (
    <div
      className={tw`absolute top-0 right-0 bottom-0 left-0 md:top-4 md:right-4 md:bottom-4 md:left-auto bg-white rounded-lg overflow-hidden shadow-md md:max-w-sm w-full z-20 flex flex-col`}
    >
      <div className="flex w-full">
        <div
          className={tw`h-12 px-4 flex items-center gap-3 flex-grow bg-gray-200`}
        >
          <CrossHairIcon /> {t("infobar")}
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <div className={tw`bg-gray-100 p-4 flex-shrink-0 rt`}>
        <LayerSelection hideLabel={true} />
      </div>
      <div className={tw`flex flex-col flex-grow overflow-auto gap-3 p-4`}>
        {selectedFeatures.flat(1)?.map((data: any) => (
          <InfoBarPanel
            key={
              selectedLayers?.[0]?.source.type === "raster" ||
              selectionStyle === SELECTION_STYLE.ALL
                ? data?.sourceLayer
                : data?.sourceLayer + data?.properties[PROPERTY_ID]
            }
            data={data}
          />
        ))}
      </div>
    </div>
  );
}
