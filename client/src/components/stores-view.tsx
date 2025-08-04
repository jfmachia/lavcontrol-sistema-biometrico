import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/lib/auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertStoreSchema, type Store, type Device } from "@shared/schema";
import { z } from "zod";
import { Plus, Store as StoreIcon, Wifi, WifiOff, Users, Activity, MapPin } from "lucide-react";

const formSchema = insertStoreSchema.extend({
  name: z.string().min(1, "Nome da loja é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

interface StoreWithDevice extends Store {
  device?: Device;
  activeUsers?: number;
  todayAccess?: number;
}

export default function StoresView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
      userId: 1, // This will be set from actual user later
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold text-white">Gerenciar Lojas</h1>
            </div>
            <p className="text-blue-300/70">Controle e monitore suas lojas conectadas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                Nova Loja
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
                        <FormLabel className="text-gray-200">Endereço</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Rua das Flores, 123"
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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