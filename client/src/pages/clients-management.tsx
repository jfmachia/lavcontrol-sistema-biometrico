import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, UserCheck, AlertTriangle, Star, Store, Phone, Mail, Edit, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreSelector } from "@/components/store-selector";

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  profile_image_url?: string;
  status: string;
  store_id?: number;
  store_name?: string;
  created_at: string;
  updated_at: string;
}

export default function ClientsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    profile_image_url: "",
    status: "active",
    store_id: null as number | null
  });

  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: stores = [] } = useQuery<any[]>({
    queryKey: ["/api/stores"],
  });

  const createClientMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/clients", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsAddDialogOpen(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        profile_image_url: "",
        status: "active",
        store_id: null
      });
      toast({
        title: "Cliente cadastrado",
        description: "O cliente foi cadastrado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível cadastrar o cliente.",
        variant: "destructive",
      });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/clients/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsEditDialogOpen(false);
      setEditingClient(null);
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o cliente.",
        variant: "destructive",
      });
    }
  });

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone?.includes(searchTerm) ||
                         client.cpf?.includes(searchTerm);
                         
    const matchesStore = selectedStoreId === null || client.store_id === selectedStoreId;
    
    return matchesSearch && matchesStore;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "ativo":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Ativo</Badge>;
      case "alert":
      case "amarelo":
      case "yellow":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"><AlertTriangle className="w-3 h-3 mr-1" />Alerta</Badge>;
      case "vip":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"><Star className="w-3 h-3 mr-1" />VIP</Badge>;
      case "blocked":
      case "bloqueado":
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500 dark:text-red-400">
          Erro ao carregar clientes: {error instanceof Error ? error.message : "Erro desconhecido"}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Clientes das Lavanderias
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os clientes que frequentam suas lavanderias
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === "active" || c.status === "ativo").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === "amarelo" || c.status === "yellow").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(c => c.status === "vip").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {/* <StoreSelector
              selectedStoreId={selectedStoreId}
              onStoreChange={setSelectedStoreId}
              placeholder="Filtrar por loja"
            /> */}
            <Button variant="outline" onClick={() => setSelectedStoreId(null)}>
              Todas as Lojas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {client.profile_image_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={client.profile_image_url}
                              alt={client.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-3 h-3 mr-1" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-3 h-3 mr-1" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {client.cpf || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Store className="w-3 h-3 mr-1" />
                        {client.store_name || `Loja ${client.store_id}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(client.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(client.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedClient(client)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Cliente</DialogTitle>
                            <DialogDescription>
                              Informações completas do cliente
                            </DialogDescription>
                          </DialogHeader>
                          {selectedClient && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                {selectedClient.profile_image_url ? (
                                  <img
                                    className="h-16 w-16 rounded-full"
                                    src={selectedClient.profile_image_url}
                                    alt={selectedClient.name}
                                  />
                                ) : (
                                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-white font-medium text-lg">
                                      {selectedClient.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-medium">{selectedClient.name}</h3>
                                  {getStatusBadge(selectedClient.status)}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <label className="font-medium text-gray-500">Email</label>
                                  <div>{selectedClient.email || "-"}</div>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-500">Telefone</label>
                                  <div>{selectedClient.phone || "-"}</div>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-500">CPF</label>
                                  <div>{selectedClient.cpf || "-"}</div>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-500">Loja</label>
                                  <div>{selectedClient.store_name || `Loja ${selectedClient.store_id}`}</div>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-500">Cadastro</label>
                                  <div>{new Date(selectedClient.created_at).toLocaleDateString("pt-BR")}</div>
                                </div>
                                <div>
                                  <label className="font-medium text-gray-500">Atualização</label>
                                  <div>{new Date(selectedClient.updated_at).toLocaleDateString("pt-BR")}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingClient(client);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm || selectedStoreId ? "Nenhum cliente encontrado com os filtros aplicados" : "Nenhum cliente cadastrado"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Altere as informações do cliente
            </DialogDescription>
          </DialogHeader>
          {editingClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input
                  id="name"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingClient.email || ""}
                  onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Telefone</Label>
                <Input
                  id="phone"
                  value={editingClient.phone || ""}
                  onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select
                  value={editingClient.status}
                  onValueChange={(value) => setEditingClient({...editingClient, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="alert">Alerta (Amarelo)</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="store" className="text-right">Loja</Label>
                <Select
                  value={editingClient.store_id?.toString() || ""}
                  onValueChange={(value) => setEditingClient({...editingClient, store_id: parseInt(value)})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store: any) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.nome_loja || store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (editingClient) {
                  updateClientMutation.mutate({
                    id: editingClient.id,
                    data: {
                      name: editingClient.name,
                      email: editingClient.email,
                      phone: editingClient.phone,
                      status: editingClient.status,
                      storeId: editingClient.store_id
                    }
                  });
                }
              }}
              disabled={updateClientMutation.isPending}
            >
              {updateClientMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Cliente */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Cadastre um novo cliente da lavanderia
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Seção de Imagem */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Foto</Label>
              <div className="col-span-3 space-y-2">
                {newClient.profile_image_url ? (
                  <div className="flex items-center space-x-2">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={newClient.profile_image_url}
                      alt="Preview"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewClient({...newClient, profile_image_url: ""})}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="URL da imagem"
                      value={newClient.profile_image_url}
                      onChange={(e) => setNewClient({...newClient, profile_image_url: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">Cole a URL da foto do cliente</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Nome */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">Nome *</Label>
              <Input
                id="new-name"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                className="col-span-3"
                placeholder="Nome completo"
              />
            </div>
            
            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-email" className="text-right">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                className="col-span-3"
                placeholder="email@exemplo.com"
              />
            </div>
            
            {/* Telefone */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-phone" className="text-right">Telefone</Label>
              <Input
                id="new-phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                className="col-span-3"
                placeholder="(11) 99999-9999"
              />
            </div>
            
            {/* CPF */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-cpf" className="text-right">CPF</Label>
              <Input
                id="new-cpf"
                value={newClient.cpf}
                onChange={(e) => setNewClient({...newClient, cpf: e.target.value})}
                className="col-span-3"
                placeholder="000.000.000-00"
              />
            </div>
            
            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-status" className="text-right">Status</Label>
              <Select
                value={newClient.status}
                onValueChange={(value) => setNewClient({...newClient, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="alert">Alerta (Amarelo)</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="blocked">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Loja */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-store" className="text-right">Loja</Label>
              <Select
                value={newClient.store_id?.toString() || ""}
                onValueChange={(value) => setNewClient({...newClient, store_id: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma loja" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store: any) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.nome_loja || store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewClient({
                  name: "",
                  email: "",
                  phone: "",
                  cpf: "",
                  profile_image_url: "",
                  status: "active",
                  store_id: null
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!newClient.name.trim()) {
                  toast({
                    title: "Campo obrigatório",
                    description: "O nome do cliente é obrigatório.",
                    variant: "destructive",
                  });
                  return;
                }
                
                createClientMutation.mutate({
                  name: newClient.name,
                  email: newClient.email || null,
                  phone: newClient.phone || null,
                  cpf: newClient.cpf || null,
                  profileImageUrl: newClient.profile_image_url || null,
                  status: newClient.status,
                  storeId: newClient.store_id
                });
              }}
              disabled={createClientMutation.isPending}
            >
              {createClientMutation.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}