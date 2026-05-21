import { cn } from "../../utils/format";
import { WavyUnderline } from "../editorial/WavyUnderline";

export type AdminTab = "config" | "static-eval" | "live-eval" | "catalog";

const tabs: Array<{ id: AdminTab; label: string; num: string }> = [
  { id: "config", label: "The recipe", num: "I" },
  { id: "static-eval", label: "The dossier", num: "II" },
  { id: "live-eval", label: "Tasting notes", num: "III" },
  { id: "catalog", label: "The inventory", num: "IV" },
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
      className="flex flex-wrap gap-x-6 gap-y-3 border-b border-cream/10 pb-4"
    >
      {tabs.map((tab) => {
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
              "relative flex flex-col items-start gap-1 transition",
              isActive ? "text-terracotta" : "text-cream/55 hover:text-cream",
            )}
          >
            <span className="font-mono text-[9px] uppercase tracking-kicker">No. {tab.num}</span>
            <span className="font-serif text-sm italic">{tab.label}</span>
            {isActive && <WavyUnderline className="mt-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
