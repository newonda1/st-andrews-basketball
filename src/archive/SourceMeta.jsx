import React from "react";

export function sourceCitationFor(record) {
  return String(record?.SourceCitation || record?.RecapSource || "").trim();
}

export function sourceNoteFor(record) {
  return String(record?.SourceNote || "").trim();
}

export function completenessFor(record) {
  return String(
    record?.BoxScoreCompleteness ||
      record?.ScoringCompleteness ||
      record?.ResultCompleteness ||
      ""
  ).trim();
}

export function formatCompleteness(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";

  const labels = {
    complete: "Complete",
    partial: "Partial",
    missing: "Missing",
    placeholder: "Placeholder",
  };

  return labels[normalized] || normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function SourceMeta({
  record,
  className = "",
  sourceClassName = "",
  noteClassName = "",
  badgeClassName = "",
}) {
  const sourceCitation = sourceCitationFor(record);
  const sourceNote = sourceNoteFor(record);
  const completeness = completenessFor(record);
  const completenessLabel = formatCompleteness(completeness);
  const articleId = String(record?.ArticleID || "").trim();

  if (!sourceCitation && !sourceNote && !completenessLabel && !articleId) return null;

  return (
    <div className={["space-y-2 text-sm text-slate-600", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-center gap-2">
        {completenessLabel ? (
          <span
            className={[
              "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600",
              badgeClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {completenessLabel}
          </span>
        ) : null}
        {articleId ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            {articleId}
          </span>
        ) : null}
      </div>
      {sourceCitation ? (
        <p className={sourceClassName}>
          <span className="font-semibold text-slate-700">Source:</span> {sourceCitation}
        </p>
      ) : null}
      {sourceNote ? (
        <p
          className={[
            "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950",
            noteClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {sourceNote}
        </p>
      ) : null}
    </div>
  );
}
