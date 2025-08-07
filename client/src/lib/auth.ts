import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export class AuthService {
  private static TOKEN_KEY = "token";
  private static USER_KEY = "user";

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getUser(): AuthUser | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static setUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("/api/auth/login", "POST", { email, password });
    const result = await response.json();
    
    // Adaptar resposta do n8n { success: true, data: { user: {...}, token: "..." } }
    if (result.success && result.data) {
      const { user, token } = result.data;
      this.setToken(token);
      this.setUser(user);
      return { token, user };
    }
    
    throw new Error(result.error || 'Login failed');
  }

  static async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("/api/auth/register", "POST", { name, email, password });
    const result = await response.json();
    
    // Adaptar resposta do n8n { success: true, data: { user: {...}, token: "..." } }
    if (result.success && result.data) {
      const { user, token } = result.data;
      this.setToken(token);
      this.setUser(user);
      return { token, user };
    }
    
    throw new Error(result.error || 'Registration failed');
  }

  static logout(): void {
    this.removeToken();
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
