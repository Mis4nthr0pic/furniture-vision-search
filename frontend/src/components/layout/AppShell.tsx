import { Link, useLocation } from "react-router-dom";
import { APP_NAME, APP_VERSION, INDEX_LABEL } from "../../design/instrument";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/format";
import { BackendStatusBanner } from "./BackendStatusBanner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { theme, toggle } = useTheme();

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
              {APP_NAME}
            </span>
            <span className="font-mono text-[10px] text-ink-muted">
              @ v{APP_VERSION} · {INDEX_LABEL}
            </span>
          </Link>

          <div className="flex items-center">
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              className="mr-2 flex h-8 w-8 items-center justify-center border border-hair text-ink-soft transition hover:border-hairStrong hover:text-ink"
              style={{ borderRadius: 4 }}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>

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
        </div>
      </header>

      <BackendStatusBanner />

      <main>{children}</main>

      <footer className="border-t border-hair px-4 py-3 sm:px-6">
        <p className="mx-auto max-w-[1280px] font-mono text-[10px] text-ink-muted">
          catalog ~2.5k · hybrid retrieval · openrouter gpt-4o
        </p>
      </footer>
    </div>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
