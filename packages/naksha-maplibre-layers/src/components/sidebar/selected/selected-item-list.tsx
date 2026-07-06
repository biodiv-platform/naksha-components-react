import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

import LayerItem from "../common/layer-item";

// Renders one row. Registers itself with dnd-kit via useSortable, then
// hands the resulting attributes/listeners down to LayerItem as
// `dragHandleProps` so only the grip icon (not the whole card) initiates a
// drag - same behavior react-sortable-hoc's SortableHandle gave you.
function SortableSelectedItem({ item, extended }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style}>
      <LayerItem item={item} extended={extended} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

// Kept as a named export in case anything imports SelectedItem directly for
// a non-sortable context (e.g. a static preview row).
export function SelectedItem({ item, extended }: { item; extended?: boolean }) {
  return <LayerItem item={item} extended={extended} />;
}

interface SelectedItemListProps {
  layerList: Array<{ id: string | number; [key: string]: any }>;
  onSortEnd: (result: { oldIndex: number; newIndex: number }) => void;
}

export const SelectedItemList = ({ layerList, onSortEnd }: SelectedItemListProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layerList.findIndex((item) => item.id === active.id);
      const newIndex = layerList.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onSortEnd({ oldIndex, newIndex });
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={layerList.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {layerList.map((item) => (
            <SortableSelectedItem key={item.id} item={item} extended={true} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};