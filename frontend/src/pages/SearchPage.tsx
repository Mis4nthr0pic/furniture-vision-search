import { useEffect, useState } from "react";
import { rateResult, searchProducts } from "../api/client";
import { FeaturesPanel } from "../components/FeaturesPanel";
import { ImageDropzone } from "../components/ImageDropzone";
import { ResultCard } from "../components/ResultCard";
import { WarningsBanner } from "../components/WarningsBanner";
import { getLlmConfigForRequest, useStore } from "../store";

export function SearchPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState("");

  const apiKey = useStore((state) => state.apiKey);
  const setApiKey = useStore((state) => state.setApiKey);
  const retrievalConfig = useStore((state) => state.retrievalConfig);
  const llmConfig = useStore((state) => state.llmConfig);
  const searchLoading = useStore((state) => state.searchLoading);
  const searchError = useStore((state) => state.searchError);
  const lastSearchId = useStore((state) => state.lastSearchId);
  const visionFeatures = useStore((state) => state.visionFeatures);
  const ranked = useStore((state) => state.ranked);
  const warnings = useStore((state) => state.warnings);
  const rerankError = useStore((state) => state.rerankError);
  const timings = useStore((state) => state.timings);
  const ratings = useStore((state) => state.ratings);
  const setSearchLoading = useStore((state) => state.setSearchLoading);
  const setSearchError = useStore((state) => state.setSearchError);
  const applySearchResult = useStore((state) => state.applySearchResult);
  const setRating = useStore((state) => state.setRating);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  async function handleSearch() {
    if (!imageFile) {
      setSearchError("Please choose an image first.");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const result = await searchProducts({
        image: imageFile,
        userPrompt,
        llmConfig: getLlmConfigForRequest({ apiKey, llmConfig }),
        retrievalConfig,
      });
      applySearchResult(result);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleRate(productId: string, relevant: boolean) {
    if (!lastSearchId) return;
    setRating(productId, relevant);
    try {
      await rateResult({ searchId: lastSearchId, productId, relevant });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Failed to save rating");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Furniture Vision Search</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Upload a furniture photo, optionally refine with text, and get ranked catalog matches with
          reasoning.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-medium text-slate-700">
              OpenRouter API key
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-or-v1-… (memory only, not saved to disk)"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Stored in memory for this session only — not saved to disk.
            </p>
          </section>

          <ImageDropzone file={imageFile} previewUrl={previewUrl} onFileSelect={setImageFile} />

          <section className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Optional prompt
              <input
                type="text"
                value={userPrompt}
                onChange={(event) => setUserPrompt(event.target.value)}
                placeholder="e.g. walnut bookshelf with open shelves"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
              />
            </label>

            <button
              type="button"
              onClick={handleSearch}
              disabled={searchLoading || !imageFile}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searchLoading ? "Searching… (may take 10–30s, longer on first embed build)" : "Search catalog"}
            </button>
          </section>

          {searchError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {searchError}
            </div>
          )}

          <WarningsBanner warnings={warnings} rerankError={rerankError} />

          {ranked.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Results</h2>
              {ranked.map((product, index) => (
                <ResultCard
                  key={product.id}
                  rank={index + 1}
                  product={product}
                  rating={ratings[product.id]}
                  disabled={!lastSearchId || searchLoading}
                  onRate={(relevant) => handleRate(product.id, relevant)}
                />
              ))}
            </section>
          )}
        </div>

        <FeaturesPanel visionFeatures={visionFeatures} timings={timings} />
      </div>
    </div>
  );
}
