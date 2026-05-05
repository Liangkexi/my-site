export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--sep)",
        padding: "20px 24px",
        marginTop: 80,
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13.2, color: "var(--fg-sub)" }}>
          © {new Date().getFullYear()} Liang
        </span>
      </div>
    </footer>
  );
}
