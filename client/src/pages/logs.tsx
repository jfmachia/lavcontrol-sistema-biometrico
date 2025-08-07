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
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-400" />;
    default:
      return <Clock className="h-4 w-4 text-blue-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-400/30">Sucesso</Badge>;
    case "failed":
      return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-400/30">Falha</Badge>;
    default:
      return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-400/30">Pendente</Badge>;
  }
};

const getMethodBadge = (method: string) => {
  switch (method) {
    case "facial_recognition":
      return <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-400/30">Reconhecimento Facial</Badge>;
    case "card":
      return <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-400/30">Cartão</Badge>;
    case "manual":
      return <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-400/30">Manual</Badge>;
    default:
      return <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-400/30">{method}</Badge>;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          <h1 className="text-3xl font-bold text-white">Logs de Acesso</h1>
        </div>
        <p className="text-blue-300/70">Histórico completo de tentativas de acesso</p>
      </div>

      <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Registros de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse border border-slate-700/50 rounded-lg p-4 bg-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-400/20 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-blue-400/20 rounded w-1/4"></div>
                      <div className="h-3 bg-blue-400/20 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 bg-blue-400/20 rounded w-20"></div>
                      <div className="h-5 bg-blue-400/20 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : logs?.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-blue-400/60" />
              <h3 className="mt-4 text-lg font-medium text-white">Nenhum log encontrado</h3>
              <p className="mt-2 text-sm text-blue-300/60">
                Ainda não há registros de acesso no sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs?.map((log) => (
                <div
                  key={log.id}
                  className="border border-slate-700/50 rounded-lg p-4 hover:bg-white/5 transition-colors bg-slate-900/30"
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
                          <div className="h-12 w-12 bg-slate-700/50 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-400/60" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          <h3 className="text-sm font-semibold text-white">
                            {log.user?.name || "Usuário não identificado"}
                          </h3>
                        </div>
                        <p className="text-sm text-blue-200/70 mt-1">
                          {log.action === "open" ? "Tentativa de abertura" : log.action} em{" "}
                          <span className="font-medium text-blue-100">
                            {log.device?.name || "Dispositivo desconhecido"}
                          </span>
                        </p>
                        <p className="text-xs text-blue-300/60 mt-1">
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