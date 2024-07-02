import { tw } from "twind";

const DataCard = ({ data }) => {
  const { titlesValues, values } = data;
  // Extract the title from titlesValues
  const title = titlesValues[0]
    ? titlesValues[0]["value"]
    : "Error loading Data";

  return (
    <div
      className={
        tw`border border-gray-300 rounded-lg px-2 py-1 shadow-md bg-white max-w-xs z-[9999] ` +
        `location-marker-hover-card`
      }
    >
      <h1 className={tw`text-lg font-bold truncate`}>{title}</h1>
      <div className={tw`flex flex-col w-full`}>
        {values.map((valueItem, index) => (
          <div key={index} className={tw`flex truncate`}>
            <span className={tw`font-bold truncate`}>{valueItem.name}:</span>
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
  );
};

export default DataCard;
