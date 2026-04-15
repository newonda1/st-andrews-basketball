

import React, { useEffect, useMemo, useState } from "react";
import Tesseract from "tesseract.js";

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

const LEGACY_DETAIL_LABELS = ["2B", "3B", "HR", "TB", "SB", "CS", "E", "PITCHES-STRIKES", "BATTERS FACED", "WP"];

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

function buildLegacyAbbreviationMap(players) {
  const byKey = new Map();

  players.forEach((player) => {
    const first = normalizeName(player.FirstName);
    const last = normalizeName(player.LastName);
    if (!first || !last) return;

    const key = `${first.charAt(0)}|${last}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(player);
  });

  const unique = new Map();
  byKey.forEach((matches, key) => {
    if (matches.length === 1) unique.set(key, matches[0]);
  });
  return unique;
}

function buildPlayerIndexes(players, rosterPlayers) {
  const rosterMap = new Map(rosterPlayers.map((entry) => [String(entry.PlayerID), entry]));
  const playersById = new Map(players.map((player) => [String(player.PlayerID), player]));
  const byJerseyLast = new Map();
  const byFullName = new Map();
  const byLastName = new Map();
  const globalByFullName = new Map();
  const globalByLastName = new Map();
  const globalByInitialLast = buildLegacyAbbreviationMap(players);
  const rosterDetails = [];

  players.forEach((player) => {
    const first = normalizeName(player.FirstName);
    const last = normalizeName(player.LastName);
    const full = `${first}|${last}`;

    if (full) globalByFullName.set(full, player);
    if (last && !globalByLastName.has(last)) {
      globalByLastName.set(last, player);
    } else if (last) {
      globalByLastName.set(last, null);
    }
  });

  rosterPlayers.forEach((rosterEntry) => {
    const player = playersById.get(String(rosterEntry.PlayerID));
    if (!player) return;

    const first = normalizeName(player.FirstName);
    const last = normalizeName(player.LastName);
    const full = `${first}|${last}`;
    const jersey = String(rosterEntry.JerseyNumber ?? "").trim();

    if (jersey && last) byJerseyLast.set(`${jersey}|${last}`, player);
    if (full) byFullName.set(full, player);
    if (last && !byLastName.has(last)) {
      byLastName.set(last, player);
    } else if (last) {
      byLastName.set(last, null);
    }

    rosterDetails.push({
      player,
      fullName: `${first} ${last}`.trim(),
      lastName: last,
    });
  });

  return {
    byJerseyLast,
    byFullName,
    byLastName,
    globalByFullName,
    globalByLastName,
    globalByInitialLast,
    byInitialLast: buildLegacyAbbreviationMap(rosterDetails.map((detail) => detail.player)),
    rosterDetails,
  };
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

function normalizeLegacyPlayerLabel(value) {
  return normalizeName(
    String(value ?? "")
      .replace(/#\d+/g, " ")
      .replace(/\([^)]*\)/g, " ")
      .replace(/[^A-Za-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
  );
}

function matchLegacyPlayer(label, indexes) {
  const cleaned = normalizeLegacyPlayerLabel(label);
  if (!cleaned) return null;

  for (const detail of indexes.rosterDetails) {
    if (cleaned === detail.fullName) return detail.player;
  }

  for (const detail of indexes.rosterDetails) {
    if (cleaned.includes(detail.fullName)) return detail.player;
  }

  const abbreviatedMatch = cleaned.match(/^([A-Z])\s+([A-Z][A-Z\s-]+)$/);
  if (abbreviatedMatch) {
    const key = `${abbreviatedMatch[1]}|${abbreviatedMatch[2].trim()}`;
    if (indexes.byInitialLast.has(key)) return indexes.byInitialLast.get(key);
    if (indexes.globalByInitialLast.has(key)) return indexes.globalByInitialLast.get(key);
  }

  const firstLastMatch = cleaned.match(/^([A-Z][A-Z\s-]*)\s+([A-Z][A-Z\s-]+)$/);
  if (firstLastMatch) {
    const fullKey = `${firstLastMatch[1].trim()}|${firstLastMatch[2].trim()}`;
    if (indexes.globalByFullName.has(fullKey)) return indexes.globalByFullName.get(fullKey);
  }

  if (indexes.byLastName.has(cleaned)) return indexes.byLastName.get(cleaned);
  if (indexes.globalByLastName.has(cleaned)) return indexes.globalByLastName.get(cleaned);

  for (const detail of indexes.rosterDetails) {
    if (cleaned === detail.lastName) return detail.player;
  }

  for (const detail of indexes.rosterDetails) {
    if (cleaned.includes(` ${detail.lastName}`) || cleaned.endsWith(detail.lastName)) {
      return detail.player;
    }
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

function createEmptyEntry(gameId, playerId) {
  return OUTPUT_FIELDS.reduce((entry, field) => {
    if (field === "StatID") {
      entry[field] = `${gameId}${playerId}`;
    } else if (field === "GameID") {
      entry[field] = parseInteger(gameId);
    } else if (field === "PlayerID") {
      entry[field] = parseInteger(playerId);
    } else {
      entry[field] = 0;
    }
    return entry;
  }, {});
}

function splitNonEmptyLines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function escapeRegex(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeOcrNumberTokens(text) {
  return String(text ?? "").replace(/(\d)[Oo](?=\d|\s|$)/g, "$10");
}

function addBreaksBeforeLabels(text) {
  return LEGACY_DETAIL_LABELS.reduce((output, label) => {
    const pattern = new RegExp(`\\s+(${escapeRegex(label)})\\s*:`, "gi");
    return output.replace(pattern, "\n$1:");
  }, text);
}

function addBreaksBeforeTeam(text) {
  return String(text ?? "").replace(/\s+(TEAM)\b/gi, "\n$1");
}

function addBreaksBetweenLegacyRows(text) {
  return String(text ?? "")
    .replace(
      /(\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+)\s+(?=[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'#.-]+){1,4}\s+\d)/g,
      "$1\n"
    )
    .replace(
      /(\d+(?:\.\d+)?\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+)\s+(?=[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'#.-]+){1,4}\s+\d)/g,
      "$1\n"
    );
}

function addBreaksBeforeRosterNames(text, indexes) {
  let output = String(text ?? "");

  indexes.rosterDetails
    .slice()
    .sort((a, b) => b.fullName.length - a.fullName.length)
    .forEach((detail) => {
      const lastName = escapeRegex(detail.player.LastName);
      const firstInitial = escapeRegex(detail.player.FirstName.charAt(0));
      const patterns = [
        new RegExp(`\\s+(${escapeRegex(detail.player.FirstName)}\\s+${escapeRegex(detail.player.LastName)})\\b`, "gi"),
        new RegExp(`\\s+(${escapeRegex(detail.player.FirstName)}\\s+#\\d+)\\b`, "gi"),
        new RegExp(`\\s+(${firstInitial}\\s+${lastName})\\b`, "gi"),
        new RegExp(`\\s+([A-Z][A-Za-z'-]*\\s+${lastName}\\s+#\\d+)\\b`, "gi"),
        new RegExp(`\\s+([A-Z][A-Za-z'-]*\\s+${lastName})\\b`, "gi"),
      ];

      patterns.forEach((pattern) => {
        output = output.replace(pattern, "\n$1");
      });
    });

  return output;
}

function normalizeLegacyImportedText(text, indexes) {
  let output = String(text ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[•·]/g, " ")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  output = normalizeOcrNumberTokens(output);
  output = addBreaksBeforeLabels(output);
  output = addBreaksBeforeTeam(output);
  output = addBreaksBeforeRosterNames(output, indexes);
  output = addBreaksBetweenLegacyRows(output);

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function normalizeLegacyDetailText(text) {
  return addBreaksBeforeLabels(
    String(text ?? "")
      .replace(/\u00A0/g, " ")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—]/g, "-")
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  )
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function normalizeLegacyPlayByPlayText(text) {
  return String(text ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\t/g, " ")
    .replace(/([^\n])\s+(Top\s+\d|Bottom\s+\d)/gi, "$1\n$2")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function parseBaseballInningsValue(value) {
  const cleaned = String(value ?? "").trim().replace(/,/g, "");
  if (!cleaned) return 0;

  if (/^\d+\.\d$/.test(cleaned)) {
    return parseDecimal(cleaned);
  }

  if (/^0[12]$/.test(cleaned)) {
    return parseDecimal(`0.${cleaned[1]}`);
  }

  if (/^\d+[012]$/.test(cleaned) && cleaned.length > 1) {
    return parseDecimal(`${cleaned.slice(0, -1)}.${cleaned.slice(-1)}`);
  }

  return parseDecimal(cleaned);
}

function matchLegacyNameToken(token, indexes) {
  return matchLegacyPlayer(String(token ?? "").replace(/\./g, " "), indexes);
}

function maybeSetCurrentPitcherFromLine(line, indexes, setCurrentPitcher) {
  const inAtPitcherMatch = line.match(/Lineup changed:\s+([A-Z]\s+[A-Za-z'-]+)\s+in at pitcher/i);
  if (inAtPitcherMatch) {
    const player = matchLegacyNameToken(inAtPitcherMatch[1], indexes);
    if (player) setCurrentPitcher(player);
    return;
  }

  const inForPitcherMatch = line.match(/([A-Z]\s+[A-Za-z'-]+)\s+in for pitcher\s+([A-Z]\s+[A-Za-z'-]+)/i);
  if (inForPitcherMatch) {
    const player = matchLegacyNameToken(inForPitcherMatch[1], indexes);
    if (player) setCurrentPitcher(player);
  }
}

function maybeSetBatterSubstitutionFromLine(line, indexes, setSubstitution) {
  const match = line.match(/Lineup changed:\s+([A-Z]\s+[A-Za-z'-]+)\s+in for batter\s+([A-Z]\s+[A-Za-z'-]+)/i);
  if (!match) return;

  const incoming = matchLegacyNameToken(match[1], indexes);
  const outgoing = matchLegacyNameToken(match[2], indexes);
  if (incoming) {
    setSubstitution({ incoming, outgoing: outgoing || null });
  }
}

function splitEmbeddedPlaySegments(line) {
  const text = String(line ?? "").trim();
  if (!text) return [];

  const match = text.match(
    /\b([A-Z]\s+[A-Za-z'-]+\s+(?:strikes out|singles|doubles|triples|homers|flies out|grounds out|pops out|lines out|reaches on an error|reached on an error|walks|is intentionally walked))\b/i
  );

  if (!match || match.index === undefined || match.index <= 0) {
    return [text];
  }

  const first = text.slice(0, match.index).replace(/[,\s]+$/, "").trim();
  const second = text.slice(match.index).trim();
  return [first, second].filter(Boolean);
}

function extractSingleFielderPosition(line) {
  const match = line.match(
    /\b(pitcher|catcher|first baseman|second baseman|third baseman|shortstop|left fielder|center fielder|right fielder)\s+[A-Z]\s+[A-Za-z'-]+/i
  );
  return match ? normalizeHeader(match[1]) : "";
}

function parseFielderSequence(line, indexes) {
  const matches = [...line.matchAll(/(?:pitcher|catcher|first baseman|second baseman|third baseman|shortstop|left fielder|center fielder|right fielder)\s+([A-Z]\s+[A-Za-z'-]+)/gi)];
  return matches
    .map((match) => matchLegacyNameToken(match[1], indexes))
    .filter(Boolean);
}

function incrementEntryValue(entry, field, amount = 1) {
  entry[field] = parseDecimal(entry[field]) + parseDecimal(amount);
}

function ensureLegacyEntry(entriesByPlayerId, gameId, playerId) {
  const key = String(playerId);
  if (!entriesByPlayerId.has(key)) {
    entriesByPlayerId.set(key, createEmptyEntry(gameId, playerId));
  }
  return entriesByPlayerId.get(key);
}

function hasRecordedBattingLine(entry) {
  return (
    parseDecimal(entry.AB) ||
    parseDecimal(entry.H) ||
    parseDecimal(entry.BB) ||
    parseDecimal(entry.SO) ||
    parseDecimal(entry.HBP) ||
    parseDecimal(entry.ROE) ||
    parseDecimal(entry.FC) ||
    parseDecimal(entry.SAC) ||
    parseDecimal(entry.SF)
  );
}

function parseLegacyBatting(text, indexes, gameId, entriesByPlayerId, warnings) {
  const playerLineRegex =
    /^(.*\D)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$/;

  splitNonEmptyLines(text).forEach((line) => {
    if (/^LINEUP\b/i.test(line) || /^TEAM\b/i.test(line)) return;

    const match = line.match(playerLineRegex);
    if (!match) return;

    const [, label, ab, runs, hits, rbi, walks, strikeouts] = match;
    if (/\bTEAM\b/i.test(label)) return;
    const player = matchLegacyPlayer(label, indexes);

    if (!player) {
      warnings.push(`Legacy batting line could not be matched: ${label.trim()}`);
      return;
    }

    const entry = ensureLegacyEntry(entriesByPlayerId, gameId, player.PlayerID);
    entry.AB = parseInteger(ab);
    entry.R = parseInteger(runs);
    entry.H = parseInteger(hits);
    entry.RBI = parseInteger(rbi);
    entry.BB = parseInteger(walks);
    entry.SO = parseInteger(strikeouts);
  });
}

function parseLegacyPitching(text, indexes, gameId, entriesByPlayerId, warnings) {
  const pitchingLineRegex =
    /^(.*\D)\s+(\d+(?:\.\d+)?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$/;

  splitNonEmptyLines(text).forEach((line) => {
    if (/^PITCHING\b/i.test(line) || /^TEAM\b/i.test(line)) return;

    const match = line.match(pitchingLineRegex);
    if (!match) return;

    const [, label, ip, hits, runs, earnedRuns, walks, strikeouts] = match;
    if (/\bTEAM\b/i.test(label)) return;
    const player = matchLegacyPlayer(label, indexes);

    if (!player) {
      warnings.push(`Legacy pitching line could not be matched: ${label.trim()}`);
      return;
    }

    const entry = ensureLegacyEntry(entriesByPlayerId, gameId, player.PlayerID);
    entry.IP = parseBaseballInningsValue(ip);
    entry.P_Innings = parseBaseballInningsValue(ip);
    entry.H_Allowed = parseInteger(hits);
    entry.R_Allowed = parseInteger(runs);
    entry.ER = parseInteger(earnedRuns);
    entry.BB_Allowed = parseInteger(walks);
    entry.SO_Pitching = parseInteger(strikeouts);

    if (/\(W\)/i.test(label)) entry.W = 1;
    if (/\(L\)/i.test(label)) entry.L = 1;
    if (/\(SV\)/i.test(label)) entry.SV = 1;
  });
}

function parseLegacyCatcherIds(text, indexes) {
  const catcherIds = new Set();

  splitNonEmptyLines(text).forEach((line) => {
    if (!/\(C\)/i.test(line)) return;
    const playerLineRegex = /^(.*\D)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$/;
    const match = line.match(playerLineRegex);
    const label = match?.[1] || line;
    const player = matchLegacyPlayer(label, indexes);
    if (player) catcherIds.add(String(player.PlayerID));
  });

  return catcherIds;
}

function parseNamedCountList(value, indexes, warnings, label) {
  const output = [];
  const items = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  items.forEach((item) => {
    const countMatch = item.match(/^(.*?)(?:\s+(\d+(?:\.\d+)?))?$/);
    const playerLabel = countMatch?.[1]?.trim() || item;
    const player = matchLegacyPlayer(playerLabel, indexes);

    if (!player) {
      warnings.push(`${label} detail could not be matched: ${playerLabel}`);
      return;
    }

    output.push({
      player,
      count: countMatch?.[2] ? parseDecimal(countMatch[2]) : 1,
    });
  });

  return output;
}

function parsePitchingDetailList(value, indexes, warnings, label) {
  const output = [];
  const items = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  items.forEach((item) => {
    const match = item.match(/^(.*?)(?:\s+(\d+(?:\.\d+)?)(?:-\d+(?:\.\d+)?)?)?$/);
    const playerLabel = match?.[1]?.trim() || item;
    const player = matchLegacyPlayer(playerLabel, indexes);

    if (!player) {
      warnings.push(`${label} detail could not be matched: ${playerLabel}`);
      return;
    }

    output.push({
      player,
      count: match?.[2] ? parseDecimal(match[2]) : 1,
    });
  });

  return output;
}

function applyLegacyDetailLine(line, indexes, gameId, entriesByPlayerId, warnings, detailType = "batting") {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex === -1) return;

  const label = normalizeHeader(line.slice(0, separatorIndex));
  const value = line.slice(separatorIndex + 1).trim();
  if (!value) return;

  if (label === "2B" || label === "3B" || label === "HR" || label === "SB" || label === "CS" || label === "E" || label === "HBP") {
    const fieldMap = {
      "2B": "2B",
      "3B": "3B",
      HR: "HR",
      SB: "SB",
      CS: "CS",
      E: "E",
      HBP: detailType === "pitching" ? "HBP_Pitching" : "HBP",
    };

    parseNamedCountList(value, indexes, warnings, label).forEach(({ player, count }) => {
      const entry = ensureLegacyEntry(entriesByPlayerId, gameId, player.PlayerID);
      incrementEntryValue(entry, fieldMap[label], count);
    });
    return;
  }

  if (label === "TB") {
    parseNamedCountList(value, indexes, warnings, label).forEach(({ player, count }) => {
      const entry = ensureLegacyEntry(entriesByPlayerId, gameId, player.PlayerID);
      entry.TB = parseDecimal(count);
    });
    return;
  }

  if (label === "PITCHES STRIKES") {
    parsePitchingDetailList(value, indexes, warnings, label).forEach(({ player, count }) => {
      const entry = ensureLegacyEntry(entriesByPlayerId, gameId, player.PlayerID);
      entry.Pitches = parseInteger(count);
    });
    return;
  }

  if (label === "BATTERS FACED") {
    parsePitchingDetailList(value, indexes, warnings, label).forEach(({ player, count }) => {
      const entry = ensureLegacyEntry(entriesByPlayerId, gameId, player.PlayerID);
      entry.BF = parseInteger(count);
    });
    return;
  }

  if (label === "WP") {
    parseNamedCountList(value, indexes, warnings, label).forEach(({ player, count }) => {
      const entry = ensureLegacyEntry(entriesByPlayerId, gameId, player.PlayerID);
      incrementEntryValue(entry, "WP", count);
    });
  }
}

function parseLegacyDetails(text, indexes, gameId, entriesByPlayerId, warnings, detailType = "batting") {
  splitNonEmptyLines(text).forEach((line) => {
    applyLegacyDetailLine(line, indexes, gameId, entriesByPlayerId, warnings, detailType);
  });
}

function parseLegacyDetailLabels(text) {
  return new Set(
    splitNonEmptyLines(text)
      .map((line) => normalizeHeader(line.split(":")[0]))
      .filter(Boolean)
  );
}

function parseLegacyPlayByPlay(text, indexes, gameId, entriesByPlayerId, options = {}) {
  let half = "";
  let currentPitcher = null;
  let currentBatterSubstitution = null;
  const {
    skipWildPitchParsing = false,
    teamBattingHalf = "bottom",
    catcherIds = new Set(),
  } = options;

  const getCurrentPitcher = () => {
    if (currentPitcher) return currentPitcher;

    const pitchingEntries = Array.from(entriesByPlayerId.values())
      .filter((entry) => parseDecimal(entry.IP) > 0)
      .sort((a, b) => parseDecimal(b.IP) - parseDecimal(a.IP));

    if (!pitchingEntries.length) return null;

    const matched = indexes.rosterDetails.find(
      (detail) => Number(detail.player.PlayerID) === Number(pitchingEntries[0].PlayerID)
    );
    return matched?.player || null;
  };

  splitNonEmptyLines(text).forEach((rawLine) => {
    splitEmbeddedPlaySegments(rawLine).forEach((line) => {
      maybeSetCurrentPitcherFromLine(line, indexes, (player) => {
        currentPitcher = player;
      });
      maybeSetBatterSubstitutionFromLine(line, indexes, (substitution) => {
        currentBatterSubstitution = substitution;
      });

      if (/^Top\b/i.test(line)) {
        half = "top";
        return;
      }

      if (/^Bottom\b/i.test(line)) {
        half = "bottom";
        return;
      }

      const normalizedLine = normalizeHeader(line);

      if (half === teamBattingHalf) {
        const batterMatch = line.match(/^([A-Z][A-Za-z.'-]*\s+[A-Z][A-Za-z.'-]*)\b/);
        let batter = batterMatch ? matchLegacyPlayer(batterMatch[1], indexes) : null;
        if (
          !batter &&
          currentBatterSubstitution &&
          batterMatch &&
          normalizeLegacyPlayerLabel(batterMatch[1]) ===
            normalizeLegacyPlayerLabel(`${currentBatterSubstitution.incoming.FirstName} ${currentBatterSubstitution.incoming.LastName}`)
        ) {
          batter = currentBatterSubstitution.incoming;
        }
        if (!batter) return;

        const hadExistingEntry = entriesByPlayerId.has(String(batter.PlayerID));
        const entry = ensureLegacyEntry(entriesByPlayerId, gameId, batter.PlayerID);
        const shouldBackfillBatting = !hadExistingEntry || !hasRecordedBattingLine(entry);

        if (shouldBackfillBatting) {
          if (normalizedLine.includes("IS INTENTIONALLY WALKED") || normalizedLine.includes(" WALKS ")) {
            incrementEntryValue(entry, "BB", 1);
          } else if (normalizedLine.includes("HIT BY PITCH")) {
            incrementEntryValue(entry, "HBP", 1);
          } else if (normalizedLine.includes("SINGLES")) {
            incrementEntryValue(entry, "AB", 1);
            incrementEntryValue(entry, "H", 1);
          } else if (normalizedLine.includes("DOUBLES")) {
            incrementEntryValue(entry, "AB", 1);
            incrementEntryValue(entry, "H", 1);
            incrementEntryValue(entry, "2B", 1);
          } else if (normalizedLine.includes("TRIPLES")) {
            incrementEntryValue(entry, "AB", 1);
            incrementEntryValue(entry, "H", 1);
            incrementEntryValue(entry, "3B", 1);
          } else if (normalizedLine.includes("HOMERS")) {
            incrementEntryValue(entry, "AB", 1);
            incrementEntryValue(entry, "H", 1);
            incrementEntryValue(entry, "HR", 1);
          } else if (
            normalizedLine.includes("STRIKES OUT") ||
            normalizedLine.includes("FLIES OUT") ||
            normalizedLine.includes("GROUNDS OUT") ||
            normalizedLine.includes("POPS OUT") ||
            normalizedLine.includes("LINES OUT") ||
            normalizedLine.includes("OUT ON INFIELD FLY")
          ) {
            incrementEntryValue(entry, "AB", 1);
            if (normalizedLine.includes("STRIKES OUT")) incrementEntryValue(entry, "SO", 1);
          } else if (
            normalizedLine.includes("REACHES ON AN ERROR") ||
            normalizedLine.includes("REACHED ON AN ERROR")
          ) {
            incrementEntryValue(entry, "AB", 1);
          } else if (normalizedLine.includes("FIELDERS CHOICE")) {
            incrementEntryValue(entry, "AB", 1);
          }
        }

        if (normalizedLine.includes("HIT BY PITCH")) incrementEntryValue(entry, "HBP", 1);
        if (normalizedLine.includes("REACHES ON AN ERROR")) incrementEntryValue(entry, "ROE", 1);
        if (normalizedLine.includes("REACHED ON AN ERROR")) incrementEntryValue(entry, "ROE", 1);
        if (normalizedLine.includes("FIELDERS CHOICE")) incrementEntryValue(entry, "FC", 1);
        if (normalizedLine.includes("SAC FLY")) incrementEntryValue(entry, "SF", 1);
        if (normalizedLine.includes("SACRIFICE FLY")) incrementEntryValue(entry, "SF", 1);
        if (normalizedLine.includes("SAC BUNT")) incrementEntryValue(entry, "SAC", 1);
        if (normalizedLine.includes("SACRIFICE BUNT")) incrementEntryValue(entry, "SAC", 1);
        if (normalizedLine.includes("SACRIFICE HIT")) incrementEntryValue(entry, "SAC", 1);
        currentBatterSubstitution = null;
        return;
      }

      const teamFieldingHalf = teamBattingHalf === "top" ? "bottom" : "top";
      if (half !== teamFieldingHalf) return;

      const activePitcher = getCurrentPitcher();
      const fielders = parseFielderSequence(line, indexes);

      const stolenBaseEvents = normalizedLine.match(/STEALS\s+(2ND|3RD|HOME)|STEAL OF HOME/g) || [];
      if (stolenBaseEvents.length && activePitcher) {
        const pitcherEntry = ensureLegacyEntry(entriesByPlayerId, gameId, activePitcher.PlayerID);
        incrementEntryValue(pitcherEntry, "SB_Allowed", stolenBaseEvents.length);
      }

      const caughtStealingEvents = line.match(/caught stealing/gi) || [];
      if (caughtStealingEvents.length && activePitcher) {
        const pitcherEntry = ensureLegacyEntry(entriesByPlayerId, gameId, activePitcher.PlayerID);
        incrementEntryValue(pitcherEntry, "CS_Pitching", caughtStealingEvents.length);
        if (fielders[0]) {
          const putoutEntry = ensureLegacyEntry(entriesByPlayerId, gameId, fielders[0].PlayerID);
          incrementEntryValue(putoutEntry, "PO", caughtStealingEvents.length);
        }
      }

      if (!skipWildPitchParsing && /wild pitch/i.test(line) && activePitcher) {
        const pitcherEntry = ensureLegacyEntry(entriesByPlayerId, gameId, activePitcher.PlayerID);
        incrementEntryValue(pitcherEntry, "WP", 1);
      }

      const passedBallEvents = line.match(/passed ball/gi) || [];
      if (passedBallEvents.length && catcherIds.size) {
        catcherIds.forEach((playerId) => {
          const catcherEntry = ensureLegacyEntry(entriesByPlayerId, gameId, playerId);
          incrementEntryValue(catcherEntry, "PB", passedBallEvents.length);
        });
      }

      if (/balk/i.test(line) && activePitcher) {
        const pitcherEntry = ensureLegacyEntry(entriesByPlayerId, gameId, activePitcher.PlayerID);
        incrementEntryValue(pitcherEntry, "BK", 1);
      }

      if (/grounds out/i.test(line)) {
        if (fielders[0]) {
          const firstFielderEntry = ensureLegacyEntry(entriesByPlayerId, gameId, fielders[0].PlayerID);
          if (fielders[1]) {
            incrementEntryValue(firstFielderEntry, "A", 1);
          } else {
            const position = extractSingleFielderPosition(line);
            if (position === "FIRST BASEMAN" || position === "PITCHER") {
              incrementEntryValue(firstFielderEntry, "PO", 1);
            } else {
              incrementEntryValue(firstFielderEntry, "A", 1);
            }
          }
        }
        if (fielders[1]) {
          const putoutEntry = ensureLegacyEntry(entriesByPlayerId, gameId, fielders[1].PlayerID);
          incrementEntryValue(putoutEntry, "PO", 1);
        }
        return;
      }

      if (/fielders choice/i.test(line)) {
        if (fielders[0]) {
          const assistEntry = ensureLegacyEntry(entriesByPlayerId, gameId, fielders[0].PlayerID);
          incrementEntryValue(assistEntry, "A", 1);
        }
        if (fielders[1]) {
          const putoutEntry = ensureLegacyEntry(entriesByPlayerId, gameId, fielders[1].PlayerID);
          incrementEntryValue(putoutEntry, "PO", 1);
        }
        return;
      }

      if (/flies out|lines out|pops out|out on infield fly/i.test(line)) {
        if (fielders[0]) {
          const putoutEntry = ensureLegacyEntry(entriesByPlayerId, gameId, fielders[0].PlayerID);
          incrementEntryValue(putoutEntry, "PO", 1);
        }
        return;
      }

      if (/picked off/i.test(line)) {
        if (fielders[0]) {
          const putoutEntry = ensureLegacyEntry(entriesByPlayerId, gameId, fielders[0].PlayerID);
          incrementEntryValue(putoutEntry, "PO", 1);
          incrementEntryValue(putoutEntry, "PIK_Fielding", 1);
        }
        if (activePitcher) {
          const pitcherEntry = ensureLegacyEntry(entriesByPlayerId, gameId, activePitcher.PlayerID);
          incrementEntryValue(pitcherEntry, "PIK_Allowed", 1);
        }
        return;
      }

      if (/grounds into a double play/i.test(line)) {
        fielders.forEach((fielder, index) => {
          const entry = ensureLegacyEntry(entriesByPlayerId, gameId, fielder.PlayerID);
          if (index === 0) incrementEntryValue(entry, "A", 1);
          if (index === 1) incrementEntryValue(entry, "PO", 1);
          incrementEntryValue(entry, "DP", 1);
        });
      }
    });
  });
}

function finalizeLegacyEntries(entriesByPlayerId) {
  return Array.from(entriesByPlayerId.values())
    .map((entry) => {
      const singles = Math.max(
        0,
        parseInteger(entry.H) - parseInteger(entry["2B"]) - parseInteger(entry["3B"]) - parseInteger(entry.HR)
      );

      entry["1B"] = singles;

      if (!parseInteger(entry.TB)) {
        entry.TB =
          singles +
          parseInteger(entry["2B"]) * 2 +
          parseInteger(entry["3B"]) * 3 +
          parseInteger(entry.HR) * 4;
      }

      if (!parseInteger(entry.PA)) {
        entry.PA =
          parseInteger(entry.AB) +
          parseInteger(entry.BB) +
          parseInteger(entry.HBP) +
          parseInteger(entry.SAC) +
          parseInteger(entry.SF);
      }

      return entry;
    })
    .filter((entry) =>
      OUTPUT_FIELDS.some((field) =>
        !["StatID", "GameID", "PlayerID"].includes(field) && parseDecimal(entry[field]) !== 0
      )
    )
    .sort((a, b) => Number(a.PlayerID) - Number(b.PlayerID));
}

function replacePreviewUrl(setter, nextFile, currentUrl) {
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  setter(nextFile ? URL.createObjectURL(nextFile) : "");
}

async function recognizeImageText(file, onProgress) {
  const result = await Tesseract.recognize(file, "eng", {
    logger: (message) => {
      if (message.status === "recognizing text" && typeof message.progress === "number") {
        onProgress(Math.round(message.progress * 100));
      }
    },
  });

  return String(result?.data?.text || "");
}

async function copyTextToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

function hasBattingAppearance(entry) {
  return (
    parseDecimal(entry.PA) ||
    parseDecimal(entry.AB) ||
    parseDecimal(entry.BB) ||
    parseDecimal(entry.HBP) ||
    parseDecimal(entry.ROE) ||
    parseDecimal(entry.FC)
  );
}

function hasPitchingAppearance(entry) {
  return parseDecimal(entry.IP) || parseDecimal(entry.BF) || parseDecimal(entry.Pitches);
}

function hasFieldingOnlyAppearance(entry) {
  return (
    !hasBattingAppearance(entry) &&
    !hasPitchingAppearance(entry) &&
    (parseDecimal(entry.A) ||
      parseDecimal(entry.PO) ||
      parseDecimal(entry.E) ||
      parseDecimal(entry.DP) ||
      parseDecimal(entry.PB))
  );
}

function sumEntries(entries, field) {
  return entries.reduce((sum, entry) => sum + parseDecimal(entry[field]), 0);
}

function buildReviewSummary(entries, gameRecord) {
  const battingTotals = {
    AB: sumEntries(entries, "AB"),
    R: sumEntries(entries, "R"),
    H: sumEntries(entries, "H"),
    RBI: sumEntries(entries, "RBI"),
    BB: sumEntries(entries, "BB"),
    SO: sumEntries(entries, "SO"),
  };

  const pitchingTotals = {
    IP: sumEntries(entries, "IP"),
    H_Allowed: sumEntries(entries, "H_Allowed"),
    R_Allowed: sumEntries(entries, "R_Allowed"),
    ER: sumEntries(entries, "ER"),
    BB_Allowed: sumEntries(entries, "BB_Allowed"),
    SO_Pitching: sumEntries(entries, "SO_Pitching"),
    SB_Allowed: sumEntries(entries, "SB_Allowed"),
  };

  const defensiveOnly = entries.filter(hasFieldingOnlyAppearance);

  return {
    playerCount: entries.length,
    generatedPlayers: entries,
    battingTotals,
    pitchingTotals,
    expectedTeamRuns: parseDecimal(gameRecord?.TeamScore),
    expectedOpponentRuns: parseDecimal(gameRecord?.OpponentScore),
    defensiveOnly,
  };
}

function formatPlayerLabel(entry, players) {
  const player = players.find((item) => Number(item.PlayerID) === Number(entry.PlayerID));
  if (!player) return String(entry.PlayerID);
  return `${player.FirstName} ${player.LastName}`;
}


export default function BoysBaseballAdmin() {
  const [players, setPlayers] = useState([]);
  const [seasonRosters, setSeasonRosters] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [games, setGames] = useState([]);
  const [seasonId, setSeasonId] = useState("2026");
  const [gameId, setGameId] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [output, setOutput] = useState("[]");
  const [warnings, setWarnings] = useState([]);
  const [status, setStatus] = useState("Load a GameChanger CSV and generate playergamestats entries.");
  const [reviewSummary, setReviewSummary] = useState(null);
  const [legacyBattingText, setLegacyBattingText] = useState("");
  const [legacyBattingDetailText, setLegacyBattingDetailText] = useState("");
  const [legacyPitchingText, setLegacyPitchingText] = useState("");
  const [legacyPitchingDetailText, setLegacyPitchingDetailText] = useState("");
  const [legacyPlayByPlayText, setLegacyPlayByPlayText] = useState("");
  const [battingImageName, setBattingImageName] = useState("");
  const [battingImagePreview, setBattingImagePreview] = useState("");
  const [battingDetailImageName, setBattingDetailImageName] = useState("");
  const [battingDetailImagePreview, setBattingDetailImagePreview] = useState("");
  const [pitchingImageName, setPitchingImageName] = useState("");
  const [pitchingImagePreview, setPitchingImagePreview] = useState("");
  const [pitchingDetailImageName, setPitchingDetailImageName] = useState("");
  const [pitchingDetailImagePreview, setPitchingDetailImagePreview] = useState("");
  const [ocrProgress, setOcrProgress] = useState({
    batting: 0,
    battingDetail: 0,
    pitching: 0,
    pitchingDetail: 0,
  });
  const [ocrStatus, setOcrStatus] = useState({
    batting: "idle",
    battingDetail: "idle",
    pitching: "idle",
    pitchingDetail: "idle",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const playersPath = "/data/boys/players.json";
        const rostersPath = "/data/boys/baseball/seasonrosters.json";
        const seasonsPath = "/data/boys/baseball/seasons.json";
        const gamesPath = "/data/boys/baseball/games.json";

        const playersRes = await fetch(playersPath);
        if (!playersRes.ok) {
          throw new Error(`Could not load players.json (${playersRes.status}) from ${playersPath}`);
        }

        const rostersRes = await fetch(rostersPath);
        if (!rostersRes.ok) {
          throw new Error(`Could not load seasonrosters.json (${rostersRes.status}) from ${rostersPath}`);
        }

        const seasonsRes = await fetch(seasonsPath);
        if (!seasonsRes.ok) {
          throw new Error(`Could not load seasons.json (${seasonsRes.status}) from ${seasonsPath}`);
        }

        const gamesRes = await fetch(gamesPath);
        if (!gamesRes.ok) {
          throw new Error(`Could not load games.json (${gamesRes.status}) from ${gamesPath}`);
        }

        const playersData = await playersRes.json();
        const rostersData = await rostersRes.json();
        const seasonsData = await seasonsRes.json();
        const gamesData = await gamesRes.json();

        const safePlayers = Array.isArray(playersData) ? playersData : [];
        const safeRosters = Array.isArray(rostersData) ? rostersData : [];
        const safeSeasons = Array.isArray(seasonsData) ? seasonsData : [];
        const safeGames = Array.isArray(gamesData) ? gamesData : [];

        setPlayers(safePlayers);
        setSeasonRosters(safeRosters);
        setSeasons(safeSeasons);
        setGames(safeGames);

        if (!safeSeasons.length) {
          setStatus("Loaded players and rosters, but seasons.json appears empty.");
        } else if (!safeGames.length) {
          setStatus("Loaded seasons, but games.json appears empty.");
        } else {
          setStatus(`Loaded ${safeSeasons.length} seasons and ${safeGames.length} baseball games successfully.`);
        }
      } catch (error) {
        setStatus(`${error?.name ? `${error.name}: ` : ""}${error?.message || "Failed to load supporting data."}`);
      }
    }

    loadData();
  }, []);

  const rosterPlayers = useMemo(() => {
    const match = seasonRosters.find((entry) => String(entry.SeasonID) === String(seasonId));
    return Array.isArray(match?.Players) ? match.Players : [];
  }, [seasonId, seasonRosters]);

  const availableSeasons = useMemo(() => {
    const seasonFileSeasons = seasons.map((entry) => String(entry.SeasonID)).filter(Boolean);
    const gameSeasons = games.map((game) => String(game.Season)).filter(Boolean);
    const rosterSeasons = seasonRosters.map((entry) => String(entry.SeasonID)).filter(Boolean);
    const values = Array.from(new Set([...seasonFileSeasons, ...gameSeasons, ...rosterSeasons]));
    return values.sort((a, b) => Number(a) - Number(b));
  }, [seasons, games, seasonRosters]);

  const seasonGames = useMemo(() => {
    return games
      .filter((game) => String(game.Season) === String(seasonId))
      .slice()
      .sort((a, b) => Number(a.GameID) - Number(b.GameID));
  }, [games, seasonId]);

  const playerIndexes = useMemo(() => buildPlayerIndexes(players, rosterPlayers), [players, rosterPlayers]);

  useEffect(() => {
    if (!availableSeasons.length) return;

    if (!availableSeasons.includes(String(seasonId))) {
      setSeasonId(availableSeasons[0]);
    }
  }, [availableSeasons, seasonId]);

  useEffect(() => {
    if (!seasonGames.length) {
      setGameId("");
      return;
    }

    if (!seasonGames.some((game) => String(game.GameID) === String(gameId))) {
      setGameId(String(seasonGames[0].GameID));
    }
  }, [seasonGames, gameId]);

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

  async function handleGenerate() {
    if (!String(gameId).trim()) {
      setStatus("Choose a GameID before generating output.");
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
    const gameRecord = seasonGames.find((game) => String(game.GameID) === String(gameId)) || null;
    setOutput(formatted);
    setWarnings(unmatched);
    setReviewSummary(buildReviewSummary(entries, gameRecord));

    try {
      await copyTextToClipboard(formatted);
      if (unmatched.length) {
        setStatus(`Generated and copied ${entries.length} entries with ${unmatched.length} unmatched row(s).`);
      } else {
        setStatus(`Generated and copied ${entries.length} entries successfully.`);
      }
    } catch {
      if (unmatched.length) {
        setStatus(`Generated ${entries.length} entries with ${unmatched.length} unmatched row(s), but clipboard copy failed.`);
      } else {
        setStatus(`Generated ${entries.length} entries, but clipboard copy failed.`);
      }
    }
  }

  async function handleGenerateLegacy() {
    const hasLegacyImages = Boolean(
      battingImageName || battingDetailImageName || pitchingImageName || pitchingDetailImageName
    );
    const hasLegacyText = Boolean(
      legacyBattingText.trim() ||
        legacyBattingDetailText.trim() ||
        legacyPitchingText.trim() ||
        legacyPitchingDetailText.trim() ||
        legacyPlayByPlayText.trim()
    );

    if (!String(gameId).trim()) {
      setStatus("Choose a GameID before generating output.");
      return;
    }

    if (!rosterPlayers.length) {
      setStatus(`No baseball roster found for SeasonID ${seasonId}.`);
      return;
    }

    if (!hasLegacyImages && !hasLegacyText) {
      setStatus("Upload at least one box score image or paste play-by-play before generating legacy output.");
      return;
    }

    const entriesByPlayerId = new Map();
    const legacyWarnings = [];
    const pitchingDetailLabels = parseLegacyDetailLabels(legacyPitchingDetailText);
    const gameRecord = seasonGames.find((game) => String(game.GameID) === String(gameId)) || null;
    const teamBattingHalf = gameRecord?.LocationType === "Away" ? "top" : "bottom";
    const catcherIds = parseLegacyCatcherIds(legacyBattingText, playerIndexes);

    parseLegacyBatting(legacyBattingText, playerIndexes, gameId.trim(), entriesByPlayerId, legacyWarnings);
    parseLegacyDetails(legacyBattingDetailText, playerIndexes, gameId.trim(), entriesByPlayerId, legacyWarnings, "batting");
    parseLegacyPitching(legacyPitchingText, playerIndexes, gameId.trim(), entriesByPlayerId, legacyWarnings);
    parseLegacyDetails(legacyPitchingDetailText, playerIndexes, gameId.trim(), entriesByPlayerId, legacyWarnings, "pitching");
    parseLegacyPlayByPlay(legacyPlayByPlayText, playerIndexes, gameId.trim(), entriesByPlayerId, {
      skipWildPitchParsing: pitchingDetailLabels.has("WP"),
      teamBattingHalf,
      catcherIds,
    });

    const entries = finalizeLegacyEntries(entriesByPlayerId);
    const formatted = formatJson(entries);

    setOutput(formatted);
    setWarnings(legacyWarnings);
    setReviewSummary(buildReviewSummary(entries, gameRecord));

    if (!entries.length) {
      if (hasLegacyImages && !hasLegacyText) {
        setStatus(
          "Box score images were uploaded, but automatic image-to-stats extraction is not wired yet, so no JSON rows could be generated from images alone."
        );
      } else {
        setStatus("No legacy rows were generated. Double-check the pasted text format.");
      }
      return;
    }

    try {
      await copyTextToClipboard(formatted);
      if (legacyWarnings.length) {
        setStatus(`Generated and copied ${entries.length} legacy entries with ${legacyWarnings.length} review warning(s).`);
      } else {
        setStatus(`Generated and copied ${entries.length} legacy entries successfully.`);
      }
    } catch {
      if (legacyWarnings.length) {
        setStatus(`Generated ${entries.length} legacy entries with ${legacyWarnings.length} review warning(s), but clipboard copy failed.`);
      } else {
        setStatus(`Generated ${entries.length} legacy entries, but clipboard copy failed.`);
      }
    }
  }

  async function handleLegacyImageChange(kind, event) {
    const file = event.target.files?.[0] || null;

    const applyRecognizedText = (recognizedText) => {
      if (kind === "batting") {
        setLegacyBattingText(normalizeLegacyImportedText(recognizedText, playerIndexes));
      } else if (kind === "battingDetail") {
        setLegacyBattingDetailText(normalizeLegacyDetailText(recognizedText));
      } else if (kind === "pitching") {
        setLegacyPitchingText(normalizeLegacyImportedText(recognizedText, playerIndexes));
      } else if (kind === "pitchingDetail") {
        setLegacyPitchingDetailText(normalizeLegacyDetailText(recognizedText));
      }
    };

    setOcrProgress((prev) => ({ ...prev, [kind]: 0 }));
    setOcrStatus((prev) => ({ ...prev, [kind]: file ? "queued" : "idle" }));

    if (kind === "batting") {
      setBattingImageName(file?.name || "");
      replacePreviewUrl(setBattingImagePreview, file, battingImagePreview);
    } else if (kind === "battingDetail") {
      setBattingDetailImageName(file?.name || "");
      replacePreviewUrl(setBattingDetailImagePreview, file, battingDetailImagePreview);
    } else if (kind === "pitching") {
      setPitchingImageName(file?.name || "");
      replacePreviewUrl(setPitchingImagePreview, file, pitchingImagePreview);
    } else if (kind === "pitchingDetail") {
      setPitchingDetailImageName(file?.name || "");
      replacePreviewUrl(setPitchingDetailImagePreview, file, pitchingDetailImagePreview);
    }

    if (!file) return;

    try {
      setOcrStatus((prev) => ({ ...prev, [kind]: "reading" }));
      setStatus(`Reading ${file.name}...`);
      const recognizedText = await recognizeImageText(file, (progress) => {
        setOcrProgress((prev) => ({ ...prev, [kind]: progress }));
      });
      applyRecognizedText(recognizedText);
      setOcrProgress((prev) => ({ ...prev, [kind]: 100 }));
      setOcrStatus((prev) => ({ ...prev, [kind]: "done" }));
      setStatus(`Read text from ${file.name}. You can generate legacy JSON now or add more images/play-by-play.`);
    } catch (error) {
      setOcrStatus((prev) => ({ ...prev, [kind]: "error" }));
      setStatus(`OCR failed for ${file.name}: ${String(error?.message || error)}`);
    }
  }

  function handleResetLegacyImporter() {
    [battingImagePreview, battingDetailImagePreview, pitchingImagePreview, pitchingDetailImagePreview]
      .filter(Boolean)
      .forEach((url) => URL.revokeObjectURL(url));

    setLegacyBattingText("");
    setLegacyBattingDetailText("");
    setLegacyPitchingText("");
    setLegacyPitchingDetailText("");
    setLegacyPlayByPlayText("");

    setBattingImageName("");
    setBattingImagePreview("");
    setBattingDetailImageName("");
    setBattingDetailImagePreview("");
    setPitchingImageName("");
    setPitchingImagePreview("");
    setPitchingDetailImageName("");
    setPitchingDetailImagePreview("");

    setOcrProgress({
      batting: 0,
      battingDetail: 0,
      pitching: 0,
      pitchingDetail: 0,
    });
    setOcrStatus({
      batting: "idle",
      battingDetail: "idle",
      pitching: "idle",
      pitchingDetail: "idle",
    });

    setOutput("[]");
    setWarnings([]);
    setReviewSummary(null);
    setStatus("Legacy importer cleared. Select the next game and upload new screenshots.");
  }

  useEffect(() => {
    return () => {
      [battingImagePreview, battingDetailImagePreview, pitchingImagePreview, pitchingDetailImagePreview]
        .filter(Boolean)
        .forEach((url) => URL.revokeObjectURL(url));
    };
  }, [battingImagePreview, battingDetailImagePreview, pitchingImagePreview, pitchingDetailImagePreview]);

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
          <span>Season</span>
          <select
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            style={{ padding: 10, fontSize: 16 }}
          >
            {availableSeasons.length === 0 ? (
              <option value="">No seasons found</option>
            ) : (
              availableSeasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))
            )}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>Game</span>
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            style={{ padding: 10, fontSize: 16 }}
          >
            {seasonGames.length === 0 ? (
              <option value="">No games found</option>
            ) : (
              seasonGames.map((game) => (
                <option key={game.GameID} value={String(game.GameID)}>
                  {`${game.GameID} — ${game.Opponent}`}
                </option>
              ))
            )}
          </select>
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
        <button type="button" onClick={handleGenerateLegacy} style={{ padding: "10px 16px" }}>
          Generate Legacy JSON
        </button>
        <button type="button" onClick={handleResetLegacyImporter} style={{ padding: "10px 16px" }}>
          Reset Legacy Importer
        </button>
        <button type="button" onClick={handleDownload} style={{ padding: "10px 16px" }}>
          Download JSON
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Status:</strong> {status}
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Loaded games:</strong> {games.length}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Loaded seasons:</strong> {seasons.length}
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Loaded file:</strong> {fileName || "None"}
      </div>

      <div style={{ marginBottom: 24 }}>
        <strong>Roster size for Season {seasonId}:</strong> {rosterPlayers.length}
      </div>

      {reviewSummary ? (
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            border: "1px solid #cbd5e1",
            background: "#f8fafc",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Review Summary</h3>
          <div style={{ marginBottom: 8 }}>
            <strong>Players generated:</strong> {reviewSummary.playerCount}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Generated player names:</strong>{" "}
            {reviewSummary.generatedPlayers.length
              ? reviewSummary.generatedPlayers.map((entry) => formatPlayerLabel(entry, players)).join(", ")
              : "None"}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Batting totals:</strong>{" "}
            {`AB ${reviewSummary.battingTotals.AB}, R ${reviewSummary.battingTotals.R} / expected ${reviewSummary.expectedTeamRuns}, H ${reviewSummary.battingTotals.H}, RBI ${reviewSummary.battingTotals.RBI}, BB ${reviewSummary.battingTotals.BB}, SO ${reviewSummary.battingTotals.SO}`}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Pitching totals:</strong>{" "}
            {`IP ${reviewSummary.pitchingTotals.IP.toFixed(1)}, H ${reviewSummary.pitchingTotals.H_Allowed}, R ${reviewSummary.pitchingTotals.R_Allowed} / expected ${reviewSummary.expectedOpponentRuns}, ER ${reviewSummary.pitchingTotals.ER}, BB ${reviewSummary.pitchingTotals.BB_Allowed}, SO ${reviewSummary.pitchingTotals.SO_Pitching}, SB Allowed ${reviewSummary.pitchingTotals.SB_Allowed}`}
          </div>
          <div>
            <strong>Defensive-only rows:</strong>{" "}
            {reviewSummary.defensiveOnly.length
              ? reviewSummary.defensiveOnly.map((entry) => formatPlayerLabel(entry, players)).join(", ")
              : "None"}
          </div>
        </div>
      ) : null}

      <div
        style={{
          marginBottom: 24,
          padding: 16,
          border: "1px solid #bfdbfe",
          background: "#eff6ff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>1. Box Score Images</h2>
        <p style={{ maxWidth: 900, lineHeight: 1.5, marginBottom: 16 }}>
          Upload your box score screenshots here. The page stores them for review and
          preview while we keep building out automatic image-to-stats extraction.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span>Batting Box Score Image</span>
            <input type="file" accept="image/*" onChange={(e) => handleLegacyImageChange("batting", e)} />
            <div style={{ fontSize: 13, color: "#475569" }}>{battingImageName || "No image selected"}</div>
            <div style={{ fontSize: 13, color: "#334155" }}>
              OCR: {ocrStatus.batting} {ocrStatus.batting === "reading" ? `(${ocrProgress.batting}%)` : ""}
            </div>
            {battingImagePreview ? (
              <img
                src={battingImagePreview}
                alt="Batting box score preview"
                style={{ width: "100%", borderRadius: 10, border: "1px solid #cbd5e1" }}
              />
            ) : null}
            {legacyBattingText ? (
              <textarea
                value={legacyBattingText}
                readOnly
                spellCheck={false}
                style={{ width: "100%", minHeight: 120, fontFamily: "monospace", fontSize: 12 }}
              />
            ) : null}
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span>Batting Detail Image</span>
            <input type="file" accept="image/*" onChange={(e) => handleLegacyImageChange("battingDetail", e)} />
            <div style={{ fontSize: 13, color: "#475569" }}>{battingDetailImageName || "No image selected"}</div>
            <div style={{ fontSize: 13, color: "#334155" }}>
              OCR: {ocrStatus.battingDetail}{" "}
              {ocrStatus.battingDetail === "reading" ? `(${ocrProgress.battingDetail}%)` : ""}
            </div>
            {battingDetailImagePreview ? (
              <img
                src={battingDetailImagePreview}
                alt="Batting detail preview"
                style={{ width: "100%", borderRadius: 10, border: "1px solid #cbd5e1" }}
              />
            ) : null}
            {legacyBattingDetailText ? (
              <textarea
                value={legacyBattingDetailText}
                readOnly
                spellCheck={false}
                style={{ width: "100%", minHeight: 120, fontFamily: "monospace", fontSize: 12 }}
              />
            ) : null}
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span>Pitching Box Score Image</span>
            <input type="file" accept="image/*" onChange={(e) => handleLegacyImageChange("pitching", e)} />
            <div style={{ fontSize: 13, color: "#475569" }}>{pitchingImageName || "No image selected"}</div>
            <div style={{ fontSize: 13, color: "#334155" }}>
              OCR: {ocrStatus.pitching} {ocrStatus.pitching === "reading" ? `(${ocrProgress.pitching}%)` : ""}
            </div>
            {pitchingImagePreview ? (
              <img
                src={pitchingImagePreview}
                alt="Pitching box score preview"
                style={{ width: "100%", borderRadius: 10, border: "1px solid #cbd5e1" }}
              />
            ) : null}
            {legacyPitchingText ? (
              <textarea
                value={legacyPitchingText}
                readOnly
                spellCheck={false}
                style={{ width: "100%", minHeight: 120, fontFamily: "monospace", fontSize: 12 }}
              />
            ) : null}
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span>Pitching Detail Image</span>
            <input type="file" accept="image/*" onChange={(e) => handleLegacyImageChange("pitchingDetail", e)} />
            <div style={{ fontSize: 13, color: "#475569" }}>{pitchingDetailImageName || "No image selected"}</div>
            <div style={{ fontSize: 13, color: "#334155" }}>
              OCR: {ocrStatus.pitchingDetail}{" "}
              {ocrStatus.pitchingDetail === "reading" ? `(${ocrProgress.pitchingDetail}%)` : ""}
            </div>
            {pitchingDetailImagePreview ? (
              <img
                src={pitchingDetailImagePreview}
                alt="Pitching detail preview"
                style={{ width: "100%", borderRadius: 10, border: "1px solid #cbd5e1" }}
              />
            ) : null}
            {legacyPitchingDetailText ? (
              <textarea
                value={legacyPitchingDetailText}
                readOnly
                spellCheck={false}
                style={{ width: "100%", minHeight: 120, fontFamily: "monospace", fontSize: 12 }}
              />
            ) : null}
          </label>
        </div>
      </div>

      <div
        style={{
          marginBottom: 24,
          padding: 16,
          border: "1px solid #c7d2fe",
          background: "#eef2ff",
        }}
      >
        <h2 style={{ marginTop: 0 }}>2. Play-By-Play</h2>
        <p style={{ maxWidth: 900, lineHeight: 1.5, marginBottom: 16 }}>
          Paste the GameChanger play-by-play here to enrich the generated rows with fields
          such as <code>ROE</code>, <code>FC</code>, <code>HBP</code>, <code>SAC</code>,
          and <code>SF</code>.
        </p>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>GameChanger Play-by-Play</span>
          <textarea
            value={legacyPlayByPlayText}
            onChange={(e) => setLegacyPlayByPlayText(normalizeLegacyPlayByPlayText(e.target.value))}
            spellCheck={false}
            placeholder={`Bottom 1st - St. Andrew's Varsity Lions\nA Kusilka hits a line drive and reaches on an error...\nC Helle lines into fielder's choice...`}
            style={{ width: "100%", minHeight: 260, fontFamily: "monospace", fontSize: 14 }}
          />
        </label>
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
