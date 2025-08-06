import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Dashboard } from "@/components/dashboard";
import { UsersManagement } from "@/components/users-management";
import { AccessControl } from "@/components/access-control";
import { BiometryManagement } from "@/components/biometry-management";
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
    <div className="min-h-screen lavcontrol-gradient flex">
      <Navigation />
      <main className="flex-1 p-6">
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
      
      <Route path="/dashboard">
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
      
      <Route path="/devices">
        <ProtectedRoute>
          <StoresView />
        </ProtectedRoute>
      </Route>
      
      <Route path="/store/register">
        <ProtectedRoute>
          <StoresView />
        </ProtectedRoute>
      </Route>
      
      <Route path="/user/register">
        <ProtectedRoute>
          <UsersManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/access-control">
        <ProtectedRoute>
          <AccessControl />
        </ProtectedRoute>
      </Route>
      
      <Route path="/alerts">
        <ProtectedRoute>
          <AlertsView />
        </ProtectedRoute>
      </Route>
      
      <Route path="/biometry">
        <ProtectedRoute>
          <BiometryManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
