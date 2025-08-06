import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, WifiOff, Plus, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Device {
  id: number;
  name: string;
  deviceId: string;
  storeId: number;
  status: string;
  lastPing: string | null;
  createdAt: string;
}

interface Store {
  id: number;
  nome_loja: string;
  loja: string;
}

export function DeviceRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    storeId: ''
  });

  // Buscar todos os dispositivos
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/devices'],
  });

  // Buscar lojas disponíveis
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['/api/stores'],
  });

  // Mutação para cadastrar dispositivo
  const registerMutation = useMutation({
    mutationFn: async (deviceData: any) => {
      return apiRequest('/api/devices', 'POST', deviceData);
    },
    onSuccess: () => {
      toast({
        title: "Dispositivo Cadastrado",
        description: "O dispositivo foi cadastrado com sucesso!",
      });
      setFormData({ name: '', deviceId: '', storeId: '' });
      setIsRegistering(false);
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Cadastro",
        description: error.message || "Não foi possível cadastrar o dispositivo.",
        variant: "destructive",
      });
    },
  });

  // Mutação para remover dispositivo
  const deleteMutation = useMutation({
    mutationFn: async (deviceId: number) => {
      return apiRequest(`/api/devices/${deviceId}`, 'DELETE', {});
    },
    onSuccess: () => {
      toast({
        title: "Dispositivo Removido",
        description: "O dispositivo foi removido com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Remoção",
        description: error.message || "Não foi possível remover o dispositivo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.deviceId || !formData.storeId) {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({
      name: formData.name,
      deviceId: formData.deviceId,
      storeId: parseInt(formData.storeId)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500 text-white';
      case 'offline':
        return 'bg-red-500 text-white';
      case 'maintenance':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'online' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Dispositivos</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie dispositivos de controle de acesso
          </p>
        </div>
        <Button
          onClick={() => setIsRegistering(!isRegistering)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Dispositivo
        </Button>
      </div>

      {/* Formulário de Cadastro */}
      {isRegistering && (
        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Cadastrar Novo Dispositivo
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha os dados do dispositivo para cadastrá-lo no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Nome do Dispositivo*</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Leitor Principal"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceId" className="text-foreground">ID do Dispositivo*</Label>
                  <Input
                    id="deviceId"
                    type="text"
                    placeholder="Ex: DEV001"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="bg-background border-input"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="store" className="text-foreground">Loja*</Label>
                <Select
                  value={formData.storeId}
                  onValueChange={(value) => setFormData({ ...formData, storeId: value })}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {storesLoading ? (
                      <SelectItem value="loading" disabled>Carregando lojas...</SelectItem>
                    ) : stores.length > 0 ? (
                      stores.map((store: Store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.nome_loja || store.loja}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-stores" disabled>Nenhuma loja disponível</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {registerMutation.isPending ? 'Cadastrando...' : 'Cadastrar Dispositivo'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegistering(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Dispositivos */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground">Dispositivos Cadastrados</CardTitle>
          <CardDescription className="text-muted-foreground">
            Lista de todos os dispositivos no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devicesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando dispositivos...</div>
            </div>
          ) : devices.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum dispositivo cadastrado</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {devices.map((device: Device) => {
                const store = stores.find((s: Store) => s.id === device.storeId);
                return (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 bg-background border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {device.deviceId}</p>
                        <p className="text-sm text-muted-foreground">
                          Loja: {store ? (store.nome_loja || store.loja) : 'Não informado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(device.status)}>
                        {getStatusIcon(device.status)}
                        <span className="ml-1 capitalize">{device.status}</span>
                      </Badge>
                      
                      {device.lastPing && (
                        <div className="text-xs text-muted-foreground">
                          Último ping: {new Date(device.lastPing).toLocaleString('pt-BR')}
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(device.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Dispositivos Online</p>
                <p className="text-2xl font-bold text-foreground">
                  {devices.filter((d: Device) => d.status === 'online').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Dispositivos Offline</p>
                <p className="text-2xl font-bold text-foreground">
                  {devices.filter((d: Device) => d.status === 'offline').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Dispositivos</p>
                <p className="text-2xl font-bold text-foreground">
                  {devices.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}