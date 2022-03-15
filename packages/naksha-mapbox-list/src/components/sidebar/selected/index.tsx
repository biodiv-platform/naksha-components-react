import { arrayMoveImmutable } from "../../../utils/array-move";
import React from "react";

import useLayers from "../../../hooks/use-layers";
import { SelectedItemList } from "./selected-item-list";
import { Button } from "../../core";
import { useT } from "@ibp/naksha-commons";
import { tw } from "twind";

export default function SelectedTabPanel() {
  const { layer } = useLayers();
  const { t } = useT();

  const onSortEnd = ({ oldIndex, newIndex }) => {
    layer.setSelectedIds(
      arrayMoveImmutable(layer.selectedIds, oldIndex, newIndex)
    );
  };

  return (
    <div className={tw`flex flex-col gap-3 w-full`}>
      {layer.selectedIds.length > 0 && (
        <div className={tw`p-3 pb-0`}>
          <Button onClick={() => layer.clearAll()}>✕ {t("clear")}</Button>
        </div>
      )}
      <SelectedItemList
        layerList={layer.selectedLayers}
        useDragHandle={true}
        onSortEnd={onSortEnd}
      />
    </div>
  );
}
