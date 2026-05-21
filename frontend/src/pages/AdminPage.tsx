import { useState } from "react";
import { CatalogMetaTab } from "../components/admin/CatalogMetaTab";
import { ConfigTab } from "../components/admin/ConfigTab";
import { LiveEvalTab } from "../components/admin/LiveEvalTab";
import { StaticEvalTab } from "../components/admin/StaticEvalTab";
import { type AdminTab, TabNav, tabPanelId } from "../components/admin/TabNav";
import { PageHeader } from "../components/instrument/PageHeader";
import { StatusDot } from "../components/instrument/StatusDot";

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("config");

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <PageHeader
        sectionId="§ 4"
        kicker="ADMIN"
        title={
          <>
            Configure <span className="font-emphasis italic text-accent">pipeline</span>
          </>
        }
        meta={<StatusDot tone="signal" label="runtime_config" />}
      />

      <TabNav active={tab} onChange={setTab} />

      <div className="mt-4" role="tabpanel" id={tabPanelId(tab)} aria-labelledby={`admin-tab-${tab}`}>
        {tab === "config" && <ConfigTab />}
        {tab === "static-eval" && <StaticEvalTab />}
        {tab === "live-eval" && <LiveEvalTab />}
        {tab === "catalog" && <CatalogMetaTab />}
      </div>
    </div>
  );
}
