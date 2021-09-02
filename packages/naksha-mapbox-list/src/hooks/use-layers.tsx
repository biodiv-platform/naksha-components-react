import { useDisclosure } from "@chakra-ui/react";
import { BaseLayer, TranslationProvider } from "@ibp/naksha-commons";
import React, {
  createContext,
  MutableRefObject,
  useContext,
  useRef,
  useState,
} from "react";
import { useImmer } from "use-immer";
import LocaleStrings from "../i18n/strings";

import { IUseDisclosure, NakshaMapboxListProps } from "../interfaces";
import { defaultNakshaProps } from "../static/constants";

interface LayerContextProps extends NakshaMapboxListProps {
  ToC?: IUseDisclosure;

  infobarData?: any[];
  setInfobarData?;

  mapRef?: MutableRefObject<any>;

  setBaseLayer?;
  setLayers?;

  setViewPort?;
  setSelectedLayers?;

  legend?;
  setLegend?;

  clickPopup?;
  setClickPopup?;

  hoverPopup?;
  setHoverPopup?;

  bearerToken?;
  onLayerDownload?;

  lastSelectedLayerId?;
  setLastSelectedLayerId?;
}

const LayersContext = createContext<LayerContextProps>(defaultNakshaProps);

export const LayersProvider = (props: NakshaMapboxListProps) => {
  const ToC = useDisclosure({ defaultIsOpen: props.showToC });
  const mapRef = useRef(null);
  const [viewPort, setViewPort] = useState<any>(props.viewPort);

  const [baseLayer, setBaseLayer] = useState<BaseLayer | undefined>(
    props.baseLayer
  );
  const [layers, setLayers] = useImmer(props.layers);

  const [selectedLayers, setSelectedLayers] = useImmer(props.selectedLayers);
  const [lastSelectedLayerId, setLastSelectedLayerId] = useState<any>();
  const [infobarData, setInfobarData] = useState<any>([]);
  const [legend, setLegend] = useState({});

  const [clickPopup, setClickPopup] = useState<any>();
  const [hoverPopup, setHoverPopup] = useState<any>();

  return (
    <LayersContext.Provider
      value={{
        ...props,
        ToC,

        infobarData,
        setInfobarData,

        mapRef,

        selectedLayers,
        setSelectedLayers,

        viewPort,
        setViewPort,

        baseLayer,
        setBaseLayer,

        layers,
        setLayers,

        legend,
        setLegend,

        clickPopup,
        setClickPopup,

        hoverPopup,
        setHoverPopup,

        lastSelectedLayerId,
        setLastSelectedLayerId,
      }}
    >
      <TranslationProvider localeStrings={LocaleStrings} lang={props.lang}>
        {props.children}
      </TranslationProvider>
    </LayersContext.Provider>
  );
};

export function useLayers() {
  return useContext(LayersContext);
}
