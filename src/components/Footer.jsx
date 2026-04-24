import React from "react";
import { Link } from "react-router-dom";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/g/1TEwk2QGWu/",
  },
  {
    label: "X",
    href: "https://x.com/sassportsinfo",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/saslions.athletics/",
  },
];

const footerLinks = [
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
  {
    label: "MaxPreps",
    href: "https://www.maxpreps.com/ga/savannah/st-andrews-lions/",
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-[var(--stats-navy)] text-white">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-12 md:grid-cols-[1.25fr_0.8fr_1fr] md:gap-8">
        <div>
          <Link to="/athletics" className="inline-flex no-underline">
            <img
              src="/images/common/st_andrews_athletics_horizontal_logo.png"
              alt="St. Andrew's Athletics"
              className="h-14 w-auto"
            />
          </Link>

          <div className="mt-5 space-y-1 text-[0.95rem] leading-[1.6] text-white/84">
            <p className="m-0">601 Penn Waller Rd</p>
            <p className="m-0">Savannah, GA 31410</p>
            <a
              href="tel:+19128974941"
              className="inline-block text-white no-underline transition hover:underline"
            >
              +1 (912) 897-4941
            </a>
          </div>
        </div>

        <div>
          <h2 className="mb-5 text-[1.35rem] font-semibold leading-[1.35] text-white">
            Stay Connected
          </h2>
          <div className="flex flex-col gap-3 text-[0.95rem] leading-[1.4]">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-white no-underline transition hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-5 text-[1.35rem] font-semibold leading-[1.35] text-white">
            Links & Resources
          </h2>
          <div className="grid gap-3 text-[0.95rem] leading-[1.4]">
            {footerLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="text-white no-underline transition hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/12">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-5 text-[0.84rem] leading-[1.45] text-white/70 md:flex-row md:items-center md:justify-between">
          <p className="m-0">
            St. Andrew&apos;s athletic statistics and archives.
          </p>
          <a
            href="https://preplegacy.com"
            target="_blank"
            rel="noreferrer"
            className="text-white/80 no-underline transition hover:text-white hover:underline"
          >
            Powered by Prep Legacy
          </a>
        </div>
      </div>
    </footer>
  );
}
