import { apiClient } from '../axios';
import { PaginatedResponse } from './types';

export interface MaintenanceLog {
  id: number;
  equipment: string;
  author: number | null;
  author_name: string;
  description: string;
  action_taken: string;
  timestamp: string;
}

export const getLogs = async (
  equipmentId?: string, 
  startDate?: string, 
  endDate?: string,
  page: number = 1
): Promise<PaginatedResponse<MaintenanceLog>> => {
  const params: Record<string, any> = { page };
  if (equipmentId) params.equipment = equipmentId;
  if (startDate) params.start_date = startDate;
  if (endDate) {
    if (endDate.length === 10) {
      params.end_date = `${endDate}T23:59:59.999Z`;
    } else {
      params.end_date = endDate;
    }
  }

  const response = await apiClient.get<PaginatedResponse<MaintenanceLog>>('/maintenance-logs/', { params });
  return response.data;
};

export const createLog = async (data: Partial<MaintenanceLog>): Promise<MaintenanceLog> => {
  const response = await apiClient.post<MaintenanceLog>('/maintenance-logs/', data);
  return response.data;
};

export const updateLog = async (id: number, data: Partial<MaintenanceLog>): Promise<MaintenanceLog> => {
  const response = await apiClient.patch<MaintenanceLog>(`/maintenance-logs/${id}/`, data);
  return response.data;
};

export const deleteLog = async (id: number): Promise<void> => {
  await apiClient.delete(`/maintenance-logs/${id}/`);
};

