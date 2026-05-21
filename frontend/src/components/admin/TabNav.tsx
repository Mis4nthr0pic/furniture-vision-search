import { cn } from "../../utils/format";

export type AdminTab = "config" | "static-eval" | "live-eval" | "catalog";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "config", label: "Config" },
  { id: "static-eval", label: "Static Eval" },
  { id: "live-eval", label: "Live Eval" },
  { id: "catalog", label: "Catalog Meta" },
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
      className="flex flex-wrap gap-1 rounded-xl bg-white/80 p-1 ring-1 ring-surface-border"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`admin-tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          aria-controls={tabPanelId(tab.id)}
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-3.5 py-2 text-sm font-medium transition",
            active === tab.id
              ? "bg-brand-800 text-white shadow-sm"
              : "text-stone-600 hover:bg-brand-50 hover:text-stone-900",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
