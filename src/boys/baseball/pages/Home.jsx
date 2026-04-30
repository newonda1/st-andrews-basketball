import React from "react";

import SportHomePage from "../../../components/SportHomePage";

const links = [
  { label: "2026 Season", to: "/athletics/boys/baseball/seasons/2026" },
  { label: "2025 Season", to: "/athletics/boys/baseball/seasons/2025" },
  {
    label: "Year-by-Year Results",
    to: "/athletics/boys/baseball/yearly-results",
  },
  { label: "Full Team Stats", to: "/athletics/boys/baseball/team/full" },
  {
    label: "Career Stats",
    to: "/athletics/boys/baseball/records/career",
  },
  {
    label: "Opponent History",
    to: "/athletics/boys/baseball/records/opponents",
  },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Baseball"
      headline="Building the St. Andrew's baseball archive."
      intro="The baseball section gathers schedules, game results, season pages, team totals, player pages, and record tables into one home for the program."
      secondaryIntro="The live archive now covers seasons from 2008 through 2026, with full game and player stat detail where source data is available."
      icon="/images/boys/baseball/boys_baseball_icon.png"
      iconAlt="St. Andrew's baseball icon"
      storyTitle="Current Archive"
      storyParagraphs={[
        "Baseball's published history currently starts with the 2008 season and runs through the current 2026 archive. The 2019 team provides one of the clearest milestones: a region championship and a state final four finish under Coach Scott Abernathy.",
        "The section is built around a season-by-season structure so new GameChanger, MaxPreps, and school records can be added without changing the shape of the archive.",
      ]}
      highlights={[
        "19 archived seasons",
        "358 games in the database",
        "2019 region champions",
        "2019 state final four",
        "Team and player stat pages",
        "Opponent history and records",
      ]}
      links={links}
    />
  );
}
