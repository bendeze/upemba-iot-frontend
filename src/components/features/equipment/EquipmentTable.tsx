'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useEquipments, useHealthStatuses, useDeleteEquipment } from '@/hooks/useTelemetry';
import { Link } from '@/i18n/routing';
import { EquipmentFormDialog } from './EquipmentFormDialog';
import { Equipment } from '@/lib/api/telemetry';
import { Search, Plus, Edit2, ArrowUpRight, Trash2 } from 'lucide-react';

export function EquipmentTable() {
  const t = useTranslations('Equipment');
  const tCommon = useTranslations('Common');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>(undefined);

  // Debounce search input to avoid spamming the backend
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: equipments, isLoading } = useEquipments(debouncedSearch);
  const { data: healthStatuses } = useHealthStatuses();
  const deleteMutation = useDeleteEquipment();

  const handleOpenCreate = () => {
    setEditingEquipment(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this hardware node? This action destroys all associated historical telemetry data!")) {
      deleteMutation.mutate(id);
    }
  };

  const renderHealthBadge = (equipmentId: string) => {
    const status = healthStatuses?.results?.find(h => h.equipment === equipmentId)?.status;
    
    if (status === 'NORMAL') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{tCommon('normal')}</span>;
    }
    if (status === 'WARNING') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">{tCommon('warning')}</span>;
    }
    if (status === 'CRITICAL') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">{tCommon('critical')}</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50">UNKNOWN</span>;
  };

  return (
    <div className="flex flex-col border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border/50 bg-muted/20 gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center shadow-sm w-full sm:w-auto rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('registerBtn')}
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/10 sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-4 sm:px-6 py-4 font-bold tracking-wider">{t('colStatus')}</th>
              <th className="px-4 sm:px-6 py-4 font-bold tracking-wider">{t('colName')}</th>
              <th className="hidden lg:table-cell px-6 py-4 font-bold tracking-wider">{t('colType')}</th>
              <th className="hidden md:table-cell px-6 py-4 font-bold tracking-wider">MAC / IP</th>
              <th className="hidden sm:table-cell px-6 py-4 font-bold tracking-wider text-center">{t('active')}</th>
              <th className="px-4 sm:px-6 py-4 font-bold tracking-wider text-right">{t('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                 <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                 </td>
              </tr>
            ) : equipments?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  {t('noEquipment')}
                </td>
              </tr>
            ) : (
              equipments?.map((eq) => (
                <tr key={eq.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors group">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {renderHealthBadge(eq.id)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 font-medium text-foreground text-sm sm:text-base">
                    {eq.name}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 text-muted-foreground text-sm">
                    {eq.equipment_type}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 font-mono text-xs text-muted-foreground">
                    <span className="bg-muted/20 rounded px-2 py-1">{eq.mac_address}</span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-center">
                    {eq.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {t('active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50">
                        {t('inactive')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(eq)}
                        title={t('edit')}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <Link 
                        href={`/dashboard?node=${eq.id}`}
                        title="View Live Telemetry" 
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>

                      <button 
                        onClick={() => handleDelete(eq.id)}
                        title={t('delete')}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <EquipmentFormDialog 
          isOpen={formOpen} 
          onClose={() => setFormOpen(false)} 
          initialData={editingEquipment} 
        />
      )}
    </div>
  );
}
