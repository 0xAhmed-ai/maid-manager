import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Login from "@/pages/Login";
import OwnerDashboard from "@/pages/OwnerDashboard";
import Tasks from "@/pages/Tasks";
import TaskDetail from "@/pages/TaskDetail";
import Maids from "@/pages/Maids";
import MaidTasks from "@/pages/MaidTasks";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { User } from "@shared/schema";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { setUser, setLanguage } = useApp();
  
  const { data, isLoading, isError } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      if (data.user.language) {
        setLanguage(data.user.language);
      }
    }
  }, [data, setUser, setLanguage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-ios-blue" />
      </div>
    );
  }

  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;
  return <>{children}</>;
}

function Router() {
  const { user } = useApp();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (user && location === "/") {
      navigate(user.role === "owner" ? "/dashboard" : "/my-tasks");
    }
  }, [user, location, navigate]);

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <OwnerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/tasks">
        <ProtectedRoute>
          <Tasks />
        </ProtectedRoute>
      </Route>
      <Route path="/tasks/:id">
        <ProtectedRoute>
          <TaskDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/maids">
        <ProtectedRoute>
          <Maids />
        </ProtectedRoute>
      </Route>
      <Route path="/my-tasks">
        <ProtectedRoute>
          <MaidTasks />
        </ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute>
          <Notifications />
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

function AppContent() {
  return (
    <AppProvider>
      <AuthBootstrap>
        <Toaster />
        <Router />
      </AuthBootstrap>
    </AppProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
