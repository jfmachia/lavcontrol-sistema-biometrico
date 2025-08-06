import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Search, 
  Crown,
  AlertTriangle, 
  Shield,
  Edit2,
  UserCheck,
  UserX,
  Filter
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StoreSelector } from "@/components/store-selector";

export default function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ["/api/stores"],
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/users/${id}`, "PATCH", data),
    onSuccess: () => {
      // Forçar atualização completa dos dados
      queryClient.removeQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });
      
      // Forçar recarregamento da página após 1 segundo para garantir atualização
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  });

  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.alertLevel === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (alertLevel: string, isBlocked: boolean, isActive: boolean) => {
    if (isBlocked) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <UserX className="w-3 h-3" />
        Bloqueado
      </Badge>;
    }
    
    if (!isActive) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <UserX className="w-3 h-3" />
        Inativo
      </Badge>;
    }

    switch (alertLevel) {
      case "vip":
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-1">
          <Crown className="w-3 h-3" />
          VIP
        </Badge>;
      case "amarelo":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Alerta
        </Badge>;
      default:
        return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950 flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          Normal
        </Badge>;
    }
  };

  const getStatusStats = () => {
    const stats = {
      total: filteredUsers.length,
      normal: filteredUsers.filter(u => u.alertLevel === "normal" && !u.isBlocked && u.isActive).length,
      amarelo: filteredUsers.filter(u => u.alertLevel === "amarelo" && !u.isBlocked && u.isActive).length,
      vip: filteredUsers.filter(u => u.alertLevel === "vip" && !u.isBlocked && u.isActive).length,
      bloqueados: filteredUsers.filter(u => u.isBlocked).length,
      inativos: filteredUsers.filter(u => !u.isActive && !u.isBlocked).length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Clientes</h1>
          <p className="text-muted-foreground">
            Edite status, perfis e configurações dos usuários
          </p>
        </div>
        <Users className="h-8 w-8 text-primary" />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
            <div className="text-xs text-muted-foreground">Normal</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.amarelo}</div>
            <div className="text-xs text-muted-foreground">Alerta</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.vip}</div>
            <div className="text-xs text-muted-foreground">VIP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.bloqueados}</div>
            <div className="text-xs text-muted-foreground">Bloqueados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.inativos}</div>
            <div className="text-xs text-muted-foreground">Inativos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filtrar por status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="amarelo">Alerta Amarelo</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filtrar por loja</Label>
              <StoreSelector 
                selectedStores={selectedStoreId ? [selectedStoreId] : []}
                onStoreChange={(stores) => setSelectedStoreId(stores.length > 0 ? stores[0] : null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(user.alertLevel, user.isBlocked, user.isActive)}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                        </DialogHeader>
                        {editingUser && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Nome do Cliente</Label>
                              <Input
                                id="edit-name"
                                value={editingUser.name || ""}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, name: e.target.value })
                                }
                                placeholder="Nome completo"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-email">Email do Cliente</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editingUser.email || ""}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, email: e.target.value })
                                }
                                placeholder="email@exemplo.com"
                              />
                            </div>

                            <div>
                              <Label>Classificação do Cliente</Label>
                              <Select
                                value={editingUser.alertLevel}
                                onValueChange={(value) =>
                                  setEditingUser({ ...editingUser, alertLevel: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">✓ Cliente Normal</SelectItem>
                                  <SelectItem value="amarelo">⚠️ Alerta Amarelo</SelectItem>
                                  <SelectItem value="vip">👑 Cliente VIP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="blocked">Usuário Bloqueado</Label>
                              <Switch
                                id="blocked"
                                checked={editingUser.isBlocked || false}
                                onCheckedChange={(checked) =>
                                  setEditingUser({ ...editingUser, isBlocked: checked })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="active">Usuário Ativo</Label>
                              <Switch
                                id="active"
                                checked={editingUser.isActive !== false}
                                onCheckedChange={(checked) =>
                                  setEditingUser({ ...editingUser, isActive: checked })
                                }
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() =>
                                  updateUserMutation.mutate({
                                    id: editingUser.id,
                                    data: {
                                      name: editingUser.name,
                                      email: editingUser.email,
                                      alertLevel: editingUser.alertLevel,
                                      isBlocked: editingUser.isBlocked || false,
                                      isActive: editingUser.isActive !== false,
                                    },
                                  })
                                }
                                disabled={updateUserMutation.isPending}
                              >
                                {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}