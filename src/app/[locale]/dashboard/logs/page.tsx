'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MaintenanceNeeded } from '@/components/features/logs/MaintenanceNeeded';
import { LogFilters } from '@/components/features/logs/LogFilters';
import { LogsTable } from '@/components/features/logs/LogsTable';

export default function MaintenanceLogsPage() {
  const t = useTranslations('Logs');
  const [selectedEquipment, setSelectedEquipment] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

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

      <LogsTable 
        equipmentId={selectedEquipment} 
        startDate={startDate} 
        endDate={endDate} 
      />
    </div>
  );
}
