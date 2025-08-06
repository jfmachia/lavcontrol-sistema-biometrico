import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Search,
  Filter,
  Bell,
  BellOff,
  Shield,
  Wifi,
  WifiOff
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AlertsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: alerts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest(`/api/alerts/${alertId}/resolve`, "PATCH", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao resolver",
        description: error.message || "Não foi possível resolver o alerta.",
        variant: "destructive",
      });
    }
  });

  const filteredAlerts = alerts?.filter((alert: any) => {
    const matchesSearch = alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.device?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "device_offline":
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case "security_breach":
        return <Shield className="w-5 h-5 text-red-600" />;
      case "system_error":
        return <XCircle className="w-5 h-5 text-orange-500" />;
      case "maintenance":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getAlertBadge = (type: string, status: string) => {
    if (status === "resolved") {
      return <Badge className="bg-green-500 text-white">Resolvido</Badge>;
    }

    switch (type) {
      case "device_offline":
        return <Badge variant="destructive">Dispositivo Offline</Badge>;
      case "security_breach":
        return <Badge className="bg-red-600 text-white">Violação de Segurança</Badge>;
      case "system_error":
        return <Badge variant="destructive">Erro do Sistema</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Manutenção</Badge>;
      default:
        return <Badge variant="secondary">Alerta</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  const activeAlerts = filteredAlerts.filter(alert => alert.status !== "resolved");
  const resolvedAlerts = filteredAlerts.filter(alert => alert.status === "resolved");

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas do Sistema</h1>
          <p className="text-muted-foreground">
            Monitore alertas e notificações em tempo real
          </p>
        </div>
        <Bell className="h-8 w-8 text-primary" />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{filteredAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Total de Alertas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Alertas Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Resolvidos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {activeAlerts.filter(a => a.priority === "high").length}
            </div>
            <div className="text-xs text-muted-foreground">Alta Prioridade</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar alertas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="device_offline">Dispositivo Offline</SelectItem>
                  <SelectItem value="security_breach">Violação de Segurança</SelectItem>
                  <SelectItem value="system_error">Erro do Sistema</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Nenhum alerta encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert: any) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${getPriorityColor(alert.priority)} ${
                    alert.status === "resolved" ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{alert.message || "Alerta do Sistema"}</h3>
                            {getAlertBadge(alert.type, alert.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {alert.device?.name && (
                              <span>Dispositivo: {alert.device.name} • </span>
                            )}
                            <span>
                              {format(new Date(alert.createdAt || Date.now()), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          {alert.description && (
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          )}
                        </div>
                      </div>

                      {alert.status !== "resolved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlertMutation.mutate(alert.id)}
                          disabled={resolveAlertMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}