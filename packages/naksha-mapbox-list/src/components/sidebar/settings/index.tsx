import { defaultMapStyles, useT } from "@ibp/naksha-commons";
import React from "react";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";
import { SELECTION_STYLE } from "../../../static/constants";
import { SelectInput } from "../../core";

export default function SettingsTabPanel() {
  const { layer } = useLayers();
  const { t } = useT();

  const handleOnStyleChange = (e) => layer.setMapStyle(e.target.value);

  const handleOnSelectionStyleChange = (e) =>
    layer.setSelectionStyle(e.target.value);

  return (
    <div className={tw`w-full p-4 flex flex-col gap-4`}>
      <SelectInput
        name="base_style"
        label={t("base_style")}
        defaultValue={layer.mapStyle}
        onChange={handleOnStyleChange}
      >
        {defaultMapStyles.map((ms) => (
          <option key={ms.key} value={ms.style}>
            {ms.text}
          </option>
        ))}
      </SelectInput>

      <SelectInput
        name="layer_selection"
        label={t("layer_selection")}
        defaultValue={layer.mapStyle}
        onChange={handleOnSelectionStyleChange}
      >
        {Object.values(SELECTION_STYLE).map((ss) => (
          <option key={ss} value={ss}>
            {t(ss)}
          </option>
        ))}
      </SelectInput>
    </div>
  );
}
