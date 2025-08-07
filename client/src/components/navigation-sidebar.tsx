import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Shield, 
  Fingerprint, 
  AlertTriangle, 
  Settings,
  BarChart3,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description: string;
  roles?: string[]; // Roles que podem acessar esta rota
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema',
    roles: ['admin', 'franqueado', 'tecnico']
  },
  {
    name: 'Lojas',
    href: '/stores',
    icon: Store,
    description: 'Gerenciar lojas e estabelecimentos',
    roles: ['admin', 'franqueado']
  },
  {
    name: 'Usuários',
    href: '/users',
    icon: Users,
    description: 'Gerenciar usuários do sistema',
    roles: ['admin', 'franqueado']
  },
  {
    name: 'Clientes',
    href: '/clients',
    icon: UserCheck,
    description: 'Clientes das lavanderias',
    roles: ['admin', 'franqueado']
  },
  {
    name: 'Gerenciar Usuários',
    href: '/users-management',
    icon: Users,
    description: 'Donos e administradores das lojas',
    roles: ['admin', 'franqueado']
  },
  {
    name: 'Controle de Acesso',
    href: '/access-control',
    icon: Shield,
    description: 'Controlar permissões de entrada',
    roles: ['admin', 'franqueado', 'tecnico']
  },
  {
    name: 'Biometria',
    href: '/biometry',
    icon: Fingerprint,
    description: 'Gerenciar dispositivos biométricos',
    roles: ['admin', 'tecnico']
  },
  {
    name: 'Dispositivos',
    href: '/devices',
    icon: Building,
    description: 'Cadastrar e gerenciar dispositivos',
    roles: ['admin', 'tecnico']
  },
  {
    name: 'Alertas',
    href: '/alerts',
    icon: AlertTriangle,
    description: 'Notificações e alertas do sistema',
    roles: ['admin', 'franqueado', 'tecnico']
  },
  {
    name: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    description: 'Relatórios e estatísticas',
    roles: ['admin', 'franqueado']
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
    description: 'Configurações do sistema',
    roles: ['admin']
  },
];

interface NavigationSidebarProps {
  className?: string;
}

// Componente para Header Dinâmico
function SystemHeader() {
  const { data: config } = useQuery({ queryKey: ["/api/config"] });
  const systemName = (config as any)?.sistema_nome || "LavControl";
  const logoUrl = (config as any)?.logo_url;
  const logoMarginTop = (config as any)?.logo_margin_top || 25;
  const logoMarginBottom = (config as any)?.logo_margin_bottom || 8;
  const logoSize = (config as any)?.logo_size || 48;
  const textMarginTop = (config as any)?.text_margin_top || 0;
  const textMarginBottom = (config as any)?.text_margin_bottom || 16;

  return (
    <div className="flex flex-col items-center">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="object-contain rounded"
          style={{
            height: `${logoSize}px`,
            width: `${logoSize}px`,
            marginTop: `${logoMarginTop}px`,
            marginBottom: `${logoMarginBottom}px`
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : (
        <Building 
          className="h-6 w-6 text-primary" 
          style={{
            marginTop: `${logoMarginTop}px`,
            marginBottom: `${logoMarginBottom}px`
          }}
        />
      )}
      <span 
        className="text-lg font-bold text-center"
        style={{
          marginTop: `${textMarginTop}px`,
          marginBottom: `${textMarginBottom}px`
        }}
      >
        {systemName}
      </span>
    </div>
  );
}

export function NavigationSidebar({ className }: NavigationSidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  // Filtrar itens baseado no role do usuário
  const filteredItems = navigationItems.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  return (
    <div className={cn("flex h-full flex-col bg-muted/20 overflow-hidden", className)}>
      {/* Logo/Header */}
      <div className="flex h-20 items-center justify-center border-b px-6">
        <SystemHeader />
      </div>

      {/* User Info */}
      {user && (
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 min-h-0 overflow-y-auto space-y-1 p-4" style={{scrollbarWidth: 'thin', scrollbarColor: '#4a5568 transparent'}}>
        {filteredItems.map((item) => {
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span>{item.name}</span>
                <span className="text-xs opacity-70">{item.description}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Role Badge */}
      {user?.role && (
        <div className="border-t p-4">
          <div className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            user.role === 'admin' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            user.role === 'franqueado' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            user.role === 'tecnico' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            user.role === 'utilizador' && "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          )}>
            {user.role === 'admin' && '🔧 Admin SaaS'}
            {user.role === 'franqueado' && '🏪 Cliente/Dono'}
            {user.role === 'tecnico' && '⚡ Técnico'}
            {user.role === 'utilizador' && '👤 Usuário'}
          </div>
        </div>
      )}
    </div>
  );
}