
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiService, LoginRequest, RegisterRequest, User } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface AuthCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(apiService.isAuthenticated());
  const { toast } = useToast();

  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: apiService.login,
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Login successful",
        description: "You are now logged in.",
      });
    },
    onError: (error) => {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: apiService.register,
    onSuccess: (data) => {
      setUser(data);
      toast({
        title: "Registration successful",
        description: "Please log in with your new credentials.",
      });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      toast({
        title: "Registration failed",
        description: "This email might already be in use or there was a connection problem.",
        variant: "destructive",
      });
    },
  });

  const wrappedLogin = (credentials: LoginRequest, callbacks?: AuthCallbacks) => {
    login(credentials, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  const wrappedRegister = (userData: RegisterRequest, callbacks?: AuthCallbacks) => {
    register(userData, {
      onSuccess: (data) => {
        callbacks?.onSuccess?.();
      },
      onError: (error) => {
        callbacks?.onError?.(error);
      },
    });
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = apiService.isAuthenticated();
      setIsAuthenticated(isAuth);
    };

    checkAuth();
  }, []);

  return {
    user,
    isAuthenticated,
    login: wrappedLogin,
    register: wrappedRegister,
    logout,
    isLoggingIn,
    isRegistering,
  };
}
