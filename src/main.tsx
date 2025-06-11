import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import PanelAdmin from "./pages/PanelAdmin";
import ViewSkin from "./pages/ViewSkin";
import PanelBattleEffect from "./pages/PanelBattleEffect";
import ViewRecall from "./pages/ViewRecall";
import ViewSpawn from "./pages/ViewSpawn";
import ViewBattleEmote from "./pages/ViewBattleEmote";
import ViewElimination from "./pages/ViewElimination";
import SkinManipulate from "./pages/SkinManipulate";
import ManageBattleEffect from "./pages/ManageBattleEffect";
import ViewHero from "./pages/ViewHero";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeContext";

const ErrorFallback = (
  <div className="text-center text-red-500 p-4">
    <h1 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h1>
    <p>Maaf, terjadi kesalahan yang tidak terduga.</p>
    <button
      className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      onClick={() => window.location.reload()}
    >
      Muat Ulang Halaman
    </button>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: ErrorFallback,
    children: [
      {
        index: true,
        element: <Home />,
        errorElement: ErrorFallback,
      },
      {
        path: "PanelUpload",
        element: <PanelAdmin />,
        errorElement: ErrorFallback,
      },
      {
        path: "PanelBattleEffect",
        element: <PanelBattleEffect />,
        errorElement: ErrorFallback,
      },
      {
        path: "SkinManipulate",
        element: <SkinManipulate />,
        errorElement: ErrorFallback,
      },
      {
        path: "ManageBattleEffect",
        element: <ManageBattleEffect />,
        errorElement: ErrorFallback,
      },
      {
        path: "unlock-skin",
        element: <ViewSkin />,
        errorElement: ErrorFallback,
      },
      {
        path: "recall-animation",
        element: <ViewRecall />,
        errorElement: ErrorFallback,
      },
      {
        path: "spawn-effect",
        element: <ViewSpawn />,
        errorElement: ErrorFallback,
      },
      {
        path: "battle-emote",
        element: <ViewBattleEmote />,
        errorElement: ErrorFallback,
      },
      {
        path: "elimination-effect",
        element: <ViewElimination />,
        errorElement: ErrorFallback,
      },
      {
        path: "view-hero",
        element: <ViewHero />,
        errorElement: ErrorFallback,
      },
    ],
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary fallback={ErrorFallback}>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);