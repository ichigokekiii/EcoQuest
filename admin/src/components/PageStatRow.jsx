export default function PageStatRow({ children }) {
  return (
    <section className="stats-grid" aria-label="Summary metrics">
      {children}
    </section>
  );
}
