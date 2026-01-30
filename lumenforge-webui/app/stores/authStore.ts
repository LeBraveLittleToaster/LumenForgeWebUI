import { create } from "zustand";
import { keycloak } from "./keycloak";

type AuthStatus =
  | "idle"
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthState = {
  keycloak: typeof keycloak;
  status: AuthStatus;
  isAuthenticated: boolean;
  token?: string;
  tokenParsed?: Record<string, any>;
  error?: unknown;

  initPromise?: Promise<boolean>;

  init: () => Promise<boolean>;
  ensureInit: () => Promise<boolean>;

  login: (redirectUri?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: (minValidity?: number) => Promise<boolean>;
  userData: () => Promise<any>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  keycloak,
  status: "idle",
  isAuthenticated: false,
  token: undefined,
  tokenParsed: undefined,
  error: undefined,
  initPromise: undefined,

  init: async () => {
    if (get().status === "initializing") return get().initPromise ?? false;
    if (get().status === "authenticated" || get().status === "unauthenticated") {
      return get().isAuthenticated;
    }

    set({ status: "initializing", error: undefined });

    const p = (async () => {
      try {
        const kc = get().keycloak;

        const authenticated = await kc.init({
          onLoad: "check-sso",
          pkceMethod: "S256",
          checkLoginIframe: false,
        });

        set({
          isAuthenticated: authenticated,
          status: authenticated ? "authenticated" : "unauthenticated",
          token: kc.token,
          tokenParsed: (kc.tokenParsed as any) ?? undefined,
          initPromise: undefined,
        });

        kc.onAuthSuccess = () =>
          set({
            isAuthenticated: true,
            status: "authenticated",
            token: kc.token,
            tokenParsed: (kc.tokenParsed as any) ?? undefined,
          });

        kc.onAuthLogout = () =>
          set({
            isAuthenticated: false,
            status: "unauthenticated",
            token: undefined,
            tokenParsed: undefined,
          });

        kc.onTokenExpired = async () => {
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

        kc.onAuthError = (err: any) => set({ status: "error", error: err });

        return authenticated;
      } catch (err) {
        set({ status: "error", error: err, isAuthenticated: false, initPromise: undefined });
        return false;
      }
    })();

    set({ initPromise: p });
    return p;
  },

  ensureInit: async () => {
    // "Run init if I haven't done it yet" — but explicit and safe.
    if (get().status === "idle") return get().init();
    if (get().status === "initializing") return (await get().initPromise) ?? false;
    return get().isAuthenticated;
  },

  login: async (redirectUri?: string) => {
    // Optional: await get().ensureInit(); (not strictly necessary for login)
    await get().keycloak.login({ redirectUri: redirectUri ?? window.location.origin });
  },

  logout: async () => {
    await get().keycloak.logout({ redirectUri: window.location.origin });
  },

  userData: async () => {
    await get().ensureInit();
    return await get().keycloak.loadUserInfo();
  },

  refreshToken: async (minValidity = 30) => {
    await get().ensureInit();
    const kc = get().keycloak;
    const refreshed = await kc.updateToken(minValidity);
    set({
      token: kc.token,
      tokenParsed: (kc.tokenParsed as any) ?? undefined,
      isAuthenticated: !!kc.authenticated,
      status: kc.authenticated ? "authenticated" : "unauthenticated",
    });
    return refreshed;
  },
}));
