import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Search, 
  Filter,
  Clock,
  User,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export function AccessControl() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");

  const { data: accessLogs, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/access-logs"],
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  });

  const { data: devices } = useQuery<any[]>({
    queryKey: ["/api/devices"],
  });

  const sendCommandMutation = useMutation({
    mutationFn: ({ deviceId, command }: { deviceId: string; command: string }) =>
      apiRequest("/api/devices/command", "POST", { deviceId, command }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/access-logs"] });
    }
  });

  const filteredLogs = accessLogs?.filter((log: any) => {
    const matchesSearch = log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "success" && log.success) ||
                         (statusFilter === "denied" && !log.success);
    const matchesDevice = deviceFilter === "all" || log.device_id?.toString() === deviceFilter;
    
    return matchesSearch && matchesStatus && matchesDevice;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "denied": return <XCircle className="w-4 h-4 text-red-400" />;
      case "error": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500/20 text-green-400 border-green-400/30";
      case "denied": return "bg-red-500/20 text-red-400 border-red-400/30";
      case "error": return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-400/30";
    }
  };

  const getAlertBadge = (alertLevel: string) => {
    switch (alertLevel) {
      case "amarelo":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Alerta
          </Badge>
        );
      case "vip":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
            <Star className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        );
      default:
        return null;
    }
  };

  const openDoor = (deviceId: string) => {
    sendCommandMutation.mutate({ deviceId, command: "OPEN_DOOR" });
  };

  const lockDoor = (deviceId: string) => {
    sendCommandMutation.mutate({ deviceId, command: "LOCK_DOOR" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Controle de Acesso</h1>
          <p className="text-slate-400">Monitore e gerencie todos os acessos do sistema em tempo real.</p>
        </div>
        <Button onClick={() => refetch()} className="lavcontrol-button-primary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Quick Device Controls */}
      <Card className="lavcontrol-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            Controle Rápido de Dispositivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices?.map((device: any) => (
              <div key={device.id} className="lavcontrol-card p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{device.name}</h3>
                    <p className="text-sm text-slate-400">{device.deviceId}</p>
                  </div>
                  <Badge className={device.status === "online" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                    {device.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => openDoor(device.deviceId)}
                    disabled={device.status !== "online" || sendCommandMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Abrir
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => lockDoor(device.deviceId)}
                    disabled={device.status !== "online" || sendCommandMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Travar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="lavcontrol-card border-0">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por usuário ou dispositivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="denied">Negado</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Dispositivo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">Todos os Dispositivos</SelectItem>
                {devices?.map((device: any) => (
                  <SelectItem key={device.id} value={device.id.toString()}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Access Logs */}
      <Card className="lavcontrol-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Logs de Acesso em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-600 rounded mb-2"></div>
                      <div className="h-3 bg-slate-600 rounded"></div>
                    </div>
                    <div className="w-20 h-6 bg-slate-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredLogs?.map((log: any) => (
                <div key={log.id} className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        {getStatusIcon(log.success ? "success" : "denied")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">
                            {log.client_name || log.user_name || "Sistema"}
                          </h3>
                          {log.access_type === "vip" && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                              <Star className="w-3 h-3 mr-1" />
                              VIP
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.method || "facial"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            Device {log.device_id} - Loja {log.store_id}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {log.created_at && !isNaN(new Date(log.created_at).getTime()) ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : 'Data inválida'}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-sm text-slate-300 mt-1">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={`border ${getStatusColor(log.success ? "success" : "denied")}`}>
                      {getStatusIcon(log.success ? "success" : "denied")}
                      <span className="ml-1 capitalize">{log.success ? "Permitido" : "Negado"}</span>
                    </Badge>
                  </div>
                </div>
              ))}
              
              {filteredLogs?.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum log de acesso encontrado.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}