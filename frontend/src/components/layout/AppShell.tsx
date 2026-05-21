import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/format";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const links = [
    { to: "/", label: "Search" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-surface-border/80 bg-brand-50/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800 font-display text-sm font-bold text-white shadow-sm">
              FV
            </span>
            <div>
              <p className="font-display text-base font-semibold leading-tight text-stone-900">
                Furniture Vision
              </p>
              <p className="text-xs text-stone-500">Catalog-aware image search</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 rounded-xl bg-white/70 p-1 ring-1 ring-surface-border">
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-brand-800 text-white shadow-sm"
                      : "text-stone-600 hover:bg-brand-50 hover:text-stone-900",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
