import React from "react";
import AthleticsSearchPage from "./components/search/AthleticsSearchPage";
import AthleticsProgramShell from "./components/AthleticsProgramShell";
import { athleticsMenuSections } from "./athleticsMenuSections";

export default function AthleticsSearchApp() {
  return (
    <AthleticsProgramShell
      title="St. Andrew's Athletic Statistics"
      subtitle="Search athletes, teams, and key stats pages"
      menuTitle="Athletics"
      menuSections={athleticsMenuSections}
      athleticsHomePath="/athletics"
      headerHomePath="/athletics"
    >
      <AthleticsSearchPage />
    </AthleticsProgramShell>
  );
}
