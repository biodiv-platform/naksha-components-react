import React from "react";
import { tw } from "twind";

const modules = [
  "naksha-mapbox-list",
  "naksha-mapbox-view",
  "naksha-mapbox-draw",
  "naksha-gmaps-draw",
  "naksha-gmaps-view",
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
