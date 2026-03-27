

import React, { useEffect, useMemo, useState } from "react";

const OUTPUT_FIELDS = [
  "StatID",
  "GameID",
  "PlayerID",
  "PA",
  "AB",
  "R",
  "H",
  "1B",
  "2B",
  "3B",
  "HR",
  "RBI",
  "BB",
  "SO",
  "HBP",
  "SAC",
  "SF",
  "ROE",
  "FC",
  "SB",
  "CS",
  "TB",
  "IP",
  "BF",
  "Pitches",
  "W",
  "L",
  "SV",
  "SVO",
  "BS",
  "H_Allowed",
  "R_Allowed",
  "ER",
  "BB_Allowed",
  "SO_Pitching",
  "HBP_Pitching",
  "BK",
  "PIK_Allowed",
  "CS_Pitching",
  "SB_Allowed",
  "WP",
  "A",
  "PO",
  "E",
  "DP",
  "TP",
  "PB",
  "PIK_Fielding",
  "CI",
  "P_Innings",
  "C_Innings",
  "1B_Innings",
  "2B_Innings",
  "3B_Innings",
  "SS_Innings",
  "LF_Innings",
  "CF_Innings",
  "RF_Innings",
  "SF_Innings",
];

const BATTING_ALIASES = {
  PA: ["PA", "PLATE APPEARANCES"],
  AB: ["AB", "AT BATS"],
  R: ["R", "RUNS"],
  H: ["H", "HITS"],
  "1B": ["1B", "SINGLES"],
  "2B": ["2B", "DOUBLES"],
  "3B": ["3B", "TRIPLES"],
  HR: ["HR", "HOME RUNS"],
  RBI: ["RBI", "RUNS BATTED IN"],
  BB: ["BB", "WALKS"],
  SO: ["SO", "K", "STRIKEOUTS"],
  HBP: ["HBP", "HIT BY PITCH"],
  SAC: ["SAC", "SH", "SAC BUNTS", "SACRIFICE HITS"],
  SF: ["SF", "SAC FLY", "SAC FLIES"],
  ROE: ["ROE", "REACHED ON ERROR"],
  FC: ["FC", "FIELDERS CHOICE", "FIELDERS CHOICE"],
  SB: ["SB", "STOLEN BASES"],
  CS: ["CS", "CAUGHT STEALING"],
  TB: ["TB", "TOTAL BASES"],
};

const PITCHING_ALIASES = {
  IP: ["IP", "INNINGS PITCHED"],
  BF: ["BF", "BATTERS FACED"],
  Pitches: ["PITCHES", "PITCH COUNT", "PC"],
  W: ["W", "WINS"],
  L: ["L", "LOSSES"],
  SV: ["SV", "SAVES"],
  SVO: ["SVO", "SAVE OPPORTUNITIES"],
  BS: ["BS", "BLOWN SAVES"],
  H_Allowed: ["H ALLOWED", "H_A", "HA", "HITS ALLOWED"],
  R_Allowed: ["R ALLOWED", "R_A", "RA", "RUNS ALLOWED"],
  ER: ["ER", "EARNED RUNS"],
  BB_Allowed: ["BB ALLOWED", "BB_A", "BBA", "WALKS ALLOWED"],
  SO_Pitching: ["SO PITCHING", "K PITCHING", "PITCHING STRIKEOUTS", "SO_P"],
  HBP_Pitching: ["HBP PITCHING", "HBP ALLOWED", "HBP_A"],
  BK: ["BK", "BALKS"],
  PIK_Allowed: ["PIK ALLOWED", "PICKOFFS ALLOWED", "PIK_A"],
  CS_Pitching: ["CS PITCHING", "CAUGHT STEALING PITCHING", "CS_P"],
  SB_Allowed: ["SB ALLOWED", "STOLEN BASES ALLOWED", "SB_A"],
  WP: ["WP", "WILD PITCHES"],
};

const FIELDING_ALIASES = {
  A: ["A", "ASSISTS"],
  PO: ["PO", "PUTOUTS"],
  E: ["E", "ERRORS"],
  DP: ["DP", "DOUBLE PLAYS"],
  TP: ["TP", "TRIPLE PLAYS"],
  PB: ["PB", "PASSED BALLS"],
  PIK_Fielding: ["PIK FIELDING", "PICKOFFS FIELDING", "PIK_F"],
  CI: ["CI", "CATCHERS INTERFERENCE"],
};

const POSITION_ALIASES = {
  P_Innings: ["P INNINGS", "P", "PITCHER INNINGS"],
  C_Innings: ["C INNINGS", "C", "CATCHER INNINGS"],
  "1B_Innings": ["1B INNINGS", "1B", "FIRST BASE INNINGS"],
  "2B_Innings": ["2B INNINGS", "2B", "SECOND BASE INNINGS"],
  "3B_Innings": ["3B INNINGS", "3B", "THIRD BASE INNINGS"],
  SS_Innings: ["SS INNINGS", "SS", "SHORTSTOP INNINGS"],
  LF_Innings: ["LF INNINGS", "LF", "LEFT FIELD INNINGS"],
  CF_Innings: ["CF INNINGS", "CF", "CENTER FIELD INNINGS"],
  RF_Innings: ["RF INNINGS", "RF", "RIGHT FIELD INNINGS"],
  SF_Innings: ["SF INNINGS", "SF", "SHORT FIELD INNINGS"],
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/[’']/g, "")
    .replace(/&/g, " AND ")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function parseCSV(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);

  if (!rows.length) return [];

  const headers = rows[0].map((header) => normalizeHeader(header));
  return rows.slice(1).map((values) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] ?? "";
    });
    return obj;
  });
}

function firstNonEmpty(row, aliases) {
  for (const alias of aliases) {
    const normalized = normalizeHeader(alias);
    if (row[normalized] !== undefined && String(row[normalized]).trim() !== "") {
      return row[normalized];
    }
  }
  return "";
}

function parseInteger(value) {
  const cleaned = String(value ?? "").trim().replace(/,/g, "");
  if (!cleaned) return 0;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseDecimal(value) {
  const cleaned = String(value ?? "").trim().replace(/,/g, "");
  if (!cleaned) return 0;
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildPlayerIndexes(players, rosterPlayers) {
  const rosterMap = new Map(rosterPlayers.map((entry) => [String(entry.PlayerID), entry]));
  const byJerseyLast = new Map();
  const byFullName = new Map();
  const byLastName = new Map();

  players.forEach((player) => {
    const rosterEntry = rosterMap.get(String(player.PlayerID));
    if (!rosterEntry) return;

    const first = normalizeName(player.FirstName);
    const last = normalizeName(player.LastName);
    const full = `${first}|${last}`;
    const jersey = String(rosterEntry.JerseyNumber ?? "").trim();

    if (jersey && last) byJerseyLast.set(`${jersey}|${last}`, player);
    if (full) byFullName.set(full, player);
    if (last) byLastName.set(last, player);
  });

  return { byJerseyLast, byFullName, byLastName };
}

function matchPlayer(row, indexes) {
  const jersey = firstNonEmpty(row, ["NUMBER", "NO", "JERSEY", "#"]).trim();
  const firstName = normalizeName(firstNonEmpty(row, ["FIRST NAME", "FIRST", "PLAYER FIRST NAME"]));
  const lastName = normalizeName(firstNonEmpty(row, ["LAST NAME", "LAST", "PLAYER LAST NAME"]));

  if (jersey && lastName && indexes.byJerseyLast.has(`${jersey}|${lastName}`)) {
    return indexes.byJerseyLast.get(`${jersey}|${lastName}`);
  }

  if (firstName && lastName && indexes.byFullName.has(`${firstName}|${lastName}`)) {
    return indexes.byFullName.get(`${firstName}|${lastName}`);
  }

  if (lastName && indexes.byLastName.has(lastName)) {
    return indexes.byLastName.get(lastName);
  }

  return null;
}

function readStatGroup(row, aliasMap, parser) {
  const output = {};
  Object.entries(aliasMap).forEach(([field, aliases]) => {
    output[field] = parser(firstNonEmpty(row, aliases));
  });
  return output;
}

function isLikelyPlayerRow(row) {
  const firstName = firstNonEmpty(row, ["FIRST NAME", "FIRST", "PLAYER FIRST NAME"]);
  const lastName = firstNonEmpty(row, ["LAST NAME", "LAST", "PLAYER LAST NAME"]);
  const number = firstNonEmpty(row, ["NUMBER", "NO", "JERSEY", "#"]);
  const joined = `${firstName} ${lastName}`.trim().toUpperCase();

  if (!firstName && !lastName && !number) return false;
  if (joined.includes("TOTAL")) return false;
  if (joined.includes("OPPONENT")) return false;
  return true;
}

function formatValue(field, value) {
  if (field === "StatID") return String(value);
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  return JSON.stringify(value);
}

function formatJson(entries) {
  if (!entries.length) return "[]";

  const lines = ["["];

  entries.forEach((entry, entryIndex) => {
    lines.push("  {");
    OUTPUT_FIELDS.forEach((field, fieldIndex) => {
      const suffix = fieldIndex === OUTPUT_FIELDS.length - 1 ? "" : ",";
      lines.push(`    \"${field}\": ${formatValue(field, entry[field])}${suffix}`);
    });
    lines.push(entryIndex === entries.length - 1 ? "  }" : "  },");
  });

  lines.push("]");
  return lines.join("\n");
}

export default function boysBaseballAdmin() {
  const [players, setPlayers] = useState([]);
  const [seasonRosters, setSeasonRosters] = useState([]);
  const [seasonId, setSeasonId] = useState("2026");
  const [gameId, setGameId] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [output, setOutput] = useState("[]");
  const [warnings, setWarnings] = useState([]);
  const [status, setStatus] = useState("Load a GameChanger CSV and generate playergamestats entries.");

  useEffect(() => {
    async function loadData() {
      try {
        const [playersRes, rostersRes] = await Promise.all([
          fetch("/data/boys/players.json"),
          fetch("/data/boys/baseball/seasonrosters.json"),
        ]);

        if (!playersRes.ok || !rostersRes.ok) {
          throw new Error("Could not load players or season roster data.");
        }

        const [playersData, rostersData] = await Promise.all([
          playersRes.json(),
          rostersRes.json(),
        ]);

        setPlayers(Array.isArray(playersData) ? playersData : []);
        setSeasonRosters(Array.isArray(rostersData) ? rostersData : []);
      } catch (error) {
        setStatus(error.message || "Failed to load supporting data.");
      }
    }

    loadData();
  }, []);

  const rosterPlayers = useMemo(() => {
    const match = seasonRosters.find((entry) => String(entry.SeasonID) === String(seasonId));
    return Array.isArray(match?.Players) ? match.Players : [];
  }, [seasonId, seasonRosters]);

  const playerIndexes = useMemo(() => buildPlayerIndexes(players, rosterPlayers), [players, rosterPlayers]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCSV(text).filter(isLikelyPlayerRow);
      setParsedRows(rows);
      setFileName(file.name);
      setWarnings([]);
      setStatus(`Loaded ${rows.length} likely player rows from ${file.name}.`);
    } catch (error) {
      setParsedRows([]);
      setFileName("");
      setStatus(error.message || "Could not read CSV file.");
    }
  }

  function handleGenerate() {
    if (!gameId.trim()) {
      setStatus("Enter a GameID before generating output.");
      return;
    }

    if (!/^\d{10}$/.test(gameId.trim())) {
      setStatus("GameID must be 10 digits, like 2026021901.");
      return;
    }

    if (!parsedRows.length) {
      setStatus("Upload a GameChanger CSV first.");
      return;
    }

    if (!rosterPlayers.length) {
      setStatus(`No baseball roster found for SeasonID ${seasonId}.`);
      return;
    }

    const unmatched = [];
    const entries = [];

    parsedRows.forEach((row) => {
      const player = matchPlayer(row, playerIndexes);
      const firstName = firstNonEmpty(row, ["FIRST NAME", "FIRST", "PLAYER FIRST NAME"]);
      const lastName = firstNonEmpty(row, ["LAST NAME", "LAST", "PLAYER LAST NAME"]);
      const jersey = firstNonEmpty(row, ["NUMBER", "NO", "JERSEY", "#"]);

      if (!player) {
        unmatched.push(`${jersey || "?"} - ${firstName} ${lastName}`.trim());
        return;
      }

      const batting = readStatGroup(row, BATTING_ALIASES, parseInteger);
      const pitching = {
        ...readStatGroup(row, PITCHING_ALIASES, parseInteger),
        IP: parseDecimal(firstNonEmpty(row, PITCHING_ALIASES.IP)),
      };
      const fielding = readStatGroup(row, FIELDING_ALIASES, parseInteger);
      const positions = readStatGroup(row, POSITION_ALIASES, parseDecimal);
      const statId = `${gameId.trim()}${player.PlayerID}`;

      entries.push({
        StatID: statId,
        GameID: parseInteger(gameId.trim()),
        PlayerID: parseInteger(player.PlayerID),
        ...batting,
        ...pitching,
        ...fielding,
        ...positions,
      });
    });

    const formatted = formatJson(entries);
    setOutput(formatted);
    setWarnings(unmatched);

    if (unmatched.length) {
      setStatus(`Generated ${entries.length} entries with ${unmatched.length} unmatched row(s).`);
    } else {
      setStatus(`Generated ${entries.length} entries successfully.`);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setStatus("JSON copied to clipboard.");
    } catch {
      setStatus("Could not copy to clipboard. You can still copy from the output box.");
    }
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${gameId || "baseball-playergamestats"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Boys Baseball Admin</h1>
      <h2 style={{ marginTop: 8 }}>GameChanger CSV Import</h2>
      <p style={{ maxWidth: 900, lineHeight: 1.5 }}>
        Upload a GameChanger CSV for one baseball game. This tool matches rows to the
        baseball roster, converts the export into your <code>playergamestats.json</code>
        schema, and generates ready-to-paste JSON.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>SeasonID</span>
          <input
            type="text"
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            style={{ padding: 10, fontSize: 16 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>GameID</span>
          <input
            type="text"
            placeholder="2026021901"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            style={{ padding: 10, fontSize: 16 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>GameChanger CSV</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
        </label>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <button type="button" onClick={handleGenerate} style={{ padding: "10px 16px" }}>
          Generate JSON
        </button>
        <button type="button" onClick={handleCopy} style={{ padding: "10px 16px" }}>
          Copy JSON
        </button>
        <button type="button" onClick={handleDownload} style={{ padding: "10px 16px" }}>
          Download JSON
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Status:</strong> {status}
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Loaded file:</strong> {fileName || "None"}
      </div>

      <div style={{ marginBottom: 24 }}>
        <strong>Roster size for SeasonID {seasonId}:</strong> {rosterPlayers.length}
      </div>

      {warnings.length > 0 && (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            border: "1px solid #d97706",
            background: "#fff7ed",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Unmatched Rows</h3>
          <ul style={{ marginBottom: 0 }}>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h3>Detected Player Rows</h3>
        <div>{parsedRows.length}</div>
      </div>

      <div>
        <h3>Generated JSON</h3>
        <textarea
          value={output}
          onChange={() => {}}
          readOnly
          spellCheck={false}
          style={{ width: "100%", minHeight: 500, fontFamily: "monospace", fontSize: 14 }}
        />
      </div>
    </div>
  );
}