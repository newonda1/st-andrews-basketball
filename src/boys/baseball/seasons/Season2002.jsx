import React from "react";

import { BaseballSeasonPage } from "./Season2008";

const seasonRecapParagraphs = [
  "The Spring 2002 baseball archive now covers a 10-10 season built from recovered Savannah Morning News box scores between March 19 and May 2. St. Andrew's had seven early games still missing before the March 19 Memorial Day loss, but the March 22 Bible Baptist report anchors the first record line at 4-5.",
  "The strongest recovered stretch came in April. Zack Hillard struck out 15 in a 12-1 win over Bible Baptist, Adam Ciccio and Davy Clay homered in that game, and the Saints swept an Agape Christian doubleheader the next day to move to 8-7. Ryan Stratz homered in the opener, while Jeff Smith and Beau Hinton each had three hits in the second game.",
  "The record path remains imperfect in one place: the April 26 Hilton Head Christian box score listed St. Andrew's at 9-9 after a 4-2 loss, but the surrounding Colleton Prep and Patrick Henry reports require one unrecovered win before the final 10-10 line. The schedule carries that placeholder and preserves the published inconsistency in the game note.",
  "Recovered leaderboards from March 21 and March 28 show Jeff Smith batting .500 in both snapshots, Ryan Stratz rising from .304 to .400, and Matt Hunt appearing among the area pitching leaders. Hillard, Stratz, Hunt, Smith, Ciccio, Clay, Hinton, Brent Adams, and Matt Hunt all have extracted game-level stats where the articles provided them.",
];

export default function Season2002() {
  return (
    <BaseballSeasonPage
      seasonId={2002}
      title="2002 Season"
      showSeasonImagesPlaceholder
      showSeasonRoster
      seasonRecapParagraphs={seasonRecapParagraphs}
    />
  );
}
