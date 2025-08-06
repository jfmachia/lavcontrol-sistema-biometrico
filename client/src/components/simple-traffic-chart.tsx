import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Activity, RefreshCw, TrendingUp } from 'lucide-react';
import { StoreSelector } from './store-selector';

interface AccessData {
  time: string;
  store_name: string;
  access_count: number;
}

interface SimpleTrafficChartProps {
  className?: string;
}

export function SimpleTrafficChart({ className }: SimpleTrafficChartProps) {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [selectedStores, setSelectedStores] = useState<number[]>([]);

  // Buscar logs de acesso em tempo real
  const { data: accessLogs = [], isLoading: logsLoading } = useQuery<any[]>({
    queryKey: ['/api/access-logs'],
    refetchInterval: isRealTimeEnabled ? 3000 : false,
    refetchIntervalInBackground: true,
  });

  const { data: accessData = [], isLoading } = useQuery<AccessData[]>({
    queryKey: ['/api/dashboard/wave-chart'],
    refetchInterval: isRealTimeEnabled ? 5000 : false,
    refetchIntervalInBackground: true,
  });

  // Processar dados dos logs em tempo real com filtro de lojas
  const chartData = React.useMemo(() => {
    if (!accessLogs || accessLogs.length === 0) return [];

    // Filtrar logs das últimas 24 horas
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let recentLogs = accessLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= yesterday;
    });

    // Filtrar por lojas selecionadas se houver
    if (selectedStores.length > 0) {
      recentLogs = recentLogs.filter(log => {
        // Assumindo que temos store_id nos logs, senão usar nome da loja
        return log.store_id ? selectedStores.includes(log.store_id) : true;
      });
    }

    // Agrupar por loja e contar acessos
    const storeGroups = recentLogs.reduce((acc, log) => {
      const storeName = log.store_name || 'Sem Loja';
      if (!acc[storeName]) {
        acc[storeName] = {
          store: storeName.length > 15 ? storeName.substring(0, 15) + '...' : storeName,
          fullName: storeName,
          acessos: 0,
        };
      }
      acc[storeName].acessos += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(storeGroups)
      .sort((a: any, b: any) => b.acessos - a.acessos)
      .slice(0, 8); // Mostrar apenas top 8 lojas
  }, [accessLogs, selectedStores]);

  const totalAccess = chartData.reduce((sum: number, item: any) => sum + item.acessos, 0);

  if (isLoading || logsLoading) {
    return (
      <Card className={`${className} bg-card border`}>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Tráfego por Loja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-card border`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tráfego por Loja (Últimas 24h)
            {isRealTimeEnabled && (
              <Badge variant="outline" className="ml-2 text-green-400 border-green-400">
                Tempo Real
              </Badge>
            )}
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
            className={`flex items-center gap-2 ${isRealTimeEnabled ? 'text-green-400' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${isRealTimeEnabled ? 'animate-spin' : ''}`} />
            {isRealTimeEnabled ? 'Pausar' : 'Ativar'}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Total: {totalAccess} acessos (últimas 24h) • Logs reais: {accessLogs.length}
          {selectedStores.length > 0 && ` • ${selectedStores.length} loja(s) filtrada(s)`}
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

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="store" 
                stroke="#9CA3AF"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelFormatter={(value, payload) => {
                  const item = chartData.find((d: any) => d.store === value);
                  return item ? item.fullName : value;
                }}
                formatter={(value: number) => [value, 'Acessos']}
              />
              <Bar 
                dataKey="acessos" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Lista resumo das lojas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {chartData.slice(0, 4).map((item: any, index) => (
            <div
              key={item.fullName}
              className="flex items-center justify-between p-3 bg-background border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-green-500' : 
                  index === 1 ? 'bg-blue-500' : 
                  index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm font-medium text-foreground truncate">
                  {item?.store || 'N/A'}
                </span>
              </div>
              <span className="text-sm font-bold text-primary">
                {item.acessos}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
          Dados dos logs reais • Atualização a cada 3 segundos • {accessLogs.length} entradas registradas
        </div>
      </CardContent>
    </Card>
  );
}