import { create } from "zustand";
import { keycloak } from "../auth/keycloak";

type AuthStatus = "idle" | "initializing" | "authenticated" | "unauthenticated" | "error";

type AuthState = {
  keycloak: typeof keycloak;
  status: AuthStatus;
  isAuthenticated: boolean;
  token?: string;
  tokenParsed?: Record<string, any>;
  error?: unknown;

  init: () => Promise<boolean>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: (minValidity?: number) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set:any, get:any) => ({
  keycloak,
  status: "idle",
  isAuthenticated: false,
  token: undefined,
  tokenParsed: undefined,
  error: undefined,

  init: async () => {
    const { keycloak } = get();

    if (get().status === "initializing" || get().status === "authenticated" || get().status === "unauthenticated") {
      return get().isAuthenticated;
    }

    set({ status: "initializing", error: undefined });

    try {
      const authenticated = await keycloak.init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        checkLoginIframe: false,
      });

      set({
        isAuthenticated: authenticated,
        status: authenticated ? "authenticated" : "unauthenticated",
        token: keycloak.token,
        tokenParsed: (keycloak.tokenParsed as any) ?? undefined,
      });

      keycloak.onAuthSuccess = () =>
        set({
          isAuthenticated: true,
          status: "authenticated",
          token: keycloak.token,
          tokenParsed: (keycloak.tokenParsed as any) ?? undefined,
        });

      keycloak.onAuthLogout = () =>
        set({
          isAuthenticated: false,
          status: "unauthenticated",
          token: undefined,
          tokenParsed: undefined,
        });

      keycloak.onTokenExpired = async () => {
        const ok = await get().refreshToken(30).catch(() => false);
        if (!ok) {
          set({
            isAuthenticated: false,
            status: "unauthenticated",
            token: undefined,
            tokenParsed: undefined,
          });
        }
      };

      keycloak.onAuthError = (err) => set({ status: "error", error: err });

      return authenticated;
    } catch (err) {
      set({ status: "error", error: err, isAuthenticated: false });
      return false;
    }
  },

  login: async () => {
    await get().keycloak.login({ redirectUri: window.location.origin });
  },

  logout: async () => {await get().keycloak.logout({ redirectUri: window.location.origin });await get().keycloak.logout({ redirectUri: window.location.origin });
  },

  refreshToken: async (minValidity = 30) => {
    const { keycloak } = get();
    const refreshed = await keycloak.updateToken(minValidity);
    set({
      token: keycloak.token,
      tokenParsed: (keycloak.tokenParsed as any) ?? undefined,
      isAuthenticated: !!keycloak.authenticated,
      status: keycloak.authenticated ? "authenticated" : "unauthenticated",
    });
    return refreshed;
  },
}));
