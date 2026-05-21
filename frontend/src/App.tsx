import { Link, Route, Routes } from "react-router-dom";
import { SearchPage } from "./pages/SearchPage";

function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-800">Admin</h1>
      <p className="mt-4 text-slate-600">
        Configuration, eval, and catalog tools — coming in the admin tab.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <nav className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-6xl gap-6">
          <Link to="/" className="font-medium text-slate-700 hover:text-slate-900">
            Search
          </Link>
          <Link to="/admin" className="font-medium text-slate-700 hover:text-slate-900">
            Admin
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}
