import { useState, useEffect } from "react";
import { Bell, Sun, Moon, Settings, Search, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { factories, alerts, getFactoryInfo } from "@/data/mock-data";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface AppHeaderProps {
  selectedFactory: string;
  onFactoryChange: (factoryId: string) => void;
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
        </span>
        <span className="text-[10px] font-medium text-status-success uppercase tracking-wider">Live</span>
      </div>
      <span className="text-[13px] font-medium text-foreground tabular-nums">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>
    </div>
  );
}

export function AppHeader({ selectedFactory, onFactoryChange }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile, role, signOut } = useAuth();
  const pendingAlerts = alerts.filter(a => !a.acknowledged).length;
  const factoryInfo = getFactoryInfo(selectedFactory);
  const displayName = profile?.full_name || factoryInfo.user.name;
  const initials = displayName ? displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <motion.header
      className="h-16 border-b border-border bg-card flex items-center justify-between px-5 shrink-0"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <div className="hidden sm:flex flex-col justify-center min-w-0">
          <h1 className="text-[14px] font-semibold text-foreground leading-tight">
            {factoryInfo.name}
          </h1>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{factoryInfo.location}</p>
        </div>

        <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

        <Select value={selectedFactory} onValueChange={onFactoryChange}>
          <SelectTrigger className="w-[200px] h-9 text-[12px] border-border rounded-lg bg-background">
            <SelectValue placeholder="Select Factory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Factories</SelectItem>
            {factories.map(f => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1.5">
        <LiveClock />

        <div className="h-6 w-px bg-border mx-1.5 hidden md:block" />

        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-lg">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
          <Bell className="h-4 w-4" />
          {pendingAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          )}
        </Button>

        <div className="ml-2 flex items-center gap-2.5">
          <div className={`h-9 w-9 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-semibold`}>
            {user.initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-[12px] font-medium text-foreground leading-tight">{user.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Production Manager</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
