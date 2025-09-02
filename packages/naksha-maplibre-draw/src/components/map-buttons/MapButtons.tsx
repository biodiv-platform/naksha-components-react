import ClearButton from "../icon-buttons/ClearButton";
import {
  SelectIcon,
  PointIcon,
  LineIcon,
  PolygonIcon,
} from "../icon-buttons/icons";
import MapButton from "../map-button/MapButton";

const MapButtons = ({
  mode,
  changeMode,
}: {
  mode: string;
  changeMode: (mode: string) => void;
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "8px",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      }}
    >
      <MapButton
        mode="select"
        icon={<SelectIcon />}
        currentMode={mode}
        changeMode={changeMode}
        tooltip="Select"
      />
      <MapButton
        mode="point"
        icon={<PointIcon />}
        currentMode={mode}
        changeMode={changeMode}
        tooltip="Point"
      />
      <MapButton
        mode="linestring"
        icon={<LineIcon />}
        currentMode={mode}
        changeMode={changeMode}
        tooltip="Line"
      />
      <MapButton
        mode="polygon"
        icon={<PolygonIcon />}
        currentMode={mode}
        changeMode={changeMode}
        tooltip="Polygon"
      />
    </div>
  );
};

export default MapButtons;
