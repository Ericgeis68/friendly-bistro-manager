import React from "react";
import {
  LayoutDashboard,
  Settings,
  Menu,
  Coffee,
  Utensils,
  ChevronRight,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  currentScreenLocal: string;
  setCurrentScreenLocal: (screen: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogoutAdmin: () => void;
  onLogout: () => void;
}

const sidebarItems = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  { id: "menu", label: "Menus", icon: <Coffee className="h-5 w-5" /> },
  { id: "cooking", label: "Cuisson", icon: <Utensils className="h-5 w-5" /> },
  { id: "settings", label: "Paramètres", icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar({ className, isCollapsed, setIsCollapsed, currentScreenLocal, setCurrentScreenLocal, sidebarOpen, setSidebarOpen, handleLogoutAdmin, onLogout, ...props }: SidebarProps) {
  const location = useLocation();
  const isSmallScreen = window.innerWidth < 1024;

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-white/50 backdrop-blur-lg h-full w-64 fixed top-0 left-0 z-20",
        isCollapsed ? "w-[5rem]" : "w-64",
        !sidebarOpen && isSmallScreen ? "hidden" : "",
        className
      )}
      {...props}
    >
      <div className="flex-1 flex flex-col gap-2 p-2">
        <Button
          variant="ghost"
          className="justify-start px-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-5 w-5 mr-2" />
          {!isCollapsed && "Réduire"}
        </Button>
        {sidebarItems.map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip delayDuration={50}>
              <li
                key={item.id}
                className="list-none"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start px-2",
                    location.pathname === `/${item.id}`
                      ? "bg-secondary"
                      : "transparent hover:bg-secondary",
                    isCollapsed ? "pl-6" : "pl-2"
                  )}
                  onClick={() => setCurrentScreenLocal(item.id)}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-2">{item.label}</span>}
                  {!isCollapsed && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </Button>
              </li>
              <TooltipTrigger asChild>
                <div></div>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      <Button variant="ghost" className="justify-start px-2 mb-2" onClick={handleLogoutAdmin}>
        <LogOut className="h-4 w-4 mr-2" />
        {!isCollapsed && "Déconnexion"}
      </Button>
    </div>
  );
}
