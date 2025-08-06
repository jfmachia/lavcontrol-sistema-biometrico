import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Fingerprint, 
  Store, 
  Link as LinkIcon,
  Unlink,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

const linkDeviceSchema = z.object({
  storeId: z.string().min(1, "Selecione uma loja"),
  deviceId: z.string().min(1, "Selecione um dispositivo")
});

type LinkDeviceFormData = z.infer<typeof linkDeviceSchema>;

export function BiometryManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const form = useForm<LinkDeviceFormData>({
    resolver: zodResolver(linkDeviceSchema),
    defaultValues: {
      storeId: "",
      deviceId: ""
    }
  });

  const { data: stores, isLoading: storesLoading } = useQuery<any[]>({
    queryKey: ["/api/stores"],
  });

  const { data: availableDevices, isLoading: devicesLoading } = useQuery<any[]>({
    queryKey: ["/api/devices/available"],
  });

  const { data: allDevices } = useQuery<any[]>({
    queryKey: ["/api/devices"],
  });

  const linkDeviceMutation = useMutation({
    mutationFn: ({ storeId, deviceId }: { storeId: number; deviceId: string }) =>
      apiRequest(`/api/stores/${storeId}`, "PATCH", { biometry: deviceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devices/available"] });
      setIsLinkDialogOpen(false);
      form.reset();
    }
  });

  const unlinkDeviceMutation = useMutation({
    mutationFn: (storeId: number) =>
      apiRequest(`/api/stores/${storeId}`, "PATCH", { biometry: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devices/available"] });
    }
  });

  const onSubmit = (data: LinkDeviceFormData) => {
    linkDeviceMutation.mutate({
      storeId: parseInt(data.storeId),
      deviceId: data.deviceId
    });
  };

  const unlinkDevice = (storeId: number) => {
    unlinkDeviceMutation.mutate(storeId);
  };

  const getDeviceStatus = (deviceId: string) => {
    const device = allDevices?.find((d: any) => d.deviceId === deviceId);
    return device?.status || "unknown";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "offline": return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500/20 text-green-400 border-green-400/30";
      case "offline": return "bg-red-500/20 text-red-400 border-red-400/30";
      default: return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Biometria</h1>
          <p className="text-slate-400">Vincule dispositivos biométricos às lojas para controle de acesso.</p>
        </div>

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button className="lavcontrol-button-primary">
              <LinkIcon className="w-4 h-4 mr-2" />
              Vincular Dispositivo
            </Button>
          </DialogTrigger>
          <DialogContent className="lavcontrol-card">
            <DialogHeader>
              <DialogTitle className="text-white">Vincular Dispositivo Biométrico</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Loja</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione uma loja" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {stores?.map((store: any) => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.name} - {store.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Dispositivo Disponível</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione um dispositivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {availableDevices?.map((device: any) => (
                            <SelectItem key={device.id} value={device.deviceId}>
                              {device.name} ({device.deviceId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full lavcontrol-button-primary"
                  disabled={linkDeviceMutation.isPending}
                >
                  {linkDeviceMutation.isPending ? "Vinculando..." : "Vincular Dispositivo"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="lavcontrol-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total de Lojas</p>
                <p className="text-2xl font-bold text-white">{stores?.length || 0}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Store className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lavcontrol-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Lojas com Biometria</p>
                <p className="text-2xl font-bold text-white">
                  {stores?.filter((store: any) => store.biometry).length || 0}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Fingerprint className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lavcontrol-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Dispositivos Disponíveis</p>
                <p className="text-2xl font-bold text-white">{availableDevices?.length || 0}</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Smartphone className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lavcontrol-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Dispositivos Online</p>
                <p className="text-2xl font-bold text-white">
                  {allDevices?.filter((device: any) => device.status === "online").length || 0}
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores with Biometry Status */}
      <Card className="lavcontrol-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-green-400" />
            Status das Lojas e Dispositivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {storesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-700/30 p-4 rounded-lg">
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-3 bg-slate-600 rounded mb-4"></div>
                  <div className="h-8 bg-slate-600 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stores?.map((store: any) => (
                <div key={store.id} className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-white mb-1">{store.name}</h3>
                      <p className="text-sm text-slate-400">{store.address}</p>
                      {store.manager && (
                        <p className="text-sm text-slate-400">Responsável: {store.manager}</p>
                      )}
                    </div>
                    <Badge className={store.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {store.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>

                  {store.biometry ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Dispositivo Biométrico:</span>
                        <Badge className={`border ${getStatusColor(getDeviceStatus(store.biometry))}`}>
                          {getStatusIcon(getDeviceStatus(store.biometry))}
                          <span className="ml-1">{store.biometry}</span>
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unlinkDevice(store.id)}
                        disabled={unlinkDeviceMutation.isPending}
                        className="w-full border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Desvincular Dispositivo
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Fingerprint className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 mb-3">Nenhum dispositivo vinculado</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          form.setValue("storeId", store.id.toString());
                          setIsLinkDialogOpen(true);
                        }}
                        className="lavcontrol-button-primary"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Vincular Dispositivo
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Devices */}
      <Card className="lavcontrol-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-orange-400" />
            Dispositivos Disponíveis para Vinculação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-700/30 p-4 rounded-lg">
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-3 bg-slate-600 rounded"></div>
                </div>
              ))}
            </div>
          ) : availableDevices?.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum dispositivo disponível para vinculação.</p>
              <p className="text-sm text-slate-500 mt-2">
                Todos os dispositivos já estão vinculados a lojas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableDevices?.map((device: any) => (
                <div key={device.id} className="bg-slate-700/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{device.name}</h3>
                    <Badge className={`border ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      <span className="ml-1 capitalize">{device.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{device.deviceId}</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      form.setValue("deviceId", device.deviceId);
                      setIsLinkDialogOpen(true);
                    }}
                    className="w-full lavcontrol-button-primary"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Selecionar para Vincular
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}