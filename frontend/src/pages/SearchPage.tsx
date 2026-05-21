import { useState } from "react";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { useSearchActions, useSearchState } from "../hooks/useSearch";
import { FeaturesPanel } from "../components/search/FeaturesPanel";
import { ImageDropzone } from "../components/search/ImageDropzone";
import { ResultsList } from "../components/search/ResultsList";
import { SearchLoadingPanel } from "../components/search/SearchLoadingPanel";
import { WarningsBanner } from "../components/search/WarningsBanner";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function SearchPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const previewUrl = useObjectUrl(imageFile);

  const {
    apiKey,
    setApiKey,
    searchLoading,
    searchError,
    lastSearchId,
    visionFeatures,
    ranked,
    warnings,
    rerankError,
    timings,
    ratings,
  } = useSearchState();

  const { runSearch, rateProduct } = useSearchActions();

  async function handleSearch() {
    if (!imageFile) return;
    await runSearch(imageFile, userPrompt);
  }

  const showEmptyResults = !searchLoading && lastSearchId && ranked.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-8 max-w-3xl animate-fade-in">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">
          Image-based product search
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          Find furniture that fits your photo
        </h1>
        <p className="mt-3 text-balance text-base leading-relaxed text-stone-600 sm:text-lg">
          Upload a room photo, optionally describe what you want, and explore ranked catalog matches
          with transparent scoring and rerank reasoning.
        </p>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Connection"
              description="Your OpenRouter key stays in memory for this tab only."
            />
            <Input
              label="OpenRouter API key"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-or-v1-…"
              hint="Never written to disk or localStorage."
              autoComplete="off"
            />
          </Card>

          <Card padding="lg" className="space-y-5">
            <CardHeader
              title="Upload & search"
              description="Drag a furniture photo or click to browse."
            />

            <ImageDropzone
              file={imageFile}
              previewUrl={previewUrl}
              onFileSelect={setImageFile}
              disabled={searchLoading}
            />

            <Input
              label="Optional prompt"
              value={userPrompt}
              onChange={(event) => setUserPrompt(event.target.value)}
              placeholder="e.g. walnut bookshelf with open shelves"
              disabled={searchLoading}
            />

            <Button
              onClick={handleSearch}
              disabled={searchLoading || !imageFile}
              loading={searchLoading}
              className="w-full sm:w-auto"
            >
              {searchLoading ? "Searching catalog…" : "Search catalog"}
            </Button>
          </Card>

          {searchError && <Alert tone="error">{searchError}</Alert>}
          {searchLoading && <SearchLoadingPanel />}
          <WarningsBanner warnings={warnings} rerankError={rerankError} />

          {showEmptyResults && (
            <Alert tone="info" title="No matches returned">
              Try a clearer photo, adjust your prompt, or tune retrieval settings in Admin.
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
