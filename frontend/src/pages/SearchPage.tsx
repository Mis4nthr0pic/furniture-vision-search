import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/instrument/PageHeader";
import { StatusDot } from "../components/instrument/StatusDot";
import { FeaturesPanel } from "../components/search/FeaturesPanel";
import { ImageDropzone } from "../components/search/ImageDropzone";
import { ResultsList } from "../components/search/ResultsList";
import { SearchLoadingPanel } from "../components/search/SearchLoadingPanel";
import { WarningsBanner } from "../components/search/WarningsBanner";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
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

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <PageHeader
        sectionId="§ 1"
        kicker="SEARCH"
        title={
          <>
            Rank <span className="font-emphasis italic text-accent">catalog</span> matches
          </>
        }
        meta={
          <>
            <StatusDot tone={hasApiKey ? "signal" : "warn"} label={hasApiKey ? "api_key" : "no_key"} />
            <span>·</span>
            <span>model gpt-4o → vision → embed → rank</span>
          </>
        }
      />

      {!hasApiKey && (
        <div className="mb-4">
          <Alert tone="warning" title="API key required">
          Set OpenRouter key in{" "}
          <Link to="/admin" className="text-accent underline-offset-2 hover:underline">
            Admin → Config
          </Link>
          . Memory only — cleared on refresh.
        </Alert>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader
              sectionId="§ 1.1 · INPUT"
              title="Index query"
              description="image/jpeg · optional prompt · hybrid k=30 n=10"
            />

            <ImageDropzone
              file={imageFile}
              previewUrl={previewUrl}
              onFileSelect={setImageFile}
              disabled={searchLoading}
            />

            <div className="mt-4 border-t border-hair pt-4">
              <Input
                label="Prompt constraint"
                value={userPrompt}
                onChange={(event) => setUserPrompt(event.target.value)}
                placeholder="walnut bookshelf · under $500"
                disabled={searchLoading}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-hair pt-4">
              <Button
                onClick={handleSearch}
                disabled={searchLoading || !imageFile || !hasApiKey}
                loading={searchLoading}
              >
                {searchLoading ? "Running…" : "Rank"}
              </Button>
              {timings && (
                <span className="font-mono text-[11px] tabular-nums text-ink-muted">
                  last run {timings.totalMs}ms
                </span>
              )}
            </div>
          </Card>

          {searchError && <Alert tone="error">{searchError}</Alert>}
          {searchLoading && (
            <SearchLoadingPanel enableRerank={retrievalConfig.enableRerank ?? true} />
          )}
          <WarningsBanner warnings={warnings} rerankError={rerankError} />

          {showEmptyResults && (
            <Alert tone="info" title="0 results">
              Refine prompt or lower filter confidence in Admin → Config.
            </Alert>
          )}

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

        <FeaturesPanel visionFeatures={visionFeatures} timings={timings} />
      </div>
    </div>
  );
}
