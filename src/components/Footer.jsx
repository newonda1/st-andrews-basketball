import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "80px",
        padding: "40px 20px",
        textAlign: "center",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* School Name */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#1f2937",
          marginBottom: "8px",
        }}
      >
        St. Andrew&apos;s Athletics
      </div>

      {/* Powered by section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        <span>Powered by</span>

        <a
          href="https://preplegacy.com"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            color: "#2563eb",
            fontWeight: "500",
          }}
        >
          <img
            src="/images/branding/preplegacy-logo.png"
            alt="PrepLegacy"
            style={{ height: "20px" }}
          />
          PrepLegacy
        </a>
      </div>
    </footer>
  );
}
