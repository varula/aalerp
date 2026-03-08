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
    <header className="h-20 border-b border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />

        {/* Brand Column */}
        <div className="hidden sm:flex flex-col justify-center min-w-0">
          <h1 className="text-lg font-bold text-foreground leading-tight tracking-tight">
            {factoryInfo.name}
          </h1>
          <p className="text-[11px] text-muted-foreground leading-tight truncate mt-0.5">{factoryInfo.location}</p>
          <p className="text-[10px] font-semibold leading-tight text-primary mt-0.5 tracking-wide uppercase">Integrated Production Management</p>
        </div>

        <div className="h-10 w-px bg-border/50 mx-1 hidden sm:block" />

        <Select value={selectedFactory} onValueChange={onFactoryChange}>
          <SelectTrigger className="w-[200px] h-10 text-sm border-border/40 rounded-xl bg-background/60 backdrop-blur-sm">
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

      <div className="flex items-center gap-2.5">
        <LiveClock />

        <div className="h-7 w-px bg-border/40 mx-1.5 hidden md:block" />

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10 rounded-xl hover:bg-accent/80 transition-all">
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-accent/80 transition-all">
          <Settings className="h-[18px] w-[18px]" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-accent/80 transition-all">
          <Bell className="h-[18px] w-[18px]" />
          {pendingAlerts > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
          )}
        </Button>

        {/* User Avatar */}
        <div className="ml-3 flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${user.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
            {user.initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Production Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
