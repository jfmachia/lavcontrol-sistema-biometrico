import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthService } from "@/lib/auth";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";

interface AccessLog {
  id: number;
  userId: number;
  deviceId: number;
  action: string;
  method: string;
  status: string;
  timestamp: string;
  user?: {
    id: number;
    name: string;
    profileImage?: string;
  };
  device?: {
    id: number;
    name: string;
    deviceId: string;
  };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>;
    case "failed":
      return <Badge variant="destructive">Falha</Badge>;
    default:
      return <Badge variant="secondary">Pendente</Badge>;
  }
};

const getMethodBadge = (method: string) => {
  switch (method) {
    case "facial_recognition":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Reconhecimento Facial</Badge>;
    case "card":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Cartão</Badge>;
    case "manual":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Manual</Badge>;
    default:
      return <Badge variant="outline">{method}</Badge>;
  }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function Logs() {
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Logs de Acesso</h1>
        <p className="text-sm text-gray-600">Histórico completo de tentativas de acesso</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : logs?.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum log encontrado</h3>
              <p className="mt-2 text-sm text-gray-500">
                Ainda não há registros de acesso no sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs?.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {log.user?.profileImage ? (
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={log.user.profileImage} 
                              alt={log.user.name}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          <h3 className="text-sm font-semibold text-gray-900">
                            {log.user?.name || "Usuário não identificado"}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {log.action === "open" ? "Tentativa de abertura" : log.action} em{" "}
                          <span className="font-medium">
                            {log.device?.name || "Dispositivo desconhecido"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(log.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(log.status)}
                      {getMethodBadge(log.method)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}