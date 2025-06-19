export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  profilePic?: string;
  isCompleted: boolean;
  phoneNumber?: string;
  interests?: string[];
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
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
  uploadProfilePicture: (file: File) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
  phoneNumber?: string;
}
