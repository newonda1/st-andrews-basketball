import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  SEARCH_RESULT_TYPE_ORDER,
  searchSearchEntries,
} from "./searchUtils";

const SEARCH_INDEX_PATH = "/data/search/index.json";

const RESULT_TYPE_LABELS = {
  athlete: "Athlete",
  team: "Team",
  page: "Page",
};

const RESULT_GROUP_LABELS = {
  athlete: "Athletes",
  team: "Teams",
  page: "Pages",
};

function getSearchRoute(query) {
  const trimmedQuery = String(query ?? "").trim();
  if (!trimmedQuery) {
    return "/athletics/search";
  }

  return `/athletics/search?${new URLSearchParams({ q: trimmedQuery }).toString()}`;
}

function groupSearchResults(results) {
  const resultTypes = [...new Set(results.map((result) => result.type).filter(Boolean))];
  const orderedTypes = [
    ...SEARCH_RESULT_TYPE_ORDER.filter((type) => resultTypes.includes(type)),
    ...resultTypes.filter((type) => !SEARCH_RESULT_TYPE_ORDER.includes(type)),
  ];

  return orderedTypes
    .map((type) => ({
      type,
      label: RESULT_GROUP_LABELS[type] || "Results",
      items: results.filter((result) => result.type === type),
    }))
    .filter((group) => group.items.length > 0);
}

export default function AthleticsSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [draftQuery, setDraftQuery] = useState(query);
  const [indexItems, setIndexItems] = useState([]);
  const [status, setStatus] = useState("Loading search index...");

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function loadSearchIndex() {
      try {
        const response = await fetch(SEARCH_INDEX_PATH, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Could not load search index (${response.status}).`);
        }

        const data = await response.json();
        const items = Array.isArray(data?.items) ? data.items : [];

        if (!cancelled) {
          setIndexItems(items);
          setStatus("");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus(error?.message || "Failed to load search index.");
          setIndexItems([]);
        }
      }
    }

    loadSearchIndex();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredItems = useMemo(
    () => indexItems.filter((item) => item.featured).slice(0, 8),
    [indexItems]
  );

  const results = useMemo(
    () => searchSearchEntries(indexItems, query, 36),
    [indexItems, query]
  );

  const groupedResults = useMemo(() => groupSearchResults(results), [results]);

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(getSearchRoute(draftQuery));
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-8">
      <section className="rounded-[1.75rem] border border-[var(--stats-line-soft)] bg-white px-6 py-7 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:px-8">
        <p className="m-0 text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[var(--stats-gray)]">
          Athletics Search
        </p>
        <h1 className="mt-3 text-[clamp(1.8rem,1.5rem+1vw,2.5rem)] font-bold leading-tight text-[var(--stats-navy)]">
          Search Athletes, Teams, and Stats Pages
        </h1>
        <p className="mt-3 max-w-3xl text-[1rem] leading-[1.7] text-slate-600">
          Start with a player name like <span className="font-semibold">Jack Kelley</span> or
          a team like <span className="font-semibold">Frederica Academy</span>.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          role="search"
        >
          <label className="sr-only" htmlFor="athletics-search-page-input">
            Search athletes, teams, and stats pages
          </label>
          <input
            id="athletics-search-page-input"
            type="search"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Search athletes or teams"
            className="h-12 flex-1 rounded-full border border-[var(--stats-line)] bg-white px-5 text-[1rem] text-[var(--stats-navy)] outline-none transition focus:border-[var(--stats-navy)] focus:ring-2 focus:ring-[rgba(1,33,105,0.12)]"
          />
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--stats-navy)] px-6 text-[0.95rem] font-semibold text-white transition hover:bg-[#00174a]"
          >
            Search
          </button>
        </form>
      </section>

      {status ? (
        <section className="rounded-[1.5rem] border border-[var(--stats-line-soft)] bg-white px-6 py-8 text-[0.98rem] text-slate-600 shadow-sm">
          {status}
        </section>
      ) : !query.trim() ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.95fr)]">
          <div className="rounded-[1.5rem] border border-[var(--stats-line-soft)] bg-white px-6 py-7 shadow-sm">
            <h2 className="m-0 text-[1.15rem] font-bold text-[var(--stats-navy)]">
              Search Tips
            </h2>
            <ul className="mt-4 space-y-3 pl-5 text-[0.97rem] leading-[1.7] text-slate-600">
              <li>Search a player name to go straight to an athlete page.</li>
              <li>Search an opponent school to jump into the team history page.</li>
              <li>Search a sport or page title when you want a broader stats page.</li>
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--stats-line-soft)] bg-white px-6 py-7 shadow-sm">
            <h2 className="m-0 text-[1.15rem] font-bold text-[var(--stats-navy)]">
              Popular Destinations
            </h2>
            <div className="mt-4 space-y-3">
              {featuredItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="block rounded-2xl border border-[var(--stats-line-soft)] px-4 py-4 text-[var(--stats-navy)] no-underline transition hover:border-[var(--stats-navy)] hover:bg-slate-50"
                >
                  <p className="m-0 text-[1rem] font-semibold leading-[1.25]">{item.title}</p>
                  <p className="m-0 mt-1 text-[0.86rem] leading-[1.45] text-slate-600">
                    {item.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : groupedResults.length === 0 ? (
        <section className="rounded-[1.5rem] border border-[var(--stats-line-soft)] bg-white px-6 py-8 shadow-sm">
          <h2 className="m-0 text-[1.15rem] font-bold text-[var(--stats-navy)]">
            No Results for "{query.trim()}"
          </h2>
          <p className="mt-3 text-[0.97rem] leading-[1.7] text-slate-600">
            Try a full athlete name, a last name, or the name of an opponent school.
          </p>
        </section>
      ) : (
        <section className="space-y-7">
          <div className="rounded-[1.5rem] border border-[var(--stats-line-soft)] bg-white px-6 py-5 shadow-sm">
            <p className="m-0 text-[0.76rem] font-bold uppercase tracking-[0.2em] text-[var(--stats-gray)]">
              Results
            </p>
            <p className="mt-2 text-[0.98rem] leading-[1.6] text-slate-600">
              Showing {results.length} result{results.length === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-[var(--stats-navy)]">"{query.trim()}"</span>
            </p>
          </div>

          {groupedResults.map((group) => (
            <div key={group.type}>
              <h2 className="text-[1.1rem] font-bold text-[var(--stats-navy)]">
                {group.label}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    to={item.to}
                    className="group block rounded-[1.4rem] border border-[var(--stats-line-soft)] bg-white px-5 py-5 text-[var(--stats-navy)] no-underline shadow-sm transition hover:-translate-y-[1px] hover:border-[var(--stats-navy)] hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[var(--stats-gray)]">
                          {RESULT_TYPE_LABELS[item.type] || "Result"}
                        </p>
                        <h3 className="m-0 mt-2 text-[1.06rem] font-semibold leading-[1.25] text-[var(--stats-navy)]">
                          {item.title}
                        </h3>
                        <p className="m-0 mt-2 text-[0.9rem] leading-[1.55] text-slate-600">
                          {item.subtitle}
                        </p>
                      </div>
                      <span className="mt-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--stats-navy)] transition group-hover:translate-x-[1px]">
                        Open
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
