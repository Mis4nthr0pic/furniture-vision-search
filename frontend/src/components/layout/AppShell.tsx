import { Link, useLocation } from "react-router-dom";
import { APP_VERSION, INDEX_LABEL } from "../../design/instrument";
import { cn } from "../../utils/format";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const links = [
    { to: "/", label: "Search" },
    { to: "/admin", label: "Admin" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-hair bg-bg">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tracking-[-0.03em] text-ink">
              instrument
            </span>
            <span className="font-mono text-[10px] text-ink-muted">
              @ v{APP_VERSION} · {INDEX_LABEL}
            </span>
          </Link>

          <nav className="flex items-center">
            {links.map((link, index) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "px-4 py-4 text-[13px] transition",
                    index > 0 && "border-l border-hair",
                    active
                      ? "instrument-tab-active font-medium text-ink"
                      : "text-ink-soft hover:text-ink",
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

      <footer className="border-t border-hair px-4 py-3 sm:px-6">
        <p className="mx-auto max-w-[1280px] font-mono text-[10px] text-ink-muted">
          catalog ~2.5k · hybrid retrieval · openrouter gpt-4o
        </p>
      </footer>
    </div>
  );
}
