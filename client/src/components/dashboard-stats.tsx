import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Cpu, DoorOpen, AlertTriangle } from "lucide-react";
import { AuthService } from "@/lib/auth";

interface DashboardStats {
  totalUsers: number;
  activeDevices: number;
  todayAccess: number;
  activeAlerts: number;
}

const statsConfig = [
  {
    title: "Total de Usuários",
    key: "totalUsers" as keyof DashboardStats,
    icon: Users,
    bgColor: "bg-blue-500",
  },
  {
    title: "Dispositivos Ativos",
    key: "activeDevices" as keyof DashboardStats,
    icon: Cpu,
    bgColor: "bg-green-500",
  },
  {
    title: "Acessos Hoje",
    key: "todayAccess" as keyof DashboardStats,
    icon: DoorOpen,
    bgColor: "bg-yellow-500",
  },
  {
    title: "Alertas Ativos",
    key: "activeAlerts" as keyof DashboardStats,
    icon: AlertTriangle,
    bgColor: "bg-red-500",
  },
];

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json() as Promise<DashboardStats>;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((config) => {
        const Icon = config.icon;
        const value = stats?.[config.key] || 0;
        
        return (
          <Card key={config.key}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`h-8 w-8 ${config.bgColor} rounded-md flex items-center justify-center`}>
                  <Icon className="text-white h-4 w-4" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{config.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
