import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Plus, Store as StoreIcon, Wifi, WifiOff, Users, Activity, MapPin, Phone, User as UserIcon, Fingerprint, Building2, Settings, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";

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
                              Código do Aparelho Biométrico da Loja
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Ex: BIO-001-SP, SCANNER-123, etc."
                              className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-400 mt-1">
                            Digite o código identificador do aparelho biométrico instalado nesta loja
                          </p>
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
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Lista Completa de Lojas</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">ID</TableHead>
                    <TableHead className="text-slate-300">Loja</TableHead>
                    <TableHead className="text-slate-300">Nome Loja</TableHead>
                    <TableHead className="text-slate-300">Nome IA</TableHead>
                    <TableHead className="text-slate-300">NV Loja</TableHead>
                    <TableHead className="text-slate-300">Endereço</TableHead>
                    <TableHead className="text-slate-300">Senha Porta</TableHead>
                    <TableHead className="text-slate-300">Senha WiFi</TableHead>
                    <TableHead className="text-slate-300">Horário Seg-Sex</TableHead>
                    <TableHead className="text-slate-300">Horário Sáb</TableHead>
                    <TableHead className="text-slate-300">Horário Dom</TableHead>
                    <TableHead className="text-slate-300">WhatsApp</TableHead>
                    <TableHead className="text-slate-300">Ponto Referência</TableHead>
                    <TableHead className="text-slate-300">Valor LV</TableHead>
                    <TableHead className="text-slate-300">Valor S</TableHead>
                    <TableHead className="text-slate-300">Cesto Grande</TableHead>
                    <TableHead className="text-slate-300">Valor LV2</TableHead>
                    <TableHead className="text-slate-300">Valor S2</TableHead>
                    <TableHead className="text-slate-300">Estacionamento</TableHead>
                    <TableHead className="text-slate-300">Delivery</TableHead>
                    <TableHead className="text-slate-300">Deixou</TableHead>
                    <TableHead className="text-slate-300">Assistente</TableHead>
                    <TableHead className="text-slate-300">Cash Back</TableHead>
                    <TableHead className="text-slate-300">Cupons</TableHead>
                    <TableHead className="text-slate-300">Promoção</TableHead>
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Instância Loja</TableHead>
                    <TableHead className="text-slate-300">LVs Número</TableHead>
                    <TableHead className="text-slate-300">S2 Número</TableHead>
                    <TableHead className="text-slate-300">Observações</TableHead>
                    <TableHead className="text-slate-300">Cidade</TableHead>
                    <TableHead className="text-slate-300">Estado</TableHead>
                    <TableHead className="text-slate-300">Latitude</TableHead>
                    <TableHead className="text-slate-300">Longitude</TableHead>
                    <TableHead className="text-slate-300">Número</TableHead>
                    <TableHead className="text-slate-300">Ordem</TableHead>
                    <TableHead className="text-slate-300">Voz</TableHead>
                    <TableHead className="text-slate-300">Msg Ini</TableHead>
                    <TableHead className="text-slate-300">Biometria</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores?.map((store: any) => (
                    <TableRow key={store.id} className="border-slate-700">
                      <TableCell className="text-white font-mono">{store.id}</TableCell>
                      <TableCell className="text-white">{store.loja || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.nome_loja || store.name || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.nome_ia || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.nv_loja || 'N/A'}</TableCell>
                      <TableCell className="text-white max-w-xs truncate">{store.endereco || store.address || 'N/A'}</TableCell>
                      <TableCell className="text-white font-mono">{store.senha_porta || 'N/A'}</TableCell>
                      <TableCell className="text-white font-mono">{store.senha_wifi || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.horario_seg_sex || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.horario_sab || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.horario_dom || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.whats_atendimento || 'N/A'}</TableCell>
                      <TableCell className="text-white max-w-xs truncate">{store.ponto_referencia || 'N/A'}</TableCell>
                      <TableCell className="text-green-400 font-mono">R$ {store.valor_lv || '0.00'}</TableCell>
                      <TableCell className="text-green-400 font-mono">R$ {store.valor_s || '0.00'}</TableCell>
                      <TableCell className="text-green-400 font-mono">R$ {store.cesto_grande || '0.00'}</TableCell>
                      <TableCell className="text-green-400 font-mono">R$ {store.valor_lv2 || '0.00'}</TableCell>
                      <TableCell className="text-green-400 font-mono">R$ {store.valor_s2 || '0.00'}</TableCell>
                      <TableCell>
                        {store.estacionamento ? 
                          <CheckCircle2 className="h-4 w-4 text-green-400" /> : 
                          <XCircle className="h-4 w-4 text-red-400" />
                        }
                      </TableCell>
                      <TableCell>
                        {store.delivery ? 
                          <CheckCircle2 className="h-4 w-4 text-green-400" /> : 
                          <XCircle className="h-4 w-4 text-red-400" />
                        }
                      </TableCell>
                      <TableCell>
                        {store.deixou ? 
                          <CheckCircle2 className="h-4 w-4 text-green-400" /> : 
                          <XCircle className="h-4 w-4 text-red-400" />
                        }
                      </TableCell>
                      <TableCell className="text-white">{store.assistente || 'N/A'}</TableCell>
                      <TableCell className="text-blue-400">{store.cash_back || 'N/A'}</TableCell>
                      <TableCell className="text-yellow-400">{store.cupons || 'N/A'}</TableCell>
                      <TableCell className="text-purple-400">{store.promocao || 'N/A'}</TableCell>
                      <TableCell className="text-slate-400">
                        {store.data ? new Date(store.data).toLocaleDateString('pt-BR') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-white font-mono">{store.instancia_loja || 'N/A'}</TableCell>
                      <TableCell className="text-white font-mono">{store.lvs_numero || 'N/A'}</TableCell>
                      <TableCell className="text-white font-mono">{store.s2_numero || 'N/A'}</TableCell>
                      <TableCell className="text-white max-w-xs truncate">{store.observacoes || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.cidade || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.estado || 'N/A'}</TableCell>
                      <TableCell className="text-white font-mono text-xs">{store.latitude || 'N/A'}</TableCell>
                      <TableCell className="text-white font-mono text-xs">{store.longitude || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.numero || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.ordem || 'N/A'}</TableCell>
                      <TableCell className="text-white">{store.voz || 'N/A'}</TableCell>
                      <TableCell className="text-white max-w-xs truncate">{store.msg_ini || 'N/A'}</TableCell>
                      <TableCell className="text-blue-400">{store.biometria || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}