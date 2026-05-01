import React, { useMemo, useState } from "react";
import { recordTableStyles } from "./recordTableStyles";
import {
  buildCrossCountryPlayerMap,
  cleanCrossCountryRaceLabel,
  formatCrossCountryDate,
  getCrossCountryDivision,
  getCrossCountryDivisionLabel,
  parseCrossCountryTime,
  resolveCrossCountryAthleteName,
  sortCrossCountryDivisions,
  sortCrossCountryEventNames,
} from "../crossCountryPageUtils";

const CATEGORY_ORDER = {
  Girls: 0,
  Boys: 1,
};

function compareTimes(a, b) {
  if (a.comparableValue == null && b.comparableValue == null) return 0;
  if (a.comparableValue == null) return 1;
  if (b.comparableValue == null) return -1;
  return a.comparableValue - b.comparableValue;
}

function formatMeetDate(value) {
  if (!value) return "—";
  return formatCrossCountryDate(value);
}

export default function SchoolRecords({
  playerMeetStats = [],
  players = [],
  meets = [],
  status = "",
}) {
  const [expandedKey, setExpandedKey] = useState(null);

  const sections = useMemo(() => {
    const playerMap = buildCrossCountryPlayerMap(players);
    const meetMap = new Map(meets.map((meet) => [String(meet.MeetID), meet]));
    const grouped = new Map();

    playerMeetStats.forEach((entry) => {
      if (!entry?.Event || !entry?.Gender || !entry?.Mark) return;

      const comparableValue = parseCrossCountryTime(entry.Mark);
      if (comparableValue == null) return;

      const meet = meetMap.get(String(entry.MeetID));
      const division = getCrossCountryDivision(entry, meet);
      const key = `${division}__${entry.Gender}__${entry.Event}`;

      if (!grouped.has(key)) grouped.set(key, []);

      grouped.get(key).push({
        ...entry,
        division,
        comparableValue,
        athleteName: resolveCrossCountryAthleteName(entry, playerMap),
        raceLabel: cleanCrossCountryRaceLabel(entry.Race),
        meetName: meet?.Name || "Unknown Meet",
        meetDate: meet?.Date || null,
      });
    });

    const bySection = new Map();

    grouped.forEach((entries, key) => {
      const [division, gender, event] = key.split("__");
      const sortedEntries = entries.slice().sort(compareTimes).slice(0, 20);

      if (!sortedEntries.length) return;

      const title = `${getCrossCountryDivisionLabel(division)} ${gender} Top Times`;
      if (!bySection.has(title)) bySection.set(title, []);

      bySection.get(title).push({
        key,
        division,
        gender,
        event,
        best: sortedEntries[0],
        rows: sortedEntries,
      });
    });

    return Array.from(bySection.entries())
      .map(([title, records]) => ({
        title,
        records: records.sort((a, b) => sortCrossCountryEventNames(a.event, b.event)),
      }))
      .sort((a, b) => {
        const aFirstRecord = a.records[0] || {};
        const bFirstRecord = b.records[0] || {};
        const divisionDiff = sortCrossCountryDivisions(
          aFirstRecord.division,
          bFirstRecord.division
        );
        if (divisionDiff !== 0) return divisionDiff;

        return (
          (CATEGORY_ORDER[aFirstRecord.gender] ?? 99) -
          (CATEGORY_ORDER[bFirstRecord.gender] ?? 99)
        );
      });
  }, [meets, playerMeetStats, players]);

  const toggleExpanded = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      {status ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-600 shadow-sm">
          {status}
        </div>
      ) : null}

      <h1 className="text-center text-[clamp(1.7rem,4vw,2.1rem)] font-bold text-slate-900">
        School Records
      </h1>
      <p className="-mt-1.5 text-center text-[clamp(0.9rem,2vw,1rem)] italic text-gray-600">
        Select any distance to see the top 20 St. Andrew&apos;s times currently
        loaded for that level, gender, and distance
      </p>

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Distance</th>
              <th className={recordTableStyles.headerCell}>Athlete</th>
              <th className={recordTableStyles.headerCell}>Best Time</th>
              <th className={recordTableStyles.headerCell}>Date</th>
              <th className={recordTableStyles.headerCell}>Meet</th>
            </tr>
          </thead>
          <tbody>
            {sections.length ? (
              sections.map((section) => (
                <React.Fragment key={section.title}>
                  <tr className="border-t bg-blue-50">
                    <td className={recordTableStyles.sectionCell} colSpan={5}>
                      {section.title}
                    </td>
                  </tr>

                  {section.records.map((record) => {
                    const isExpanded = expandedKey === record.key;
                    return (
                      <React.Fragment key={record.key}>
                        <tr
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleExpanded(record.key)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleExpanded(record.key);
                            }
                          }}
                          className={`cursor-pointer border-t hover:bg-gray-100 ${
                            isExpanded ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td className={`${recordTableStyles.bodyCell} text-center font-semibold text-blue-900`}>
                            {record.event}
                          </td>
                          <td className={recordTableStyles.bodyCell}>
                            <div className={recordTableStyles.playerWrap}>
                              <span className={recordTableStyles.playerText}>
                                {record.best.athleteName}
                              </span>
                            </div>
                          </td>
                          <td className={recordTableStyles.bodyCell}>
                            {record.best.Mark}
                          </td>
                          <td className={recordTableStyles.bodyCell}>
                            {formatMeetDate(record.best.meetDate)}
                          </td>
                          <td className={recordTableStyles.bodyCell}>
                            {record.best.meetName}
                          </td>
                        </tr>

                        {isExpanded ? (
                          <tr>
                            <td className="border p-0" colSpan={5}>
                              <div className="overflow-x-auto">
                                <table className={recordTableStyles.innerTable}>
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className={recordTableStyles.headerCell}>
                                        Rank
                                      </th>
                                      <th className={recordTableStyles.headerCell}>
                                        Athlete
                                      </th>
                                      <th className={recordTableStyles.headerCell}>
                                        Time
                                      </th>
                                      <th className={recordTableStyles.headerCell}>
                                        Race
                                      </th>
                                      <th className={recordTableStyles.headerCell}>
                                        Meet
                                      </th>
                                      <th className={recordTableStyles.headerCell}>
                                        Date
                                      </th>
                                      <th className={recordTableStyles.headerCell}>
                                        Place
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {record.rows.map((row, index) => (
                                      <tr key={`${record.key}-${row.StatID || index}`}>
                                        <td className={recordTableStyles.detailCell}>
                                          {index + 1}
                                        </td>
                                        <td className={recordTableStyles.detailCell}>
                                          <div className={recordTableStyles.playerWrap}>
                                            <span className={recordTableStyles.playerText}>
                                              {row.athleteName}
                                            </span>
                                          </div>
                                        </td>
                                        <td className={recordTableStyles.detailCell}>
                                          {row.Mark}
                                        </td>
                                        <td className={recordTableStyles.detailCell}>
                                          {row.raceLabel}
                                        </td>
                                        <td className={recordTableStyles.detailCell}>
                                          {row.meetName}
                                        </td>
                                        <td className={recordTableStyles.detailCell}>
                                          {formatMeetDate(row.meetDate)}
                                        </td>
                                        <td className={recordTableStyles.detailCell}>
                                          {row.Place || "—"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))
            ) : (
              <tr className="border-t bg-white">
                <td className={recordTableStyles.bodyCell} colSpan={5}>
                  <span className="text-gray-500">
                    No cross country times are loaded yet.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
