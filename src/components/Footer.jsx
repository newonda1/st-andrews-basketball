import React from "react";
import { Link } from "react-router-dom";

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

const footerLinkColumns = [
  [
    {
      label: "Admissions",
      href: "https://saslions.com/admissions/",
    },
    {
      label: "Athletic Events",
      href: "https://www.saslionsathletics.com/inside-athletics/athletic-events",
    },
    {
      label: "Booster Club",
      href: "https://sasboosterclub.boosterhub.com/register/11952",
    },
    {
      label: "GIAA",
      href: "https://giaasports.org/",
    },
  ],
  [
    {
      label: "NCAA Eligibility Center",
      href: "https://web3.ncaa.org/ecwr3/",
    },
    {
      label: "NAIA Eligibility Center",
      href: "https://play.mynaia.org/",
    },
    {
      label: "MaxPreps",
      href: "https://www.maxpreps.com/ga/savannah/st-andrews-lions/",
    },
  ],
];

const footerBottomLinks = [
  {
    label: "Admissions",
    href: "https://saslions.com/admissions/",
  },
  {
    label: "Athletic Events",
    href: "https://www.saslionsathletics.com/inside-athletics/athletic-events",
  },
  {
    label: "Booster Club",
    href: "https://sasboosterclub.boosterhub.com/register/11952",
  },
];

function renderSocialIcon(icon) {
  if (icon === "facebook") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[1.1rem] w-[1.1rem]"
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
        className="h-[1.1rem] w-[1.1rem]"
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
      className="h-[1.1rem] w-[1.1rem]"
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

export default function Footer() {
  return (
    <footer className="mt-16 bg-[var(--stats-navy)] text-white">
      <div className="w-full px-6 py-12 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_1.45fr] lg:gap-14">
          <div>
            <Link to="/athletics" className="inline-flex no-underline">
              <span
                aria-label="St. Andrew's Athletics"
                className="block h-[58px] w-[340px] bg-white sm:h-[66px] sm:w-[385px]"
                style={{
                  WebkitMask:
                    "url('/images/common/st_andrews_athletics_horizontal_logo_dark.png') center / contain no-repeat",
                  mask:
                    "url('/images/common/st_andrews_athletics_horizontal_logo_dark.png') center / contain no-repeat",
                }}
              />
            </Link>

            <div className="mt-10 space-y-1 text-[0.96rem] leading-[1.65] text-white">
              <p className="m-0">601 Penn Waller Rd</p>
              <p className="m-0">Savannah, GA 31410</p>
              <p className="m-0">United States</p>
              <a
                href="tel:+19128974941"
                className="inline-block text-white no-underline underline-offset-2 transition hover:underline"
              >
                +1 (912) 897-4941
              </a>
            </div>
          </div>

          <div>
            <h2 className="mb-8 text-[1.4rem] font-normal leading-[1.2] text-white sm:text-[1.55rem]">
              Stay Connected
            </h2>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-[54px] w-[54px] items-center justify-center rounded-full border border-white/28 text-white no-underline transition hover:border-white hover:bg-white hover:text-[var(--stats-navy)]"
                >
                  {renderSocialIcon(item.icon)}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-8 text-[1.4rem] font-normal leading-[1.2] text-white sm:text-[1.55rem]">
              Links & Resources
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {footerLinkColumns.map((column, columnIndex) => (
                <div key={`footer-column-${columnIndex}`} className="space-y-0">
                  {column.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block border-b border-white/22 py-3 text-[0.96rem] leading-[1.35] text-white no-underline transition hover:underline"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/14">
        <div className="flex w-full flex-col gap-3 px-6 py-5 text-[0.82rem] leading-[1.45] text-white/70 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-16 2xl:px-24">
          <p className="m-0">St. Andrew&apos;s athletic statistics and archives.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="https://preplegacy.com"
              target="_blank"
              rel="noreferrer"
              className="text-white/80 no-underline transition hover:text-white hover:underline"
            >
              Powered by Prep Legacy
            </a>
            {footerBottomLinks.map((item) => (
              <a
                key={`footer-bottom-${item.label}`}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-white/70 no-underline transition hover:text-white hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
