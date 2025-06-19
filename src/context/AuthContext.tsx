"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
  VerifyTokenCredentials,
} from "@/types/auth";
import Cookies from "js-cookie";
import { toast } from "@/hooks/toast/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
};
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get<{ customer: User }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/profile/get-details`,
        {
          headers: {
            // Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status == 401 || response.status == 403) {
        setState((prev) => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          loading: false,
        }));
        return;
      }
      const user = response.data.customer;
      // console.log(user);
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        loading: false,
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: axiosError.response?.data?.message || "Authentication failed",
      }));
      console.error("Auth check error:", axiosError);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/login`,
        credentials
      );
      const { accessToken, user } = response.data;
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        loading: false,
      }));

      router.push("/");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: axiosError.response?.data?.message || "Login failed",
      }));
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/register`,
        credentials
      );
      const { activationToken } = response.data;
      Cookies.set("activationToken", activationToken, {
        expires: 1,
        path: "/",
        sameSite: "strict",
      });

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${activationToken}`;

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        loading: false,
      }));

      router.push("/user/verify");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: axiosError.response?.data?.message || "Registration failed",
      }));
      throw error;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/logout`,
        null,
        {
          withCredentials: true,
        }
      );
      // console.log(response.data);
      if (response.status == 201) {
        toast({
          title: "Logout successful",
          description: "You have been logged out successfully.",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    } finally {
      setState({
        ...initialState,
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      router.push("/");
    }
    return true;
  };

  const verify = async (credentials: VerifyTokenCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/verify`,
        credentials
      );
      const { user, accessToken } = response.data;

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        loading: false,
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: axiosError.response?.data?.message || "Verification failed",
      }));
      throw error;
    }
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/profile/upload/images`,
        File,
        {
          withCredentials: true,
        }
      );

      console.log(response.data);

      setState((prev) => ({
        ...prev,
        user: prev.user
          ? { ...prev.user, profilePic: response.data.profilePic }
          : null,
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        error: axiosError.response?.data?.message || "Upload failed",
      }));
      throw error;
    }
  };

  const updateUser = async (data: Partial<User>): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/profile/update-profile`,
        data,
        {
          withCredentials: true,
        }
      );
      const updatedUser = response.data.customer;
      setState((prev) => ({
        ...prev,
        user: updatedUser,
        loading: false,
      }));
      checkAuth();
      router.push("/user/profile");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: axiosError.response?.data?.message || "Update failed",
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        verify,
        uploadProfilePicture,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
