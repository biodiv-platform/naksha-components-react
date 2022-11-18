import { MapStyles } from "@biodiv-platform/naksha-commons";
import { ViewState } from "react-map-gl";

export interface NakshaMapboxViewProps {
  defaultViewState?: Partial<ViewState>;
  mapboxAccessToken: string;
  mapStyle?: MapStyles;
  data?: any;
}
