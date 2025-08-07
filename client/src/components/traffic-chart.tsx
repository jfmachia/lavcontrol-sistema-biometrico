import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AuthService } from "@/lib/auth";
import { TrendingUp } from "lucide-react";

interface TrafficData {
  date: string;
  count: number;
}

export default function TrafficChart() {
  const { data: trafficData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/traffic-chart"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/traffic-chart");
      if (!response.ok) throw new Error("Failed to fetch traffic chart");
      return response.json() as Promise<TrafficData[]>;
    },
  });

  // Completar os dados para os últimos 7 dias
  const completeData = () => {
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existingData = trafficData?.find(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === dateStr;
      });
      
      result.push({
        date: dateStr,
        count: existingData?.count || 0,
        displayDate: date.toLocaleDateString('pt-BR', { 
          weekday: 'short',
          day: '2-digit',
          month: '2-digit'
        })
      });
    }
    
    return result;
  };

  const chartData = completeData();
  const totalTraffic = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Fluxo de Usuários
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Últimos 7 dias
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {totalTraffic.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">total de acessos</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse w-full h-full bg-gray-200 rounded"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => value.toString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px'
                }}
                labelStyle={{ color: '#d1d5db' }}
                formatter={(value: number) => [
                  `${value} usuários`,
                  'Acessos'
                ]}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#colorTraffic)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}