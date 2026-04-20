import React, { useMemo, useState } from "react";
import { recordTableStyles } from "./recordTableStyles";

const CATEGORY_ORDER = {
  running: 0,
  relay: 1,
  field: 2,
};

const EVENT_ORDER = [
  "55 Meter Dash",
  "60 Meter Dash",
  "100 Meter Dash",
  "200 Meter Dash",
  "400 Meter Dash",
  "800 Meter Run",
  "1600 Meter Run",
  "3200 Meter Run",
  "100 Meter Hurdles",
  "110 Meter Hurdles",
  "300 Meter Hurdles",
  "4x100 Meter Relay",
  "4x400 Meter Relay",
  "4x800 Meter Relay",
  "Long Jump",
  "Triple Jump",
  "High Jump",
  "Pole Vault",
  "Shot Put",
  "Discus",
  "Javelin",
];

function safeNum(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseTimeMark(mark) {
  if (!mark) return null;

  const value = String(mark).trim();
  if (!value) return null;

  const parts = value.split(":");
  if (parts.length === 1) return safeNum(parts[0]);

  if (parts.length === 2) {
    const minutes = safeNum(parts[0]);
    const seconds = safeNum(parts[1]);
    if (minutes == null || seconds == null) return null;
    return minutes * 60 + seconds;
  }

  return null;
}

function parseDistanceMark(mark) {
  if (!mark) return null;

  const value = String(mark).trim();
  const feetInches = value.match(/^(\d+)-(\d+(?:\.\d+)?)$/);
  if (feetInches) {
    return Number(feetInches[1]) * 12 + Number(feetInches[2]);
  }

  return safeNum(value);
}

function getEventCategory(event) {
  if (event.includes("Relay")) return "relay";

  if (
    event.includes("Jump") ||
    event.includes("Put") ||
    event.includes("Discus") ||
    event.includes("Vault") ||
    event.includes("Javelin") ||
    event.includes("Throw")
  ) {
    return "field";
  }

  return "running";
}

function getComparableValue(event, mark) {
  const category = getEventCategory(event);
  return category === "field" ? parseDistanceMark(mark) : parseTimeMark(mark);
}

function compareMarks(a, b) {
  if (a.category === "field") return b.comparableValue - a.comparableValue;
  return a.comparableValue - b.comparableValue;
}

function sortEventName(a, b) {
  const aIndex = EVENT_ORDER.indexOf(a);
  const bIndex = EVENT_ORDER.indexOf(b);

  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }

  return a.localeCompare(b);
}

function resolveAthleteName(entry, playerMap) {
  if (entry.PlayerID != null) {
    const player = playerMap.get(String(entry.PlayerID));
    if (player) return `${player.FirstName} ${player.LastName}`.trim();
  }

  return entry.AthleteName || "St. Andrew's Relay Team";
}

function formatMeetDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
}

export default function SchoolRecords({
  playerMeetStats = [],
  players = [],
  meets = [],
}) {
  const [expandedKey, setExpandedKey] = useState(null);

  const sections = useMemo(() => {
    const playerMap = new Map(players.map((player) => [String(player.PlayerID), player]));
    const meetMap = new Map(meets.map((meet) => [String(meet.MeetID), meet]));
    const grouped = new Map();

    playerMeetStats.forEach((entry) => {
      if (!entry?.Event || !entry?.Gender || !entry?.Mark) return;

      const comparableValue = getComparableValue(entry.Event, entry.Mark);
      if (comparableValue == null) return;

      const meet = meetMap.get(String(entry.MeetID));
      const category = getEventCategory(entry.Event);
      const key = `${entry.Gender}__${category}__${entry.Event}`;

      if (!grouped.has(key)) grouped.set(key, []);

      grouped.get(key).push({
        ...entry,
        category,
        comparableValue,
        athleteName: resolveAthleteName(entry, playerMap),
        meetName: meet?.Name || "Unknown Meet",
        meetDate: meet?.Date || null,
      });
    });

    const bySection = new Map();

    grouped.forEach((entries, key) => {
      const [gender, category, event] = key.split("__");
      const title = `${gender} ${category === "field" ? "Field Events" : category === "relay" ? "Relays" : "Running Events"}`;
      const sortedEntries = entries.slice().sort(compareMarks).slice(0, 20);

      if (!sortedEntries.length) return;

      if (!bySection.has(title)) bySection.set(title, []);

      bySection.get(title).push({
        key,
        event,
        best: sortedEntries[0],
        rows: sortedEntries,
      });
    });

    return Array.from(bySection.entries())
      .map(([title, records]) => ({
        title,
        records: records.sort((a, b) => sortEventName(a.event, b.event)),
      }))
      .sort((a, b) => {
        const [aGender, aCategoryText] = a.title.split(" ", 2);
        const [bGender, bCategoryText] = b.title.split(" ", 2);
        if (aGender !== bGender) return aGender.localeCompare(bGender);

        const aCategory =
          aCategoryText === "Field" ? "field" : aCategoryText === "Relays" ? "relay" : "running";
        const bCategory =
          bCategoryText === "Field" ? "field" : bCategoryText === "Relays" ? "relay" : "running";

        return CATEGORY_ORDER[aCategory] - CATEGORY_ORDER[bCategory];
      });
  }, [meets, playerMeetStats, players]);

  const toggleExpanded = (key) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="pt-2 pb-10 lg:pb-40 space-y-6 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center">School Records</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        Select any event to see the top 20 St. Andrew&apos;s performances currently
        loaded for that event
      </p>

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Event</th>
              <th className={recordTableStyles.headerCell}>Athlete / Team</th>
              <th className={recordTableStyles.headerCell}>Best Mark</th>
              <th className={recordTableStyles.headerCell}>Date</th>
              <th className={recordTableStyles.headerCell}>Meet</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
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
                        <td className={recordTableStyles.bodyCell}>{record.best.Mark}</td>
                        <td className={recordTableStyles.bodyCell}>
                          {formatMeetDate(record.best.meetDate)}
                        </td>
                        <td className={recordTableStyles.bodyCell}>{record.best.meetName}</td>
                      </tr>

                      {isExpanded ? (
                        <tr>
                          <td className="border p-0" colSpan={5}>
                            <div className="overflow-x-auto">
                              <table className={recordTableStyles.innerTable}>
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className={recordTableStyles.headerCell}>Rank</th>
                                    <th className={recordTableStyles.headerCell}>Athlete / Team</th>
                                    <th className={recordTableStyles.headerCell}>Mark</th>
                                    <th className={recordTableStyles.headerCell}>Meet</th>
                                    <th className={recordTableStyles.headerCell}>Date</th>
                                    <th className={recordTableStyles.headerCell}>Place</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {record.rows.map((row, index) => (
                                    <tr key={`${record.key}-${index}`}>
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
                                      <td className={recordTableStyles.detailCell}>{row.Mark}</td>
                                      <td className={recordTableStyles.detailCell}>{row.meetName}</td>
                                      <td className={recordTableStyles.detailCell}>
                                        {formatMeetDate(row.meetDate)}
                                      </td>
                                      <td className={recordTableStyles.detailCell}>{row.Place}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
