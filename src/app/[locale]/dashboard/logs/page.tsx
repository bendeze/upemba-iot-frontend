'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MaintenanceNeeded } from '@/components/features/logs/MaintenanceNeeded';
import { LogFilters } from '@/components/features/logs/LogFilters';
import { LogsTable } from '@/components/features/logs/LogsTable';
import { RawTelemetryLogsTable } from '@/components/features/logs/RawTelemetryLogsTable';
import { Activity, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

function LogsPageContent() {
  const t = useTranslations('Logs');
  const searchParams = useSearchParams();
  
  const initialEquipment = searchParams.get('equipment') || undefined;
  const initialTab = searchParams.get('tab') === 'telemetry' ? 'telemetry' : 'health';

  const [activeTab, setActiveTab] = useState<'health' | 'telemetry'>(initialTab);
  const [selectedEquipment, setSelectedEquipment] = useState<string | undefined>(initialEquipment);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    const eq = searchParams.get('equipment');
    if (eq) {
      setSelectedEquipment(eq);
    }
    const tabParam = searchParams.get('tab');
    if (tabParam === 'telemetry' || tabParam === 'health') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('pageTitle')}
          </h1>
          <p className="text-muted-foreground mt-1 tracking-wide text-sm">
            {t('pageDesc')}
          </p>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center p-1 bg-muted/60 border border-border/50 rounded-xl">
          <button
            onClick={() => setActiveTab('health')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
              activeTab === 'health'
                ? "bg-background text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span>{t('tabHealth')}</span>
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
              activeTab === 'telemetry'
                ? "bg-background text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('tabTelemetry')}</span>
          </button>
        </div>
      </div>

      <MaintenanceNeeded />

      <LogFilters 
        selectedEquipment={selectedEquipment}
        setSelectedEquipment={setSelectedEquipment}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {activeTab === 'health' ? (
        <LogsTable 
          equipmentId={selectedEquipment} 
          startDate={startDate} 
          endDate={endDate} 
        />
      ) : (
        <RawTelemetryLogsTable 
          equipmentId={selectedEquipment} 
          startDate={startDate} 
          endDate={endDate} 
        />
      )}
    </div>
  );
}

export default function MaintenanceLogsPage() {
  return (
    <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse text-muted-foreground text-sm">Loading logs...</div>}>
      <LogsPageContent />
    </Suspense>
  );
}

