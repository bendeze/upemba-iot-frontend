import { getTranslations } from 'next-intl/server';
import { EquipmentMetrics } from '@/components/features/equipment/EquipmentMetrics';
import { EquipmentTable } from '@/components/features/equipment/EquipmentTable';

export default async function EquipmentDashboardPage() {
  const t = await getTranslations('Equipment');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('pageTitle')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('pageDesc')}
          </p>
        </div>
      </div>

      <EquipmentMetrics />
      <EquipmentTable />
    </div>
  );
}
