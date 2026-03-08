import { useState, useEffect } from "react";
import { Bell, Sun, Moon, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { factories, alerts, getFactoryInfo } from "@/data/mock-data";
import { useTheme } from "@/hooks/use-theme";
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
      <span className="text-sm font-medium text-foreground tabular-nums">
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
    <motion.header
      className="h-16 border-b border-border/60 bg-card/80 backdrop-blur-xl flex items-center justify-between px-5 shrink-0"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <div className="hidden sm:flex flex-col justify-center min-w-0">
          <h1 className="text-[15px] font-semibold text-foreground leading-tight tracking-tight">
            {factoryInfo.name}
          </h1>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{factoryInfo.location}</p>
        </div>

        <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

        <Select value={selectedFactory} onValueChange={onFactoryChange}>
          <SelectTrigger className="w-[200px] h-9 text-[13px] border-border/50 rounded-xl bg-background/60 backdrop-blur-sm">
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

        <div className="h-6 w-px bg-border/40 mx-1 hidden md:block" />

        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }}>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-xl">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
            <Settings className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.15 }}>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
            <Bell className="h-4 w-4" />
            {pendingAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            )}
          </Button>
        </motion.div>

        <motion.div
          className="ml-2 flex items-center gap-2.5"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`h-9 w-9 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-semibold`}>
            {user.initials}
          </div>
          <div className="hidden lg:block">
            <p className="text-[13px] font-medium text-foreground leading-tight">{user.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Production Manager</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
