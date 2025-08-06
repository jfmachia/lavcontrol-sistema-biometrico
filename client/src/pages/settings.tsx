import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Database, Shield, Bell, Mail, Webhook } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Settings() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Acesso Restrito</h3>
          <p className="text-muted-foreground">Apenas administradores podem acessar as configurações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema LavControl
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as opções básicas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input id="company-name" defaultValue="LavControl SaaS" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-email">E-mail do Administrador</Label>
                <Input id="admin-email" type="email" defaultValue="admin@lavcontrol.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Input id="timezone" defaultValue="America/Sao_Paulo" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
              </div>

              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações do Banco de Dados
              </CardTitle>
              <CardDescription>
                Informações sobre conexão e status da VPS PostgreSQL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Servidor</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary">212.85.1.24:5435</Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Online</Badge>
                  </div>
                </div>
                <div>
                  <Label>Banco de Dados</Label>
                  <div className="mt-1">
                    <Badge variant="secondary">postgres</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status da Conexão</Label>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">✅ Conectado com sucesso à VPS PostgreSQL</p>
                  <p className="text-xs text-green-600 mt-1">Última verificação: agora</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-muted-foreground">Usuários</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-2xl font-bold text-green-600">14</div>
                  <div className="text-sm text-muted-foreground">Lojas</div>
                </div>
                <div className="p-3 border rounded">
                  <div className="text-2xl font-bold text-orange-600">19</div>
                  <div className="text-sm text-muted-foreground">Dispositivos</div>
                </div>
              </div>

              <Button variant="outline">Testar Conexão</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Timeout de Sessão (horas)</Label>
                <Input id="session-timeout" type="number" defaultValue="24" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="two-factor" />
                <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="password-policy" defaultChecked />
                <Label htmlFor="password-policy">Política de Senha Forte</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="login-attempts" defaultChecked />
                <Label htmlFor="login-attempts">Limitar Tentativas de Login</Label>
              </div>

              <Button>Aplicar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="email-alerts" defaultChecked />
                  <Label htmlFor="email-alerts">Alertas por E-mail</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="device-offline" defaultChecked />
                  <Label htmlFor="device-offline">Dispositivos Offline</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="access-failed" defaultChecked />
                  <Label htmlFor="access-failed">Tentativas de Acesso Falharam</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="daily-reports" />
                  <Label htmlFor="daily-reports">Relatórios Diários</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-email">E-mail para Notificações</Label>
                <Input id="notification-email" type="email" defaultValue="alerts@lavcontrol.com" />
              </div>

              <Button>Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Integrações
              </CardTitle>
              <CardDescription>
                Configure integrações com sistemas externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">MQTT Broker</h4>
                  <div className="space-y-2">
                    <Input placeholder="broker.emqx.io" defaultValue="broker.emqx.io" />
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Conectado</Badge>
                      <span className="text-sm text-muted-foreground">Para comandos de dispositivos</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Webhook N8N</h4>
                  <div className="space-y-2">
                    <Input placeholder="https://n8n.example.com/webhook/lavcontrol" />
                    <p className="text-sm text-muted-foreground">
                      URL para envio de eventos de acesso e alertas
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">API Keys</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input type="password" placeholder="Chave API para integrações externas" />
                      <Button variant="outline">Gerar Nova</Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button>Salvar Integrações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}