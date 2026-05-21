import { useState } from "react";
import { Link } from "react-router-dom";
import { StatusDot } from "../components/instrument/StatusDot";
import { ImageDropzone } from "../components/search/ImageDropzone";
import { ReferenceCard } from "../components/search/ReferenceCard";
import { ResultsList } from "../components/search/ResultsList";
import { SearchLoadingPanel } from "../components/search/SearchLoadingPanel";
import { WarningsBanner } from "../components/search/WarningsBanner";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { useHasApiKey } from "../hooks/useAdminConfig";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { useSearchActions, useSearchState } from "../hooks/useSearch";

export function SearchPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const previewUrl = useObjectUrl(imageFile);
  const hasApiKey = useHasApiKey();

  const {
    searchLoading,
    searchError,
    lastSearchId,
    visionFeatures,
    ranked,
    warnings,
    rerankError,
    timings,
    ratings,
    retrievalConfig,
  } = useSearchState();

  const { runSearch, rateProduct } = useSearchActions();

  async function handleSearch() {
    if (!imageFile) return;
    await runSearch(imageFile, userPrompt);
  }

  const showEmptyResults = !searchLoading && lastSearchId && ranked.length === 0;
  const stats = [
    { label: "mode", value: retrievalConfig.mode ?? "hybrid" },
    { label: "K", value: String(retrievalConfig.k ?? 30) },
    { label: "N", value: String(retrievalConfig.n ?? 10) },
    {
      label: "τ",
      value: (retrievalConfig.confidenceThreshold ?? 0.7).toFixed(2),
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-7">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h1 className="editorial-title max-w-3xl">
          Photo in, <span className="editorial-italic">catalog</span> out.
        </h1>
        <StatusDot tone={hasApiKey ? "signal" : "warn"} label={hasApiKey ? "api_key" : "no_key"} />
      </header>

      {!hasApiKey && (
        <div className="mb-6">
          <Alert tone="warning" title="API key required">
            Set OpenRouter key in{" "}
            <Link to="/admin" className="text-accent underline-offset-2 hover:underline">
              Admin → Config
            </Link>
            . Memory only — cleared on refresh.
          </Alert>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="instrument-panel flex flex-col">
          <div className="p-3">
            <ImageDropzone
              file={imageFile}
              previewUrl={previewUrl}
              onFileSelect={setImageFile}
              disabled={searchLoading}
            />
          </div>

          <div className="border-t border-hair px-3 py-3">
            <input
              id="prompt-constraint"
              type="text"
              value={userPrompt}
              onChange={(event) => setUserPrompt(event.target.value)}
              placeholder="add a prompt (optional)"
              disabled={searchLoading}
              className="instrument-input-underline text-[14px] placeholder:text-ink-muted/60"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tabular-nums text-ink-muted">
              {stats.map((stat) => (
                <span key={stat.label} className="flex items-baseline gap-1">
                  <span>{stat.label}</span>
                  <span className="text-ink">{stat.value}</span>
                </span>
              ))}
              {timings && <span>· {timings.totalMs}ms</span>}
            </div>

            <Button
              onClick={handleSearch}
              disabled={searchLoading || !imageFile || !hasApiKey}
              loading={searchLoading}
            >
              {searchLoading ? "Running…" : "Search"}
            </Button>
          </div>
        </div>

        <ReferenceCard
          previewUrl={previewUrl}
          fileName={imageFile?.name}
          visionFeatures={visionFeatures}
        />
      </section>

      {searchError && (
        <div className="mt-5">
          <Alert tone="error">{searchError}</Alert>
        </div>
      )}
      {searchLoading && (
        <div className="mt-5">
          <SearchLoadingPanel enableRerank={retrievalConfig.enableRerank ?? true} />
        </div>
      )}

      <div className="mt-5">
        <WarningsBanner warnings={warnings} rerankError={rerankError} />
      </div>

      {showEmptyResults && (
        <div className="mt-5">
          <Alert tone="info" title="0 results">
            Refine prompt or lower filter confidence in Admin → Config.
          </Alert>
        </div>
      )}

      {ranked.length > 0 && (
        <div className="mt-7">
          <ResultsList
            ranked={ranked}
            ratings={ratings}
            lastSearchId={lastSearchId}
            searchLoading={searchLoading}
            onRate={(productId, relevant) => {
              if (!lastSearchId) return;
              void rateProduct(lastSearchId, productId, relevant);
            }}
          />
        </div>
      )}
    </div>
  );
}
