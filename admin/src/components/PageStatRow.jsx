export default function PageStatRow({ children }) {
  return (
    <section
      className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Summary metrics"
    >
      {children}
    </section>
  );
}
