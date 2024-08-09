import { MapStyles, defaultViewState } from "@biodiv-platform/naksha-commons";
import { NakshaMapboxListProps } from "../interfaces";
import { CSSProperties } from "react";

export const defaultNakshaProps: NakshaMapboxListProps = {
  defaultViewState,

  mapboxAccessToken: "pk.xxx",
  nakshaApiEndpoint: "/naksha-api/api",
  geoserver: { endpoint: "/geoserver", workspace: "biodiv", store: "ibp" },

  mapStyle: MapStyles.MAP_STREETS,
  layers: [],
  selectedLayers: [],
  clusterMarkers: [],
};

export const FALLBACK_THUMB =
  "data:image/svg+xml,%3Csvg fill='none' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 72 72'%3E%3Cpath fill='%23fff' d='M0 0h72v72H0z'/%3E%3Cpath d='M35.981 48.293l-13.853-10.77-3.045 2.368L36 53.048l16.917-13.157-3.064-2.387-13.872 10.789zM36 43.519l13.834-10.77 3.083-2.388L36 17.204 19.083 30.36l3.064 2.387L36 43.518z' fill='%23A0AEC0'/%3E%3C/svg%3E";

export const overflowStyle: CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-word",
};

export const overflowStyle2: CSSProperties = {
  ...overflowStyle,
  WebkitLineClamp: 2,
};

export const PROPERTY_ID = "ogc_fid";

export const LAYER_STATUS = {
  ACTIVE: "Active",
  PENDING: "Pending",
};

export const SELECTION_STYLE = {
  TOP: "layer_selection_top",
  ALL: "layer_selection_all",
};

export const CLUSTER_LAYERS = {
  CLUSTERS: "clusters",
  CLUSTER_COUNT: "cluster-count",
  UNCLUSTERED_POINTS: "unclustered-point",
};
