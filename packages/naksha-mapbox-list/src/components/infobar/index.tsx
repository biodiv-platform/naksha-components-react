import { useT } from "@ibp/naksha-commons";
import React from "react";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import { PROPERTY_ID } from "../../static/constants";
import { CrossHairIcon } from "../core";
import InfoBarPanel from "./infobar-panel";

export default function InfoBar() {
  const { layer } = useLayers();
  const { t } = useT();

  return (
    <div
      className={tw`absolute top-4 right-4 bottom-4 bg-white rounded-lg shadow-md max-w-sm w-full z-10 flex flex-col`}
    >
      <div
        className={tw`border-b-2 h-12 px-4 flex items-center gap-3 flex-shrink-0`}
      >
        <CrossHairIcon /> {t("infobar")}
      </div>
      <div className={tw`flex flex-col flex-grow overflow-auto gap-3 p-4`}>
        {layer.selectedFeatures.map((data) => (
          <InfoBarPanel
            key={data.sourceLayer + data.properties[PROPERTY_ID]}
            data={data}
          />
        ))}
      </div>
    </div>
  );
}
