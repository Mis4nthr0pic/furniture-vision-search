import { useState } from "react";
import { Link } from "react-router-dom";
import { PainterlyBackdrop } from "../components/editorial/PainterlyBackdrop";
import { SectionHeader } from "../components/editorial/SectionHeader";
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
    <PainterlyBackdrop className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8 sm:py-14">
        <SectionHeader
          kickerNum="01"
          kicker="The recipe"
          title={
            <>
              Find the piece in{" "}
              <span className="text-terracotta not-italic">your photograph</span>
            </>
          }
          subtitle="Upload a room scene, whisper what you want, and browse ranked catalog matches with transparent scoring and rerank reasoning."
          aside="psst — start here"
          asideTilt={-6}
          className="mb-10 animate-fade-in"
        />

        {!hasApiKey && (
          <div className="mb-6">
            <Alert tone="info" title="Key required">
              Add your OpenRouter key in{" "}
              <Link to="/admin" className="text-terracotta underline underline-offset-4">
                back of house → config
              </Link>
              . Keys live in memory only.
            </Alert>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] xl:grid-cols-[1.15fr_0.95fr]">
          <div className="space-y-6">
            <Card padding="lg" className="animate-fade-in">
              <CardHeader
                kicker="✦ Upload"
                title="Offer a photograph"
                description="Drag a furniture photo or click to browse."
              />

              <ImageDropzone
                file={imageFile}
                previewUrl={previewUrl}
                onFileSelect={setImageFile}
                disabled={searchLoading}
              />

              <div className="mt-6">
                <Input
                  label="Optional refinement"
                  value={userPrompt}
                  onChange={(event) => setUserPrompt(event.target.value)}
                  placeholder="walnut bookshelf, under $500…"
                  disabled={searchLoading}
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={searchLoading || !imageFile || !hasApiKey}
                loading={searchLoading}
                className="mt-8 w-full sm:w-auto"
              >
                {searchLoading ? "Consulting the catalog…" : "Search the salon"}
              </Button>
            </Card>

            {searchError && <Alert tone="error">{searchError}</Alert>}
            {searchLoading && (
              <SearchLoadingPanel enableRerank={retrievalConfig.enableRerank ?? true} />
            )}
            <WarningsBanner warnings={warnings} rerankError={rerankError} />

            {showEmptyResults && (
              <Alert tone="info" title="No matches returned">
                Try a clearer photo, refine your prompt, or tune retrieval in back of house.
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
    </PainterlyBackdrop>
  );
}
