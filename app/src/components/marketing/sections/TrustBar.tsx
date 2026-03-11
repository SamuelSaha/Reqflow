/**
 * Trust Bar — Logo names of trusted companies
 * SSR, static content
 */

const logos = ['Doctolib', 'Qonto', 'Alan', 'Pennylane', 'Swile', 'Spendesk'];

export function TrustBar() {
  return (
    <section className="bg-white py-10 md:py-12 px-6 md:px-12 lg:px-20 flex flex-col items-center gap-6">
      <span className="text-caption font-semibold text-slate-400 tracking-[1.5px] uppercase text-center">
        Trusted by fast-moving teams
      </span>
      <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
        {logos.map((name) => (
          <span key={name} className="text-body-lg font-bold text-slate-300 select-none">
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
