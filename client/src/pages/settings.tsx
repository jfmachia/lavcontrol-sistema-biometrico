import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell,
  Database,
  Wifi,
  Save,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    notifications: {
      accessAlerts: true,
      deviceOffline: true,
      systemUpdates: false,
      emailNotifications: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      autoLogout: true,
    },
    system: {
      simulateEntries: true,
      realTimeUpdates: true,
      debugMode: false,
      maintenanceMode: false,
    },
    mqtt: {
      broker: "broker.emqx.io",
      port: 1883,
      username: "",
      password: "",
      topic: "lavcontrol/devices",
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/settings", "POST", data),
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: () => apiRequest("/api/mqtt/test", "POST", {}),
    onSuccess: () => {
      toast({
        title: "Conexão testada",
        description: "A conexão MQTT está funcionando corretamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na conexão",
        description: error.message || "Não foi possível conectar ao broker MQTT.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema LavControl
          </p>
        </div>
        <SettingsIcon className="h-8 w-8 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={user?.name || ""} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <Label>Função</Label>
              <Input value={user?.role || ""} disabled />
            </div>
            <Button variant="outline" className="w-full">
              <User className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Alertas de Acesso</Label>
              <Switch
                checked={settings.notifications.accessAlerts}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, accessAlerts: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Dispositivos Offline</Label>
              <Switch
                checked={settings.notifications.deviceOffline}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, deviceOffline: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Atualizações do Sistema</Label>
              <Switch
                checked={settings.notifications.systemUpdates}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, systemUpdates: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notificações por Email</Label>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, emailNotifications: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Autenticação de Dois Fatores</Label>
              <Switch
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorAuth: checked }
                  }))
                }
              />
            </div>
            <div>
              <Label>Timeout da Sessão (minutos)</Label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Logout Automático</Label>
              <Switch
                checked={settings.security.autoLogout}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, autoLogout: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Simular Entradas</Label>
              <Switch
                checked={settings.system.simulateEntries}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, simulateEntries: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Atualizações em Tempo Real</Label>
              <Switch
                checked={settings.system.realTimeUpdates}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, realTimeUpdates: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Modo Debug</Label>
              <Switch
                checked={settings.system.debugMode}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, debugMode: checked }
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Modo Manutenção</Label>
              <Switch
                checked={settings.system.maintenanceMode}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, maintenanceMode: checked }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações MQTT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Configurações MQTT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Broker MQTT</Label>
              <Input
                value={settings.mqtt.broker}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    mqtt: { ...prev.mqtt, broker: e.target.value }
                  }))
                }
                placeholder="broker.emqx.io"
              />
            </div>
            <div>
              <Label>Porta</Label>
              <Input
                type="number"
                value={settings.mqtt.port}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    mqtt: { ...prev.mqtt, port: parseInt(e.target.value) }
                  }))
                }
                placeholder="1883"
              />
            </div>
            <div>
              <Label>Usuário</Label>
              <Input
                value={settings.mqtt.username}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    mqtt: { ...prev.mqtt, username: e.target.value }
                  }))
                }
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                value={settings.mqtt.password}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    mqtt: { ...prev.mqtt, password: e.target.value }
                  }))
                }
                placeholder="Opcional"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Tópico Base</Label>
              <Input
                value={settings.mqtt.topic}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    mqtt: { ...prev.mqtt, topic: e.target.value }
                  }))
                }
                placeholder="lavcontrol/devices"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Testar Conexão
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}