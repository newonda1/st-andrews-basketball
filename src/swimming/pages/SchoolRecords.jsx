import React, { useMemo, useState } from "react";
import { recordTableStyles } from "../../track/pages/recordTableStyles";
import { sortSwimEventNames } from "../swimmingPageUtils";

const CATEGORY_ORDER = {
  individual: 0,
  relay: 1,
};

const GENDER_ORDER = {
  Girls: 0,
  Boys: 1,
};

const LEVEL_ORDER = {
  Varsity: 0,
  "Middle School": 1,
};

function getLevelTableTitle(level) {
  if (level === "Varsity") return "High School Records";
  if (level === "Middle School") return "Middle School Records";
  return `${level} Records`;
}

function parseSwimTimeMark(mark) {
  if (!mark) return null;

  const value = String(mark).trim().replace(/[^\d:.]/g, "");
  if (!value) return null;

  const parts = value.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

  return null;
}

function getEventCategory(event) {
  return String(event || "").includes("Relay") ? "relay" : "individual";
}

function compareMarks(a, b) {
  return a.comparableValue - b.comparableValue;
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

function RecordsTable({
  tableTitle,
  sections,
  expandedKey,
  onToggleExpanded,
}) {
  if (!sections.length) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">{tableTitle}</h2>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
          No records are loaded for this section yet.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">{tableTitle}</h2>

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="bg-gray-200 font-bold">
            <tr>
              <th className={recordTableStyles.headerCell}>Event</th>
              <th className={recordTableStyles.headerCell}>Swimmer / Relay</th>
              <th className={recordTableStyles.headerCell}>Best Time</th>
              <th className={recordTableStyles.headerCell}>Date</th>
              <th className={recordTableStyles.headerCell}>Meet</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <React.Fragment key={`${tableTitle}-${section.title}`}>
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
                        onClick={() => onToggleExpanded(record.key)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onToggleExpanded(record.key);
                          }
                        }}
                        className={`cursor-pointer border-t hover:bg-gray-100 ${
                          isExpanded ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td
                          className={`${recordTableStyles.bodyCell} text-center font-semibold text-blue-900`}
                        >
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
                                    <th className={recordTableStyles.headerCell}>Rank</th>
                                    <th className={recordTableStyles.headerCell}>
                                      Swimmer / Relay
                                    </th>
                                    <th className={recordTableStyles.headerCell}>Time</th>
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
                                      <td className={recordTableStyles.detailCell}>
                                        {row.Mark}
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
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SchoolRecords({
  playerMeetStats = [],
  meets = [],
  status = "",
}) {
  const [expandedKey, setExpandedKey] = useState(null);

  const sections = useMemo(() => {
    const meetMap = new Map(meets.map((meet) => [String(meet.MeetID), meet]));
    const grouped = new Map();

    playerMeetStats.forEach((entry) => {
      if (!entry?.Event || !entry?.Gender || !entry?.Mark) return;

      const comparableValue = parseSwimTimeMark(entry.Mark);
      if (comparableValue == null) return;

      const meet = meetMap.get(String(entry.MeetID));
      const level = entry.Level || meet?.Level || "Varsity";
      const category = getEventCategory(entry.Event);
      const key = `${entry.Gender}__${level}__${category}__${entry.Event}`;

      if (!grouped.has(key)) grouped.set(key, []);

      grouped.get(key).push({
        ...entry,
        level,
        category,
        comparableValue,
        athleteName: entry.AthleteName || "St. Andrew's Relay Team",
        meetName: meet?.Name || "Unknown Meet",
        meetDate: meet?.Date || null,
      });
    });

    const bySection = new Map();

    grouped.forEach((entries, key) => {
      const [gender, level, category, event] = key.split("__");
      const title = `${gender} ${category === "relay" ? "Relays" : "Individual Events"}`;
      const sortedEntries = entries.slice().sort(compareMarks).slice(0, 20);

      if (!sortedEntries.length) return;

      const sectionKey = `${level}__${title}`;
      if (!bySection.has(sectionKey)) {
        bySection.set(sectionKey, {
          title,
          gender,
          level,
          category,
          records: [],
        });
      }

      bySection.get(sectionKey).records.push({
        key,
        gender,
        level,
        category,
        event,
        best: sortedEntries[0],
        rows: sortedEntries,
      });
    });

    return Array.from(bySection.values())
      .map((section) => ({
        ...section,
        records: section.records.sort((a, b) => sortSwimEventNames(a.event, b.event)),
      }))
      .sort((a, b) => {
        if (a.gender !== b.gender) {
          return (GENDER_ORDER[a.gender] ?? 99) - (GENDER_ORDER[b.gender] ?? 99);
        }

        if (a.level !== b.level) {
          return (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99);
        }

        return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
      });
  }, [meets, playerMeetStats]);

  const highSchoolSections = useMemo(
    () => sections.filter((section) => section.level === "Varsity"),
    [sections]
  );

  const middleSchoolSections = useMemo(
    () => sections.filter((section) => section.level === "Middle School"),
    [sections]
  );

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

      <h1 className="text-2xl font-bold text-center">School Records</h1>
      <p className="-mt-1.5 text-center text-sm italic text-gray-600">
        Select any event to see the top 20 St. Andrew&apos;s swim performances
        currently loaded for that event
      </p>

      {!sections.length ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-600">
          No swim records are loaded yet.
        </div>
      ) : (
        <>
          <RecordsTable
            tableTitle={getLevelTableTitle("Varsity")}
            sections={highSchoolSections}
            expandedKey={expandedKey}
            onToggleExpanded={toggleExpanded}
          />
          <RecordsTable
            tableTitle={getLevelTableTitle("Middle School")}
            sections={middleSchoolSections}
            expandedKey={expandedKey}
            onToggleExpanded={toggleExpanded}
          />
        </>
      )}
    </div>
  );
}
