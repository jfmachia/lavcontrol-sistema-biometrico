import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Edit, 
  Shield, 
  AlertTriangle, 
  Crown, 
  Search,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';

const editUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  isBlocked: z.boolean(),
  alertLevel: z.enum(['normal', 'amarelo', 'vip']),
  isActive: z.boolean(),
});

type EditUserForm = z.infer<typeof editUserSchema>;

interface User {
  id: number;
  name: string;
  email: string;
  isBlocked?: boolean;
  alertLevel?: 'normal' | 'amarelo' | 'vip';
  isActive: boolean;
  createdAt: string;
}

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked' | 'vip' | 'alert'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const editUserMutation = useMutation({
    mutationFn: async (data: { userId: number; updates: Partial<EditUserForm> }) => {
      return await apiRequest(`/api/users/${data.userId}`, 'PATCH', data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Usuário Atualizado",
        description: "As informações do usuário foram atualizadas com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Atualizar",
        description: error.message || "Falha ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const form = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      isBlocked: false,
      alertLevel: 'normal',
      isActive: true,
    },
  });

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filterStatus) {
      case 'active':
        return matchesSearch && user.isActive && !user.isBlocked;
      case 'blocked':
        return matchesSearch && user.isBlocked;
      case 'vip':
        return matchesSearch && user.alertLevel === 'vip';
      case 'alert':
        return matchesSearch && user.alertLevel === 'amarelo';
      default:
        return matchesSearch;
    }
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      isBlocked: user.isBlocked || false,
      alertLevel: user.alertLevel || 'normal',
      isActive: user.isActive,
    });
  };

  const onSubmit = (data: EditUserForm) => {
    if (!editingUser) return;
    
    editUserMutation.mutate({
      userId: editingUser.id,
      updates: data,
    });
  };

  const getStatusBadge = (user: User) => {
    if (user.isBlocked) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <UserX className="w-3 h-3" />
        Bloqueado
      </Badge>;
    }
    
    if (user.alertLevel === 'vip') {
      return <Badge className="bg-purple-500 hover:bg-purple-600 flex items-center gap-1">
        <Crown className="w-3 h-3" />
        VIP
      </Badge>;
    }
    
    if (user.alertLevel === 'amarelo') {
      return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Alerta
      </Badge>;
    }
    
    if (user.isActive) {
      return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
        <UserCheck className="w-3 h-3" />
        Ativo
      </Badge>;
    }
    
    return <Badge variant="outline">Inativo</Badge>;
  };

  const getStatusCount = (status: string) => {
    switch (status) {
      case 'active':
        return users.filter(u => u.isActive && !u.isBlocked).length;
      case 'blocked':
        return users.filter(u => u.isBlocked).length;
      case 'vip':
        return users.filter(u => u.alertLevel === 'vip').length;
      case 'alert':
        return users.filter(u => u.alertLevel === 'amarelo').length;
      default:
        return users.length;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Gerenciar Clientes
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie status, bloqueios e níveis de alerta dos usuários
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{getStatusCount('all')}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-500">{getStatusCount('active')}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados</p>
                <p className="text-2xl font-bold text-red-500">{getStatusCount('blocked')}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VIP</p>
                <p className="text-2xl font-bold text-purple-500">{getStatusCount('vip')}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-yellow-500">{getStatusCount('alert')}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({getStatusCount('all')})</SelectItem>
                <SelectItem value="active">Ativos ({getStatusCount('active')})</SelectItem>
                <SelectItem value="blocked">Bloqueados ({getStatusCount('blocked')})</SelectItem>
                <SelectItem value="vip">VIP ({getStatusCount('vip')})</SelectItem>
                <SelectItem value="alert">Alertas ({getStatusCount('alert')})</SelectItem>
              </SelectContent>
            </Select>
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
              Nenhum usuário encontrado com os filtros selecionados
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Criado em {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(user)}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                        </DialogHeader>
                        
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <Separator />

                            <FormField
                              control={form.control}
                              name="alertLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nível do Cliente</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="normal">Normal</SelectItem>
                                      <SelectItem value="amarelo">Alerta Amarelo</SelectItem>
                                      <SelectItem value="vip">VIP</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            <div className="flex items-center justify-between">
                              <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="!mt-0">Usuário Ativo</FormLabel>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="isBlocked"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="!mt-0 text-red-600">Bloqueado</FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <DialogTrigger asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogTrigger>
                              <Button 
                                type="submit" 
                                disabled={editUserMutation.isPending}
                              >
                                {editUserMutation.isPending ? 'Salvando...' : 'Salvar'}
                              </Button>
                            </div>
                          </form>
                        </Form>
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