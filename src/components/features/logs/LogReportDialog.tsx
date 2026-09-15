'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateLog, useUpdateLog } from '@/hooks/useLogs';
import { useEquipments } from '@/hooks/useTelemetry';
import { MaintenanceLog } from '@/lib/api/logs';
import { X, FileText } from 'lucide-react';

interface LogReportDialogProps {
  initialData?: MaintenanceLog;
  isOpen: boolean;
  onClose: () => void;
  defaultEquipmentId?: string; // Pre-selects equipment if we are filtering by one
  targetStatusId?: number; // The ML prediction ID to bind this log to
}

export function LogReportDialog({ initialData, isOpen, onClose, defaultEquipmentId, targetStatusId }: LogReportDialogProps) {
  const t = useTranslations('Logs.reportDialog');
  const tCommon = useTranslations('Common');
  const isReadOnly = !!initialData;
  const createMutation = useCreateLog();
  const updateMutation = useUpdateLog();
  const { data: equipments } = useEquipments();

  const [formData, setFormData] = useState<Partial<MaintenanceLog>>({
    equipment: initialData?.equipment || defaultEquipmentId || undefined,
    action_taken: initialData?.action_taken || '',
    description: initialData?.description || '',
  });

  // Reset form when opened with new data
  useEffect(() => {
    if (isOpen) {
      setFormData({
        equipment: initialData?.equipment || defaultEquipmentId || undefined,
        action_taken: initialData?.action_taken || '',
        description: initialData?.description || '',
      });
    }
  }, [isOpen, initialData, defaultEquipmentId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return onClose(); // Viewing mode, nothing to save.
    
    // Inject the sys_ref so the frontend table maps it forever
    const finalDescription = targetStatusId 
      ? formData.description + `\n\n\n[SYSTEM TAG DO NOT REMOVE: #sys_ref:${targetStatusId}]` 
      : formData.description;

    createMutation.mutate({ ...formData, description: finalDescription }, { onSuccess: onClose });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-3xl max-h-[90vh] border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-muted rounded-lg text-foreground border border-border/40">
                <FileText className="w-5 h-5 text-foreground" />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-foreground">
                 {isReadOnly ? t('viewTitle') : t('createTitle')}
               </h2>
               <p className="text-xs text-muted-foreground mt-0.5">
                 {isReadOnly && initialData 
                   ? `Author: ${initialData.author_name || 'System'} | Filed: ${new Date(initialData.timestamp).toLocaleString()}`
                   : t('desc')}
               </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {tCommon('selectEquipment')}
              </label>
              <select
                required
                disabled={isReadOnly}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-75 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.equipment || ""}
                onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              >
                <option value="" disabled>{tCommon('selectEquipment')}...</option>
                {equipments?.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.mac_address})
                  </option>
                ))}
            </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('descriptionLabel')}
              </label>
              <input
                required
                disabled={isReadOnly}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-75 disabled:cursor-not-allowed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. Replaced capacitor / inspection nominal"
                value={formData.action_taken}
                onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('descriptionLabel')}
            </label>
            <textarea
              required
              disabled={isReadOnly}
              className="flex-1 min-h-[250px] w-full rounded-md border border-input bg-background disabled:opacity-75 disabled:cursor-not-allowed px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 leading-relaxed resize-none"
              placeholder="Provide notes or breakdown of the maintenance operation..."
              value={formData.description?.replace(/\[SYSTEM TAG DO NOT REMOVE: #sys_ref:\d+\]/g, '')}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border/50 mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-5 py-2"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-sm disabled:opacity-50"
            >
              {isPending ? t('savingBtn') : isReadOnly ? t('closeBtn') : t('submitBtn')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
