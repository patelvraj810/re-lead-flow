"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  CalendarDays,
  PlusCircle,
  Settings,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Users,
  },
  {
    label: "Pipeline",
    href: "/pipeline",
    icon: GitBranch,
  },
  {
    label: "Nurture",
    href: "/nurture",
    icon: PlusCircle,
  },
  {
    label: "Schedule",
    href: "/schedule",
    icon: CalendarDays,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out",
        "bg-[#0c0c0e] border-r border-border",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-bold tracking-tight">
              Re<span className="text-gold-gradient">Flow</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Lead Pipeline
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-secondary/60 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all text-xs"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}