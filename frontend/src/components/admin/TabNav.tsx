import { cn } from "../../utils/format";

export type AdminTab = "config" | "static-eval" | "live-eval" | "catalog";

const tabs: Array<{ id: AdminTab; label: string; section: string }> = [
  { id: "config", label: "Config", section: "§ 4.1" },
  { id: "static-eval", label: "Evaluation", section: "§ 4.2" },
  { id: "live-eval", label: "Live metrics", section: "§ 4.3" },
  { id: "catalog", label: "Catalog", section: "§ 4.4" },
];

export function tabPanelId(tab: AdminTab): string {
  return `admin-tabpanel-${tab}`;
}

export function TabNav({
  active,
  onChange,
}: {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Admin sections"
      className="flex flex-wrap border-b border-hair"
    >
      {tabs.map((tab, index) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={tabPanelId(tab.id)}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-3 font-mono text-[11px] uppercase tracking-wide transition",
              index > 0 && "border-l border-hair",
              isActive
                ? "instrument-tab-active bg-panel font-medium text-ink"
                : "text-ink-muted hover:bg-panel hover:text-ink-soft",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
