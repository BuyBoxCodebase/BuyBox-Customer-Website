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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
  showWelcomeModal: false,
};

// Helper function to set token in both localStorage and cookies
const setAuthToken = (token: string, expiryDays = 7) => {
  // Set in localStorage
  localStorage.setItem("token", token);

  // Set in cookies for server-side access
  Cookies.set("token", token, {
    expires: expiryDays,
    path: "/",
    sameSite: "strict",
  });

  // Set for axios requests
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Helper function to set access and refresh tokens
const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("token", accessToken);
  
  Cookies.set("accessToken", accessToken, {
    expires: 7,
    path: "/",
    sameSite: "strict",
  });
  Cookies.set("refreshToken", refreshToken, {
    expires: 7,
    path: "/",
    sameSite: "strict",
  });
  Cookies.set("token", accessToken, {
    expires: 7,
    path: "/",
    sameSite: "strict",
  });
  axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
};

// Helper function to remove token from both places
const removeAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  
  Cookies.remove("token", { path: "/" });
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });
  
  delete axios.defaults.headers.common["Authorization"];
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }
    console.log(refreshToken)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = await response.json();

    setAuthTokens(accessToken, newRefreshToken || refreshToken);
    
    return accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  const router = useRouter();

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("accessToken");
        const token = localStorage.getItem("token");
        const authToken = accessToken || token;
        
        if (authToken) {
          config.headers["Authorization"] = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } else {
            // Refresh failed, logout user
            removeAuthToken();
            setState({
              ...initialState,
              user: null,
              isAuthenticated: false,
              loading: false,
              showWelcomeModal: false,
            });
            router.push("/user/login");
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const accessToken = localStorage.getItem("accessToken");
      
      const authToken = accessToken || token;
      
      if (authToken) {
        try {
          const response = await axios.get<{ customer: User }>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/profile/get-details`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );

          setState((prev) => ({
            ...prev,
            user: response.data.customer,
            isAuthenticated: true,
            loading: false,
            showWelcomeModal: false,
          }));

          // Ensure token is set in cookies too
          if (accessToken) {
            Cookies.set("accessToken", accessToken, {
              expires: 7,
              path: "/",
              sameSite: "strict",
            });
          } else if (token) {
            Cookies.set("token", token, {
              expires: 7,
              path: "/",
              sameSite: "strict",
            });
          }
        } catch (error) {
          // If request fails with 401, try to refresh
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 401 && accessToken) {
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
              // Retry with new token
              await checkAuth();
              return;
            }
          }
          throw error;
        }
      } else {
        setState((prev) => ({ ...prev, loading: false, showWelcomeModal: false }));
      }
    } catch (error) {
      removeAuthToken();
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        loading: false,
        showWelcomeModal: false,
      }));
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/login`,
        credentials
      );
      const { accessToken, refreshToken, user } = response.data;

      // Set both access and refresh tokens
      if (refreshToken) {
        setAuthTokens(accessToken, refreshToken);
      } else {
        setAuthToken(accessToken);
      }

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        loading: false,
        showWelcomeModal: true,
      }));

      router.push("/");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: axiosError.response?.data?.message || "Login failed",
        showWelcomeModal: false,
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

      // Set activation token in both places
      localStorage.setItem("activationToken", activationToken);
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
        showWelcomeModal: false,
      }));

      router.push("/user/verify");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: axiosError.response?.data?.message || "Registration failed",
        showWelcomeModal: false,
      }));
      throw error;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    } finally {
      // Remove token from both places
      removeAuthToken();
      Cookies.remove("activationToken", { path: "/" });
      localStorage.removeItem("activationToken");

      setState({
        ...initialState,
        user: null,
        isAuthenticated: false,
        loading: false,
        showWelcomeModal: false,
      });
      router.push("/user/login");
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

      // Set token in both localStorage and cookies
      setAuthToken(accessToken);

      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        loading: false,
        showWelcomeModal: false,
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: axiosError.response?.data?.message || "Verification failed",
        showWelcomeModal: false,
      }));
      throw error;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const hideWelcomeModal = () => {
    setState((prev) => ({ ...prev, showWelcomeModal: false }));
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
        hideWelcomeModal,
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
