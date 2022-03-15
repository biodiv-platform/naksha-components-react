import { useT } from "@ibp/naksha-commons";
import React, { useEffect } from "react";
import { tw } from "twind";

import {
  CloseButton,
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

export default function SidebarTabs({ onClose }) {
  const { t } = useT();

  return (
    <div
      className={tw`absolute top-4 left-4 bottom-4 bg-white rounded-lg shadow-md max-w-sm w-full z-10 overflow-hidden`}
    >
      <CloseButton onClick={onClose} />
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
