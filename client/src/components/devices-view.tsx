import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Cpu, Unlock, Lock, RotateCcw } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Device {
  id: number;
  name: string;
  deviceId: string;
  location: string;
  status: string;
  lastPing: string | null;
  createdAt: string;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "online":
      return { variant: "default" as const, label: "Online", color: "bg-green-500" };
    case "offline":
      return { variant: "destructive" as const, label: "Offline", color: "bg-red-500" };
    case "maintenance":
      return { variant: "secondary" as const, label: "Manutenção", color: "bg-yellow-500" };
    default:
      return { variant: "outline" as const, label: "Desconhecido", color: "bg-gray-500" };
  }
};

export default function DevicesView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices, isLoading } = useQuery({
    queryKey: ["/api/devices"],
    queryFn: async () => {
      const response = await fetch("/api/devices", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch devices");
      return response.json() as Promise<Device[]>;
    },
  });

  const sendCommand = useMutation({
    mutationFn: async ({ deviceId, command }: { deviceId: string; command: string }) => {
      const response = await fetch(`/api/devices/${deviceId}/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeaders(),
        },
        body: JSON.stringify({ command }),
      });
      if (!response.ok) throw new Error("Failed to send command");
      return response.json();
    },
    onSuccess: (_, { command, deviceId }) => {
      toast({
        title: "Comando enviado",
        description: `Comando "${command}" enviado para dispositivo ${deviceId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao enviar comando",
        variant: "destructive",
      });
    },
  });

  const handleCommand = (deviceId: string, command: string) => {
    sendCommand.mutate({ deviceId, command });
  };

  const handleAddDevice = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Adicionar dispositivo será implementado em breve",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Dispositivos</h2>
          <p className="text-sm text-gray-600">Monitore e controle dispositivos de acesso</p>
        </div>
        <Button onClick={handleAddDevice}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Dispositivo
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                      <div className="ml-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : devices?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Cpu className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dispositivo encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece adicionando um novo dispositivo ao sistema
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices?.map((device) => {
            const statusConfig = getStatusConfig(device.status);
            const isOnline = device.status === "online";
            
            return (
              <Card key={device.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`h-12 w-12 ${isOnline ? 'bg-primary/10' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                        <Cpu className={`text-xl h-6 w-6 ${isOnline ? 'text-primary' : 'text-red-600'}`} />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{device.name}</h3>
                        <p className="text-sm text-gray-500">{device.deviceId}</p>
                      </div>
                    </div>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                        {isOnline ? "Operacional" : "Sem conexão"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Último ping:</span>
                      <span className="text-sm text-gray-900">
                        {device.lastPing 
                          ? new Date(device.lastPing).toLocaleString("pt-BR")
                          : "Nunca"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Localização:</span>
                      <span className="text-sm text-gray-900">{device.location || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleCommand(device.deviceId, "unlock")}
                      disabled={!isOnline || sendCommand.isPending}
                    >
                      <Unlock className="mr-1 h-3 w-3" />
                      Liberar
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleCommand(device.deviceId, "lock")}
                      disabled={!isOnline || sendCommand.isPending}
                    >
                      <Lock className="mr-1 h-3 w-3" />
                      Bloquear
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => handleCommand(device.deviceId, "reset")}
                      disabled={sendCommand.isPending}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
