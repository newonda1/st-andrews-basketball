import React from "react";

import { BaseballSeasonPage } from "./Season2008";

const seasonRecapParagraphs = [
  "The Spring 2001 baseball archive now follows St. Andrew's from the March 6 opener through the May 4 Calhoun Academy result. The recovered record path is 9-10, built from 16 scored box scores and three placeholders needed to reconcile the published record lines.",
  "The Saints opened with a 17-3 win over Abundant Life Academy, then went 1-2 at the Williamsburg Tournament with an 18-4 consolation win over North Myrtle Beach Christian. Ryan Stratz went 4-for-4 in that game, Zack Hillard went 4-for-5, Matt Hunt went 3-for-5, and Beau Hinton and Brent Adams each drove in three runs.",
  "April brought the strongest run of recovered results. Hillard threw a one-hitter in a 5-0 region win over Hilton Head Christian, Hunt and Jeff Smith combined for 13 strikeouts in another 5-0 win over Abundant Life, and St. Andrew's swept an Agape Christian doubleheader behind Hunt's walk-off single in the opener and Stratz's eight-strikeout win in the second game.",
  "The final stat-leader snapshots kept Beau Hinton on the area batting list, including a .452 final regular-season average line on May 11. Beau Hinton was also named honorable mention on the Savannah Morning News All-Coastal Empire baseball team in June.",
  "Three results remain unidentified: one loss before the March 24 Sea Island report, one loss between the April 11 Beaufort Academy game and the April 19 Agape sweep, and one win before the April 25 Beaufort Academy report.",
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
