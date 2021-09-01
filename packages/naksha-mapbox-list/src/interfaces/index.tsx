import { ViewportProps } from "react-map-gl";
import { BaseLayer } from "@ibp/naksha-commons";

type LayerType = "grid" | "vector" | "raster";

interface SelectedLayers {
  id: string;
  type: LayerType;
  source?: string;
}

export interface ExtendedMarkerProps {
  latitude: number;
  longitude: number;
  colorHex: string;
}

export interface NakshaMapboxListProps {
  viewPort?: Partial<ViewportProps>;

  loadToC?: boolean;
  showToC?: boolean;

  managePublishing?: boolean;
  nakshaEndpointToken?: string;
  mapboxApiAccessToken: string;
  nakshaApiEndpoint?: string;
  bearerToken?: string;
  geoserver?: {
    endpoint: string;
    store: string;
    workspace: string;
    onClick?: any;
  };

  selectedLayers?: SelectedLayers[];
  baseLayer?: BaseLayer;
  layers?: GeoserverLayer[];
  onLayerDownload?;
  markers?: ExtendedMarkerProps[];
  lang?;

  children?;
}

interface VectorStyleMeta {
  styleName?;
  styleTitle?;
  colors?;
}

export interface IUseDisclosure {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export interface GeoserverLayer {
  id: string;
  index?: number;
  title: string;
  description?: string;
  thumbnail?: string;
  attribution?: string;
  license?: string;
  tags?: string[];
  createdBy?: string;
  author?: { name: string };
  url?: string;
  createdDate?: string;
  isDownloadable?: boolean;
  bbox?: any[];
  isAdded?: boolean;
  ats?;
  source: {
    type: LayerType;
    scheme?;
    tiles?;
    endpoint?;
    fetcher?;
  };
  onClick?: ({ bbox, feature, layerId: string }) => JSX.Element;
  onHover?: ({ bbox, feature, layerId: string }) => JSX.Element;
  data?: {
    styles?: VectorStyleMeta[];
    styleIndex?;
    propertyMap?;
    titleColumn?;
    summaryColumn?;
    [key: string]: any;
  };
}
