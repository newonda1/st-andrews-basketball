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
      <div className="mx-auto max-w-[1120px] px-8 pb-14 pt-12 sm:px-10 lg:px-12 lg:pb-12 lg:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.12fr_0.82fr_1.22fr] lg:gap-12 xl:gap-16">
          <div>
            <Link to="/athletics" className="inline-flex no-underline">
              <img
                src="/images/common/st_andrews_athletics_horizontal_logo_dark.png"
                alt="St. Andrew's Athletics"
                className="block h-auto w-[280px] brightness-0 invert sm:w-[315px]"
              />
            </Link>

            <div className="mt-7 space-y-1 text-[0.95rem] leading-[1.65] text-white/94 lg:text-[0.99rem]">
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
            <h2 className="mb-6 text-[1.25rem] font-normal leading-[1.2] text-white sm:text-[1.4rem]">
              Stay Connected
            </h2>
            <div className="flex flex-wrap gap-3.5">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-full border border-white/30 text-white no-underline transition hover:border-white hover:bg-white hover:text-[var(--stats-navy)]"
                >
                  {renderSocialIcon(item.icon)}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-6 text-[1.25rem] font-normal leading-[1.2] text-white sm:text-[1.4rem]">
              Links & Resources
            </h2>
            <div className="grid max-w-[440px] gap-x-8 gap-y-0 sm:grid-cols-2 lg:max-w-[520px]">
              {footerLinkColumns.map((column, columnIndex) => (
                <div
                  key={`footer-column-${columnIndex}`}
                  className="max-w-[220px] space-y-0"
                >
                  {column.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block border-b border-white/24 py-[0.78rem] text-[0.95rem] leading-[1.35] text-white no-underline transition hover:underline"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mx-auto mt-12 max-w-[1120px] text-[0.92rem] italic leading-[1.65] text-white/82 lg:mt-14 lg:text-[1rem]">
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
