import React, { useState } from "react";
import { tw } from "twind";
import { Button, IconButton } from ".";

export default function Popup({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={tw`relative inline-block`}>
      <IconButton onClick={() => setIsOpen(!isOpen)}>{title}</IconButton>
      <div
        className={tw`absolute right-0 z-20 w-48 p-2 mt-2 bg-white rounded-md shadow-xl border-2 border-blue-300 border-opacity-80`}
        style={isOpen ? {} : { display: "none" }}
      >
        {children}
      </div>
    </div>
  );
}
