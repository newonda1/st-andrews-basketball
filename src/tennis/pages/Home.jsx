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
      headline="Building a match-by-match tennis archive."
      intro="The tennis section now has a home for dual matches, region tournaments, state individual brackets, and season results."
      secondaryIntro="The current archive begins with the 2025-26 season and is structured so team seasons, individual brackets, and match detail can grow together."
      icon="/images/tennis/tennis_icon.png"
      iconAlt="St. Andrew's tennis icon"
      storyTitle="Current Archive"
      storyParagraphs={[
        "Tennis combines team results with individual draw history, so the archive is shaped around both dual matches and tournament pages.",
        "The 2025-26 section includes boys and girls region tournament results, GIAA state individual appearances, opponent athlete data, and match detail pages.",
      ]}
      highlights={[
        "2025-26 active archive",
        "18 matches and tournaments",
        "4 tournament pages",
        "Boys and girls region results",
        "State individual entries",
        "Match detail pages",
      ]}
      links={links}
    />
  );
}
