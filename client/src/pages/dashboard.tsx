import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "@/components/dashboard-stats";
import TrafficChart from "@/components/traffic-chart";
import RealTimeAccess from "@/components/real-time-access";
import { AuthService } from "@/lib/auth";
import { Clock, CheckCircle, AlertCircle, Cpu } from "lucide-react";

interface RecentActivity {
  id: number;
  type: "access" | "device" | "user" | "alert";
  message: string;
  timestamp: string;
  user?: {
    id: number;
    name: string;
    profileImageUrl?: string;
  };
}

interface DeviceStatus {
  id: number;
  name: string;
  deviceId: string;
  status: "online" | "offline" | "maintenance";
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "access":
      return { icon: CheckCircle, color: "bg-green-500" };
    case "device":
      return { icon: Cpu, color: "bg-blue-500" };
    case "user":
      return { icon: CheckCircle, color: "bg-yellow-500" };
    case "alert":
      return { icon: AlertCircle, color: "bg-red-500" };
    default:
      return { icon: Clock, color: "bg-gray-500" };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "online":
      return { label: "Online", variant: "default" as const, dotColor: "bg-green-500" };
    case "offline":
      return { label: "Offline", variant: "destructive" as const, dotColor: "bg-red-500" };
    case "maintenance":
      return { label: "Manutenção", variant: "secondary" as const, dotColor: "bg-yellow-500" };
    default:
      return { label: "Desconhecido", variant: "outline" as const, dotColor: "bg-gray-500" };
  }
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 5) return "há poucos minutos";
  if (diffInMinutes < 60) return `há ${diffInMinutes} minutos`;
  if (diffInMinutes < 1440) return `há ${Math.floor(diffInMinutes / 60)} horas`;
  return `há ${Math.floor(diffInMinutes / 1440)} dias`;
};

export default function Dashboard() {
  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ["/api/devices"],
    queryFn: async () => {
      const response = await fetch("/api/devices", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch devices");
      return response.json() as Promise<DeviceStatus[]>;
    },
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/access-logs", { limit: 10 }],
    queryFn: async () => {
      const response = await fetch("/api/access-logs?limit=10", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch recent logs");
      const logs = await response.json();
      
      // Transform logs into recent activity format
      return logs.map((log: any) => ({
        id: log.id,
        type: log.status === "success" ? "access" : "alert",
        message: log.user 
          ? `${log.user.name} ${log.status === "success" ? "acessou" : "tentou acessar"} ${log.device?.store?.name || log.device?.name || "loja"}`
          : `Tentativa de acesso ${log.status === "success" ? "bem-sucedida" : "negada"} em ${log.device?.store?.name || log.device?.name || "loja"}`,
        timestamp: log.timestamp,
        user: log.user ? {
          id: log.user.id,
          name: log.user.name,
          profileImageUrl: log.user.profileImageUrl
        } : undefined,
      })) as RecentActivity[];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="text-3xl font-bold text-white">Dashboard de Controle</h1>
        </div>
        <p className="text-blue-300/70">Sistema de monitoramento em tempo real</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <TrafficChart />
        </div>
        <div>
          <RealTimeAccess />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center">
                    <div className="h-2 w-2 bg-blue-400/20 rounded-full mr-3"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-blue-400/20 rounded w-3/4"></div>
                      <div className="h-2 bg-blue-400/20 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : logs?.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-blue-400/60" />
                <p className="mt-2 text-sm text-blue-300/60">Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-400/30">
                {logs?.map((activity, index) => {
                  const config = getActivityIcon(activity.type);
                  const Icon = config.icon;
                  
                  return (
                    <div key={activity.id || index} className="flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center mr-3">
                        {activity.user?.profileImageUrl ? (
                          <img 
                            src={activity.user.profileImageUrl} 
                            alt={activity.user.name}
                            className="h-8 w-8 rounded-full object-cover border border-blue-400/30"
                          />
                        ) : (
                          <div className={`h-2 w-2 ${config.color} rounded-full`}></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.message}</p>
                        <p className="text-xs text-blue-300/60">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/50 to-indigo-900/30 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-400" />
              Status das Lojas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devicesLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-indigo-400/20 rounded-full mr-3"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-indigo-400/20 rounded w-24"></div>
                        <div className="h-2 bg-indigo-400/20 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="h-5 bg-indigo-400/20 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : devices?.length === 0 ? (
              <div className="text-center py-8">
                <Cpu className="mx-auto h-8 w-8 text-indigo-400/60" />
                <p className="mt-2 text-sm text-indigo-300/60">Nenhuma loja cadastrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices?.slice(0, 4).map((device) => {
                  const statusConfig = getStatusConfig(device.status);
                  
                  return (
                    <div key={device.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 ${statusConfig.dotColor} rounded-full mr-3`}></div>
                        <div>
                          <p className="text-sm font-medium text-white">{device.store?.name || device.name}</p>
                          <p className="text-xs text-indigo-300/60">{device.deviceId}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        statusConfig.variant === "default" ? "bg-green-500/20 text-green-400 border-green-400/30" :
                        statusConfig.variant === "destructive" ? "bg-red-500/20 text-red-400 border-red-400/30" :
                        statusConfig.variant === "secondary" ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30" :
                        "bg-gray-500/20 text-gray-400 border-gray-400/30"
                      }`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
