import { useT } from "@biodiv-platform/naksha-commons";
import React from "react";

import useLayers from "../../../hooks/use-layers";
import { SELECTION_STYLE } from "../../../static/constants";
import { SelectInput } from "../../core";

interface LayerSelectionProps {
  hideLabel?;
}

export default function LayerSelection({ hideLabel }: LayerSelectionProps) {
  const {
    layer: {selectionStyle, handleSelectStyle },
  } = useLayers();
  const { t } = useT();

  const handleOnSelectionStyleChange = (e) => {
    handleSelectStyle(e.target.value);
  };

  return (
    <SelectInput
      name="layer_selection"
      label={hideLabel ? null : t("layer_selection")}
      defaultValue={selectionStyle}
      onChange={handleOnSelectionStyleChange}
    >
      {Object.values(SELECTION_STYLE).map((ss) => (
        <option key={ss} value={ss}>
          {t(ss)}
        </option>
      ))}
    </SelectInput>
  );
}
