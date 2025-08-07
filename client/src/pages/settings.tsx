import { useState, useEffect } from "react";
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

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["/api/config"],
  });

  const [settings, setSettings] = useState({
    sistema_nome: "LavControl",
    tema: "dark",
    idioma: "pt-BR",
    notificacoes_email: true,
    notificacoes_push: true,
    backup_automatico: true,
    manutencao: false,
    mqtt_broker: "broker.emqx.io",
    mqtt_port: 1883,
    mqtt_topic: "lavcontrol/devices",
    email_smtp_host: "",
    email_smtp_port: 587,
    email_user: ""
  });

  // Update settings when config loads
  useEffect(() => {
    if (config) {
      setSettings({
        sistema_nome: config.sistema_nome || "LavControl",
        tema: config.tema || "dark",
        idioma: config.idioma || "pt-BR",
        notificacoes_email: config.notificacoes_email ?? true,
        notificacoes_push: config.notificacoes_push ?? true,
        backup_automatico: config.backup_automatico ?? true,
        manutencao: config.manutencao ?? false,
        mqtt_broker: config.mqtt_broker || "broker.emqx.io",
        mqtt_port: config.mqtt_port || 1883,
        mqtt_topic: config.mqtt_topic || "lavcontrol/devices",
        email_smtp_host: config.email_smtp_host || "",
        email_smtp_port: config.email_smtp_port || 587,
        email_user: config.email_user || ""
      });
    }
  }, [config]);

  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/config", "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
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

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (configLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-600 rounded animate-pulse"></div>
          <div className="h-8 bg-slate-600 rounded w-48 animate-pulse"></div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="lavcontrol-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-slate-600 rounded w-32"></div>
                <div className="h-10 bg-slate-600 rounded"></div>
                <div className="h-10 bg-slate-600 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
            <p className="text-slate-400">Gerencie as configurações do sistema LavControl.</p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          className="lavcontrol-button-primary"
          disabled={saveSettingsMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {/* System Settings */}
      <Card className="lavcontrol-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sistema_nome" className="text-white">Nome do Sistema</Label>
              <Input
                id="sistema_nome"
                value={settings.sistema_nome}
                onChange={(e) => handleInputChange('sistema_nome', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idioma" className="text-white">Idioma</Label>
              <Input
                id="idioma"
                value={settings.idioma}
                onChange={(e) => handleInputChange('idioma', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Notificações por Email</Label>
                <p className="text-sm text-slate-400">
                  Receba notificações importantes por email
                </p>
              </div>
              <Switch
                checked={settings.notificacoes_email}
                onCheckedChange={(checked) => handleInputChange('notificacoes_email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Notificações Push</Label>
                <p className="text-sm text-slate-400">
                  Receba notificações push em tempo real
                </p>
              </div>
              <Switch
                checked={settings.notificacoes_push}
                onCheckedChange={(checked) => handleInputChange('notificacoes_push', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Backup Automático</Label>
                <p className="text-sm text-slate-400">
                  Criar backups automáticos do sistema
                </p>
              </div>
              <Switch
                checked={settings.backup_automatico}
                onCheckedChange={(checked) => handleInputChange('backup_automatico', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Modo Manutenção</Label>
                <p className="text-sm text-slate-400">
                  Coloque o sistema em modo manutenção
                </p>
              </div>
              <Switch
                checked={settings.manutencao}
                onCheckedChange={(checked) => handleInputChange('manutencao', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MQTT Settings */}
      <Card className="lavcontrol-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Configurações MQTT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mqtt_broker" className="text-white">Broker MQTT</Label>
              <Input
                id="mqtt_broker"
                value={settings.mqtt_broker}
                onChange={(e) => handleInputChange('mqtt_broker', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="broker.emqx.io"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mqtt_port" className="text-white">Porta</Label>
              <Input
                id="mqtt_port"
                type="number"
                value={settings.mqtt_port}
                onChange={(e) => handleInputChange('mqtt_port', parseInt(e.target.value) || 1883)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="mqtt_topic" className="text-white">Tópico MQTT</Label>
              <Input
                id="mqtt_topic"
                value={settings.mqtt_topic}
                onChange={(e) => handleInputChange('mqtt_topic', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="lavcontrol/devices"
              />
              <p className="text-sm text-slate-400">Tópico que o sistema irá escutar para comandos dos dispositivos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="lavcontrol-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configurações de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email_smtp_host" className="text-white">Servidor SMTP</Label>
              <Input
                id="email_smtp_host"
                value={settings.email_smtp_host}
                onChange={(e) => handleInputChange('email_smtp_host', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_smtp_port" className="text-white">Porta SMTP</Label>
              <Input
                id="email_smtp_port"
                type="number"
                value={settings.email_smtp_port}
                onChange={(e) => handleInputChange('email_smtp_port', parseInt(e.target.value) || 587)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="email_user" className="text-white">Email de Envio</Label>
              <Input
                id="email_user"
                type="email"
                value={settings.email_user}
                onChange={(e) => handleInputChange('email_user', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="noreply@lavcontrol.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}