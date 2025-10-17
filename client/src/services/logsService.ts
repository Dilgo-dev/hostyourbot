import { logsApi } from './api';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface AdminLog {
  id: number;
  service_name: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface LogFilters {
  service_name?: string;
  level?: string;
  date?: string;
  limit?: number;
  offset?: number;
}

export interface GetLogsResponse {
  data: AdminLog[];
  total: number;
  limit: number;
  offset: number;
}

export const logsService = {
  async getLogs(filters: LogFilters = {}): Promise<GetLogsResponse> {
    const params = new URLSearchParams();

    if (filters.service_name) params.append('service_name', filters.service_name);
    if (filters.level) params.append('level', filters.level);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await logsApi.get<GetLogsResponse>(`/api/logs?${params.toString()}`);
    return response.data;
  },

  exportLogs(logs: AdminLog[]): void {
    const headers = ['ID', 'Date/Heure', 'Service', 'Niveau', 'Message'];
    const rows = logs.map(log => [
      log.id.toString(),
      new Date(log.created_at).toLocaleString('fr-FR'),
      log.service_name,
      log.level.toUpperCase(),
      `"${log.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
