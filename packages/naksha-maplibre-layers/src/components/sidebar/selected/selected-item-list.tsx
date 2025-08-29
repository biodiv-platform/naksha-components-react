import React from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import LayerItem from "../common/layer-item";

export const SelectedItem = SortableElement(({ item, extended }) => (
  <LayerItem item={item} extended={extended} />
));

export const SelectedItemList = SortableContainer(({ layerList }) => (
  <div>
    {layerList.map((item, index) => (
      <SelectedItem key={item.id} index={index} item={item} extended={true} />
    ))}
  </div>
));
