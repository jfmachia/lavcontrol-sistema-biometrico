import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AreaChart, 
  Area,
  LineChart,
  Line,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, PieChartIcon, Activity, Calendar } from 'lucide-react';
import { StoreSelector } from './store-selector';

interface AccessLog {
  id: number;
  user_id: string;
  client_id: number;
  device_id: number | null;
  store_id: number;
  access_type: string;
  method: string;
  success: boolean;
  details?: string;
  created_at: string;
  user_name?: string;
  store_name?: string;
}

interface ReportsTrafficChartProps {
  className?: string;
}

export function ReportsTrafficChart({ className }: ReportsTrafficChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [timeRange, setTimeRange] = useState('today');
  const [selectedStores, setSelectedStores] = useState<number[]>([]);

  // Buscar logs de acesso completos
  const { data: accessLogs = [], isLoading } = useQuery<AccessLog[]>({
    queryKey: ['/api/access-logs'],
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

  // Processar dados conforme o tipo de gráfico e período
  const chartData = React.useMemo(() => {
    if (!accessLogs || accessLogs.length === 0) return [];

    const now = new Date();
    let filteredLogs = accessLogs;

    // Filtrar por lojas selecionadas
    if (selectedStores.length > 0) {
      filteredLogs = filteredLogs.filter(log => {
        return log.store_id ? selectedStores.includes(log.store_id) : true;
      });
    }

    // Filtrar por período
    switch (timeRange) {
      case 'today':
        filteredLogs = accessLogs.filter(log => {
          const logDate = new Date(log.created_at);
          return logDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredLogs = accessLogs.filter(log => new Date(log.created_at) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredLogs = accessLogs.filter(log => new Date(log.created_at) >= monthAgo);
        break;
    }

    if (chartType === 'pie') {
      // Dados por loja para gráfico de pizza
      const storeGroups = filteredLogs.reduce((acc, log) => {
        const storeName = log.store_name || 'Sem Loja';
        acc[storeName] = (acc[storeName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(storeGroups)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    }

    if (timeRange === 'today') {
      // Dados por hora para hoje
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        const hourLogs = filteredLogs.filter(log => {
          const logHour = new Date(log.created_at).getHours();
          return logHour === hour;
        });

        const storeGroups = hourLogs.reduce((acc, log) => {
          const storeName = log.store_name || 'Outros';
          acc[storeName] = (acc[storeName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          time: hourStr,
          total: hourLogs.length,
          ...storeGroups
        };
      });

      return hourlyData;
    } else {
      // Dados por dia para períodos maiores
      const dailyData: Record<string, any> = {};
      
      filteredLogs.forEach(log => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        const storeName = log.store_name || 'Outros';
        
        if (!dailyData[date]) {
          dailyData[date] = { date, total: 0 };
        }
        
        dailyData[date].total += 1;
        dailyData[date][storeName] = (dailyData[date][storeName] || 0) + 1;
      });

      return Object.values(dailyData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
  }, [accessLogs, chartType, timeRange]);

  // Obter lojas únicas para cores
  const uniqueStores = React.useMemo(() => {
    if (!accessLogs) return [];
    const storeNames = accessLogs.map(log => log.store_name).filter(Boolean);
    return Array.from(new Set(storeNames)) as string[];
  }, [accessLogs]);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const totalAccess = accessLogs.length;
  const todayAccess = accessLogs.filter(log => 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  ).length;

  if (isLoading) {
    return (
      <Card className={`${className} bg-card border`}>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Relatório de Tráfego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando relatórios...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {chartData.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [value, 'Acessos']} />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={timeRange === 'today' ? 'time' : 'date'} 
              stroke="#9CA3AF" 
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={timeRange === 'today' ? 'time' : 'date'} 
              stroke="#9CA3AF" 
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            {uniqueStores.slice(0, 5).map((store, index) => (
              <Area
                key={store}
                type="monotone"
                dataKey={store}
                stackId="1"
                stroke={colors[index]}
                fill={colors[index]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      default: // bar
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={timeRange === 'today' ? 'time' : 'date'} 
              stroke="#9CA3AF" 
              fontSize={11}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Bar dataKey="total" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <Card className={`${className} bg-card border`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Relatório de Tráfego por Loja
            <Badge variant="outline" className="ml-2">
              Total: {totalAccess}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">7 Dias</SelectItem>
                <SelectItem value="month">30 Dias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Linha</SelectItem>
                <SelectItem value="area">Área</SelectItem>
                <SelectItem value="pie">Pizza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            Hoje: {todayAccess} acessos
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Período: {timeRange === 'today' ? 'Últimas 24h' : timeRange === 'week' ? 'Últimos 7 dias' : 'Últimos 30 dias'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Seletor de Lojas */}
        <div className="mb-6">
          <StoreSelector
            selectedStores={selectedStores}
            onStoreChange={setSelectedStores}
            multiSelect={true}
          />
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Resumo por lojas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {uniqueStores.slice(0, 10).map((storeName, index) => {
            const storeAccess = accessLogs.filter(log => log.store_name === storeName).length;
            return (
              <div
                key={storeName}
                className="flex items-center justify-between p-3 bg-background border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-xs font-medium text-foreground truncate">
                    {storeName.length > 12 ? storeName.substring(0, 12) + '...' : storeName}
                  </span>
                </div>
                <span className="text-xs font-bold text-primary">
                  {storeAccess}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
          Dados atualizados automaticamente • Logs em tempo real de todas as entradas
        </div>
      </CardContent>
    </Card>
  );
}