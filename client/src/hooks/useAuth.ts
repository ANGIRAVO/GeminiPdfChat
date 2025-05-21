import { useState, useEffect } from "react";
import { 
  getCurrentUser, 
  loginUser, 
  registerUser, 
  logoutUser, 
  User, 
  LoginCredentials, 
  RegisterCredentials 
} from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to authenticate. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await loginUser(credentials);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await registerUser(credentials);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}
