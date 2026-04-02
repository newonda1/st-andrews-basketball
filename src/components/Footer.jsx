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
      >
        <Link
          to="/athletics"
          style={{
            color: "#475569",
            fontSize: "0.92rem",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          St. Andrew&apos;s Athletics
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
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
