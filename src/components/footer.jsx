export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "60px",
        padding: "30px 20px",
        textAlign: "center",
        color: "#64748b",
        fontSize: "14px",
      }}
    >
      <div>St. Andrew&apos;s Basketball</div>
      <div style={{ marginTop: "6px" }}>
        Powered by{" "}
        <a
          href="https://preplegacy.com"
          style={{ color: "#2563eb", textDecoration: "none" }}
        >
          PrepLegacy
        </a>
      </div>
    </footer>
  );
}
