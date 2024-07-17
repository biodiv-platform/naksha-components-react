import { Popup } from "react-map-gl";
import { tw } from "twind";

const Pop: any = Popup;

export default function DataCard({ coordinates, data }) {
  const { titlesValues, values } = data;
  // Extract the title from titlesValues
  const title = titlesValues[0]
    ? titlesValues[0]["value"]
    : "Error loading Data";

  return coordinates ? (
    <Pop
      longitude={coordinates[0]}
      latitude={coordinates[1]}
      closeButton={false}
    >
      <div className={tw` bg-white `}>
        <h1 className={tw`text-lg font-bold `}>{title}</h1>
        <div className={tw`flex flex-col w-full`}>
          {values.map((valueItem, index) => (
            <div key={index} className={tw`flex truncate`}>
              <span className={tw`font-bold `}>{valueItem.name}: &nbsp;</span>
              <span className={tw`truncate`}>
                {Array.isArray(valueItem.value)
                  ? valueItem.value.map((val, i) => (
                      <span key={i}>
                        {val.label}
                        {i < valueItem.value.length - 1 ? ", " : ""}
                      </span>
                    ))
                  : valueItem.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Pop>
  ) : null;
}
