import { useT } from "@biodiv-platform/naksha-commons";
import React from "react";
import { tw } from "twind";

import useLayers from "../../../hooks/use-layers";
import { SearchInput } from "../../core";

export default function LayerSearch() {
  const { t } = useT();
  const { query } = useLayers();

  const handleOnSearchChange = (e) => query.setTerm(e.target.value);

  return (
    <div className={tw`flex-shrink-0 border-b-2 p-4`}>
      <SearchInput
        name="lyr_search"
        placeholder={t("find_layer_by_name")}
        onChange={handleOnSearchChange}
      />
    </div>
  );
}
