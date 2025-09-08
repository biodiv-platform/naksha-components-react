
export const MapStyleSwitcher = ({
  currentStyleIdx,
  onStyleChange,
  mapStyles,
}) => (
  <div
    style={{
      position: "absolute",
      left: 12,
      bottom: 12,
      background: "rgba(255,255,255,0.95)",
      padding: "8px",
      borderRadius: "6px",
      zIndex: 1000,
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    }}
  >
    <select
      value={currentStyleIdx}
      onChange={(e) => onStyleChange(Number(e.target.value))}
      style={{ fontSize: 14, padding: "4px" }}
    >
      {mapStyles.map((style, idx) => (
        <option key={style.key || idx} value={idx}>
          {style.text || `Style ${idx + 1}`}
        </option>
      ))}
    </select>
  </div>
);
