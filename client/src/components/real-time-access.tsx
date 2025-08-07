import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthService } from "@/lib/auth";
import { Activity, User, Zap } from "lucide-react";

interface RealtimeAccess {
  id: number;
  userId: number;
  clientId: number;
  deviceId: number;
  action: string;
  method: string;
  status: string;
  timestamp: string;
  client?: {
    id: number;
    name: string;
    profileImageUrl?: string;
  };
  device?: {
    id: number;
    name: string;
    store?: {
      name: string;
    };
  };
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const accessTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - accessTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "agora";
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
  return `${Math.floor(diffInMinutes / 60)}h atrás`;
};

export default function RealTimeAccess() {
  const { data: recentAccess, isLoading } = useQuery({
    queryKey: ["/api/access-logs", { realtime: true }],
    queryFn: async () => {
      const response = await fetch("/api/access-logs?limit=10", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch real-time access");
      return response.json() as Promise<RealtimeAccess[]>;
    },
    refetchInterval: 3000, // Atualiza a cada 3 segundos
  });

  const successfulAccess = recentAccess?.filter(access => access.status === "success") || [];

  return (
    <Card className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border-blue-800/30 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-blue-100">
                Acessos em Tempo Real
              </CardTitle>
              <p className="text-blue-300/70 text-sm">
                Pessoas entrando nas lojas agora
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">LIVE</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="h-10 w-10 bg-blue-400/20 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-blue-400/20 rounded w-32"></div>
                  <div className="h-2 bg-blue-400/20 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : successfulAccess.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto mb-3">
              <User className="h-8 w-8 text-blue-400/60" />
            </div>
            <p className="text-blue-300/60 text-sm">
              Nenhum acesso recente
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-400/30">
            {successfulAccess.map((access, index) => (
              <div
                key={access.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 border ${
                  index === 0 
                    ? "bg-green-500/10 border-green-400/30 shadow-lg shadow-green-500/10" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-blue-400/30">
                    <AvatarImage 
                      src={access.client?.profileImageUrl} 
                      alt={access.client?.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-500/20 text-blue-300">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-blue-950 animate-pulse">
                      <div className="h-full w-full bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">
                      {access.client?.name || "Cliente desconhecido"}
                    </p>
                    {index === 0 && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-400/30">
                        NOVO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-300/70">
                    <span>{access.device?.store?.name || access.device?.name}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(access.timestamp)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-blue-300/50 uppercase tracking-wide">
                    {access.method === 'facial_recognition' ? 'Face ID' : access.method}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}