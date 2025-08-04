import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Info, X, Clock } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: number;
  type: string;
  title: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
  device?: {
    id: number;
    name: string;
    deviceId: string;
  };
}

const getAlertConfig = (type: string) => {
  switch (type) {
    case "device_offline":
      return { icon: AlertTriangle, color: "bg-red-50 border-red-200", iconColor: "text-red-500" };
    case "multiple_denies":
      return { icon: AlertTriangle, color: "bg-yellow-50 border-yellow-200", iconColor: "text-yellow-500" };
    case "maintenance":
      return { icon: Info, color: "bg-blue-50 border-blue-200", iconColor: "text-blue-500" };
    default:
      return { icon: Info, color: "bg-gray-50 border-gray-200", iconColor: "text-gray-500" };
  }
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const alertDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} minutos`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `há ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  }
};

export default function AlertsView() {
  const [openTime, setOpenTime] = useState("06:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
    queryFn: async () => {
      const response = await fetch("/api/alerts", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch alerts");
      return response.json() as Promise<Alert[]>;
    },
  });

  const resolveAlert = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
      });
      if (!response.ok) throw new Error("Failed to resolve alert");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao resolver alerta",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de alerta foram atualizadas",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Alertas e Configurações</h2>
        <p className="text-sm text-gray-600">Configure alertas e horários de funcionamento</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <div className="h-5 w-5 bg-gray-200 rounded mr-3 mt-0.5"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : alerts?.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum alerta ativo</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Todos os alertas foram resolvidos
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts?.map((alert) => {
                  const config = getAlertConfig(alert.type);
                  const Icon = config.icon;
                  
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start p-4 rounded-lg border ${config.color}`}
                    >
                      <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${config.iconColor}`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-600 mt-2 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeAgo(alert.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlert.mutate(alert.id)}
                        disabled={resolveAlert.isPending}
                        className="ml-3 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Alerta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="alert-offline" defaultChecked />
                  <Label htmlFor="alert-offline" className="text-sm">
                    Dispositivo offline por mais de 5 minutos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="alert-denies" defaultChecked />
                  <Label htmlFor="alert-denies" className="text-sm">
                    Múltiplas tentativas de acesso negadas
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="alert-schedule" />
                  <Label htmlFor="alert-schedule" className="text-sm">
                    Acesso fora do horário permitido
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="alert-user" defaultChecked />
                  <Label htmlFor="alert-user" className="text-sm">
                    Novo usuário cadastrado
                  </Label>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Horários de Funcionamento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="open-time" className="text-xs font-medium text-gray-700">
                      Abertura
                    </Label>
                    <Input
                      id="open-time"
                      type="time"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="close-time" className="text-xs font-medium text-gray-700">
                      Fechamento
                    </Label>
                    <Input
                      id="close-time"
                      type="time"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
