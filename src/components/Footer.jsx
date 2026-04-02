import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "24px",
        borderTop: "1px solid #e5e7eb",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          boxSizing: "border-box",
        }}
        className="flex-col sm:flex-row text-center sm:text-left"
      >
        <Link
          to="/athletics"
          style={{
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
          }}
          className="w-full justify-center sm:w-auto sm:justify-start"
        >
          <img
            src="/images/common/st_andrews_athletics_logo.png"
            alt="St. Andrew's Athletics"
            style={{
              height: "48px",
              width: "auto",
              display: "block",
            }}
          />
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          className="w-full justify-center sm:w-auto sm:justify-end"
        >
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: "0.92rem",
            }}
          >
            Powered by
          </p>
          <a
            href="https://preplegacy.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img
              src="/images/branding/preplegacy-logo.png"
              alt="Prep Legacy"
              style={{
                height: "34px",
                width: "auto",
                display: "block",
              }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
