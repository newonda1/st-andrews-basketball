import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  buildTrackSeasonList,
  getTrackSeasonLabel,
} from "../trackPageUtils";

const styles = {
  page: {
    width: "100%",
    paddingBottom: "12rem",
  },
  title: {
    textAlign: "center",
    fontSize: "clamp(1.7rem, 4vw, 2.1rem)",
    fontWeight: 700,
    color: "#0f172a",
  },
  status: {
    textAlign: "center",
    fontSize: "1rem",
    color: "#475569",
    margin: "8px 0 20px",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    marginTop: "26px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "transparent",
  },
  th: {
    background: "#dbeafe",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "1rem",
    textAlign: "center",
    padding: "clamp(8px, 1.6vw, 11px) clamp(8px, 2vw, 12px)",
    border: "1px solid #cbd5e1",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "clamp(8px, 1.6vw, 10px) clamp(8px, 2vw, 12px)",
    border: "1px solid #cbd5e1",
    textAlign: "center",
    fontSize: "1rem",
    color: "#111827",
    verticalAlign: "middle",
    background: "white",
  },
  leftTd: {
    textAlign: "left",
    lineHeight: 1.5,
  },
  link: {
    color: "#1d4ed8",
    textDecoration: "none",
    fontWeight: 700,
  },
  muted: {
    color: "#64748b",
  },
};

const SNAPSHOT_META_PATTERNS = [
  /^The spring now includes/i,
  /^The season now includes/i,
  /^The season preserves/i,
  /^The state meet still preserves/i,
  /^State-meet entries are loaded/i,
  /^No St\. Andrew's/i,
];

function buildSeasonSnapshot(season) {
  const notes = Array.isArray(season?.HighlightNotes)
    ? season.HighlightNotes.map((note) => String(note || "").trim()).filter(Boolean)
    : [];

  const highlightNotes = notes.filter(
    (note) => !SNAPSHOT_META_PATTERNS.some((pattern) => pattern.test(note))
  );

  const snapshotParts = (highlightNotes.length ? highlightNotes : notes).slice(0, 2);

  if (snapshotParts.length) {
    return snapshotParts.join(" ");
  }

  return season?.StatusNote || "—";
}

export default function YearlyResults({
  seasons = [],
  meets = [],
  status = "",
}) {
  const seasonRows = useMemo(() => {
    return buildTrackSeasonList(seasons, meets)
      .slice()
      .sort((a, b) => Number(a.SeasonID) - Number(b.SeasonID))
      .map((season) => {
        return {
          seasonId: season.SeasonID,
          seasonLabel: getTrackSeasonLabel(season),
          coach: season.HeadCoach || "—",
          note: buildSeasonSnapshot(season),
        };
      });
  }, [meets, seasons]);

  return (
    <div style={styles.page}>
      <style>
        {`
          @media (min-width: 768px) {
            .track-seasons-desktop-nowrap {
              white-space: nowrap;
            }
          }
        `}
      </style>

      {status ? <div style={styles.status}>{status}</div> : null}

      <h1 style={styles.title}>Track Seasons</h1>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Season</th>
              <th style={styles.th}>Coach</th>
              <th style={styles.th}>Season Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {seasonRows.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={3}>
                  <span style={styles.muted}>No track seasons are available yet.</span>
                </td>
              </tr>
            ) : (
              seasonRows.map((row) => (
                <tr key={row.seasonId}>
                  <td style={styles.td} className="track-seasons-desktop-nowrap">
                    <Link
                      to={`/athletics/track/seasons/${row.seasonId}`}
                      style={styles.link}
                      className="track-seasons-desktop-nowrap"
                    >
                      {row.seasonLabel}
                    </Link>
                  </td>
                  <td style={styles.td} className="track-seasons-desktop-nowrap">
                    {row.coach}
                  </td>
                  <td style={{ ...styles.td, ...styles.leftTd }}>{row.note}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
