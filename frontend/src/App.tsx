import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AdminPage } from "./pages/AdminPage";
import { SearchPage } from "./pages/SearchPage";

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
