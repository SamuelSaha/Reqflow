/**
 * Hero Background — Warm peach gradient
 * SSR, pure CSS
 */

export function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[var(--warm-50)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30" />
    </div>
  );
}
