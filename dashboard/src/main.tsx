import { lazy, StrictMode, Suspense } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import "./index.css";

const HomePage = lazy(() => import("./pages/Home").then((module) => ({ default: module.HomePage })));
const ReportsPage = lazy(() => import("./pages/Reports").then((module) => ({ default: module.ReportsPage })));
const IdeasPage = lazy(() => import("./pages/Ideas").then((module) => ({ default: module.IdeasPage })));
const TrendsPage = lazy(() => import("./pages/Trends").then((module) => ({ default: module.TrendsPage })));
const PricingPage = lazy(() => import("./pages/Pricing").then((module) => ({ default: module.PricingPage })));
const SettingsPage = lazy(() => import("./pages/Settings").then((module) => ({ default: module.SettingsPage })));

function PageLoader({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300">
            Loading Scout intelligence...
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <PageLoader><HomePage /></PageLoader> },
      { path: "reports", element: <PageLoader><ReportsPage /></PageLoader> },
      { path: "ideas", element: <PageLoader><IdeasPage /></PageLoader> },
      { path: "trends", element: <PageLoader><TrendsPage /></PageLoader> },
      { path: "pricing", element: <PageLoader><PricingPage /></PageLoader> },
      { path: "settings", element: <PageLoader><SettingsPage /></PageLoader> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
