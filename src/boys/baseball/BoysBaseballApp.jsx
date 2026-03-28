import React, { useMemo } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AthleticsProgramShell from "../../components/AthleticsProgramShell";
import YearlyResults from "./pages/YearlyResults";

function PlaceholderPage({ title, text }) {
  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "10px" }}>{title}</h2>
      <p style={{ margin: 0, lineHeight: 1.6, color: "#475569" }}>{text}</p>
    </div>
  );
}

export default function BoysBaseballApp() {
  const menuSections = useMemo(
    () => [
      {
        title: "Results",
        links: [
          {
            to: "/athletics/boys/baseball",
            label: "Full Year-by-Year Results",
            end: true,
          },
          {
            to: "/athletics/boys/baseball/opponent-history",
            label: "Opponent Game History",
          },
        ],
      },
      {
        title: "Team Stats",
        links: [
          {
            to: "/athletics/boys/baseball/team-stats",
            label: "Full Team Stats",
          },
          {
            to: "/athletics/boys/baseball/team-records/single-game",
            label: "Team Records (Single Game)",
          },
          {
            to: "/athletics/boys/baseball/team-records/season",
            label: "Team Records (Season)",
          },
        ],
      },
      {
        title: "Individual Stats",
        links: [
          {
            to: "/athletics/boys/baseball/career-stats",
            label: "Full Career Stats",
          },
          {
            to: "/athletics/boys/baseball/player-records/single-game",
            label: "Single Game Records",
          },
          {
            to: "/athletics/boys/baseball/player-records/season",
            label: "Season Records",
          },
        ],
      },
    ],
    []
  );

  return (
    <AthleticsProgramShell
      title="Boys' Baseball"
      subtitle="Historical results, player statistics, and program records"
      menuTitle="Boys' Baseball"
      menuSections={menuSections}
      athleticsHomePath="/athletics"
      footerText="St. Andrew's Athletics"
      footerHref="https://preplegacy.com"
      footerLogoSrc="/images/branding/preplegacy-logo.png"
    >
      <Routes>
        <Route index element={<YearlyResults />} />
        <Route
          path="opponent-history"
          element={
            <PlaceholderPage
              title="Opponent Game History"
              text="This page will eventually show the full game history against each baseball opponent in the database."
            />
          }
        />
        <Route
          path="team-stats"
          element={
            <PlaceholderPage
              title="Full Team Stats"
              text="This page will eventually summarize season-by-season baseball team statistics once more game data has been entered."
            />
          }
        />
        <Route
          path="team-records/single-game"
          element={
            <PlaceholderPage
              title="Team Records (Single Game)"
              text="This page will eventually list baseball team single-game records."
            />
          }
        />
        <Route
          path="team-records/season"
          element={
            <PlaceholderPage
              title="Team Records (Season)"
              text="This page will eventually list baseball team season records."
            />
          }
        />
        <Route
          path="career-stats"
          element={
            <PlaceholderPage
              title="Full Career Stats"
              text="This page will eventually show baseball career statistics for individual players."
            />
          }
        />
        <Route
          path="player-records/single-game"
          element={
            <PlaceholderPage
              title="Single Game Records"
              text="This page will eventually show baseball individual single-game records."
            />
          }
        />
        <Route
          path="player-records/season"
          element={
            <PlaceholderPage
              title="Season Records"
              text="This page will eventually show baseball individual season records."
            />
          }
        />
        <Route
          path="*"
          element={<Navigate to="/athletics/boys/baseball" replace />}
        />
      </Routes>
    </AthleticsProgramShell>
  );
}
