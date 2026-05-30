import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

vi.mock("@/lib/store", () => ({
  useHireSightStore: Object.assign(
    (selector: any) => selector?.({
      uploadsByKind: {},
      selectedCandidateId: "cand-marcus",
      uploadProgress: {},
    }) ?? { uploadsByKind: {}, selectedCandidateId: "cand-marcus", uploadProgress: {} },
    {
      selectUploadsByKind: (s: any) => s.uploadsByKind,
      selectUploadProgress: (s: any) => s.uploadProgress,
      selectSelectedCandidateId: (s: any) => s.selectedCandidateId,
    }
  ),
  useUploadsByKind: () => ({}),
  useUploadProgress: () => ({}),
  useSelectedCandidateId: () => "cand-marcus",
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
  formatScore: (s: number) => `${Math.round(s)}%`,
  initials: (n: string) => n.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase(),
  fetchWithTimeout: vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ jobs: [] }),
    })
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement("div", props, children),
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  useReducedMotion: () => false,
}));

const mockJobs = [
  { id: "1", title: "Software Engineer", company: "Acme", location: "Remote", skills: ["React", "TypeScript"], status: "active", mode: "remote", salary: "$100k", seniority: "mid", description: "Great role", employerId: "e1", createdAt: "2024-01-01" },
  { id: "2", title: "Frontend Developer", company: "Beta", location: "NYC", skills: ["Vue"], status: "active", mode: "hybrid", salary: "$90k", seniority: "senior", description: "Senior role", employerId: "e2", createdAt: "2024-01-02" },
];

describe("CandidateWorkspace", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ jobs: mockJobs }),
      })
    ));
  });

  it("renders candidate workspace with heading", async () => {
    const mod = await import("@/components/candidate-workspace");
    const CandidateWorkspace = mod.CandidateWorkspace;
    const { container } = render(React.createElement(CandidateWorkspace));
    await waitFor(() => {
      expect(container.querySelector("h1")).toBeTruthy();
    });
  });

  it("shows profile strength indicator", async () => {
    const mod = await import("@/components/candidate-workspace");
    const CandidateWorkspace = mod.CandidateWorkspace;
    render(React.createElement(CandidateWorkspace));
    await waitFor(() => {
      expect(screen.getByRole("meter")).toBeInTheDocument();
    });
  });
});
