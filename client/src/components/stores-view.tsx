import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { insertStoreSchema, type Store, type Device, type User } from "@shared/schema";
import { z } from "zod";
import { Plus, Store as StoreIcon, Wifi, WifiOff, Users, Activity, MapPin, Phone, User as UserIcon, Fingerprint, Building2, Settings } from "lucide-react";

const formSchema = insertStoreSchema.extend({
  name: z.string().min(1, "Nome da loja é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  phone: z.string().optional(),
  manager: z.string().min(1, "Nome do responsável é obrigatório"),
  biometry: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface StoreWithDevice extends Store {
  device?: Device;
  activeUsers?: number;
  todayAccess?: number;
  owner?: User;
}

interface StoreStatistics {
  totalStores: number;
  onlineStores: number;
  totalAccess: number;
  activeDevices: number;
}

export default function StoresView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Available devices for linking to stores
  const { data: availableDevices } = useQuery({
    queryKey: ["/api/devices/available"],
    queryFn: async () => {
      const response = await fetch("/api/devices/available", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch devices");
      return response.json() as Promise<Device[]>;
    },
  });

  // Store statistics for dashboard view  
  const { data: statistics } = useQuery({
    queryKey: ["/api/stores/statistics"],
    queryFn: async () => {
      const response = await fetch("/api/stores/statistics", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch statistics");
      return response.json() as Promise<StoreStatistics>;
    },
  });

  const { data: stores, isLoading } = useQuery({
    queryKey: ["/api/stores"],
    queryFn: async () => {
      const response = await fetch("/api/stores", {
        headers: AuthService.getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch stores");
      return response.json() as Promise<StoreWithDevice[]>;
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: (data: FormData) =>
      apiRequest("/api/stores", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setIsDialogOpen(false);
      toast({
        title: "Loja criada",
        description: "A loja foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar loja",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      manager: "",
      biometry: "",
      userId: user?.id || 1,
      isActive: true,
    },
  });

  const onSubmit = (data: FormData) => {
    createStoreMutation.mutate(data);
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "online":
        return { 
          label: "Online", 
          variant: "default" as const, 
          dotColor: "bg-green-500", 
          icon: Wifi,
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/20"
        };
      case "offline":
        return { 
          label: "Offline", 
          variant: "destructive" as const, 
          dotColor: "bg-red-500", 
          icon: WifiOff,
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/20"
        };
      default:
        return { 
          label: "Desconhecido", 
          variant: "secondary" as const, 
          dotColor: "bg-gray-500", 
          icon: WifiOff,
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/20"
        };
    }
  };

  // Role-based permission check
  const canCreateStore = user?.role === "franqueado" || user?.role === "master";
  const canLinkDevice = user?.role === "tecnico" || user?.role === "master";
  const canViewAllStores = user?.role === "master";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6">
      {/* Statistics Dashboard */}
      {statistics && canViewAllStores && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-blue-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-300">Total de Lojas</CardTitle>
                <Building2 className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{statistics.totalStores}</div>
              <p className="text-xs text-blue-300/70">lojas cadastradas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-300">Lojas Online</CardTitle>
                <Wifi className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{statistics.onlineStores}</div>
              <p className="text-xs text-green-300/70">conectadas agora</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 border-purple-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-300">Acessos Hoje</CardTitle>
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{statistics.totalAccess}</div>
              <p className="text-xs text-purple-300/70">entradas registradas</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-orange-500/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-300">Dispositivos Ativos</CardTitle>
                <Fingerprint className="h-4 w-4 text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{statistics.activeDevices}</div>
              <p className="text-xs text-orange-300/70">biometrias funcionando</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold text-white">
                {user?.role === "master" ? "Todas as Lojas" : 
                 user?.role === "franqueado" ? "Suas Lojas" : 
                 "Vincular Dispositivos"}
              </h1>
            </div>
            <p className="text-blue-300/70">
              {user?.role === "master" ? "Visão geral de todas as lojas do sistema" :
               user?.role === "franqueado" ? "Gerencie suas lojas e monitore acessos" :
               "Configure dispositivos biométricos para as lojas"}
            </p>
          </div>
          {canCreateStore && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  {user?.role === "tecnico" ? "Vincular Dispositivo" : "Nova Loja"}
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Nova Loja</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Nome da Loja</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Loja Shopping Center"
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Endereço Completo</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo - SP"
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Telefone</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="(11) 99999-9999"
                              className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="manager"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Responsável pela Loja</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Ex: João Silva"
                              className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {user?.role === "tecnico" && (
                    <FormField
                      control={form.control}
                      name="biometry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            <div className="flex items-center gap-2">
                              <Fingerprint className="h-4 w-4" />
                              ID do Dispositivo Biométrico
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue placeholder="Selecione um dispositivo disponível" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600">
                                {availableDevices?.map((device) => (
                                  <SelectItem key={device.id} value={device.deviceId}>
                                    {device.name} ({device.deviceId})
                                  </SelectItem>
                                )) || (
                                  <SelectItem value="" disabled>
                                    Nenhum dispositivo disponível
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="border-slate-600 text-gray-300 hover:bg-slate-800"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createStoreMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createStoreMutation.isPending ? "Criando..." : "Criar Loja"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stores?.length === 0 ? (
        <div className="text-center py-16">
          <div className="p-4 bg-blue-500/10 rounded-full w-fit mx-auto mb-4">
            <StoreIcon className="h-12 w-12 text-blue-400/60" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma loja cadastrada</h3>
          <p className="text-blue-300/60 mb-6">Adicione sua primeira loja para começar o monitoramento</p>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Loja
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores?.map((store) => {
            const statusConfig = getStatusConfig(store.device?.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={store.id} className={`bg-gradient-to-br from-slate-900/70 to-blue-900/30 border-slate-700/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 ${statusConfig.borderColor}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white font-semibold mb-1">
                        {store.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-blue-300/70">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{store.address}</span>
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                      <StatusIcon className="h-4 w-4 text-current" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-300/70">Status do Sistema</span>
                    <Badge 
                      variant={statusConfig.variant}
                      className={`${
                        statusConfig.variant === "default" ? "bg-green-500/20 text-green-400 border-green-400/30" :
                        statusConfig.variant === "destructive" ? "bg-red-500/20 text-red-400 border-red-400/30" :
                        "bg-gray-500/20 text-gray-400 border-gray-400/30"
                      } border`}
                    >
                      <div className={`h-2 w-2 ${statusConfig.dotColor} rounded-full mr-1`}></div>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Store Details */}
                  <div className="space-y-3">
                    {store.manager && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-blue-400" />
                        <div>
                          <p className="text-xs text-blue-300/70">Responsável</p>
                          <p className="text-sm text-white">{store.manager}</p>
                        </div>
                      </div>
                    )}
                    
                    {store.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-400" />
                        <div>
                          <p className="text-xs text-blue-300/70">Telefone</p>
                          <p className="text-sm text-white">{store.phone}</p>
                        </div>
                      </div>
                    )}

                    {store.biometry && (
                      <div className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4 text-orange-400" />
                        <div>
                          <p className="text-xs text-blue-300/70">Biometria</p>
                          <p className="text-sm text-white font-mono">{store.biometry}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700/50">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-3 w-3 text-blue-400" />
                      </div>
                      <p className="text-xs text-blue-300/70">Usuários Ativos</p>
                      <p className="text-lg font-semibold text-white">{store.activeUsers || 0}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Activity className="h-3 w-3 text-green-400" />
                      </div>
                      <p className="text-xs text-blue-300/70">Acessos Hoje</p>
                      <p className="text-lg font-semibold text-white">{store.todayAccess || 0}</p>
                    </div>
                  </div>

                  {store.device && (
                    <div className="pt-2 border-t border-slate-700/50">
                      <span className="text-xs text-blue-300/50 uppercase tracking-wide">ID do Dispositivo</span>
                      <p className="text-sm text-white font-mono">{store.device.deviceId}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}