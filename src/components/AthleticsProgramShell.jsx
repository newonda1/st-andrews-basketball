import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { statsSearchItems } from "./statsSearchIndex";

const utilityLinks = [
  {
    label: "Tickets",
    href: "https://gofan.co/app/school/GA23139",
  },
  {
    label: "Livestream",
    href: "https://fan.hudl.com/usa/ga/savannah/organization/31104/st-andrews-high-school",
  },
  {
    label: "Booster Club",
    href: "https://sasboosterclub.boosterhub.com/register/11952",
  },
];

const mobileBottomLinks = [
  ...utilityLinks,
  {
    label: "Admissions",
    href: "https://saslions.com/admissions/",
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/g/1TEwk2QGWu/",
    icon: "facebook",
  },
  {
    label: "X",
    href: "https://x.com/sassportsinfo",
    icon: "x",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/saslions.athletics/",
    icon: "instagram",
  },
];

function isPathCurrent(pathname, target, end = false) {
  if (!target) {
    return false;
  }

  if (end) {
    return pathname === target;
  }

  return pathname === target || pathname.startsWith(`${target}/`);
}

function getSearchScore(item, query) {
  const label = item.label.toLowerCase();
  const description = (item.description || "").toLowerCase();
  const keywords = (item.keywords || []).join(" ").toLowerCase();
  const haystack = `${label} ${description} ${keywords}`.trim();
  const terms = query.split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return item.featured ? 1 : 0;
  }

  if (terms.some((term) => !haystack.includes(term))) {
    return 0;
  }

  let score = 20;

  if (label === query) {
    score += 100;
  } else if (label.startsWith(query)) {
    score += 50;
  } else if (haystack.includes(query)) {
    score += 25;
  }

  if (description.includes(query)) {
    score += 10;
  }

  if (item.featured) {
    score += 4;
  }

  return score;
}

function getVisibleSearchItems(searchQuery, fallbackItems = []) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return fallbackItems;
  }

  return statsSearchItems
    .map((item) => ({ item, score: getSearchScore(item, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label)
    )
    .slice(0, 8)
    .map((entry) => entry.item);
}

function renderSocialIcon(icon) {
  if (icon === "facebook") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="currentColor"
      >
        <path d="M13.5 21V12.8H16l.4-3H13.5V7.9c0-.9.3-1.6 1.6-1.6h1.4V3.6c-.2 0-1.1-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.5H8.2v3h2.4V21h2.9Z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="4" y="4" width="16" height="16" rx="4.2" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 5L18 19" />
      <path d="M18 5L6 19" />
    </svg>
  );
}

function SearchResults({ items, query, onSelect, compact = false }) {
  if (items.length === 0) {
    return (
      <p
        className={`m-0 text-[0.9rem] leading-[1.45] text-white/72 ${
          compact ? "px-0 py-2" : "px-6 py-4"
        }`}
      >
        No matching stats pages found. Try a sport, record type, or player.
      </p>
    );
  }

  return (
    <>
      <p
        className={`m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/60 ${
          compact ? "pb-3" : "px-6 pb-3 pt-5"
        }`}
      >
        {query.trim() ? "Results" : "Popular Pages"}
      </p>
      <div className={compact ? "space-y-0" : "pb-2"}>
        {items.map((item) => (
          <Link
            key={`${item.to}-${item.label}`}
            to={item.to}
            onClick={onSelect}
            className={`block border-t border-white/10 text-white no-underline transition hover:bg-white/[0.04] ${
              compact ? "py-3" : "px-6 py-4"
            }`}
          >
            <p className="m-0 text-[1rem] leading-[1.2]">{item.label}</p>
            <p className="m-0 mt-1 text-[0.82rem] leading-[1.3] text-white/68">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function AthleticsProgramShell({
  title,
  subtitle,
  menuTitle,
  menuSections = [],
  children,
  athleticsHomePath = "/athletics",
  headerHomePath = athleticsHomePath,
  homeLabel = "Home",
  showFooter = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const [openDropdownTitle, setOpenDropdownTitle] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedTitle, setMobileExpandedTitle] = useState(null);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  const normalizedSections = useMemo(
    () =>
      (menuSections || []).filter(
        (section) =>
          section?.title &&
          Array.isArray(section.links) &&
          section.links.length > 0
      ),
    [menuSections]
  );

  const navSections = useMemo(
    () => [
      {
        title: homeLabel,
        links: [{ to: headerHomePath, label: homeLabel, end: true }],
      },
      ...normalizedSections,
    ],
    [headerHomePath, homeLabel, normalizedSections]
  );

  const featuredSearchItems = useMemo(
    () => statsSearchItems.filter((item) => item.featured).slice(0, 7),
    []
  );

  const visibleSearchItems = useMemo(
    () => getVisibleSearchItems(searchQuery, featuredSearchItems),
    [featuredSearchItems, searchQuery]
  );

  const mobileVisibleSearchItems = useMemo(
    () => getVisibleSearchItems(mobileSearchQuery, []),
    [mobileSearchQuery]
  );

  const openDropdownSection = useMemo(
    () =>
      navSections.find(
        (section) =>
          section.title === openDropdownTitle &&
          (section.links || []).length > 1
      ) || null,
    [navSections, openDropdownTitle]
  );

  useEffect(() => {
    setOpenDropdownTitle(null);
    setSearchOpen(false);
    setSearchQuery("");
    setMobileMenuOpen(false);
    setMobileExpandedTitle(null);
    setMobileSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (!searchOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    if (mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isLinkActive = (item) =>
    isPathCurrent(location.pathname, item?.to, Boolean(item?.end));

  const isSectionActive = (section) =>
    (section.links || []).some((item) => isLinkActive(item));

  const closeNavMenus = () => setOpenDropdownTitle(null);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpandedTitle(null);
    setMobileSearchQuery("");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (visibleSearchItems.length > 0) {
      navigate(visibleSearchItems[0].to);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleMobileSearchSubmit = (event) => {
    event.preventDefault();

    if (mobileVisibleSearchItems.length > 0) {
      navigate(mobileVisibleSearchItems[0].to);
      closeMobileMenu();
    }
  };

  const handleNavShellBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      closeNavMenus();
    }
  };

  const getDropdownColumns = (links) => {
    const columnCount = links.length > 5 ? 2 : 1;
    const chunkSize = Math.ceil(links.length / columnCount);

    return Array.from({ length: columnCount }, (_, index) =>
      links.slice(index * chunkSize, index * chunkSize + chunkSize)
    ).filter((column) => column.length > 0);
  };

  const getDropdownWidth = (links) => {
    const columnCount = getDropdownColumns(links).length;
    return columnCount > 1
      ? "min(760px, calc(100vw - 6rem))"
      : "min(420px, calc(100vw - 6rem))";
  };

  const renderMobileMenuItem = (section) => {
    const links = section.links || [];
    const isExpanded = mobileExpandedTitle === section.title;
    const isActive = isSectionActive(section);

    if (links.length <= 1) {
      const item = links[0];

      return (
        <Link
          key={section.title}
          to={item.to}
          onClick={closeMobileMenu}
          className={`flex items-center justify-between border-b border-[#e5e5e5] py-5 text-[1.16rem] leading-[1.15] no-underline ${
            isActive ? "text-[var(--stats-navy)]" : "text-[#242424]"
          }`}
        >
          <span>{section.title}</span>
        </Link>
      );
    }

    return (
      <div key={section.title}>
        <button
          type="button"
          className={`flex w-full items-center justify-between border-b border-[#e5e5e5] bg-transparent py-5 text-left text-[1.16rem] leading-[1.15] ${
            isExpanded || isActive ? "text-[var(--stats-navy)]" : "text-[#242424]"
          }`}
          onClick={() =>
            setMobileExpandedTitle((current) =>
              current === section.title ? null : section.title
            )
          }
        >
          <span>{section.title}</span>
          <span aria-hidden="true" className="ml-4 text-[1.8rem] leading-none text-[#7a7a7a]">
            {isExpanded ? "−" : "+"}
          </span>
        </button>

        {isExpanded ? (
          <div className="border-b border-[#e5e5e5] pb-3">
            {links.map((item) => (
              <Link
                key={`${section.title}-${item.to}`}
                to={item.to}
                onClick={closeMobileMenu}
                className="block border-t border-[#f1f1f1] py-3 pl-4 text-[0.98rem] leading-[1.25] text-[#44506a] no-underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderNavItem = (section) => {
    const links = section.links || [];
    const active = isSectionActive(section);
    const open = openDropdownTitle === section.title;
    const textClass = active || open ? "text-[var(--stats-navy)]" : "text-[#242424]";

    if (links.length === 1) {
      const item = links[0];
      return (
        <div key={section.title} className="relative flex flex-1 items-stretch">
          <NavLink
            to={item.to}
            end={item.end}
            onMouseEnter={() => setOpenDropdownTitle(section.title)}
            onFocus={() => setOpenDropdownTitle(section.title)}
            className={({ isActive }) =>
              `relative inline-flex min-h-[54px] w-full items-center justify-center px-3 py-[15px] text-center text-[1.02rem] font-semibold leading-[1.15] no-underline transition-colors ${
                isActive ? "text-[var(--stats-navy)]" : textClass
              }`
            }
          >
            {section.title}
          </NavLink>
          <span
            aria-hidden="true"
            className={`absolute inset-x-[12%] bottom-0 h-[3px] origin-center bg-[var(--stats-gray)] transition ${
              active || open ? "scale-x-100 opacity-100" : "scale-x-50 opacity-0"
            }`}
          />
        </div>
      );
    }

    return (
      <div
        key={section.title}
        className="relative flex flex-1 items-stretch"
        onMouseEnter={() => setOpenDropdownTitle(section.title)}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onFocus={() => setOpenDropdownTitle(section.title)}
          onClick={() =>
            setOpenDropdownTitle((current) =>
              current === section.title ? null : section.title
            )
          }
          className={`relative inline-flex min-h-[54px] w-full items-center justify-center bg-transparent px-3 py-[15px] text-center text-[1.02rem] font-semibold leading-[1.15] transition-colors ${textClass}`}
        >
          {section.title}
        </button>
        <span
          aria-hidden="true"
          className={`absolute inset-x-[12%] bottom-0 h-[3px] origin-center bg-[var(--stats-gray)] transition ${
            active || open ? "scale-x-100 opacity-100" : "scale-x-50 opacity-0"
          }`}
        />
      </div>
    );
  };

  return (
    <div className="stats-site-shell">
      <header className="fixed inset-x-0 top-0 z-40 bg-white">
        <div className="hidden lg:block border-b border-white/10 bg-[var(--stats-dark)]">
          <div className="flex min-h-[40px] w-full items-center justify-between px-6 lg:px-8 xl:px-10 2xl:px-12">
            <a
              href="https://saslions.myschoolapp.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold uppercase tracking-[0.02em] text-white no-underline transition hover:underline"
            >
              LMS LOGIN &gt;
            </a>

            <div className="flex items-center">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-10 w-10 items-center justify-center text-white transition hover:bg-white hover:text-[var(--stats-navy)]"
                >
                  {renderSocialIcon(item.icon)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:hidden border-b border-white/10 bg-[var(--stats-dark)]">
          <div className="relative mx-auto flex min-h-[46px] max-w-[1180px] items-center justify-center px-4">
            <a
              href="https://saslions.myschoolapp.com/"
              target="_blank"
              rel="noreferrer"
              className="absolute left-4 text-[11px] font-bold uppercase tracking-[0.02em] text-white/80 no-underline"
            >
              LMS LOGIN &gt;
            </a>
            <div className="flex items-center">
              {socialLinks.map((item) => (
                <a
                  key={`mobile-social-${item.label}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-10 w-10 items-center justify-center text-white"
                >
                  {renderSocialIcon(item.icon)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-b border-[var(--stats-line-soft)] bg-white">
          <div className="flex w-full items-center justify-between px-4 py-4 lg:px-8 lg:py-5 xl:px-10 2xl:px-12">
            <Link
              to={headerHomePath}
              className="flex min-w-0 items-center gap-3 text-[var(--stats-navy)] no-underline lg:gap-4"
            >
              <img
                src="/images/common/st_andrews_athletics_horizontal_logo_dark.png"
                alt="St. Andrew's Athletics"
                className="h-[32px] w-auto sm:h-[38px] lg:h-[48px]"
              />
              <span
                aria-hidden="true"
                className="hidden h-8 w-px bg-[var(--stats-gray)] md:block lg:h-[39px]"
              />
              <div className="hidden min-w-0 md:flex md:flex-col">
                <span className="text-[0.94rem] font-semibold uppercase tracking-[0.01em] text-[var(--stats-navy)] lg:text-[1.12rem]">
                  {title}
                </span>
                {subtitle ? (
                  <span className="text-[0.82rem] leading-[1.2] text-[var(--stats-gray)]">
                    {subtitle}
                  </span>
                ) : null}
              </div>
            </Link>

            <div
              ref={searchContainerRef}
              className="relative hidden items-center gap-1 lg:flex"
            >
              <div className="flex items-center">
                {utilityLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="px-[10px] py-[10px] text-[0.875rem] font-semibold leading-[1.25] text-[var(--stats-gray)] no-underline transition hover:text-[var(--stats-navy)] hover:underline"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <button
                type="button"
                aria-label="Search the stats site"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((current) => !current)}
                className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--stats-gray)] transition hover:text-[var(--stats-navy)]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-[1.1rem] w-[1.1rem]"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 16L21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {searchOpen ? (
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(420px,92vw)] border border-[var(--stats-navy)] bg-[var(--stats-navy)] shadow-[0_18px_36px_rgba(15,23,42,0.22)]">
                  <form onSubmit={handleSearchSubmit} className="border-b border-white/15 p-5">
                    <div className="flex items-center border-b border-white/35">
                      <button
                        type="submit"
                        className="inline-flex h-10 w-10 items-center justify-center text-white/85"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-[1rem] w-[1rem]"
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="6.5"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M16 16L21 21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search the stats site"
                        className="stats-desktop-search-input h-10 w-full border-none bg-transparent px-1 text-[0.95rem] text-white outline-none"
                      />
                    </div>
                  </form>

                  <SearchResults
                    items={visibleSearchItems}
                    query={searchQuery}
                    onSelect={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                  />
                </div>
              ) : null}
            </div>

            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => {
                setSearchOpen(false);
                setMobileMenuOpen(true);
              }}
              className="inline-flex h-[46px] w-[54px] items-center justify-center border-l border-[var(--stats-line)] text-[#6e6e6e] lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7"
              >
                <path d="M4 7H20" stroke="currentColor" strokeWidth="2.1" />
                <path d="M4 12H20" stroke="currentColor" strokeWidth="2.1" />
                <path d="M4 17H20" stroke="currentColor" strokeWidth="2.1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="hidden border-y border-[var(--stats-line-soft)] bg-[var(--stats-panel-muted)] lg:block">
          <div
            className="relative"
            onMouseLeave={closeNavMenus}
            onBlur={handleNavShellBlur}
          >
            <nav
              aria-label={menuTitle || title}
              className="flex w-full items-center justify-center px-6 lg:px-8 xl:px-10 2xl:px-12"
            >
              <div className="flex w-full items-stretch justify-between">
                {navSections.map(renderNavItem)}
              </div>
            </nav>

            {openDropdownSection ? (
              <div
                className="absolute left-1/2 top-full z-50 -translate-x-1/2"
                style={{ width: getDropdownWidth(openDropdownSection.links) }}
              >
                <div className="bg-[var(--stats-navy)] px-9 py-8 shadow-[0_28px_42px_rgba(15,23,42,0.28)]">
                  <div
                    className="grid gap-8"
                    style={{
                      gridTemplateColumns: `repeat(${getDropdownColumns(
                        openDropdownSection.links
                      ).length}, minmax(0, 1fr))`,
                    }}
                  >
                    {getDropdownColumns(openDropdownSection.links).map(
                      (column, columnIndex) => (
                        <div
                          key={`${openDropdownSection.title}-column-${columnIndex}`}
                          className="flex flex-col"
                        >
                          {column.map((item, itemIndex) => (
                            <NavLink
                              key={`${openDropdownSection.title}-${item.to}`}
                              to={item.to}
                              end={item.end}
                              onClick={closeNavMenus}
                              className="block border-b border-white/35 py-[14px] text-[1rem] leading-[1.2] text-white no-underline transition hover:opacity-80"
                              style={{
                                borderBottom:
                                  itemIndex === column.length - 1
                                    ? "none"
                                    : undefined,
                              }}
                            >
                              {item.label}
                            </NavLink>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-white lg:hidden">
          <div className="min-h-full px-5 pb-12 pt-8">
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMobileMenu}
                className="inline-flex h-11 w-11 items-center justify-center text-[#242424]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8"
                >
                  <path d="M5 5L19 19" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M19 5L5 19" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={handleMobileSearchSubmit}
              className="mt-5 bg-[var(--stats-navy)] px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-white"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 16L21 21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  value={mobileSearchQuery}
                  onChange={(event) => setMobileSearchQuery(event.target.value)}
                  placeholder="Search"
                  className="stats-mobile-search-input h-8 w-full border-none bg-transparent p-0 text-[1rem] text-white outline-none"
                />
              </div>

              {mobileSearchQuery.trim() ? (
                <div className="mt-4 border-t border-white/15 pt-2">
                  <SearchResults
                    items={mobileVisibleSearchItems}
                    query={mobileSearchQuery}
                    compact
                    onSelect={closeMobileMenu}
                  />
                </div>
              ) : null}
            </form>

            <nav
              aria-label={`${menuTitle || title} mobile navigation`}
              className="mt-6 border-t border-[#e6e6e6]"
            >
              {navSections.map(renderMobileMenuItem)}
            </nav>

            <div className="mt-10 flex flex-col gap-5">
              {mobileBottomLinks.map((item) => (
                <a
                  key={`mobile-${item.label}`}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[1rem] leading-[1.1] text-[var(--stats-navy)] no-underline"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-[132px] sm:px-5 sm:pt-[142px] lg:pt-[166px]">
        <main className="min-h-[520px]">{children}</main>
      </div>

      {showFooter ? <Footer /> : null}
    </div>
  );
}
