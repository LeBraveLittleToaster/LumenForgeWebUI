import { create } from "zustand";
import type { Client, StompSubscription } from "@stomp/stompjs";
import { getStompAuthenticated } from "~/api/axios";

type SliderId = number;

type SliderStore = {
  sliderCount: number;
  sliders: Record<SliderId, number>;
  connected: boolean;
  connecting: boolean;
  error?: string;

  initSliders: (count: number, defaultValue?: number) => void;
  setSlider: (id: SliderId, value: number) => void;

  connect: (token: string) => void;
  disconnect: () => void;

  // optional helper if you want to send from store
  publishSlider: (id: SliderId, value: number) => void;
};

const clamp = (v: number, min = 0, max = 255) => Math.min(max, Math.max(min, v));
const topicFor = (id: number) => `/topic/slider/set/${id}`;
const publishDest = "/app/slider/set";

let client: Client | null = null;
const subs = new Map<number, StompSubscription>();

function unsubscribeAll() {
  for (const s of subs.values()) s.unsubscribe();
  subs.clear();
}

function subscribeRange(storeGet: () => SliderStore, storeSet: any) {
  if (!client || !client.connected) return;

  unsubscribeAll();

  const { sliderCount, setSlider } = storeGet();
  for (let id = 0; id < sliderCount; id++) {
    const sub = client.subscribe(topicFor(id), (msg) => {
      const newValue = Number(msg.body);
      if (!Number.isNaN(newValue)) setSlider(id, newValue);
    });
    subs.set(id, sub);
  }
}

export const useSliderStore = create<SliderStore>((set, get) => ({
  sliderCount: 0,
  sliders: {},
  connected: false,
  connecting: false,
  error: undefined,

  initSliders: (count, defaultValue = 50) => {
    set((state) => {
      const sliders: Record<number, number> = { ...state.sliders };

      for (let i = 0; i < count; i++) {
        if (sliders[i] === undefined) sliders[i] = defaultValue;
      }

      for (const key of Object.keys(sliders)) {
        const id = Number(key);
        if (id >= count) delete sliders[id];
      }

      return { sliderCount: count, sliders };
    });

    if (client?.connected) {
      subscribeRange(get, set);
    }
  },

  setSlider: (id, value) =>
    set((state) => ({
      sliders: {
        ...state.sliders,
        [id]: clamp(value),
      },
    })),

  connect: (token) => {
    if (client) return;

    set({ connecting: true, error: undefined });

    client = getStompAuthenticated(token);

    const prevOnConnect = client.onConnect;
    client.onConnect = (frame) => {
      prevOnConnect?.(frame);
      set({ connected: true, connecting: false });

      subscribeRange(get, set);
    };

    client.onStompError = (frame) => {
      set({ error: frame.headers["message"] ?? "STOMP error" });
    };

    client.onWebSocketClose = () => {
      unsubscribeAll();
      client = null;
      set({ connected: false, connecting: false });
    };
  },

  disconnect: () => {
    unsubscribeAll();
    client?.deactivate?.();
    client = null;
    set({ connected: false, connecting: false, error: undefined });
  },

  publishSlider: async (id, value) => {
    get().setSlider(id, value);

    if (!client?.connected) return;

    client.publish({
      destination: publishDest + `/${id}`,
      body: clamp(value).toString(),
    });
  },
}));

export default useSliderStore;