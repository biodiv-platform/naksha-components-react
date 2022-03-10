import { Tabs, usePanelState, useTabState } from "@bumaga/tabs";
import clsx from "clsx";
import React from "react";
import { tw } from "twind";

const IconTab = ({ children, icon }) => {
  const { onClick, isActive } = useTabState();

  const classes = clsx([
    "flex items-center justify-center h-12 px-2 py-2 -mb-px border-b-2 -px-1 whitespace-nowrap focus:outline-none w-full focus:ring",
    {
      "text-blue-600 border-blue-500": isActive,
      "text-gray-700 hover:border-gray-400": !isActive,
    },
  ]);

  return (
    <button className={tw(classes)} onClick={onClick}>
      {icon}
      <span className={tw`ml-2`}>{children}</span>
    </button>
  );
};

const Panel = ({ children }) => {
  const isActive = usePanelState();

  return isActive ? (
    <div className={tw`w-full flex flex-grow-1 overflow-auto`}>{children}</div>
  ) : null;
};

const TabHeader = ({ children }) => (
  <div
    className={tw`flex flex-shrink-0 border-b border-gray-200 justify-around`}
  >
    {children}
  </div>
);

export { Tabs, TabHeader, IconTab, Panel };
