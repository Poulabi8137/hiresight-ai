"use client";

import { create } from "zustand";

type UploadProgress = Record<string, number>;

type HireSightState = {
  selectedCandidateId: string;
  uploadProgress: UploadProgress;
  setSelectedCandidateId: (id: string) => void;
  setUploadProgress: (id: string, value: number) => void;
};

export const useHireSightStore = create<HireSightState>((set) => ({
  selectedCandidateId: "cand-marcus",
  uploadProgress: {},
  setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
  setUploadProgress: (id, value) =>
    set((state) => ({
      uploadProgress: {
        ...state.uploadProgress,
        [id]: value
      }
    }))
}));
