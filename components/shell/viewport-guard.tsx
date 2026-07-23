import Image from "next/image";

export function ViewportGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto min-h-dvh w-full max-w-[1024px] bg-white min-[1025px]:hidden">
        {children}
      </main>
      <main className="hidden h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#fff1f4_0%,#ffffff_42%,#f5f3ff_100%)] px-12 min-[1025px]:flex">
        <section className="grid max-w-6xl grid-cols-[1fr_0.9fr] items-center gap-16">
          <div>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-primary/10 bg-white/80 px-4 py-2 shadow-soft backdrop-blur">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                M
              </span>
              <span className="text-sm font-semibold text-ink">Milo</span>
            </div>
            <h1 className="max-w-xl text-balance text-5xl font-bold leading-[1.08] tracking-[-0.045em] text-ink">
              This application is available only on Mobile &amp; Tablet.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
              Milo is designed around touch, gestures, and a native mobile
              rhythm. Open it on a device up to 1024px wide for the full
              experience.
            </p>
            <div className="mt-9 flex gap-3">
              <span className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-soft">
                320px — 1024px
              </span>
              <span className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-soft">
                PWA ready
              </span>
            </div>
          </div>
          <Image
            src="/images/mobile-only-illustration.webp"
            alt="Two phones connecting through Milo"
            width={780}
            height={520}
            priority
            className="h-auto w-full drop-shadow-2xl"
          />
        </section>
      </main>
    </>
  );
}
