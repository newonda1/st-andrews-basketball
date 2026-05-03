import React from "react";

import SportHomePage from "../../components/SportHomePage";

const links = [
  { label: "2004 Season", to: "/athletics/golf/seasons/2004" },
  { label: "2024 Season", to: "/athletics/golf/seasons/2024" },
  { label: "2023 Season", to: "/athletics/golf/seasons/2023" },
  { label: "2022 Season", to: "/athletics/golf/seasons/2022" },
  { label: "Season Results", to: "/athletics/golf/yearly-results" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Golf"
      headline="Organizing the St. Andrew's golf archive."
      intro="The golf section gives published results a home, connecting season summaries, match pages, source notes, courses, divisions, and visible St. Andrew's entries."
      secondaryIntro="The current archive now begins with 2004 match reports from Mary Calder Golf Course and Wilmington Island Country Club, then continues through state tournament results from 2019, 2021, 2022, 2023, and 2024."
      icon="/images/golf/golf_icon.png"
      iconAlt="St. Andrew's golf icon"
      storyTitle="State Archive"
      storyParagraphs={[
        "Golf's archive is different from the game-by-game sports because it blends match reports with published state tournament files. The home page gives those result sets a cleaner front door.",
        "The 2023 and 2024 seasons include visible St. Andrew's entries, while the earlier seasons preserve the broader state context from the posted tournament PDFs.",
      ]}
      highlights={[
        "6 archive seasons",
        "2 recovered 2004 match pages",
        "12 tournament pages",
        "2019 through 2024 state results",
        "2023 and 2024 St. Andrew's entries",
        "Boys and girls state results",
        "Source PDF context",
      ]}
      links={links}
    />
  );
}
