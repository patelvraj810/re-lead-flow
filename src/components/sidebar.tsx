"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  CalendarDays,
  Sparkles,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch },
  { label: "Nurture", href: "/nurture", icon: Sparkles },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "bg-[#0a0b0e] border-r border-[#1a1c22]",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-[#1a1c22]">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 shrink-0">
          <Building2 className="w-[18px] h-[18px] text-[#c9a84c]" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="text-[17px] font-bold tracking-tight leading-none">
              Re<span className="text-gold-gradient">Flow</span>
            </h1>
            <p className="text-[9px] text-[#4a4e5a] uppercase tracking-[0.25em] mt-0.5 font-medium">
              Lead Pipeline
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3a3e4a] px-2 mb-2">
            Workspace
          </p>
        )}
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/15"
                  : "text-[#5a5e6a] hover:text-[#a0a4b0] hover:bg-[#14161a]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#c9a84c] rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  "w-[16px] h-[16px] shrink-0 transition-colors",
                  isActive ? "text-[#c9a84c]" : "text-[#3a3e4a] group-hover:text-[#5a5e6a]"
                )}
              />
              {!collapsed && (
                <span className="animate-fade-in truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-[#1a1c22]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center gap-2 px-2.5 py-2 w-full rounded-lg text-[#3a3e4a] hover:text-[#5a5e6a] hover:bg-[#14161a] transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}