import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/Home";
import { IdeasPage } from "./pages/Ideas";
import { PricingPage } from "./pages/Pricing";
import { ReportsPage } from "./pages/Reports";
import { SettingsPage } from "./pages/Settings";
import { TrendsPage } from "./pages/Trends";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "ideas", element: <IdeasPage /> },
      { path: "trends", element: <TrendsPage /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
