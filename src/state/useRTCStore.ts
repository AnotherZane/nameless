import { create } from "zustand";

type RTCStore = {
  iceServers: RTCIceServer[];
  addIceServer: (server: RTCIceServer) => void;
  connection?: RTCPeerConnection;
  createConnection: () => void;
  channel?: RTCDataChannel;
  setChannel: (chan: RTCDataChannel) => void;
};

const useRTCStore = create<RTCStore>((set, get) => ({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com:3478" },
  ],
  addIceServer: (server: RTCIceServer) => {
    const servers = get().iceServers;
    servers.push(server);
    set({ iceServers: servers });
  },
  createConnection: () =>
    set({
      connection: new RTCPeerConnection({
        iceServers: get().iceServers,
      }),
    }),
  setChannel: (chan: RTCDataChannel) => set({ channel: chan }),
}));

export { useRTCStore };
