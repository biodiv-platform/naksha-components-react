import { arrayMoveImmutable } from "../../../utils/array-move";
import React from "react";

import useLayers from "../../../hooks/use-layers";
import { SelectedItemList } from "./selected-item-list";

export default function SelectedTabPanel() {
  const { layer } = useLayers();

  const onSortEnd = ({ oldIndex, newIndex }) => {
    layer.setSelectedIds(
      arrayMoveImmutable(layer.selectedIds, oldIndex, newIndex)
    );
  };

  return (
    <SelectedItemList
      layerList={layer.selectedLayers}
      useDragHandle={true}
      onSortEnd={onSortEnd}
    />
  );
}
