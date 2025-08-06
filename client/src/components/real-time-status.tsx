import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebSocket } from '@/hooks/use-websocket';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Wifi, WifiOff, PlayCircle, Users, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function RealTimeStatus({ className }: { className?: string }) {
  const { isConnected } = useWebSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados para simulação
  const { data: stores } = useQuery<any[]>({
    queryKey: ['/api/stores'],
  });

  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  // Mutation para simular entrada de usuário
  const simulateEntryMutation = useMutation({
    mutationFn: async ({ storeId, userId }: { storeId: number; userId: number }) => {
      const response = await apiRequest('/api/simulate/user-entry', 'POST', { storeId, userId });
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Entrada Simulada",
        description: data.message || "Entrada registrada com sucesso",
        variant: "default",
      });
      
      // Invalidar queries para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/wave-chart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/access-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Simulação",
        description: error.message || "Falha ao simular entrada",
        variant: "destructive",
      });
    }
  });

  const handleSimulateEntry = () => {
    if (!stores || !users || stores.length === 0 || users.length === 0) {
      toast({
        title: "Dados Insuficientes",
        description: "É necessário ter lojas e usuários cadastrados",
        variant: "destructive",
      });
      return;
    }

    // Selecionar aleatoriamente uma loja e um usuário
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];

    simulateEntryMutation.mutate({
      storeId: randomStore.id,
      userId: randomUser.id
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              Status Tempo Real
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              Desconectado
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Conexão WebSocket:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Ativa" : "Inativa"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Atualização Automática:</span>
          <Badge variant="outline" className="text-green-400 border-green-400">
            Ativa (30s)
          </Badge>
        </div>

        {stores && users && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
              <Store className="w-3 h-3" />
              {stores.length} lojas
              <Users className="w-3 h-3 ml-2" />
              {users.length} usuários
            </div>
            
            <Button
              onClick={handleSimulateEntry}
              disabled={simulateEntryMutation.isPending}
              size="sm"
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <PlayCircle className="w-4 h-4" />
              {simulateEntryMutation.isPending ? 'Simulando...' : 'Simular Entrada'}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-3 p-2 bg-muted/30 rounded">
          💡 O sistema simula entradas automáticas a cada 30 segundos para demonstração
        </div>
      </CardContent>
    </Card>
  );
}