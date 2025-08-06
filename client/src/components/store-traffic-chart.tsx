import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Activity, Settings2, RefreshCw } from 'lucide-react';

interface AccessData {
  time: string;
  store_name: string;
  access_count: number;
}

interface StoreTrafficChartProps {
  className?: string;
}

export function StoreTrafficChart({ className }: StoreTrafficChartProps) {
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [showStoreFilter, setShowStoreFilter] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const queryClient = useQueryClient();

  const { data: accessData = [], isLoading, refetch } = useQuery<AccessData[]>({
    queryKey: ['/api/dashboard/wave-chart'],
    refetchInterval: isRealTimeEnabled ? 5000 : false, // Atualiza a cada 5 segundos
    refetchIntervalInBackground: true,
  });

  // Extrair lojas únicas e ordenar
  const uniqueStores = React.useMemo(() => {
    if (!accessData || accessData.length === 0) return [];
    const storeNames = [...new Set(accessData.map(item => item.store_name))];
    return storeNames.sort();
  }, [accessData]);

  // Inicializar com todas as lojas selecionadas
  useEffect(() => {
    if (uniqueStores.length > 0 && selectedStores.length === 0) {
      setSelectedStores(uniqueStores);
    }
  }, [uniqueStores, selectedStores.length]);

  // Processar dados para o gráfico
  const chartData = React.useMemo(() => {
    if (!accessData || accessData.length === 0) return [];

    // Filtrar dados por lojas selecionadas
    const filteredData = selectedStores.length > 0 
      ? accessData.filter(item => selectedStores.includes(item.store_name))
      : accessData;

    // Agrupar por horário
    const timeGroups = filteredData.reduce((acc, item) => {
      const hour = new Date(item.time).getHours();
      const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!acc[timeLabel]) {
        acc[timeLabel] = { time: timeLabel, total: 0 };
      }
      
      acc[timeLabel][item.store_name] = (acc[timeLabel][item.store_name] || 0) + item.access_count;
      acc[timeLabel].total += item.access_count;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(timeGroups).sort((a: any, b: any) => a.time.localeCompare(b.time));
  }, [accessData, selectedStores]);

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

  // Cores para cada loja
  const storeColors = [
    '#22c55e', // Verde
    '#3b82f6', // Azul
    '#a855f7', // Roxo
    '#f97316', // Laranja
    '#ec4899', // Rosa
    '#0ea5e9', // Azul claro
    '#84cc16', // Lima
    '#f59e0b', // Âmbar
  ];

  const getStoreColor = (storeName: string) => {
    const index = uniqueStores.indexOf(storeName);
    return storeColors[index % storeColors.length];
  };

  if (isLoading) {
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
            <Activity className="w-5 h-5 text-primary" />
            Tráfego por Loja (Últimas 24h)
            {isRealTimeEnabled && (
              <Badge variant="outline" className="ml-2 text-green-400 border-green-400">
                Tempo Real
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              className={`flex items-center gap-2 ${isRealTimeEnabled ? 'text-green-400' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRealTimeEnabled ? 'animate-spin' : ''}`} />
              {isRealTimeEnabled ? 'Pausar' : 'Ativar'} Tempo Real
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStoreFilter(!showStoreFilter)}
              className="flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Filtrar ({selectedStores.length}/{uniqueStores.length})
            </Button>
          </div>
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
                    className="text-sm text-foreground cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getStoreColor(storeName) }}
                    />
                    {storeName}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
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
                labelFormatter={(value) => `Horário: ${value}`}
              />
              
              {selectedStores.map((storeName, index) => (
                <Area
                  key={storeName}
                  type="monotone"
                  dataKey={storeName}
                  stackId="1"
                  stroke={getStoreColor(storeName)}
                  fill={getStoreColor(storeName)}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo por loja */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {selectedStores.map((storeName) => {
            const totalAccess = accessData
              .filter(item => item.store_name === storeName)
              .reduce((sum, item) => sum + item.access_count, 0);
            
            return (
              <div
                key={storeName}
                className="flex items-center justify-between p-3 bg-background border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getStoreColor(storeName) }}
                  />
                  <span className="text-sm font-medium text-foreground truncate">
                    {storeName}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {totalAccess}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}