import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  Bookmark,
  Home,
  Lightbulb,
  Settings,
  Sparkles,
  Tags,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/ideas", label: "Saved Ideas", icon: Lightbulb },
  { href: "/trends", label: "Trend Analysis", icon: Sparkles },
  { href: "/pricing", label: "Pricing", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-radial-premium text-zinc-100">
      <aside className="fixed left-4 top-4 z-20 hidden h-[calc(100vh-2rem)] w-72 rounded-[2rem] border border-white/10 bg-black/35 p-4 backdrop-blur-2xl lg:block">
        <Logo />
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-400 transition",
                  isActive
                    ? "bg-white/10 text-white shadow-blue-glow"
                    : "hover:bg-white/5 hover:text-white",
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Bookmark size={16} />
            Pro Scout
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-400">
            Unlimited scans, exports, competitor gaps, and AI roadmap generation.
          </p>
          <Button className="mt-4 w-full py-2 text-xs">Upgrade</Button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo compact />
      </header>

      <main className="px-4 py-6 lg:ml-80 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
