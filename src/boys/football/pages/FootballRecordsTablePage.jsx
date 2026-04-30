import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { recordTableStyles } from "../../basketball/pages/recordTableStyles";

import { footballPlayerPath } from "./footballDetailUtils";

function PlayerNameCell({ row }) {
  return (
    <div className={recordTableStyles.playerWrap}>
      {row?.playerId ? (
        <Link
          to={footballPlayerPath(row.playerId)}
          className={`${recordTableStyles.playerLink} text-blue-700`}
        >
          {row?.playerName || "—"}
        </Link>
      ) : (
        <span className={recordTableStyles.playerText}>{row?.playerName || "—"}</span>
      )}
    </div>
  );
}

export function renderPlayerColumn(row) {
  return <PlayerNameCell row={row} />;
}

export default function FootballRecordsTablePage({
  title,
  subtitle,
  sectionDefs,
  rowsByRecord,
  error,
  summaryColumns,
  detailColumns,
  footnote = "",
}) {
  const [expandedKey, setExpandedKey] = useState(null);

  const visibleSections = useMemo(
    () =>
      (sectionDefs || [])
        .map((section) => ({
          ...section,
          records: (section.records || []).filter((record) =>
            (rowsByRecord?.[record.key] || []).some((row) => !row?._placeholder)
          ),
        }))
        .filter((section) => section.records.length > 0),
    [rowsByRecord, sectionDefs]
  );

  const topColumns = summaryColumns || [];
  const expandedColumns = detailColumns || [];
  const outerColSpan = topColumns.length + 1;

  return (
    <div className="space-y-6 px-4 pt-2 pb-10 mx-auto max-w-6xl lg:pb-40">
      <h1 className="text-2xl font-bold text-center">{title}</h1>
      {subtitle ? (
        <p className="-mt-1.5 text-center text-sm italic text-gray-600">{subtitle}</p>
      ) : null}

      {error ? (
        <div className="p-3 whitespace-pre-wrap text-red-700 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className={recordTableStyles.outerTable}>
          <thead className="font-bold bg-gray-200">
            <tr>
              <th className={recordTableStyles.headerCell}>Record</th>
              {topColumns.map((column) => (
                <th key={column.header} className={recordTableStyles.headerCell}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleSections.map((section) => (
              <React.Fragment key={section.title}>
                <tr className="border-t bg-blue-50">
                  <td className={recordTableStyles.sectionCell} colSpan={outerColSpan}>
                    {section.title}
                  </td>
                </tr>

                {section.records.map((record) => {
                  const rows = rowsByRecord?.[record.key] || [];
                  const topRow = rows[0] || null;
                  const isOpen = expandedKey === record.key;

                  return (
                    <React.Fragment key={record.key}>
                      <tr
                        onClick={() =>
                          setExpandedKey((previousKey) =>
                            previousKey === record.key ? null : record.key
                          )
                        }
                        className={`border-t cursor-pointer hover:bg-gray-100 ${
                          isOpen ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className={`${recordTableStyles.bodyCell} font-semibold`}>
                          <div className="leading-tight">
                            <div>{record.label}</div>
                            {record.qualifierText ? (
                              <div className="mt-1 text-[clamp(0.62rem,0.85vw,0.8rem)] italic font-normal text-gray-600">
                                {record.qualifierText}
                              </div>
                            ) : null}
                          </div>
                        </td>

                        {topColumns.map((column) => (
                          <td
                            key={`${record.key}-${column.header}`}
                            className={`${recordTableStyles.bodyCell} ${
                              column.emphasize ? "font-semibold" : ""
                            }`}
                          >
                            {column.render(topRow)}
                          </td>
                        ))}
                      </tr>

                      {isOpen ? (
                        <tr className="border-t">
                          <td className={recordTableStyles.bodyCell} colSpan={outerColSpan}>
                            <div className="overflow-x-auto">
                              <table className={recordTableStyles.innerTable}>
                                <thead className="font-bold bg-gray-200">
                                  <tr>
                                    <th className={recordTableStyles.headerCell}>#</th>
                                    {expandedColumns.map((column) => (
                                      <th
                                        key={`${record.key}-${column.header}-detail`}
                                        className={recordTableStyles.headerCell}
                                      >
                                        {column.header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody>
                                  {rows.map((row, index) => (
                                    <tr
                                      key={`${record.key}-${index}`}
                                      className={`border-t ${
                                        row?._placeholder
                                          ? "bg-white text-gray-400"
                                          : index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50"
                                      }`}
                                    >
                                      <td className={`${recordTableStyles.detailCell} font-semibold`}>
                                        {index + 1}
                                      </td>

                                      {expandedColumns.map((column) => (
                                        <td
                                          key={`${record.key}-${index}-${column.header}`}
                                          className={`${recordTableStyles.detailCell} ${
                                            column.emphasize ? "font-semibold" : ""
                                          }`}
                                        >
                                          {column.render(row)}
                                        </td>
                                      ))}
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

      {footnote ? (
        <p className="text-xs italic text-center text-gray-500">{footnote}</p>
      ) : null}
    </div>
  );
}
