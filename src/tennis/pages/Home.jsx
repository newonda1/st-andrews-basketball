import React from "react";

import SportHomePage from "../../components/SportHomePage";

const links = [
  { label: "2025-26 Season", to: "/athletics/tennis/seasons/2026" },
  { label: "Season Results", to: "/athletics/tennis/yearly-results" },
  {
    label: "Boys Region Tournament",
    to: "/athletics/tennis/matches/2026-giaa-2-aaa-region-tournament",
  },
  {
    label: "Girls Region Tournament",
    to: "/athletics/tennis/matches/2026-giaa-2-aaa-region-tournament-girls",
  },
  {
    label: "Boys State Individual",
    to: "/athletics/tennis/matches/2026-giaa-state-individual-boys",
  },
  {
    label: "Girls State Individual",
    to: "/athletics/tennis/matches/2026-giaa-state-individual-girls",
  },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Tennis"
      headline="A coed tennis program with championship roots."
      intro="The 2025-26 Lions have added another strong chapter, with the boys posting a 9-1 dual-match record and both boys and girls represented in GIAA region and state individual tournament play."
      secondaryIntro="New SavannahNow research adds more shape to the program's recent history: Jack Wylly was a first-team All-Greater Savannah selection in 2017 and 2018, then won a GISA individual state title while leading St. Andrew's to a team state runner-up finish in 2019. The search also recovered Paige Edwards' singles win against Beaufort Academy in 2012."
      icon="/images/tennis/tennis_icon.png"
      iconAlt="St. Andrew's tennis icon"
      storyTitle="Program History"
      storyParagraphs={[
        "St. Andrew's tennis history now stretches from the 1981 state championship era through the recent run of region titles and individual success. The program's story is built around both team achievement and individual players making their mark across Savannah-area and state competition.",
        "The latest recovered results highlight that blend: Wylly's rise from All-Greater Savannah performer to GISA state champion, the 2019 boys team state runner-up finish, and Edwards' 2012 singles win all sit alongside the current coed team's 2026 tournament work.",
      ]}
      linksTitle="Explore Tennis History"
      links={links}
    />
  );
}
