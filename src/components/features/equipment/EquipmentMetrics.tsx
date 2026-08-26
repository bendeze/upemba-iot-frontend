'use client';

import { useTranslations } from 'next-intl';
import { useEquipments, useHealthStatuses } from '@/hooks/useTelemetry';
import { Server, Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EquipmentMetrics() {
  const t = useTranslations('Equipment');
  const { data: equipments, isLoading } = useEquipments();
  const { data: healthStatuses } = useHealthStatuses();

  if (isLoading) {
    return <div className="h-24 w-full bg-muted/20 animate-pulse rounded-xl border border-border/40" />;
  }

  const total = equipments?.length || 0;
  const live = equipments?.filter(e => e.is_active).length || 0;

  // Calculate nodes currently warning/critical based on health
  const issues = equipments?.filter(e => {
    const status = healthStatuses?.results?.find(h => h.equipment === e.id)?.status;
    return status === 'WARNING' || status === 'CRITICAL';
  }).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-card/50 border-border/50 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('colName')}
          </CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-foreground">{total}</div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('active')}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-foreground">{live}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {total > 0 ? Math.round((live / total) * 100) : 0}% fleet availability
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('maintenance')}
          </CardTitle>
          <AlertTriangle className={`h-4 w-4 ${issues > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold font-mono ${issues > 0 ? 'text-amber-500' : 'text-foreground'}`}>{issues}</div>
          {issues > 0 && <p className="text-xs text-amber-500/80 mt-1">Requires attention</p>}
        </CardContent>
      </Card>
    </div>
  );
}
