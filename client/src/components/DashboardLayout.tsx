import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, Activity, AlertCircle, Settings } from "lucide-react";
import { CSSProperties, useState } from "react";
import { useLocation } from "wouter";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Activity, label: "Targets", path: "/targets" },
  { icon: AlertCircle, label: "Incidents", path: "/incidents" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + delta));
      setSidebarWidth(newWidth);
      localStorage.setItem(SIDEBAR_WIDTH_KEY, newWidth.toString());
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <Sidebar className="border-r">
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              alt={APP_TITLE}
              className="h-8 w-8 rounded object-cover"
            />
            <h1 className="font-bold text-lg">{APP_TITLE}</h1>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={location === item.path}
                  onClick={() => navigate(item.path)}
                  className="cursor-pointer"
                >
                  <a href={item.path}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4 gap-2">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground">
            Public Monitoring Dashboard
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>

      <div
        onMouseDown={handleMouseDown}
        className="absolute left-[var(--sidebar-width)] top-0 h-full w-1 cursor-col-resize hover:bg-primary/20 transition-colors"
        style={{ left: `${sidebarWidth}px` }}
      />
    </SidebarProvider>
  );
}
