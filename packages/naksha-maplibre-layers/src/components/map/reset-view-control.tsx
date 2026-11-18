import { ControlPosition, useControl, ViewState } from "react-map-gl/maplibre";

const CROSSHAIR_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:auto"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`;

/** MapLibre control with one button that flies the map back to a view */
class ResetViewButton {
  private container?: HTMLDivElement;

  constructor(
    private onReset: () => void,
    private title: string
  ) {}

  onAdd() {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    const button = document.createElement("button");
    button.type = "button";
    button.title = this.title;
    button.setAttribute("aria-label", this.title);
    button.style.display = "flex";
    button.innerHTML = CROSSHAIR_ICON;
    button.onclick = this.onReset;

    this.container.appendChild(button);
    return this.container;
  }

  onRemove() {
    this.container?.remove();
  }
}

interface ResetViewControlProps {
  viewState: Partial<ViewState>;
  position?: ControlPosition;
}

/** Button that returns the map to `viewState` (the map's starting view) */
export default function ResetViewControl({
  viewState,
  position = "bottom-right",
}: ResetViewControlProps) {
  useControl(
    ({ map }) =>
      new ResetViewButton(
        () =>
          map.flyTo({
            center: [viewState.longitude!, viewState.latitude!],
            zoom: viewState.zoom,
          }),
        "Reset view"
      ),
    { position }
  );

  return null;
}
