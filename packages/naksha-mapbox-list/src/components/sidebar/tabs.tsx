import { useT } from "@biodiv-platform/naksha-commons";
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
      className={tw`absolute top-0 right-0 bottom-0 left-24 md:right-auto md:top-4  md:bottom-4 bg-white rounded-lg shadow-md md:max-w-sm w-full z-20 overflow-hidden`}
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
