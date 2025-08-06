import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Clock, 
  DollarSign, 
  Phone, 
  Wifi, 
  MapPin, 
  User,
  Save,
  Building2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StoreSettingsProps {
  storeId: number;
}

export default function StoreSettings({ storeId }: StoreSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: store, isLoading } = useQuery<any>({
    queryKey: ["/api/stores", storeId],
    queryFn: async () => {
      const response = await apiRequest(`/api/stores/${storeId}`, 'GET');
      return await response.json();
    },
  });

  const [settings, setSettings] = useState({
    // Informações Básicas
    name: "",
    address: "",
    phone: "",
    managerName: "",
    whatsAtendimento: "",
    
    // Horários de Funcionamento
    horarioSegSex: "",
    horarioSabado: "",
    horarioDom: "",
    
    // Preços dos Serviços
    valorLv: "",
    valorS: "",
    valorLv2: "",
    valorS2: "",
    
    // Configurações Técnicas
    senhaPorta: "",
    senhaWifi: "",
    biometria: "",
    
    // Serviços Extras
    estacionamento: false,
    delivery: false,
    cashBack: "",
    cupons: "",
    
    // Observações
    observacoes: "",
    pontoReferencia: "",
    promocao: "",
  });

  // Atualizar state quando dados carregarem
  React.useEffect(() => {
    if (store) {
      setSettings({
        name: store.name || store.nomeLoja || "",
        address: store.address || store.endereco || "",
        phone: store.phone || "",
        managerName: store.managerName || store.manager || "",
        whatsAtendimento: store.whatsAtendimento || "",
        horarioSegSex: store.horarioSegSex || "06:00-22:00",
        horarioSabado: store.horarioSabado || "08:00-20:00",
        horarioDom: store.horarioDom || "10:00-18:00",
        valorLv: store.valorLv || "0.00",
        valorS: store.valorS || "0.00",
        valorLv2: store.valorLv2 || "0.00",
        valorS2: store.valorS2 || "0.00",
        senhaPorta: store.senhaPorta || "",
        senhaWifi: store.senhaWifi || "",
        biometria: store.biometria || "",
        estacionamento: store.estacionamento || false,
        delivery: store.delivery || false,
        cashBack: store.cashBack || "",
        cupons: store.cupons || "",
        observacoes: store.observacoes || "",
        pontoReferencia: store.pontoReferencia || "",
        promocao: store.promocao || "",
      });
    }
  }, [store]);

  const updateStoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(`/api/stores/${storeId}`, "PATCH", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores", storeId] });
      toast({
        title: "Configurações salvas",
        description: "As configurações da loja foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateStoreMutation.mutate(settings);
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações da Loja: {store?.name || store?.nomeLoja}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Básicas</TabsTrigger>
              <TabsTrigger value="schedule">Horários</TabsTrigger>
              <TabsTrigger value="pricing">Preços</TabsTrigger>
              <TabsTrigger value="technical">Técnicas</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
            </TabsList>

            {/* Informações Básicas */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Loja</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nome da lavanderia"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="managerName">Gerente</Label>
                  <Input
                    id="managerName"
                    value={settings.managerName}
                    onChange={(e) => handleInputChange('managerName', e.target.value)}
                    placeholder="Nome do gerente"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsAtendimento">WhatsApp Atendimento</Label>
                  <Input
                    id="whatsAtendimento"
                    value={settings.whatsAtendimento}
                    onChange={(e) => handleInputChange('whatsAtendimento', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua das Flores, 123 - Centro"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="pontoReferencia">Ponto de Referência</Label>
                  <Input
                    id="pontoReferencia"
                    value={settings.pontoReferencia}
                    onChange={(e) => handleInputChange('pontoReferencia', e.target.value)}
                    placeholder="Próximo ao shopping..."
                  />
                </div>
              </div>
            </TabsContent>

            {/* Horários de Funcionamento */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horarioSegSex">Segunda a Sexta</Label>
                  <Input
                    id="horarioSegSex"
                    value={settings.horarioSegSex}
                    onChange={(e) => handleInputChange('horarioSegSex', e.target.value)}
                    placeholder="06:00-22:00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horarioSabado">Sábado</Label>
                  <Input
                    id="horarioSabado"
                    value={settings.horarioSabado}
                    onChange={(e) => handleInputChange('horarioSabado', e.target.value)}
                    placeholder="08:00-20:00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="horarioDom">Domingo</Label>
                  <Input
                    id="horarioDom"
                    value={settings.horarioDom}
                    onChange={(e) => handleInputChange('horarioDom', e.target.value)}
                    placeholder="10:00-18:00"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Preços dos Serviços */}
            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorLv">Lavagem (R$)</Label>
                  <Input
                    id="valorLv"
                    value={settings.valorLv}
                    onChange={(e) => handleInputChange('valorLv', e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valorS">Secagem (R$)</Label>
                  <Input
                    id="valorS"
                    value={settings.valorS}
                    onChange={(e) => handleInputChange('valorS', e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valorLv2">Lavagem 2 (R$)</Label>
                  <Input
                    id="valorLv2"
                    value={settings.valorLv2}
                    onChange={(e) => handleInputChange('valorLv2', e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valorS2">Secagem 2 (R$)</Label>
                  <Input
                    id="valorS2"
                    value={settings.valorS2}
                    onChange={(e) => handleInputChange('valorS2', e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cashBack">Cash Back (%)</Label>
                  <Input
                    id="cashBack"
                    value={settings.cashBack}
                    onChange={(e) => handleInputChange('cashBack', e.target.value)}
                    placeholder="5%"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cupons">Cupons Disponíveis</Label>
                  <Input
                    id="cupons"
                    value={settings.cupons}
                    onChange={(e) => handleInputChange('cupons', e.target.value)}
                    placeholder="DESCONTO10"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Configurações Técnicas */}
            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaPorta">Senha da Porta</Label>
                  <Input
                    id="senhaPorta"
                    value={settings.senhaPorta}
                    onChange={(e) => handleInputChange('senhaPorta', e.target.value)}
                    placeholder="123456"
                    type="password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senhaWifi">Senha do WiFi</Label>
                  <Input
                    id="senhaWifi"
                    value={settings.senhaWifi}
                    onChange={(e) => handleInputChange('senhaWifi', e.target.value)}
                    placeholder="senha123"
                    type="password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="biometria">Sistema Biométrico</Label>
                  <Input
                    id="biometria"
                    value={settings.biometria}
                    onChange={(e) => handleInputChange('biometria', e.target.value)}
                    placeholder="Ativo/Inativo"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Serviços Extras */}
            <TabsContent value="services" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="estacionamento"
                    checked={settings.estacionamento}
                    onCheckedChange={(checked) => handleInputChange('estacionamento', checked)}
                  />
                  <Label htmlFor="estacionamento">Estacionamento Disponível</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="delivery"
                    checked={settings.delivery}
                    onCheckedChange={(checked) => handleInputChange('delivery', checked)}
                  />
                  <Label htmlFor="delivery">Serviço de Delivery</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="promocao">Promoções Ativas</Label>
                  <Textarea
                    id="promocao"
                    value={settings.promocao}
                    onChange={(e) => handleInputChange('promocao', e.target.value)}
                    placeholder="Descreva as promoções ativas..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações Gerais</Label>
                  <Textarea
                    id="observacoes"
                    value={settings.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Informações adicionais sobre a loja..."
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botão de Salvar */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              onClick={handleSave} 
              disabled={updateStoreMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateStoreMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}