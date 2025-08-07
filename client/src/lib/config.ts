// Configuração para APIs do n8n

interface N8nConfig {
  baseUrl: string;
  endpoints: {
    auth: {
      login: string;
      register: string;
      user: string;
    };
    users: string;
    stores: string;
    devices: string;
    clients: string;
    accessLogs: string;
    alerts: string;
    dashboard: {
      stats: string;
      trafficChart: string;
      waveChart: string;
    };
    commands: {
      device: string;
    };
  };
  websocketUrl?: string;
}

// URLs do n8n - CONFIGURAR AQUI AS SUAS URLs
const N8N_CONFIG: N8nConfig = {
  baseUrl: import.meta.env.VITE_N8N_BASE_URL || 'https://seu-n8n.com/webhook',
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register', 
      user: '/auth/user'
    },
    users: '/users',
    stores: '/stores',
    devices: '/devices',
    clients: '/clients',
    accessLogs: '/access-logs',
    alerts: '/alerts',
    dashboard: {
      stats: '/dashboard/stats',
      trafficChart: '/dashboard/traffic-chart',
      waveChart: '/dashboard/wave-chart'
    },
    commands: {
      device: '/device/command'
    }
  },
  websocketUrl: import.meta.env.VITE_N8N_WS_URL
};

export { N8N_CONFIG };
export type { N8nConfig };