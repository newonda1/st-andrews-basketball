import React from "react";

import { BaseballSeasonPage } from "./Season2008";

const seasonRecapParagraphs = [
  "The March 2001 winter sweep found the first baseball box score of the 2001 spring season. St. Andrew's opened 1-0 with a 17-3 win over Abundant Life Academy, scoring 15 runs across the first three innings and finishing with 16 hits.",
  "Ryan Stratz was credited as the winning pitcher and also went 2-for-5 with a home run and three RBIs. Matt Hunt added a home run and three RBIs, Adam Ciccio went 3-for-4 with two doubles and three RBIs, Jeff Smith doubled twice, and Beau Hinton added two hits.",
  "Only the opener has been recovered from this NewsBank date range so far, so the page keeps the season record and player statistics limited to that published March 7 box score.",
];

export default function Season2001() {
  return (
    <BaseballSeasonPage
      seasonId={2001}
      title="2001 Season"
      showSeasonImagesPlaceholder
      showSeasonRoster
      seasonRecapParagraphs={seasonRecapParagraphs}
    />
  );
}
