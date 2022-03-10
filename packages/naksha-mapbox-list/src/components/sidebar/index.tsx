import { useT } from "@ibp/naksha-commons";
import React, { useEffect } from "react";
import { tw } from "twind";

import useLayers from "../../hooks/use-layers";
import { axGetGeoserverLayers } from "../../services/naksha";
import {
  IconTab,
  LayersIcon,
  Panel,
  SlidersIcon,
  TabHeader,
  Tabs,
} from "../core";
import LayersTabPanel from "./layers";
import SelectedTabPanel from "./selected";
import SettingsTabPanel from "./settings";

export default function Sidebar() {
  const { mp, layer } = useLayers();
  const { t } = useT();

  const loadToC = async () => {
    const _layers = await axGetGeoserverLayers(
      mp.nakshaEndpointToken,
      mp.nakshaApiEndpoint,
      mp.geoserver,
      mp.selectedLayers
    );

    const _newLayers = [...(mp.layers || []), ..._layers];
    layer.setAll(_newLayers);
  };

  useEffect(() => {
    mp.loadToC && loadToC();
  }, []);

  return (
    <div
      className={tw`absolute top-4 left-4 bottom-4 bg-white rounded-lg shadow-md max-w-sm w-full z-10`}
    >
      <div className={tw`flex flex-col h-full`}>
        <Tabs>
          <TabHeader>
            <IconTab icon={<LayersIcon />}>{t("layers")}</IconTab>
            <IconTab icon={<LayersIcon />}>{t("selected")}</IconTab>
            <IconTab icon={<SlidersIcon />}>{t("settings")}</IconTab>
          </TabHeader>

          <Panel>
            <LayersTabPanel />
          </Panel>
          <Panel>
            <SelectedTabPanel />
          </Panel>
          <Panel>
            <SettingsTabPanel />
          </Panel>
        </Tabs>
      </div>
    </div>
  );
}
