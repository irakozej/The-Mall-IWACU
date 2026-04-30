export default function MenuLoading() {
  return (
    <>
      <section className="bg-forest-deep text-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="h-3 w-40 bg-cream/10 rounded" />
          <div className="mt-4 h-12 sm:h-16 w-48 bg-cream/10 rounded" />
          <div className="mt-3 h-3 w-64 bg-cream/10 rounded" />
        </div>
        <div className="imigongo-strip" aria-hidden />
      </section>

      <div className="sticky top-16 sm:top-20 z-30 bg-cream/90 backdrop-blur border-b border-ink/8">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3 flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-20 bg-ink/10 rounded animate-pulse" />
          ))}
          <div className="ml-auto h-9 w-[200px] bg-ink/10 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 space-y-12">
        {[1, 2, 3].map((s) => (
          <div key={s}>
            <div className="h-3 w-16 bg-ink/10 rounded mb-3" />
            <div className="h-10 w-56 bg-ink/10 rounded mb-8 animate-pulse" />
            <ul className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="py-3 border-b border-ink/10 flex justify-between gap-3">
                  <div className="h-5 w-3/5 bg-ink/10 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-ink/10 rounded animate-pulse" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
