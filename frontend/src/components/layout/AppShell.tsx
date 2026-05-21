import { Link, useLocation } from "react-router-dom";
import { WavyUnderline } from "../editorial/WavyUnderline";
import { cn } from "../../utils/format";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const links = [
    { to: "/", label: "The salon", editorial: "search" },
    { to: "/admin", label: "Back of house", editorial: "admin" },
  ];

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 border-b border-cream/8 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-terracotta/40 bg-burgundy font-display text-lg italic text-terracotta">
              Sd
            </span>
            <div>
              <p className="font-display text-lg italic tracking-tight text-cream">Salon de l&apos;objet</p>
              <p className="font-mono text-[9px] uppercase tracking-kicker text-cream/45">
                catalog vision search
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "relative flex flex-col items-center gap-1 font-serif text-sm italic transition",
                    active ? "text-terracotta" : "text-cream/65 hover:text-cream",
                  )}
                >
                  {link.label}
                  {active && <WavyUnderline />}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-cream/8 px-4 py-8 sm:px-8">
        <p className="mx-auto max-w-[1200px] font-mono text-[10px] uppercase tracking-kicker text-cream/35">
          ✦ Furniture vision · ~2,500 pieces · hybrid retrieval
        </p>
      </footer>
    </div>
  );
}
