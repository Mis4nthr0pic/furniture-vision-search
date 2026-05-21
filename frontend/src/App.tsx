import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { SearchPage } from "./pages/SearchPage";
import { Card, CardHeader } from "./components/ui/Card";

function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader
          title="Admin workspace"
          description="Configuration, evaluation, and catalog tools will live here — config tabs, reindex progress, static eval, and live metrics."
        />
        <p className="text-sm text-stone-600">
          For now, set your API key on the Search page. The admin experience is the next frontend
          step.
        </p>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AppShell>
  );
}
