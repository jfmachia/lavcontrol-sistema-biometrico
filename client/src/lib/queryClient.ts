import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { N8N_CONFIG } from "./config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Função para construir URL completa para n8n
function buildN8nUrl(endpoint: string): string {
  // Se já é uma URL completa, usar como está
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Se começa com /api/, remover e usar endpoint diretamente
  if (endpoint.startsWith('/api/')) {
    const cleanEndpoint = endpoint.replace('/api/', '/');
    return `${N8N_CONFIG.baseUrl}${cleanEndpoint}`;
  }
  
  // Caso contrário, anexar ao baseUrl
  return `${N8N_CONFIG.baseUrl}${endpoint}`;
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Construir URL para n8n
  const n8nUrl = buildN8nUrl(url);
  
  console.log(`🔗 API Request: ${method} ${n8nUrl}`);

  const res = await fetch(n8nUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    mode: 'cors', // Importante para CORS com n8n
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Construir URL para n8n
    const endpoint = queryKey.join("/") as string;
    const n8nUrl = buildN8nUrl(endpoint);
    
    console.log(`🔍 Query: GET ${n8nUrl}`);

    const res = await fetch(n8nUrl, {
      headers,
      mode: 'cors', // Importante para CORS com n8n
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
