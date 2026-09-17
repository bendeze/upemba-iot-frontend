'use client';

import { useTranslations } from 'next-intl';
import { useEquipments } from '@/hooks/useTelemetry';
import { Filter, X } from 'lucide-react';

interface LogFiltersProps {
  selectedEquipment: string | undefined;
  setSelectedEquipment: (id: string | undefined) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export function LogFilters({
  selectedEquipment,
  setSelectedEquipment,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: LogFiltersProps) {
  const t = useTranslations('Logs');
  const tCommon = useTranslations('Common');
  const { data: equipments } = useEquipments();

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 border border-border/50 rounded-xl bg-card/50 shadow-sm backdrop-blur-sm">
      {/* Equipment Selector */}
      <div className="flex-1 space-y-1.5 min-w-[200px]">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
          {tCommon('targetNode')}
        </label>
        <select
          value={selectedEquipment || ""}
          onChange={(e) => setSelectedEquipment(e.target.value || undefined)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground hover:bg-muted/30 cursor-pointer"
        >
          <option value="">{t('filterNode')}</option>
          {equipments?.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} ({eq.mac_address})
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Selectors */}
      <div className="flex-1 space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
          {t('filterStart')}
        </label>
        <input
          type="date"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground hover:bg-muted/30"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="flex-1 space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
          {t('filterEnd')}
        </label>
        <input
          type="date"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-foreground hover:bg-muted/30"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Clear Filters Utility */}
      <div className="flex items-end">
         <button
            onClick={() => {
              setSelectedEquipment(undefined);
              setStartDate('');
              setEndDate('');
            }}
            disabled={!selectedEquipment && !startDate && !endDate}
            className="flex h-10 w-full md:w-auto items-center justify-center gap-2 rounded-md border border-input bg-background hover:bg-muted px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
         >
           <X className="w-4 h-4" />
           {t('resetFilters')}
         </button>
      </div>

    </div>
  );
}

