import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  buildTrackSeasonList,
  getTrackSeasonLabel,
} from "../trackPageUtils";

const styles = {
  page: {
    width: "100%",
  },
  title: {
    textAlign: "center",
    fontSize: "clamp(1.7rem, 4vw, 2.1rem)",
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "0.98rem",
    lineHeight: 1.7,
    color: "#475569",
    maxWidth: "900px",
    margin: "10px auto 0",
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
    fontSize: "clamp(0.78rem, 2vw, 0.95rem)",
    textAlign: "center",
    padding: "clamp(8px, 1.6vw, 11px) clamp(8px, 2vw, 12px)",
    border: "1px solid #cbd5e1",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "clamp(8px, 1.6vw, 10px) clamp(8px, 2vw, 12px)",
    border: "1px solid #cbd5e1",
    textAlign: "center",
    fontSize: "clamp(0.8rem, 2.15vw, 0.95rem)",
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
      const seasonMeets = meets
        .filter((meet) => Number(meet.Season) === Number(season.SeasonID))
        .slice()
        .sort((a, b) => String(a.Date || "").localeCompare(String(b.Date || "")));

      const highlightText = Array.isArray(season.HighlightNotes)
        ? season.HighlightNotes.slice(0, 2).join(" ")
        : "";

      return {
        seasonId: season.SeasonID,
        seasonLabel: getTrackSeasonLabel(season),
        coach: season.HeadCoach || "—",
        meetCount: seasonMeets.length,
        note: highlightText || season.StatusNote || "—",
      };
      });
  }, [meets, seasons]);

  return (
    <div style={styles.page}>
      {status ? <div style={styles.status}>{status}</div> : null}

      <h1 style={styles.title}>Track Seasons</h1>
      <p style={styles.subtitle}>
        The track section now runs season by season. Choose a year to open the
        full team page, see the athletes with loaded results, and expand each meet
        for the complete St. Andrew&apos;s results table.
      </p>
      <p style={styles.subtitle}>
        There is no 2019-20 season page because the program did not have any
        recorded meets during the Covid-19 shutdown.
      </p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Season</th>
              <th style={styles.th}>Coach</th>
              <th style={styles.th}>Meets</th>
              <th style={styles.th}>Season Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {seasonRows.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={4}>
                  <span style={styles.muted}>No track seasons are available yet.</span>
                </td>
              </tr>
            ) : (
              seasonRows.map((row) => (
                <tr key={row.seasonId}>
                  <td style={styles.td}>
                    <Link
                      to={`/athletics/track/seasons/${row.seasonId}`}
                      style={styles.link}
                    >
                      {row.seasonLabel}
                    </Link>
                  </td>
                  <td style={styles.td}>{row.coach}</td>
                  <td style={styles.td}>{row.meetCount}</td>
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
