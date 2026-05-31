"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

type UploadProgress = Record<string, number>;

export type StoredUpload = {
  id: string;
  kind: string;
  file_name: string;
  content_type: string;
  size: number;
  bucket: string;
  storage_path: string;
  url: string;
};

type HireSightState = {
  selectedCandidateId: string;
  uploadProgress: UploadProgress;
  uploadsByKind: Record<string, StoredUpload[]>;
  setSelectedCandidateId: (id: string) => void;
  setUploadProgress: (id: string, value: number) => void;
  addUpload: (kind: string, record: StoredUpload) => void;
  clearUploads: (kind?: string) => void;
};

export const useHireSightStore = create<HireSightState>()(
  persist(
    (set) => ({
      selectedCandidateId: "cand-marcus",
      uploadProgress: {},
      uploadsByKind: {},
      setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
      setUploadProgress: (id, value) =>
        set((state) => ({
          uploadProgress: {
            ...state.uploadProgress,
            [id]: value
          }
        })),
      addUpload: (kind, record) =>
        set((state) => ({
          uploadsByKind: {
            ...state.uploadsByKind,
            [kind]: [record, ...(state.uploadsByKind[kind] ?? [])]
          }
        })),
      clearUploads: (kind) =>
        set((state) => {
          if (kind) {
            const { [kind]: _, ...rest } = state.uploadsByKind;
            return { uploadsByKind: rest };
          }
          return { uploadsByKind: {} };
        })
    }),
    {
      name: "hiresight-uploads",
      partialize: (state) => ({
        uploadsByKind: state.uploadsByKind,
        selectedCandidateId: state.selectedCandidateId
      })
    }
  )
);

// Pre-created selectors to avoid inline selector re-creation on every render
export const selectUploadsByKind = (s: HireSightState) => s.uploadsByKind;
export const selectUploadProgress = (s: HireSightState) => s.uploadProgress;
export const selectSelectedCandidateId = (s: HireSightState) => s.selectedCandidateId;

export function useUploadsByKind() {
  return useHireSightStore(useShallow(selectUploadsByKind));
}

export function useUploadProgress() {
  return useHireSightStore(useShallow(selectUploadProgress));
}

export function useSelectedCandidateId() {
  return useHireSightStore(selectSelectedCandidateId);
}
