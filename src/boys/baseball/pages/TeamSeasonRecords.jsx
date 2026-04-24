import React, { useEffect, useMemo, useState } from "react";
import { recordTableStyles } from "./recordTableStyles";
import { loadAllBaseballPlayerGameStats } from "../dataLoaders";
import {
  buildTeamGameTotals,
  fetchJson,
  formatRecordValue,
  formatSeasonLabel,
  safeNum,
} from "./teamStatsUtils";

export default function TeamSeasonRecords() {
  const [rowsByRecord, setRowsByRecord] = useState({});
  const [error, setError] = useState("");
  const [expandedKey, setExpandedKey] = useState(null);

  const sectionDefs = useMemo(
    () => [
      {
        title: "Batting",
        records: [
          { key: "GamesPlayed", label: "Games Played", abbr: "GP", valueFn: (s) => safeNum(s?.GamesPlayed) },
          { key: "PA", label: "Plate Appearances", abbr: "PA", valueFn: (s) => safeNum(s?.PA) },
          { key: "AB", label: "At Bats", abbr: "AB", valueFn: (s) => safeNum(s?.AB) },
          { key: "R", label: "Runs", abbr: "R", valueFn: (s) => safeNum(s?.R) },
          { key: "H", label: "Hits", abbr: "H", valueFn: (s) => safeNum(s?.H) },
          { key: "1B", label: "Singles", abbr: "1B", valueFn: (s) => safeNum(s?.["1B"]) },
          { key: "2B", label: "Doubles", abbr: "2B", valueFn: (s) => safeNum(s?.["2B"]) },
          { key: "3B", label: "Triples", abbr: "3B", valueFn: (s) => safeNum(s?.["3B"]) },
          { key: "HR", label: "Home Runs", abbr: "HR", valueFn: (s) => safeNum(s?.HR) },
          { key: "RBI", label: "Runs Batted In", abbr: "RBI", valueFn: (s) => safeNum(s?.RBI) },
          { key: "BB", label: "Walks", abbr: "BB", valueFn: (s) => safeNum(s?.BB) },
          { key: "SO", label: "Strikeouts (Batting)", abbr: "SO", valueFn: (s) => safeNum(s?.SO) },
          { key: "HBP", label: "Hit By Pitch", abbr: "HBP", valueFn: (s) => safeNum(s?.HBP) },
          { key: "SAC", label: "Sacrifice Hits", abbr: "SAC", valueFn: (s) => safeNum(s?.SAC) },
          { key: "SF", label: "Sacrifice Flies", abbr: "SF", valueFn: (s) => safeNum(s?.SF) },
          { key: "ROE", label: "Reached on Error", abbr: "ROE", valueFn: (s) => safeNum(s?.ROE) },
          { key: "FC", label: "Fielder's Choice", abbr: "FC", valueFn: (s) => safeNum(s?.FC) },
          { key: "TB", label: "Total Bases", abbr: "TB", valueFn: (s) => safeNum(s?.TB) },
        ],
      },
      {
        title: "Pitching",
        records: [
          { key: "NoHitters", label: "No-Hitters", abbr: "NH", valueFn: (s) => safeNum(s?.NoHitters) },
          { key: "PerfectGames", label: "Perfect Games", abbr: "PG", valueFn: (s) => safeNum(s?.PerfectGames) },
          { key: "IP", label: "Innings Pitched", abbr: "IP", valueFn: (s) => safeNum(s?.IP) },
          { key: "BF", label: "Batters Faced", abbr: "BF", valueFn: (s) => safeNum(s?.BF) },
          { key: "Pitches", label: "Pitches", abbr: "P", valueFn: (s) => safeNum(s?.Pitches) },
          { key: "W", label: "Wins", abbr: "W", valueFn: (s) => safeNum(s?.W) },
          { key: "L", label: "Losses", abbr: "L", valueFn: (s) => safeNum(s?.L) },
          { key: "SV", label: "Saves", abbr: "SV", valueFn: (s) => safeNum(s?.SV) },
          { key: "SVO", label: "Save Opportunities", abbr: "SVO", valueFn: (s) => safeNum(s?.SVO) },
          { key: "BS", label: "Blown Saves", abbr: "BS", valueFn: (s) => safeNum(s?.BS) },
          { key: "H_Allowed", label: "Hits Allowed", abbr: "H", valueFn: (s) => safeNum(s?.H_Allowed) },
          { key: "R_Allowed", label: "Runs Allowed", abbr: "R", valueFn: (s) => safeNum(s?.R_Allowed) },
          { key: "ER", label: "Earned Runs", abbr: "ER", valueFn: (s) => safeNum(s?.ER) },
          { key: "BB_Allowed", label: "Walks Allowed", abbr: "BB", valueFn: (s) => safeNum(s?.BB_Allowed) },
          { key: "SO_Pitching", label: "Strikeouts (Pitching)", abbr: "K", valueFn: (s) => safeNum(s?.SO_Pitching) },
          { key: "HBP_Pitching", label: "Hit Batters", abbr: "HBP", valueFn: (s) => safeNum(s?.HBP_Pitching) },
          { key: "BK", label: "Balks", abbr: "BK", valueFn: (s) => safeNum(s?.BK) },
          { key: "PIK_Allowed", label: "Pickoffs Allowed", abbr: "PIK", valueFn: (s) => safeNum(s?.PIK_Allowed) },
          { key: "WP", label: "Wild Pitches", abbr: "WP", valueFn: (s) => safeNum(s?.WP) },
          { key: "P_Innings", label: "Pitcher Innings", abbr: "P INN", valueFn: (s) => safeNum(s?.P_Innings) },
        ],
      },
      {
        title: "Baserunning",
        records: [
          { key: "SB", label: "Stolen Bases", abbr: "SB", valueFn: (s) => safeNum(s?.SB) },
          { key: "CS", label: "Caught Stealing", abbr: "CS", valueFn: (s) => safeNum(s?.CS) },
          { key: "CS_Pitching", label: "Runners Caught Stealing", abbr: "CS", valueFn: (s) => safeNum(s?.CS_Pitching) },
          { key: "SB_Allowed", label: "Stolen Bases Allowed", abbr: "SB", valueFn: (s) => safeNum(s?.SB_Allowed) },
        ],
      },
      {
        title: "Fielding",
        records: [
          { key: "A", label: "Assists", abbr: "A", valueFn: (s) => safeNum(s?.A) },
          { key: "PO", label: "Putouts", abbr: "PO", valueFn: (s) => safeNum(s?.PO) },
          { key: "E", label: "Errors", abbr: "E", valueFn: (s) => safeNum(s?.E) },
          { key: "DP", label: "Double Plays", abbr: "DP", valueFn: (s) => safeNum(s?.DP) },
          { key: "TP", label: "Triple Plays", abbr: "TP", valueFn: (s) => safeNum(s?.TP) },
          { key: "PB", label: "Passed Balls", abbr: "PB", valueFn: (s) => safeNum(s?.PB) },
          { key: "PIK_Fielding", label: "Pickoffs (Fielding)", abbr: "PIK", valueFn: (s) => safeNum(s?.PIK_Fielding) },
          { key: "CI", label: "Catcher's Interference", abbr: "CI", valueFn: (s) => safeNum(s?.CI) },
          { key: "C_Innings", label: "Catcher Innings", abbr: "C INN", valueFn: (s) => safeNum(s?.C_Innings) },
          { key: "1B_Innings", label: "1B Innings", abbr: "1B INN", valueFn: (s) => safeNum(s?.["1B_Innings"]) },
          { key: "2B_Innings", label: "2B Innings", abbr: "2B INN", valueFn: (s) => safeNum(s?.["2B_Innings"]) },
          { key: "3B_Innings", label: "3B Innings", abbr: "3B INN", valueFn: (s) => safeNum(s?.["3B_Innings"]) },
          { key: "SS_Innings", label: "SS Innings", abbr: "SS INN", valueFn: (s) => safeNum(s?.SS_Innings) },
          { key: "LF_Innings", label: "LF Innings", abbr: "LF INN", valueFn: (s) => safeNum(s?.LF_Innings) },
          { key: "CF_Innings", label: "CF Innings", abbr: "CF INN", valueFn: (s) => safeNum(s?.CF_Innings) },
          { key: "RF_Innings", label: "RF Innings", abbr: "RF INN", valueFn: (s) => safeNum(s?.RF_Innings) },
          { key: "SF_Innings", label: "Short Field Innings", abbr: "SF INN", valueFn: (s) => safeNum(s?.SF_Innings) },
        ],
      },
    ],
    []
  );

  const recordDefs = useMemo(() => sectionDefs.flatMap((section) => section.records), [sectionDefs]);

  useEffect(() => {
    const run = async () => {
      try {
        setError("");

        const [gamesDataRaw, playerStatsDataRaw] = await Promise.all([
          fetchJson("games.json", "/data/boys/baseball/games.json"),
          loadAllBaseballPlayerGameStats(),
        ]);

        const teamGames = buildTeamGameTotals(gamesDataRaw, playerStatsDataRaw);
        const seasonTotalsMap = new Map();

        for (const gameRow of teamGames) {
          const seasonKey = gameRow.SeasonKey;
          if (!seasonTotalsMap.has(seasonKey)) {
            seasonTotalsMap.set(seasonKey, {
              SeasonKey: seasonKey,
              GamesPlayed: 0,
              NoHitters: 0,
              PerfectGames: 0,
            });
          }

          const totals = seasonTotalsMap.get(seasonKey);
          totals.GamesPlayed += 1;

          for (const def of recordDefs) {
            if (def.key === "GamesPlayed" || def.key === "NoHitters" || def.key === "PerfectGames") continue;
            totals[def.key] = safeNum(totals[def.key]) + def.valueFn(gameRow);
          }

          totals.NoHitters += safeNum(gameRow.NoHitters);
          totals.PerfectGames += safeNum(gameRow.PerfectGames);
        }

        const seasonTotals = Array.from(seasonTotalsMap.values());
        const next = {};

        for (const def of recordDefs) {
          const list = seasonTotals
            .map((seasonRow) => ({
              value: def.valueFn(seasonRow),
              season: formatSeasonLabel(seasonRow.SeasonKey),
            }))
            .filter((r) => Number.isFinite(r.value) && r.value > 0)
            .sort((a, b) => {
              if (b.value !== a.value) return b.value - a.value;
              return String(b.season).localeCompare(String(a.season));
            })
            .slice(0, 20);

          while (list.length < 20) {
            list.push({
              value: "—",
              season: "—",
              _placeholder: true,
            });
          }

          next[def.key] = list;
        }

        setRowsByRecord(next);
      } catch (e) {
        setError(String(e?.message || e));
        console.error(e);
      }
    };

    run();
  }, [recordDefs]);

  const toggleExpanded = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Team Season Records</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        Select any record to see the top 20 historical team seasons for that record
      </p>

      {error && (
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Record</th>
              <th className={recordTableStyles.headerCell}>Value</th>
              <th className={recordTableStyles.headerCell}>Season</th>
            </tr>
          </thead>

          <tbody>
            {sectionDefs.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t bg-blue-50">
                  <td className={recordTableStyles.sectionCell} colSpan={3}>
                    {section.title}
                  </td>
                </tr>

                {section.records.map((def) => {
                  const top = (rowsByRecord[def.key] || [])[0];
                  const isOpen = expandedKey === def.key;

                  return (
                    <React.Fragment key={def.key}>
                      <tr
                        onClick={() => toggleExpanded(def.key)}
                        className={`border-t cursor-pointer hover:bg-gray-100 ${isOpen ? "bg-gray-50" : "bg-white"}`}
                      >
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>{def.label}</td>
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>
                          {top?.value === "—" ? top.value : formatRecordValue(top?.value)}
                        </td>
                        <td className={recordTableStyles.bodyCell}>{top?.season ?? "—"}</td>
                      </tr>

                      {isOpen && (
                        <tr className="border-t">
                          <td className={recordTableStyles.bodyCell} colSpan={3}>
                            <div className="overflow-x-auto">
                              <table className={recordTableStyles.innerTable}>
                                <thead className="bg-gray-200 font-bold">
                                  <tr>
                                    <th className={recordTableStyles.headerCell}>#</th>
                                    <th className={recordTableStyles.headerCell}>{def.abbr}</th>
                                    <th className={recordTableStyles.headerCell}>Season</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(rowsByRecord[def.key] || []).map((r, idx) => (
                                    <tr
                                      key={`${def.key}-${idx}`}
                                      className={`border-t ${
                                        r._placeholder
                                          ? "bg-white text-gray-400"
                                          : idx % 2 === 0
                                          ? "bg-white"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>{idx + 1}</td>
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>
                                        {r.value === "—" ? r.value : formatRecordValue(r.value)}
                                      </td>
                                      <td className={recordTableStyles.detailCell}>{r.season}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs italic text-gray-500">
        Team season records are calculated from all available completed-game statistics for each season.
      </p>
    </div>
  );
}
