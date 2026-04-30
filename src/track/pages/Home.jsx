import React from "react";

import SportHomePage from "../../components/SportHomePage";

const links = [
  { label: "School Records", to: "/athletics/track/records/school" },
  { label: "List of Champions", to: "/athletics/track/champions" },
  { label: "Season Results", to: "/athletics/track/yearly-results" },
  { label: "2026 Season", to: "/athletics/track/seasons/2026" },
  { label: "2025 Season", to: "/athletics/track/seasons/2025" },
];

export default function Home() {
  return (
    <SportHomePage
      sportName="Track & Field"
      eyebrow="Track & Field"
      headline="Tracking marks, champions, and season history."
      intro="The track & field section is built around performances: school records, season-best marks, relays, qualifiers, podium finishes, and championship results."
      secondaryIntro="The live archive combines boys and girls results from public meet files, school records, and season summaries so the program can be explored event by event."
      icon="/images/track/track_icon.png"
      iconAlt="St. Andrew's track and field icon"
      storyTitle="Program Snapshot"
      storyParagraphs={[
        "Track & field tells a different kind of story than the score-based sports. The strongest entries are marks, placements, relays, qualifiers, and the athletes who move up the all-time lists.",
        "The current section reaches from the 2004-05 school year through 2026, connecting SCISA, GISA, and GIAA results with a school-record view and a growing list of champions.",
      ]}
      highlights={[
        "19 archived seasons",
        "45 meet pages",
        "838 athlete entries",
        "34 legacy school record entries",
        "Region and state champions",
        "Boys, girls, and relay marks",
      ]}
      links={links}
    />
  );
}
