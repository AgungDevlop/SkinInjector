import * as React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { RouterProvider, createBrowserRouter, useRouteError } from "react-router-dom";
import Home from "./pages/Home";
import PanelAdmin from "./pages/PanelAdmin";
import ErrorBoundary from "./components/ErrorBoundary";

// Komponen ErrorFallback yang menampilkan detail error
const ErrorFallback: React.FC<{ error?: Error; errorInfo?: React.ErrorInfo }> = ({ error, errorInfo }) => {
  // Jika digunakan dalam konteks routing, ambil error dari useRouteError
  const routeError = useRouteError() as Error | undefined;
  const displayError = error || routeError; // Gunakan error dari props atau routeError

  return (
    <div className="text-center text-red-500 p-4">
      <h1 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h1>
      <p className="mb-2">
        {displayError?.message || 'Maaf, terjadi kesalahan yang tidak terduga.'}
      </p>
      {displayError && (
        <div className="text-left bg-gray-100 p-4 rounded text-black mb-4 max-w-2xl mx-auto">
          <p className="font-bold">Detail Error:</p>
          <pre className="whitespace-pre-wrap">{displayError.toString()}</pre>
          {errorInfo && (
            <>
              <p className="font-bold mt-2">Stack Trace:</p>
              <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
            </>
          )}
        </div>
      )}
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={() => window.location.reload()}
      >
        Muat Ulang Halaman
      </button>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorFallback />,
    children: [
      {
        index: true,
        element: <Home />,
        errorElement: <ErrorFallback />,
      },
      {
        path: "admin",
        element: <PanelAdmin />,
        errorElement: <ErrorFallback />,
      },
    ],
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);