import { useState, useEffect } from "react";
import { Bell, Search, Sun, Moon, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { factories, alerts, getFactoryInfo, FACTORY_USERS } from "@/data/mock-data";
import { useTheme } from "@/hooks/use-theme";

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
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
      </div>
      <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>
    </div>
  );
}

export function AppHeader({ selectedFactory, onFactoryChange }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const pendingAlerts = alerts.filter(a => !a.acknowledged).length;
  const factoryInfo = getFactoryInfo(selectedFactory);
  const user = factoryInfo.user;

  return (
    <header className="h-16 border-b bg-card/80 glass flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        {/* Brand Column */}
        <div className="hidden sm:flex flex-col justify-center min-w-0">
          <h1 className="text-[15.5px] font-semibold text-foreground leading-tight" style={{ letterSpacing: "-0.03em" }}>
            {factoryInfo.name}
          </h1>
          <p className="text-[10px] text-muted-foreground leading-tight truncate">{factoryInfo.location}</p>
          <p className="text-[10px] font-semibold leading-tight text-blue-600 dark:text-blue-400">Integrated Production Management System</p>
        </div>

        <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

        <Select value={selectedFactory} onValueChange={onFactoryChange}>
          <SelectTrigger className="w-[180px] h-9 text-sm border-border/60">
            <SelectValue placeholder="Select Factory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Factories</SelectItem>
            {factories.map(f => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <LiveClock />

        <div className="h-6 w-px bg-border mx-1 hidden md:block" />

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-lg">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
          <Bell className="h-4 w-4" />
          {pendingAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>

        {/* User Avatar — changes per factory */}
        <div className="ml-2 flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-bold`}>
            {user.initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-foreground leading-tight">{user.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{factoryInfo.location}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
