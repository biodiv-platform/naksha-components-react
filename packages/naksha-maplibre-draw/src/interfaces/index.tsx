import { MapStyles } from "@biodiv-platform/naksha-commons";
import { ViewState } from "react-map-gl/maplibre";

export interface NakshaMaplibreViewProps {
  defaultViewState?: Partial<ViewState>;
  mapStyle?: MapStyles;
  features?;
  onFeaturesChange?;
  isControlled?: boolean;
  isMultiple?: boolean;
}
