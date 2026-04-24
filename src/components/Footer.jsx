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
      <div className="mx-auto max-w-[1180px] px-8 pb-14 pt-12 sm:px-10 lg:px-12 lg:pb-[46px] lg:pt-[54px]">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="w-full max-w-[360px] shrink-0">
            <Link
              to="/athletics"
              className="inline-flex items-center gap-2 text-white no-underline"
            >
              <svg
                aria-label="St. Andrew's Lions"
                viewBox="0 0 1526 460"
                className="block h-auto w-[198px] sm:w-[218px]"
                role="img"
              >
                <defs>
                  <filter
                    id="footer-logo-to-white"
                    colorInterpolationFilters="sRGB"
                  >
                    <feColorMatrix
                      in="SourceGraphic"
                      result="logoAlphaBase"
                      type="matrix"
                      values="0 0 0 0 0
                              0 0 0 0 0
                              0 0 0 0 0
                              -0.333 -0.333 -0.333 1 0"
                    />
                    <feComponentTransfer
                      in="logoAlphaBase"
                      result="logoAlpha"
                    >
                      <feFuncA type="linear" slope="3" intercept="-0.08" />
                    </feComponentTransfer>
                    <feFlood floodColor="#ffffff" result="whiteLogo" />
                    <feComposite
                      in="whiteLogo"
                      in2="logoAlpha"
                      operator="in"
                    />
                  </filter>
                </defs>
                <image
                  href="/images/common/st_andrews_athletics_horizontal_logo_dark.png"
                  width="1526"
                  height="460"
                  preserveAspectRatio="xMinYMin meet"
                  filter="url(#footer-logo-to-white)"
                />
              </svg>
              <span
                aria-hidden="true"
                className="block h-[44px] w-px bg-white/86 sm:h-[50px]"
              />
              <span className="text-[1.72rem] font-normal uppercase leading-none tracking-[0.03em] text-white sm:text-[2rem]">
                Athletics
              </span>
            </Link>

            <div className="mt-[23px] space-y-[4px] text-[0.96rem] leading-[1.45] text-white/95">
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

          <div className="w-full max-w-[210px] shrink-0 lg:pt-[2px]">
            <h2 className="mb-[21px] text-[1.22rem] font-normal leading-[1.15] text-white sm:text-[1.33rem]">
              Stay Connected
            </h2>
            <div className="flex flex-wrap gap-[14px]">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-[43px] w-[43px] items-center justify-center rounded-full border border-white/26 text-white no-underline transition hover:border-white hover:bg-white hover:text-[var(--stats-navy)]"
                >
                  {renderSocialIcon(item.icon)}
                </a>
              ))}
            </div>
          </div>

          <div className="w-full max-w-[364px] shrink-0 lg:pt-[2px]">
            <h2 className="mb-[21px] text-[1.22rem] font-normal leading-[1.15] text-white sm:text-[1.33rem]">
              Links & Resources
            </h2>
            <div className="grid grid-cols-1 gap-x-[20px] gap-y-0 sm:grid-cols-2">
              {footerLinkColumns.map((column, columnIndex) => (
                <div
                  key={`footer-column-${columnIndex}`}
                  className="max-w-[172px] space-y-[11px]"
                >
                  {column.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block border-b border-white/23 pb-[10px] pt-[3px] text-[0.97rem] leading-[1.32] text-white no-underline transition hover:underline"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-[60px] max-w-[1060px] text-[0.93rem] italic leading-[1.72] text-white/84 lg:mt-[68px] lg:text-[0.99rem]">
          St. Andrew&apos;s School does not discriminate on the basis of sex,
          race, color, disability, sexual orientation, religion, or national
          or ethnic origin in the administration of its education policies,
          admission policies, scholarship or financial aid policies, or
          athletic or other school-administered programs.
        </p>
      </div>
    </footer>
  );
}
