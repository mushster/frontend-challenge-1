import { makeAutoObservable } from "mobx";

export class AuthStore {
  isAuthenticated: boolean = false;
  username: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  login = async (username: string, password: string) => {
    this.isLoading = true;
    this.error = null;

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple validation
      if (password === "password") {
        this.isAuthenticated = true;
        this.username = username;
      } else {
        this.error = "Invalid credentials";
      }
    } catch (error) {
      this.error = "Login failed";
    } finally {
      this.isLoading = false;
    }
  };

  logout = () => {
    this.isAuthenticated = false;
    this.username = null;
  };
}

const authStore = new AuthStore();
export default authStore; 