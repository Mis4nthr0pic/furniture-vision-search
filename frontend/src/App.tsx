import { Link, Route, Routes } from "react-router-dom";

function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight text-slate-800">
        Furniture Vision Search
      </h1>
      <p className="mt-4 max-w-md text-center text-slate-600">
        Upload a furniture image to find matching catalog products.
      </p>
    </div>
  );
}

function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-slate-800">Admin</h1>
      <p className="mt-4 text-slate-600">Configuration and evaluation tools.</p>
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
