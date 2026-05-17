import React from "react";
import HistoricalGameDetail from "../../../basketball/archive/HistoricalGameDetail";
import { basketballArchiveConfigs } from "../../../basketball/archive/configs";

export default function GameDetailHistorical() {
  return <HistoricalGameDetail config={basketballArchiveConfigs.boys} />;
}
