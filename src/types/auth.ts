export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  profilePic?: string;
  isCompleted: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  showWelcomeModal: boolean;
}

export interface VerifyTokenCredentials {
  activationToken: string;
  activationCode: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<boolean>;
  verify: (credentials: VerifyTokenCredentials) => Promise<void>;
  clearError: () => void;
  hideWelcomeModal: () => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
  phoneNumber?: string;
}
