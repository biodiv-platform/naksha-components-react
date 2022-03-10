import React from "react";
import { tw } from "twind";

export const Button = (props) => {
  return (
    <button
      type="button"
      className={tw`px-4 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80`}
      {...props}
    />
  );
};

export const IconButton = (props) => {
  return (
    <button
      type="button"
      className={tw`flex gap-2 align-middle p-2 font-medium tracking-wide capitalize transition-colors duration-200 transform bg-white-600 rounded-md focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80 border border-blue-600 text-blue-600 hover:border-blue-500`}
      {...props}
    />
  );
};
