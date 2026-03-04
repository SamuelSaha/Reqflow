/**
 * Hero Background - CSS-only animated gradient
 * Pure CSS for performance (no JS needed)
 */

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-mkt-deep via-mkt-slate-900 to-mkt-deep" />

      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            animationDelay: '0s',
            animationDuration: '20s'
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            animationDelay: '2s',
            animationDuration: '18s'
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] rounded-full blur-3xl animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
            animationDelay: '4s',
            animationDuration: '22s'
          }}
        />
      </div>

      {/* Grid overlay for geometric feel */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />
    </div>
  );
}
