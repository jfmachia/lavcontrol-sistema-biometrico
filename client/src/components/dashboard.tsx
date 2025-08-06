import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Store, 
  Users, 
  Activity, 
  Smartphone, 
  AlertTriangle,
  TrendingUp,
  Eye,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  totalUsers: number;
  activeDevices: number;
  todayAccess: number;
  activeAlerts: number;
}

interface StoreStats {
  totalStores: number;
  onlineStores: number;
  totalAccess: number;
  activeDevices: number;
}

interface TrafficData {
  date: string;
  count: number;
}

export function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: storeStats } = useQuery<StoreStats>({
    queryKey: ["/api/stores/statistics"],
  });

  const { data: trafficData } = useQuery<TrafficData[]>({
    queryKey: ["/api/dashboard/traffic-chart"],
  });

  const { data: facialUsers } = useQuery<any[]>({
    queryKey: ["/api/users/facial-recognized"],
  });

  const statCards = user?.role === "master" ? [
    {
      title: "Total de Lojas",
      value: storeStats?.totalStores || 0,
      icon: Store,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      title: "Lojas Online",
      value: storeStats?.onlineStores || 0,
      icon: Activity,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      title: "Acessos Hoje",
      value: storeStats?.totalAccess || 0,
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20"
    },
    {
      title: "Dispositivos Ativos",
      value: storeStats?.activeDevices || 0,
      icon: Smartphone,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    }
  ] : [
    {
      title: "Usuários Ativos",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      title: "Dispositivos Online",
      value: stats?.activeDevices || 0,
      icon: Smartphone,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      title: "Acessos Hoje",
      value: stats?.todayAccess || 0,
      icon: Activity,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20"
    },
    {
      title: "Alertas Ativos",
      value: stats?.activeAlerts || 0,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard LavControl</h1>
          <p className="text-slate-400">
            Bem-vindo, {user?.name}! Monitore seu sistema de controle de acesso.
          </p>
        </div>
        <div className="lavcontrol-card p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="lavcontrol-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <Card className="lavcontrol-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Tráfego de Acessos (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficData?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-sm text-slate-300">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                        style={{ width: `${Math.min((item.count / 50) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Facial Recognition Users */}
        <Card className="lavcontrol-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Usuários com Biometria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {facialUsers?.slice(0, 8).map((user: any) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="lavcontrol-card border-0">
        <CardHeader>
          <CardTitle className="text-white">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="lavcontrol-button-primary p-4 rounded-lg text-center hover:opacity-90 transition-opacity">
              <Store className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Nova Loja</span>
            </button>
            <button className="lavcontrol-button-primary p-4 rounded-lg text-center hover:opacity-90 transition-opacity">
              <Users className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Novo Usuário</span>
            </button>
            <button className="lavcontrol-button-primary p-4 rounded-lg text-center hover:opacity-90 transition-opacity">
              <Smartphone className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Vincular Dispositivo</span>
            </button>
            <button className="lavcontrol-button-primary p-4 rounded-lg text-center hover:opacity-90 transition-opacity">
              <Shield className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Ver Logs</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}