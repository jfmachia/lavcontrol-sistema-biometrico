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
  Search
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StoresView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStore, setEditingStore] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: stores = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/stores"],
  });

  const { data: storeStats } = useQuery<any>({
    queryKey: ["/api/stores/statistics"],
  });

  const createStoreMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/stores", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setIsCreateDialogOpen(false);
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

  const filteredStores = stores?.filter((store: any) =>
    store.nome_loja?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.loja?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (store: any) => {
    if (store.status === "online") {
      return <Badge className="bg-green-500 text-white">Online</Badge>;
    }
    return <Badge variant="secondary">Offline</Badge>;
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
                <Label>Código da Loja</Label>
                <Input placeholder="LV001" />
              </div>
              <div>
                <Label>Nome da Loja</Label>
                <Input placeholder="Shopping Center ABC" />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input placeholder="Rua das Flores, 123" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button>Salvar</Button>
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
                    {store.nome_loja}
                  </CardTitle>
                  {getStatusBadge(store)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Código: {store.loja}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {store.telefone || "Sem telefone"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Criado em: {new Date(store.created_at || Date.now()).toLocaleDateString('pt-BR')}
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
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Loja</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome da Loja</Label>
                          <Input defaultValue={store.nome_loja} />
                        </div>
                        <div>
                          <Label>Telefone</Label>
                          <Input defaultValue={store.telefone} />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">Cancelar</Button>
                          <Button>Salvar</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}