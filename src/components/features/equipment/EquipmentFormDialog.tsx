'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateEquipment, useUpdateEquipment } from '@/hooks/useTelemetry';
import { Equipment } from '@/lib/api/telemetry';
import { X } from 'lucide-react';

interface EquipmentFormDialogProps {
  initialData?: Equipment;
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentFormDialog({ initialData, isOpen, onClose }: EquipmentFormDialogProps) {
  const t = useTranslations('Equipment.modal');
  const tCommon = useTranslations('Common');
  const isEditing = !!initialData;
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();

  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: initialData?.name || '',
    equipment_type: initialData?.equipment_type || '',
    mac_address: initialData?.mac_address || '',
    location_notes: initialData?.location_notes || '',
    is_active: initialData?.is_active ?? true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: formData },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: onClose });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{isEditing ? t('editTitle') : t('createTitle')}</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">{t('nameLabel')}</label>
            <input
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Inverter-A Substation 2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">{t('typeLabel')}</label>
              <select
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.equipment_type}
                onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
              >
                <option value="" disabled>Select category...</option>
                <option value="INVERTER">Solar Inverter</option>
                <option value="MOTOR">Motor/Pump</option>
                <option value="SERVER">Server Room</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">MAC Address</label>
              <input
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="00:1B:44:11:3A:B7"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">{t('locationLabel')}</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Physical location details..."
              value={formData.location_notes}
              onChange={(e) => setFormData({ ...formData, location_notes: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 pb-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('statusLabel')} (Active Mode)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {isPending ? t('savingBtn') : t('saveBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
