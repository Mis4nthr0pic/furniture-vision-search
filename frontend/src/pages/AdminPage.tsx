import { useState } from "react";
import { CatalogMetaTab } from "../components/admin/CatalogMetaTab";
import { ConfigTab } from "../components/admin/ConfigTab";
import { LiveEvalTab } from "../components/admin/LiveEvalTab";
import { StaticEvalTab } from "../components/admin/StaticEvalTab";
import { TabNav, type AdminTab } from "../components/admin/TabNav";

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("config");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-6 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">
          Admin workspace
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Configure, evaluate, and inspect the pipeline
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
          API keys and retrieval settings apply to the Search page immediately. Keys stay in memory
          only and clear on refresh.
        </p>
      </section>

      <div className="mb-6">
        <TabNav active={tab} onChange={setTab} />
      </div>

      {tab === "config" && <ConfigTab />}
      {tab === "static-eval" && <StaticEvalTab />}
      {tab === "live-eval" && <LiveEvalTab />}
      {tab === "catalog" && <CatalogMetaTab />}
    </div>
  );
}
