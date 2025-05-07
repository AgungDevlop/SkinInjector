import * as React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { RouterProvider, createBrowserRouter} from "react-router-dom";
import Home from "./pages/Home";
import PanelAdmin from "./pages/PanelAdmin";
import ErrorBoundary from "./components/ErrorBoundary";

const ErrorFallback = (
  <div className="text-center text-red-500 p-4">
    <h1 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h1>
    <p>Maaf, terjadi kesalahan yang tidak terduga.</p>
    <button
      className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      onClick={() => window.location.reload()}
    >
      Muat Ulang Halaman
    </button>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/SkinInjector/", 
    element: <App />,
    errorElement: ErrorFallback,
    children: [
      {
        index: true,
        element: <Home />,
        errorElement: ErrorFallback, 
      },
      {
        path: "admin",
        element: <PanelAdmin />,
        errorElement: ErrorFallback,
      },
    ],
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary fallback={ErrorFallback}>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
