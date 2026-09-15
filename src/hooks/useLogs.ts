import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLogs,
  createLog,
  updateLog,
  deleteLog,
  MaintenanceLog,
} from '@/lib/api/logs';
import { PaginatedResponse } from '@/lib/api/types';

export const POLLING_INTERVAL = 40 * 1000; // 40 seconds sync

export function useLogs(equipmentId?: string, startDate?: string, endDate?: string, page: number = 1) {
  return useQuery<PaginatedResponse<MaintenanceLog>>({
    queryKey: ['logs', equipmentId, startDate, endDate, page],
    queryFn: () => getLogs(equipmentId, startDate, endDate, page),
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs'] }),
  });
}

export function useUpdateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaintenanceLog> }) => updateLog(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs'] }),
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs'] }),
  });
}
