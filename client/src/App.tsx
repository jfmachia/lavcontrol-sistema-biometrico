import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth.tsx";
import { useWebSocket } from "@/hooks/use-websocket";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { Dashboard } from "@/components/dashboard";
import { UsersManagement } from "@/components/users-management";
import { AccessControl } from "@/components/access-control";
import { BiometryManagement } from "@/components/biometry-management";
import { DeviceRegistration } from "@/components/device-registration";
import { Reports } from "@/pages/reports";
import { Settings } from "@/pages/settings";
import Login from "@/pages/login";
import Register from "@/pages/register";
import StoresView from "@/components/stores-view";
import AlertsView from "@/components/alerts-view";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen lavcontrol-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex dark">
      <NavigationSidebar className="w-64 border-r bg-card" />
      <main className="flex-1 p-6 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>
      
      <Route path="/register">
        <PublicRoute>
          <Register />
        </PublicRoute>
      </Route>
      
      {/* Rotas principais do sistema */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/stores">
        <ProtectedRoute>
          <StoresView />
        </ProtectedRoute>
      </Route>
      
      <Route path="/users">
        <ProtectedRoute>
          <UsersManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/access-control">
        <ProtectedRoute>
          <AccessControl />
        </ProtectedRoute>
      </Route>
      
      <Route path="/biometry">
        <ProtectedRoute>
          <BiometryManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/devices">
        <ProtectedRoute>
          <DeviceRegistration />
        </ProtectedRoute>
      </Route>
      
      <Route path="/alerts">
        <ProtectedRoute>
          <AlertsView />
        </ProtectedRoute>
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWebSocket(); // Initialize WebSocket connection
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="lavcontrol-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
