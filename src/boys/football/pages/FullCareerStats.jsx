import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { recordTableStyles } from "../../basketball/pages/recordTableStyles";
import { FULL_CAREER_VIEW_CONFIG } from "../footballRecordConfigs";
import { usePreparedFootballRecordsData } from "../footballRecordsData";

import { footballPlayerPath } from "./footballDetailUtils";

export default function FullCareerStats() {
  const { data, error } = usePreparedFootballRecordsData();
  const [selectedView, setSelectedView] = useState("offense");
  const [sortField, setSortField] = useState(FULL_CAREER_VIEW_CONFIG.offense.defaultSort);
  const [sortDirection, setSortDirection] = useState("desc");
  const [playerQuery, setPlayerQuery] = useState("");

  useEffect(() => {
    const defaultSort = FULL_CAREER_VIEW_CONFIG[selectedView]?.defaultSort;
    if (defaultSort) {
      setSortField(defaultSort);
      setSortDirection("desc");
    }
  }, [selectedView]);

  const activeView = FULL_CAREER_VIEW_CONFIG[selectedView];
  const careerRows = data?.playerCareers || [];

  const sortedRows = useMemo(() => {
    if (!activeView) return [];

    const activeColumn = activeView.columns.find((column) => column.key === sortField);
    if (!activeColumn) return careerRows;

    return [...careerRows].sort((a, b) => {
      const aValue = activeColumn.sortValue(a);
      const bValue = activeColumn.sortValue(b);
      const aNumber = Number.isFinite(aValue) ? aValue : Number.NEGATIVE_INFINITY;
      const bNumber = Number.isFinite(bValue) ? bValue : Number.NEGATIVE_INFINITY;

      if (aNumber !== bNumber) {
        return sortDirection === "asc" ? aNumber - bNumber : bNumber - aNumber;
      }

      return String(a?.PlayerName || "").localeCompare(String(b?.PlayerName || ""));
    });
  }, [activeView, careerRows, sortDirection, sortField]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = playerQuery.trim().toLowerCase();
    if (!normalizedQuery) return sortedRows;

    return sortedRows.filter((row) =>
      String(row?.PlayerName || "").toLowerCase().includes(normalizedQuery)
    );
  }, [playerQuery, sortedRows]);

  const compactHeaderCellClass =
    "!px-[clamp(0.2rem,0.5vw,0.8rem)] !py-[clamp(0.18rem,0.32vw,0.38rem)]";
  const compactBodyCellClass =
    "!px-[clamp(0.2rem,0.65vw,0.85rem)] !py-[clamp(0.18rem,0.38vw,0.42rem)]";

  if (!data && !error) {
    return <div className="p-4 text-center text-gray-600">Loading football full career stats…</div>;
  }

  return (
    <div className="space-y-6 px-4 pt-2 pb-10 mx-auto max-w-7xl lg:pb-40">
      <h1 className="text-2xl font-bold text-center">Full Career Stats</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        View complete tracked football career totals for St. Andrew&apos;s players across every available MaxPreps game log
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(FULL_CAREER_VIEW_CONFIG).map(([viewKey, view]) => {
          const isActive = selectedView === viewKey;
          return (
            <button
              key={viewKey}
              type="button"
              onClick={() => setSelectedView(viewKey)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                isActive
                  ? "border-blue-900 bg-blue-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              {view.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 whitespace-pre-wrap text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full max-w-sm">
          <label htmlFor="football-career-player-search" className="sr-only">
            Search players in the football full career stats table
          </label>

          <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 shadow-sm">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 shrink-0 text-gray-500"
            >
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>

            <input
              id="football-career-player-search"
              type="search"
              value={playerQuery}
              onChange={(event) => setPlayerQuery(event.target.value)}
              placeholder="Search players"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <p className="text-xs italic text-center text-gray-500 sm:text-right">
          Click any column header to re-sort this career leaderboard view.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="font-bold bg-gray-200">
            <tr>
              <th className={`${recordTableStyles.headerCell} ${compactHeaderCellClass}`}>Player</th>
              {activeView.columns.map((column) => {
                const isSorted = sortField === column.key;
                return (
                  <th
                    key={column.key}
                    className={`${recordTableStyles.headerCell} ${compactHeaderCellClass}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (sortField === column.key) {
                          setSortDirection((previousDirection) =>
                            previousDirection === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setSortField(column.key);
                          setSortDirection("desc");
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1 w-full"
                    >
                      <span>{column.label}</span>
                      <span className="text-[0.7em]">
                        {isSorted ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row, index) => (
              <tr
                key={`${row?.CareerKey || row?.PlayerName || index}`}
                className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className={`${recordTableStyles.bodyCell} ${compactBodyCellClass}`}>
                  <div className={recordTableStyles.playerWrap}>
                    {row?.PlayerID ? (
                      <Link
                        to={footballPlayerPath(row.PlayerID)}
                        className={`${recordTableStyles.playerLink} text-blue-700`}
                      >
                        {row?.PlayerName || "—"}
                      </Link>
                    ) : (
                      <span className={recordTableStyles.playerText}>{row?.PlayerName || "—"}</span>
                    )}
                  </div>
                </td>

                {activeView.columns.map((column) => (
                  <td
                    key={`${row?.CareerKey || row?.PlayerName || index}-${column.key}`}
                    className={`${recordTableStyles.bodyCell} ${compactBodyCellClass}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}

            {filteredRows.length === 0 ? (
              <tr className="border-t bg-white">
                <td
                  className={recordTableStyles.bodyCell}
                  colSpan={activeView.columns.length + 1}
                >
                  No players match the current search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="text-xs italic text-center text-gray-500">
        Career totals use tracked MaxPreps football game logs and combine season-specific athlete entries by the shared MaxPreps football career identifier.
      </p>
    </div>
  );
}
