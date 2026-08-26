'use client';

import { useTranslations } from 'next-intl';
import { useEquipments } from '@/hooks/useTelemetry';
import { useEffect } from 'react';

interface EquipmentSelectorProps {
  value: number | undefined;
  onChange: (value: number) => void;
}

export function EquipmentSelector({ value, onChange }: EquipmentSelectorProps) {
  const t = useTranslations('Common');
  const { data: equipments, isLoading, isError, error } = useEquipments();

  useEffect(() => {
    if (equipments && equipments.length > 0 && !value) {
      onChange(equipments[0].id);
    }
  }, [equipments, value, onChange]);

  if (isLoading) {
    return <div className="h-10 w-[200px] bg-muted animate-pulse rounded-md" />;
  }
  
  if (isError) {
    return (
      <div className="h-10 w-[200px] flex items-center px-3 text-xs text-red-500 border border-red-500/50 bg-red-500/10 rounded-md">
         ERR: {error?.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[200px]">
      <label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {t('targetNode')}
      </label>
      <select
        value={value?.toString() || ""}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="h-10 px-3 py-2 w-full rounded-md border border-border/50 bg-background/50 text-foreground transition-colors focus:ring-2 focus:ring-primary outline-none cursor-pointer text-xs"
      >
        <option value="" disabled>{t('selectEquipment')}</option>
        {equipments?.map((eq) => (
           <option key={eq.id} value={eq.id.toString()}>
             {eq.name || `Equipment #${eq.id}`}
           </option>
        ))}
      </select>
    </div>
  );
}
