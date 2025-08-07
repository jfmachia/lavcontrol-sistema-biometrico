import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, Building } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

// Componente para Header do Sistema no Login
function LoginSystemHeader() {
  const { data: config, isLoading, error } = useQuery({ 
    queryKey: ["/api/config"],
    queryFn: async () => {
      const response = await fetch("/api/config");
      if (!response.ok) throw new Error("Failed to fetch config");
      return response.json();
    },
    retry: false,
  });
  
  // Debug para verificar se está carregando os dados
  console.log("Login - Config data:", config);
  console.log("Login - Loading:", isLoading);
  console.log("Login - Error:", error);
  
  const systemName = (config as any)?.sistema_nome || "LavControl";
  const logoUrl = (config as any)?.logo_url;

  return (
    <div className="text-center">
      {logoUrl ? (
        <div className="mx-auto mb-4">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="object-contain rounded mx-auto"
            style={{
              height: "48px",
              width: "auto",
              maxWidth: "120px"
            }}
            onError={(e) => {
              // Fallback para o ícone padrão se a imagem falhar
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
              if (fallback) {
                fallback.classList.remove('hidden');
              }
            }}
          />
          <div className="fallback-icon hidden mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <Building className="text-white h-6 w-6" />
          </div>
        </div>
      ) : (
        <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
          <Building className="text-white h-6 w-6" />
        </div>
      )}
      <h2 className="mt-6 text-3xl font-bold text-gray-900">{systemName}</h2>
      <p className="mt-2 text-sm text-gray-600">Entre na sua conta para acessar o sistema</p>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando para o dashboard...",
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <LoginSystemHeader />
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember-me" className="text-sm">Lembrar de mim</Label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary/80">
                    Esqueceu a senha?
                  </a>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">Não tem uma conta? </span>
                <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                  Registre-se
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
