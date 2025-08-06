import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Store, 
  Users, 
  Activity, 
  Smartphone, 
  AlertTriangle,
  TrendingUp,
  Eye,
  Shield,
  Settings2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { WaveChart } from "@/components/wave-chart";

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
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [showStoreFilter, setShowStoreFilter] = useState(false);

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

  const { data: stores } = useQuery<any[]>({
    queryKey: ["/api/stores"],
  });

  // Extrair nomes únicos das lojas dos dados do gráfico
  const { data: waveData } = useQuery<any[]>({
    queryKey: ["/api/dashboard/wave-chart"],
  });

  const uniqueStores = React.useMemo(() => {
    if (!waveData) return [];
    const storeNames = [...new Set(waveData.map(item => item.store_name))];
    return storeNames.sort();
  }, [waveData]);

  // Inicializar com todas as lojas selecionadas
  React.useEffect(() => {
    if (uniqueStores.length > 0 && selectedStores.length === 0) {
      setSelectedStores(uniqueStores);
    }
  }, [uniqueStores]);

  const handleStoreToggle = (storeName: string, checked: boolean) => {
    if (checked) {
      setSelectedStores(prev => [...prev, storeName]);
    } else {
      setSelectedStores(prev => prev.filter(s => s !== storeName));
    }
  };

  const handleSelectAll = () => {
    setSelectedStores(uniqueStores);
  };

  const handleDeselectAll = () => {
    setSelectedStores([]);
  };

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard LavControl</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name}! Monitore seu sistema de controle de acesso.
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm text-foreground">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
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
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Tráfego de Acessos (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelFormatter={(value) => `Data: ${new Date(value).toLocaleDateString('pt-BR')}`}
                    formatter={(value) => [`${value} acessos`, 'Acessos']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="url(#gradient1)"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#3B82F6' }}
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Facial Recognition Users */}
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
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
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
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

      {/* Wave Chart com Filtro de Lojas */}
      <Card className="col-span-full bg-card border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Tráfego em Tempo Real por Loja
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStoreFilter(!showStoreFilter)}
              className="flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Filtrar Lojas ({selectedStores.length}/{uniqueStores.length})
            </Button>
          </div>
          
          {showStoreFilter && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedStores.length === uniqueStores.length}
                >
                  Selecionar Todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedStores.length === 0}
                >
                  Desmarcar Todas
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {uniqueStores.map((storeName) => (
                  <div key={storeName} className="flex items-center space-x-2">
                    <Checkbox
                      id={`store-${storeName}`}
                      checked={selectedStores.includes(storeName)}
                      onCheckedChange={(checked) => handleStoreToggle(storeName, !!checked)}
                    />
                    <label
                      htmlFor={`store-${storeName}`}
                      className="text-sm text-foreground cursor-pointer hover:text-primary transition-colors"
                    >
                      {storeName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <WaveChart selectedStores={selectedStores} />
        </CardContent>
      </Card>
    </div>
  );
}