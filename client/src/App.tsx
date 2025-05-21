import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { AuthModal } from "@/components/auth/AuthModal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuth, setShowAuth] = useState<boolean>(false);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setShowAuth(true);
        }
      } catch (error) {
        console.error('Failed to check authentication:', error);
        setShowAuth(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    setShowAuth(false);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setIsAuthenticated(false);
      setShowAuth(true);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {isAuthenticated ? (
          <Router />
        ) : (
          <AuthModal isOpen={showAuth} onSuccess={handleLogin} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
