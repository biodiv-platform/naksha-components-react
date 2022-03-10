import { useT } from "@ibp/naksha-commons";
import React, { useState } from "react";
import { tw } from "twind";

export default function MoreLess({ children }) {
  const [showMore, setShowMore] = useState(false);
  const { t } = useT();

  return (
    <div>
      {showMore && children}
      <button
        onClick={() => setShowMore(!showMore)}
        className={tw`text-blue-600 focus:outline-none focus:outline focus:ring`}
      >
        {showMore ? t("less") : t("more")}
      </button>
    </div>
  );
}
