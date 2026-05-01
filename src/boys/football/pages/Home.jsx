import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "1998 Championship Season", to: "/athletics/football/seasons/1998" },
  { label: "2025 Season", to: "/athletics/football/seasons/2025" },
  { label: "Year-by-Year Results", to: "/athletics/football/yearly-results" },
  {
    label: "Team Season Records",
    to: "/athletics/football/team/season-records",
  },
  {
    label: "Opponent History",
    to: "/athletics/football/records/opponents",
  },
  { label: "Career Stats", to: "/athletics/football/records/career" },
  {
    label: "Single Game Records",
    to: "/athletics/football/records/single-game",
  },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Football"
      headline="Connecting St. Andrew's football history."
      intro="The football archive gives the program a home for season results, team records, opponent history, rosters, and individual stat tables."
      secondaryIntro="The current data set now includes the 1996-1999 SCISA era and the 2004-2025 MaxPreps-era seasons, while the program's championship history remains visible across the broader athletics site."
      icon="/images/common/football_icon.png"
      iconAlt="St. Andrew's football icon"
      storyTitle="Program Archive"
      storyParagraphs={[
        "Football's archive now combines recovered SCISA-history schedules from the late-1990s championship run with the MaxPreps-era seasons that have published schedules, scores, rosters, and stat tables.",
        "The section is built for both team history and player records, connecting year-by-year summaries with single-game records, season leaderboards, career pages, and opponent history.",
      ]}
      highlights={[
        "26 archived seasons",
        "278 games in the database",
        "1998 state championship",
        "1996 and 1997 state runner-up finishes",
        "2002 region championship",
        "Team and individual records",
        "Rosters and player stat tables",
      ]}
      links={links}
    />
  );
}
