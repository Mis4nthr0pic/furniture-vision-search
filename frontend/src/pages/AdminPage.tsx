import { useState } from "react";
import { CatalogMetaTab } from "../components/admin/CatalogMetaTab";
import { ConfigTab } from "../components/admin/ConfigTab";
import { LiveEvalTab } from "../components/admin/LiveEvalTab";
import { StaticEvalTab } from "../components/admin/StaticEvalTab";
import { type AdminTab, TabNav, tabPanelId } from "../components/admin/TabNav";
import { PainterlyBackdrop } from "../components/editorial/PainterlyBackdrop";
import { SectionHeader } from "../components/editorial/SectionHeader";

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("config");

  return (
    <PainterlyBackdrop className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8 sm:py-14">
        <SectionHeader
          kickerNum="04"
          kicker="Back of house"
          title={
            <>
              Configure the{" "}
              <span className="text-terracotta not-italic">pipeline</span>
            </>
          }
          subtitle="API keys and retrieval settings apply to the salon immediately. Keys stay in memory only and clear on refresh."
          aside="staff only"
          className="mb-8"
        />

        <div className="mb-8">
          <TabNav active={tab} onChange={setTab} />
        </div>

        <div role="tabpanel" id={tabPanelId(tab)} aria-labelledby={`admin-tab-${tab}`}>
          {tab === "config" && <ConfigTab />}
          {tab === "static-eval" && <StaticEvalTab />}
          {tab === "live-eval" && <LiveEvalTab />}
          {tab === "catalog" && <CatalogMetaTab />}
        </div>
      </div>
    </PainterlyBackdrop>
  );
}
