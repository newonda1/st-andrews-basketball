import React from "react";

import SportHomePage from "../../components/SportHomePage";

const links = [
  { label: "2003 Season", to: "/athletics/golf/seasons/2003" },
  { label: "2004 Season", to: "/athletics/golf/seasons/2004" },
  { label: "Spring 2006 Season", to: "/athletics/golf/seasons/2005-06" },
  { label: "2024 Season", to: "/athletics/golf/seasons/2024" },
  { label: "2023 Season", to: "/athletics/golf/seasons/2023" },
  { label: "2022 Season", to: "/athletics/golf/seasons/2022" },
  { label: "Season Results", to: "/athletics/golf/yearly-results" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Golf"
      archiveImageKey="golf"
      headline="Organizing the St. Andrew's golf archive."
      intro="The golf section gives published results a home, connecting season summaries, match pages, source notes, courses, divisions, and visible St. Andrew's entries."
      secondaryIntro="The current archive now begins with 2003 and 2004 match reports, adds a Spring 2006 GISA state summary, then continues through state tournament results from 2019, 2021, 2022, 2023, and 2024."
      icon="/images/golf/golf_icon.png"
      iconAlt="St. Andrew's golf icon"
      storyTitle="State Archive"
      storyParagraphs={[
        "Golf's archive is different from the game-by-game sports because it blends match reports with published state tournament files. The home page gives those result sets a cleaner front door.",
        "The 2023 and 2024 seasons include visible St. Andrew's entries, while the earlier seasons preserve the broader state context from the posted tournament PDFs.",
      ]}
      highlights={[
        "9 archive seasons",
        "5 recovered 2003 match pages",
        "SCISA 2003 state sixth",
        "2004 state fourth",
        "12 tournament pages",
        "Spring 2006 state summary",
        "2019 through 2024 state results",
      ]}
      links={links}
    />
  );
}
