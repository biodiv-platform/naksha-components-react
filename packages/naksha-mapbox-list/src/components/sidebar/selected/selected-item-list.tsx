import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import LayerItem from "../common/layer-item";

interface Props {
  layerList: any[];
  setLayerList: (layers: any[]) => void;
}

export default function SelectedItemList({ layerList, setLayerList }: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = layerList.findIndex((i) => i.id === active.id);
      const newIndex = layerList.findIndex((i) => i.id === over.id);
      setLayerList(arrayMove(layerList, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={layerList.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {layerList.map((item) => (
            <LayerItem key={item.id} item={item} extended />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
