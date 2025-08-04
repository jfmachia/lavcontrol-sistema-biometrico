import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, UserX, CheckCircle, XCircle } from "lucide-react";
import { AuthService } from "@/lib/auth";

interface AccessLog {
  id: number;
  action: string;
  method: string | null;
  timestamp: string;
  status: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  device?: {
    id: number;
    name: string;
    deviceId: string;
  };
}

export default function LogsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/access-logs"],
    queryFn: async () => {
      const response = await fetch("/api/access-logs", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch access logs");
      return response.json() as Promise<AccessLog[]>;
    },
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = !searchTerm || 
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.device?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.device?.deviceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDevice = deviceFilter === "all" || 
      log.device?.deviceId === deviceFilter;
    
    return matchesSearch && matchesDevice;
  }) || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return { variant: "default" as const, label: "Permitido", icon: CheckCircle };
      case "failed":
        return { variant: "destructive" as const, label: "Negado", icon: XCircle };
      default:
        return { variant: "outline" as const, label: "Desconhecido", icon: XCircle };
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "access_granted":
        return "Acesso concedido";
      case "access_denied":
        return "Acesso negado";
      case "device_command":
        return "Comando de dispositivo";
      default:
        return action;
    }
  };

  const getMethodLabel = (method: string | null) => {
    switch (method) {
      case "card":
        return "Cartão";
      case "facial_recognition":
        return "Reconhecimento facial";
      case "manual":
        return "Manual";
      default:
        return method || "N/A";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Logs de Acesso</h2>
        <p className="text-sm text-gray-600">Histórico detalhado de todos os acessos</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por usuário, dispositivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os dispositivos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os dispositivos</SelectItem>
                <SelectItem value="DEV-001">Portão Principal</SelectItem>
                <SelectItem value="DEV-002">Recepção</SelectItem>
                <SelectItem value="DEV-003">Garagem</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4 p-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum log encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Tente ajustar sua busca" : "Não há logs de acesso disponíveis"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispositivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => {
                    const statusConfig = getStatusConfig(log.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {new Date(log.timestamp).toLocaleDateString("pt-BR")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                              {log.user ? (
                                <User className="h-4 w-4 text-gray-600" />
                              ) : (
                                <UserX className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.user?.name || "Desconhecido"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {log.user?.id ? `USR-${log.user.id}` : "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {log.device?.name || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.device?.deviceId || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{getActionLabel(log.action)}</div>
                          <div className="text-xs text-gray-500">
                            {getMethodLabel(log.method)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={statusConfig.variant} className="inline-flex items-center">
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
