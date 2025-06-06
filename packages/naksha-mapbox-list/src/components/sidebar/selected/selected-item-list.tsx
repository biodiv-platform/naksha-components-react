import React from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext } from "@dnd-kit/core";
import LayerItem from "../common/layer-item";
import { GeoserverLayer } from "../../../interfaces";

export const SelectedItem = ({
  item,
  extended,
}: {
  item: GeoserverLayer;
  extended: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LayerItem
        item={item}
        extended={extended}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

interface SelectedItemListProps {
  layerList: GeoserverLayer[];
  onSortEnd: (oldIndex: number, newIndex: number) => void;
}

export const SelectedItemList = ({
  layerList,
  onSortEnd,
}: SelectedItemListProps) => {
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layerList.findIndex((item) => item.id === active.id);
      const newIndex = layerList.findIndex((item) => item.id === over.id);
      onSortEnd(oldIndex, newIndex);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext
        items={layerList.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {layerList.map((item) => (
          <SelectedItem key={item.id} item={item} extended={true} />
        ))}
      </SortableContext>
    </DndContext>
  );
};
