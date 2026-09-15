'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTelemetryWebSocket } from '@/hooks/useTelemetry';
import { EquipmentSelector } from './EquipmentSelector';
import { StatusBadge } from './StatusBadge';
import { TelemetryCharts } from './TelemetryCharts';
import { ReadingsTable } from './ReadingsTable';
import { Radio } from 'lucide-react';

export function TelemetryDashboard() {
  const t = useTranslations('Telemetry');
  const [selectedEquipment, setSelectedEquipment] = useState<string | undefined>();

  // Subscribe to real-time equipment telemetry stream
  const { isConnected } = useTelemetryWebSocket({
    equipmentId: selectedEquipment,
    enabled: !!selectedEquipment,
  });

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/10">
         <div className="flex items-center gap-3">
            <EquipmentSelector 
              value={selectedEquipment} 
              onChange={setSelectedEquipment} 
            />
            {selectedEquipment && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-semibold border transition-colors duration-300 bg-background/60">
                <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                <span className={isConnected ? 'text-emerald-400' : 'text-muted-foreground'}>
                  {isConnected ? t('liveWs') : t('syncing')}
                </span>
              </div>
            )}
         </div>
         <div className="hidden sm:block flex-1" />
         {selectedEquipment && (
            <StatusBadge equipmentId={selectedEquipment} />
         )}
      </div>

      {/* Main Content Area */}
      {selectedEquipment ? (
        <div className="flex flex-col gap-8">
          <TelemetryCharts equipmentId={selectedEquipment} />
          <ReadingsTable equipmentId={selectedEquipment} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 mt-8 rounded-2xl border-2 border-dashed border-border/50 bg-muted/5 min-h-[400px]">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/20">
             <div className="w-4 h-4 bg-primary/50 rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-pulse" />
          </div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center max-w-md">
            {t('selectPrompt')}
          </p>
        </div>
      )}

    </div>
  );
}
