import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Smartphone, 
  Shield, 
  AlertTriangle,
  Settings,
  LogOut,
  Fingerprint,
  Plus,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["master", "franqueado"]
    },
    {
      label: "Lojas",
      href: "/stores",
      icon: Store,
      roles: ["master", "franqueado"]
    },
    {
      label: "Cadastrar Loja",
      href: "/store/register",
      icon: Plus,
      roles: ["master"]
    },
    {
      label: "Usuários",
      href: "/users",
      icon: Users,
      roles: ["master", "franqueado"]
    },
    {
      label: "Cadastrar Usuário",
      href: "/user/register",
      icon: UserPlus,
      roles: ["master", "franqueado"]
    },
    {
      label: "Dispositivos",
      href: "/devices",
      icon: Smartphone,
      roles: ["master", "franqueado", "tecnico"]
    },
    {
      label: "Controle de Acesso",
      href: "/access-control",
      icon: Shield,
      roles: ["master", "franqueado"]
    },
    {
      label: "Alertas",
      href: "/alerts",
      icon: AlertTriangle,
      roles: ["master", "franqueado"]
    },
    {
      label: "Biometria",
      href: "/biometry",
      icon: Fingerprint,
      roles: ["tecnico"]
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="lavcontrol-gradient min-h-screen w-64 p-4 border-r border-slate-700/50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 p-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold lavcontrol-text-gradient">LavControl</h1>
          <p className="text-xs text-slate-400">Sistema de Controle de Acesso</p>
        </div>
      </div>

      {/* User Info */}
      <div className="lavcontrol-card p-4 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {filteredItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-12 ${
                  isActive 
                    ? "lavcontrol-button-primary text-white" 
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="mt-auto space-y-2">
        <Link href="/settings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 h-12 text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}