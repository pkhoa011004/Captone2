export function AdminPageCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
