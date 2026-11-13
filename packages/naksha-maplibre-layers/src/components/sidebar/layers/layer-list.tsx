import React, { useMemo, useState } from "react";
import { useVirtual } from "react-virtual";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";
import LayerItem from "../common/layer-item";

export function LayerList() {
  const { layer, query } = useLayers();

  const filteredLayers = useMemo(
    () =>
      query.term
        ? layer.all.filter((_l) =>
            _l.title.toLowerCase().includes(query.term.toLowerCase())
          )
        : layer.all,
    [layer.all, query.term]
  );

  const parentRef = React.useRef<any>(null);

  const rowVirtualizer = useVirtual({
    size: filteredLayers.length,
    parentRef,
  });

  return (
    <div className={tw`flex-grow-1 relative`}>
      <AutoSizer
        renderProp={(p) => (
          <div
            ref={parentRef}
            className="List"
            style={{ height: p.height, overflow: "auto" }}
          >
            <div
              style={{
                height: rowVirtualizer.totalSize,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.virtualItems.map((virtualRow) => (
                <div
                  key={virtualRow.index}
                  ref={virtualRow.measureRef}
                  className={tw`absolute top-0 left-0 w-full`}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div style={{ height: 146 }}>
                    <LayerItem item={filteredLayers[virtualRow.index]} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      />
    </div>
  );
}
