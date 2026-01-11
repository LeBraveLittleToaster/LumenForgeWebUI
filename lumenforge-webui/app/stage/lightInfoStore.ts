import { create } from "zustand";

export type LightInfo = {
  name:string;
  id: string;
  x: number;
  y: number;
};

type LightsState = {
  lights: LightInfo[];

  // setters / actions
  setLights: (lights: LightInfo[]) => void;
  upsertLight: (light: LightInfo) => void;
  updateLightPos: (id: string, x: number, y: number) => void;
  removeLight: (id: string) => void;
  clear: () => void;
};

export const useLightsStore = create<LightsState>((set) => ({
  lights: [],

  setLights: (lights) => set({ lights }),

  upsertLight: (light) =>
    set((state) => {
      const idx = state.lights.findIndex((l) => l.id === light.id);
      if (idx === -1) return { lights: [...state.lights, light] };
      const next = state.lights.slice();
      next[idx] = light;
      return { lights: next };
    }),

  updateLightPos: (id, x, y) =>
    set((state) => ({
      lights: state.lights.map((l) => (l.id === id ? { ...l, x, y } : l)),
    })),

  removeLight: (id) =>
    set((state) => ({
      lights: state.lights.filter((l) => l.id !== id),
    })),

  clear: () => set({ lights: [] }),
}));
