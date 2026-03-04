import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content" role="main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
