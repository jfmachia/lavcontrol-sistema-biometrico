import { useAuth } from "@/hooks/use-auth";
import { Shield, BarChart3, Users, Cpu, ClipboardList, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { Link } from "wouter";

const navItems = [
  { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { path: "/users", icon: Users, label: "Reconhecidos" },
  { path: "/devices", icon: Cpu, label: "Dispositivos" },
  { path: "/logs", icon: ClipboardList, label: "Logs de Acesso" },
  { path: "/alerts", icon: Bell, label: "Alertas" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
            <Shield className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-900">AccessControl</span>
        </div>
      </div>
      
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-300 text-gray-600">
              {user?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-gray-500 hover:text-gray-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
