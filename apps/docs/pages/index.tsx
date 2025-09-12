import React from "react";
import { tw } from "twind";

const modules = [
  "naksha-gmaps-draw",
  "naksha-gmaps-view",
  "naksha-gmaps-draw",
  "naksha-gmaps-view",
  "naksha-maplibre-layers",
  "naksha-maplibre-view",
  "naksha-maplibre-draw",
];

export default function IndexPage() {
  return (
    <div className={tw`container mt-10`}>
      <ul className={tw`list-item list-decimal`}>
        {modules.map((mod) => (
          <li key={mod}>
            <a
              className={tw`text-blue-500 focus:outline-none focus:ring`}
              href={`/examples/${mod}`}
            >
              {mod}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
