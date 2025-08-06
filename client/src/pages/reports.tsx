import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsTrafficChart } from "@/components/reports-traffic-chart";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export function Reports() {
  const { data: trafficData } = useQuery<Array<{ date: string; count: number }>>({
    queryKey: ["/api/dashboard/traffic-chart"],
  });

  const { data: stats } = useQuery<{
    totalUsers: number;
    activeDevices: number;
    todayAccess: number;
    activeAlerts: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: storeStats } = useQuery<{
    totalStores: number;
    onlineStores: number;
    totalAccess: number;
    activeDevices: number;
  }>({
    queryKey: ["/api/stores/statistics"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Análise detalhada e estatísticas do sistema LavControl
        </p>
      </div>

      {/* KPIs Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Usuários ativos no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas Conectadas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats?.onlineStores || 0}</div>
            <p className="text-xs text-muted-foreground">
              De {storeStats?.totalStores || 0} lojas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acessos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeStats?.totalAccess || 0}</div>
            <p className="text-xs text-muted-foreground">Entradas e saídas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos Ativos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeDevices || 0}</div>
            <p className="text-xs text-muted-foreground">Dispositivos online agora</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="waves" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waves">Tráfego por Loja</TabsTrigger>
          <TabsTrigger value="timeline">Histórico Semanal</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="waves" className="space-y-4">
          <ReportsTrafficChart className="col-span-full" />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acessos dos Últimos 7 Dias</CardTitle>
              <p className="text-sm text-muted-foreground">
                Histórico de acessos bem-sucedidos por dia
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value) => [`${value} acessos`, 'Quantidade']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Online</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="font-medium">{stats?.activeDevices || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Alertas Ativos</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="font-medium">{stats?.activeAlerts || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taxa de Sucesso</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="font-medium">98.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Método</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Biométrico</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reconhecimento Facial</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cartão/RFID</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}