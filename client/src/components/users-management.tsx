import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  Plus, 
  Search, 
  AlertTriangle, 
  Star, 
  Edit,
  Shield,
  Crown,
  Wrench
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["master", "franqueado", "tecnico"]),
  alertLevel: z.enum(["normal", "amarelo", "vip"])
});

type UserFormData = z.infer<typeof userSchema>;

export function UsersManagement() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const editForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema.omit({ password: true })),
    defaultValues: {
      name: "",
      email: "",
      role: "franqueado",
      alertLevel: "normal"
    }
  });

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "franqueado",
      alertLevel: "normal"
    }
  });

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => apiRequest("/api/users", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      form.reset();
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) =>
      apiRequest(`/api/users/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setSelectedUser(null);
      setIsEditDialogOpen(false);
      editForm.reset();
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/users/${id}/toggle-status`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    }
  });

  const onSubmit = (data: UserFormData) => {
    createUserMutation.mutate(data);
  };

  const onEditSubmit = (data: Partial<UserFormData>) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, data });
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      alertLevel: user.alert_level || user.alertLevel
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users?.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "master": return <Crown className="w-4 h-4" />;
      case "franqueado": return <Shield className="w-4 h-4" />;
      case "tecnico": return <Wrench className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "master": return "bg-purple-500/20 text-purple-400 border-purple-400/30";
      case "franqueado": return "bg-blue-500/20 text-blue-400 border-blue-400/30";
      case "tecnico": return "bg-orange-500/20 text-orange-400 border-orange-400/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-400/30";
    }
  };

  const getAlertBadge = (alertLevel: string) => {
    switch (alertLevel) {
      case "amarelo":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Alerta Amarelo
          </Badge>
        );
      case "vip":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
            <Star className="w-3 h-3 mr-1" />
            Cliente VIP
          </Badge>
        );
      default:
        return null;
    }
  };

  const updateUserAlert = (userId: number, alertLevel: "normal" | "amarelo" | "vip") => {
    updateUserMutation.mutate({ id: userId, data: { alertLevel } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Usuários</h1>
          <p className="text-slate-400">Gerencie usuários e configurações de alerta do sistema.</p>
        </div>

        {currentUser?.role !== "tecnico" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="lavcontrol-button-primary">
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="lavcontrol-card">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Nome</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Senha</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Função</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Selecione uma função" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {currentUser?.role === "master" && (
                              <SelectItem value="master">Master</SelectItem>
                            )}
                            <SelectItem value="franqueado">Franqueado</SelectItem>
                            <SelectItem value="tecnico">Técnico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alertLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Nível de Alerta</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Selecione o nível de alerta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="amarelo">Alerta Amarelo</SelectItem>
                            <SelectItem value="vip">Cliente VIP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full lavcontrol-button-primary" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="lavcontrol-card">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Usuário</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nome</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="bg-slate-700 border-slate-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Função</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione uma função" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          {currentUser?.role === "master" && (
                            <SelectItem value="admin">Admin</SelectItem>
                          )}
                          <SelectItem value="franqueado">Franqueado</SelectItem>
                          <SelectItem value="tecnico">Técnico</SelectItem>
                          <SelectItem value="utilizador">Utilizador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="alertLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nível de Alerta</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione o nível de alerta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="amarelo">Alerta Amarelo</SelectItem>
                          <SelectItem value="vip">Cliente VIP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 lavcontrol-button-primary" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => toggleUserStatusMutation.mutate(selectedUser?.id)}
                    className="flex-1"
                    disabled={toggleUserStatusMutation.isPending}
                  >
                    {selectedUser?.is_active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="lavcontrol-card border-0">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar usuários por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="lavcontrol-card border-0">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-slate-600 rounded-full mb-4"></div>
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-3 bg-slate-600 rounded mb-4"></div>
                  <div className="h-8 bg-slate-600 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers?.map((user: any) => (
            <Card key={user.id} className="lavcontrol-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{user.name}</h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  {currentUser?.role !== "tecnico" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Função:</span>
                    <Badge className={`border ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Status:</span>
                    <Badge className={user.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {getAlertBadge(user.alertLevel) && (
                    <div className="pt-2 border-t border-slate-700">
                      {getAlertBadge(user.alertLevel)}
                    </div>
                  )}

                  {currentUser?.role === "franqueado" && user.role !== "master" && (
                    <div className="pt-2 border-t border-slate-700">
                      <Label className="text-sm text-slate-400 mb-2 block">Configurar Alerta:</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={user.alertLevel === "normal" ? "default" : "outline"}
                          onClick={() => updateUserAlert(user.id, "normal")}
                          className="flex-1"
                        >
                          Normal
                        </Button>
                        <Button
                          size="sm"
                          variant={user.alertLevel === "amarelo" ? "default" : "outline"}
                          onClick={() => updateUserAlert(user.id, "amarelo")}
                          className="flex-1"
                        >
                          Amarelo
                        </Button>
                        <Button
                          size="sm"
                          variant={user.alertLevel === "vip" ? "default" : "outline"}
                          onClick={() => updateUserAlert(user.id, "vip")}
                          className="flex-1"
                        >
                          VIP
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}