import { create } from "zustand";

const useAudioStore = create((set) => ({
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  audioUrl: null,
  setAudioUrl: (url) => set({ audioUrl: url, isPlaying: true }),
  stopAudio: () => set({ isPlaying: false, audioUrl: null }),
}));

export default useAudioStore;
