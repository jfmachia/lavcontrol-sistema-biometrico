import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock,
  Users,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Search,
  Smartphone,
  Wifi,
  WifiOff,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StoreSettings from "./store-settings";

export default function StoresView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStore, setEditingStore] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    storeCode: "",
    name: "",
    address: "",
    phone: ""
  });
  const [deleteConfirmStore, setDeleteConfirmStore] = useState<any>(null);

  const { data: stores = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/stores"],
  });

  const { data: storeStats } = useQuery<any>({
    queryKey: ["/api/stores/statistics"],
  });

  // Buscar dispositivos quando uma loja está sendo editada
  const { data: storeDevices = [] } = useQuery<any[]>({
    queryKey: ["/api/devices/by-store", editingStore?.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/devices/by-store/${editingStore?.id}`, 'GET');
      return await response.json();
    },
    enabled: !!editingStore?.id,
  });

  const createStoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("/api/stores", "POST", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/statistics"] });
      setIsCreateDialogOpen(false);
      setNewStore({ storeCode: "", name: "", address: "", phone: "" });
      toast({
        title: "Loja cadastrada",
        description: "A loja foi cadastrada com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível cadastrar a loja.",
        variant: "destructive",
      });
    }
  });

  const updateStoreMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/stores/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.refetchQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/statistics"] });
      setEditingStore(null);
      toast({
        title: "Loja atualizada",
        description: "As informações da loja foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar a loja.",
        variant: "destructive",
      });
    }
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/stores/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro ${response.status}: ${text || response.statusText}`);
      }

      // Se OK, tenta ler a resposta como JSON se houver conteúdo
      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/statistics"] });
      setDeleteConfirmStore(null);
      toast({
        title: "Loja deletada",
        description: "A loja foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar",
        description: error.message || "Não foi possível deletar a loja.",
        variant: "destructive",
      });
    }
  });

  const filteredStores = stores?.filter((store: any) =>
    store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (store: any) => {
    if (store.isActive !== false) {
      return <Badge className="bg-green-500 text-white">Ativa</Badge>;
    }
    return <Badge variant="secondary">Inativa</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lojas</h1>
          <p className="text-muted-foreground">
            Gerencie suas lojas e estabelecimentos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Loja</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="store-code">Código da Loja</Label>
                <Input 
                  id="store-code"
                  placeholder="LV001" 
                  value={newStore.storeCode}
                  onChange={(e) => setNewStore({...newStore, storeCode: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="store-name">Nome da Loja</Label>
                <Input 
                  id="store-name"
                  placeholder="Shopping Center ABC" 
                  value={newStore.name}
                  onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="store-address">Endereço</Label>
                <Input 
                  id="store-address"
                  placeholder="Rua das Flores, 123" 
                  value={newStore.address}
                  onChange={(e) => setNewStore({...newStore, address: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="store-phone">Telefone</Label>
                <Input 
                  id="store-phone"
                  placeholder="(11) 99999-9999" 
                  value={newStore.phone}
                  onChange={(e) => setNewStore({...newStore, phone: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewStore({ storeCode: "", name: "", address: "", phone: "" });
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    if (!newStore.name.trim()) {
                      toast({
                        title: "Campo obrigatório",
                        description: "O nome da loja é obrigatório.",
                        variant: "destructive",
                      });
                      return;
                    }
                    createStoreMutation.mutate({
                      name: newStore.name,
                      address: newStore.address,
                      phone: newStore.phone,
                      storeCode: newStore.storeCode
                    });
                  }}
                  disabled={createStoreMutation.isPending}
                >
                  {createStoreMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      {storeStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{storeStats.totalStores}</div>
              <div className="text-xs text-muted-foreground">Total de Lojas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{storeStats.onlineStores}</div>
              <div className="text-xs text-muted-foreground">Lojas Online</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{storeStats.totalAccess}</div>
              <div className="text-xs text-muted-foreground">Acessos Hoje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{storeStats.activeDevices}</div>
              <div className="text-xs text-muted-foreground">Dispositivos Ativos</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar loja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lojas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Nenhuma loja encontrada
          </div>
        ) : (
          filteredStores.map((store: any) => (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary" />
                    {store.name || store.nome_loja}
                  </CardTitle>
                  {getStatusBadge(store)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {store.address || store.endereco || "Sem endereço"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {store.phone || store.telefone || "Sem telefone"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Gerente: {store.managerName || store.manager_name || "Não definido"}
                  </div>
                </div>

                {/* Métricas da Loja */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">
                      {store.dailyAccess || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Acessos Hoje</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {store.deviceCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Dispositivos</div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStore({
                          ...store,
                          name: store.name,
                          address: store.address, 
                          phone: store.phone,
                          managerName: store.managerName || store.manager_name
                        })}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Loja</DialogTitle>
                      </DialogHeader>
                      {editingStore && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-store-name">Nome da Loja</Label>
                            <Input
                              id="edit-store-name"
                              value={editingStore.name || ""}
                              onChange={(e) =>
                                setEditingStore({ ...editingStore, name: e.target.value })
                              }
                              placeholder="Nome da loja"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-store-address">Endereço</Label>
                            <Input
                              id="edit-store-address"
                              value={editingStore.address || ""}
                              onChange={(e) =>
                                setEditingStore({ ...editingStore, address: e.target.value })
                              }
                              placeholder="Rua das Flores, 123"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-store-phone">Telefone</Label>
                            <Input
                              id="edit-store-phone"
                              value={editingStore.phone || ""}
                              onChange={(e) =>
                                setEditingStore({ ...editingStore, phone: e.target.value })
                              }
                              placeholder="(11) 99999-9999"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-store-manager">Gerente</Label>
                            <Input
                              id="edit-store-manager"
                              value={editingStore.managerName || ""}
                              onChange={(e) =>
                                setEditingStore({ ...editingStore, managerName: e.target.value })
                              }
                              placeholder="Nome do gerente"
                            />
                          </div>

                          {/* Seção de Dispositivos Vinculados */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pt-4 border-t">
                              <Smartphone className="w-4 h-4 text-primary" />
                              <Label className="text-sm font-medium">Dispositivos Vinculados</Label>
                            </div>
                            
                            {storeDevices.length === 0 ? (
                              <div className="text-center py-6 bg-muted/20 rounded-lg">
                                <Smartphone className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  Nenhum dispositivo vinculado a esta loja
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {storeDevices.map((device: any) => (
                                  <div 
                                    key={device.id} 
                                    className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <Smartphone className="w-4 h-4 text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{device.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Tipo: {device.type || 'Biométrico'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {device.status === 'online' ? (
                                        <div className="flex items-center gap-1 text-green-600">
                                          <Wifi className="w-4 h-4" />
                                          <span className="text-xs">Online</span>
                                        </div>
                                      ) : device.status === 'maintenance' ? (
                                        <div className="flex items-center gap-1 text-yellow-600">
                                          <AlertTriangle className="w-4 h-4" />
                                          <span className="text-xs">Manutenção</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 text-red-600">
                                          <WifiOff className="w-4 h-4" />
                                          <span className="text-xs">Offline</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingStore(null)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() =>
                                updateStoreMutation.mutate({
                                  id: editingStore.id,
                                  data: {
                                    name: editingStore.name,
                                    address: editingStore.address,
                                    phone: editingStore.phone,
                                    managerName: editingStore.managerName,
                                  },
                                })
                              }
                              disabled={updateStoreMutation.isPending}
                            >
                              {updateStoreMutation.isPending ? "Salvando..." : "Salvar"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteConfirmStore(store)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>Tem certeza que deseja deletar a loja <strong>{store.name || store.nome_loja}</strong>?</p>
                        <p className="text-sm text-muted-foreground">
                          Esta ação não pode ser desfeita. Todos os dados relacionados a esta loja serão perdidos.
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setDeleteConfirmStore(null)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => deleteStoreMutation.mutate(store.id)}
                            disabled={deleteStoreMutation.isPending}
                          >
                            {deleteStoreMutation.isPending ? "Deletando..." : "Deletar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}