'use client';

import { useMemo } from 'react';
import { useHealthStatuses, useTelemetryWebSocket } from '@/hooks/useTelemetry';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { HealthStatus } from '@/lib/api/telemetry';

export function GlobalHealthLeds() {
  const { data: statuses, isLoading, isError } = useHealthStatuses();
  // Maintain global WebSocket stream for instant ML health updates & alerts
  useTelemetryWebSocket({ isGlobal: true, enabled: true });

  if (isLoading || isError) {
    return <div className="flex h-5 items-center justify-center animate-pulse space-x-2">
      <div className="w-3 h-3 rounded-full bg-muted"></div>
      <div className="w-3 h-3 rounded-full bg-muted"></div>
      <div className="w-3 h-3 rounded-full bg-muted"></div>
    </div>;
  }

  // Extract only the absolute latest status per unique equipment in O(N) time
  const latestStatuses = useMemo(() => {
    if (!statuses?.results) return [];
    
    // Using a Map prevents the O(N^2) performance freeze that happens with '.some()' inside a loop
    const equipmentMap = new Map<string, HealthStatus>();
    for (const status of statuses.results) {
      if (!equipmentMap.has(status.equipment)) {
        equipmentMap.set(status.equipment, status);
      }
    }
    return Array.from(equipmentMap.values());
  }, [statuses?.results]);

  const hasCritical = latestStatuses.some((s) => s.status === 'CRITICAL');
  const hasWarning = latestStatuses.some((s) => s.status === 'WARNING');
  const isAllGood = !hasCritical && !hasWarning && latestStatuses.length > 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 rounded-full border border-border/40 bg-background/50 shadow-sm backdrop-blur-sm">
      <div className="hidden md:block text-[10px] font-bold tracking-widest text-muted-foreground mr-1">STATUS</div>
      
      {/* GREEN LED */}
      <div className={cn(
        "flex shrink-0 items-center justify-center w-5 h-5 rounded-full transition-all duration-500",
        isAllGood ? "bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted"
      )}>
        <div className={cn("w-2.5 h-2.5 rounded-full", isAllGood ? "bg-green-500" : "bg-neutral-600")} />
      </div>

      {/* YELLOW LED */}
      <div className={cn(
        "flex shrink-0 items-center justify-center w-5 h-5 rounded-full transition-all duration-500",
        hasWarning && !hasCritical ? "bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.6)]" : "bg-muted"
      )}>
        <div className={cn("w-2.5 h-2.5 rounded-full", hasWarning && !hasCritical ? "bg-yellow-500" : "bg-neutral-600")} />
      </div>

      {/* RED LED */}
      <div className={cn(
        "flex shrink-0 items-center justify-center w-5 h-5 rounded-full transition-all duration-500",
        hasCritical ? "bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.6)]" : "bg-muted"
      )}>
        <div className={cn("w-2.5 h-2.5 rounded-full", hasCritical ? "bg-red-500" : "bg-neutral-600")} />
      </div>
    </div>
  );
}
