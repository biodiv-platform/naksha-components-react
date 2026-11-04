import React, { useEffect, useState } from "react";
import { GMAP_FEATURE_TYPES } from "../static/constants";
import { usePosition } from "../utils/use-location";

export default function TraceLocation({
  TraceButtonComponent,
  onFeatureAdded,
}) {
  const [trackData, setTrackData] = useState<any>([]);
  const [isTracking, setIsTracking] = useState(false);
  const { position } = usePosition(isTracking);

  useEffect(() => {
    if (isTracking && position) {
      setTrackData([...trackData, position]);
    }
  }, [isTracking, position]);

  const handleOnTraceAction = () => {
    if (isTracking) {
      setIsTracking(false);
      onFeatureAdded({
        getType: () => GMAP_FEATURE_TYPES.RAW,
        data: [...trackData],
      });
      setTrackData([]);
    } else {
      setIsTracking(true);
    }
  };

  return (
    <div>
      {React.isValidElement(TraceButtonComponent) ? (
        React.cloneElement(TraceButtonComponent, {
          onClick: handleOnTraceAction,
          isTracking,
        } as any)
      ) : (
        <button
          type="button"
          onClick={handleOnTraceAction}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            background: isTracking ? "#e53e3e" : "#fff",
            color: isTracking ? "#fff" : "#333",
            cursor: "pointer",
          }}
        >
          {isTracking ? "Stop Tracing" : "Trace Location"}
        </button>
      )}
    </div>
  );
}
