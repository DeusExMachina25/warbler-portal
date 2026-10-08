// Placeholder used by pages that later build steps will fill in.
export function ComingSoon({ title, step, children }: { title: string; step: number; children?: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">Arrives in build step {step}.</p>
      {children}
    </section>
  );
}
