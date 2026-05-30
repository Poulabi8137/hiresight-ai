"use client";

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Layers, Sparkles, UserCheck } from "lucide-react";
import type { Application, Candidate } from "@/lib/types";
import { fetchWithTimeout } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stages = ["applied", "screening", "shortlisted", "interview", "offer"] as const;

type PipelineBoardProps = {
  candidates: Candidate[];
  applications: Application[];
  stageCounts: Record<string, number>;
  onRefresh: () => void;
};

export function PipelineBoard({ candidates, applications, stageCounts, onRefresh }: PipelineBoardProps) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge className="bg-background/70">
            <UserCheck className="mr-1 h-3.5 w-3.5" />
            Hiring pipeline
          </Badge>
          <h2 className="heading-display mt-3 text-2xl">Stage-aware motion board</h2>
        </div>
        <Button>
          <Sparkles className="h-4 w-4" />
          Generate shortlist
        </Button>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Layers className="h-3.5 w-3.5 text-primary" />
        Drag candidates between stages to update their pipeline position.
      </div>

      <DragDropContext onDragEnd={(result: DropResult) => {
        if (!result.destination) return;
        const stage = result.destination.droppableId;
        const appId = result.draggableId;
        if (stage && appId) {
          fetchWithTimeout("/api/applications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId: appId, stage })
          }).then(() => {
            onRefresh();
            toast.success(`Moved to ${stage}`);
          }).catch(() => toast.error("Failed to move candidate"));
        }
      }}>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" role="list" aria-label="Pipeline stages">
          {stages.map((stage) => (
            <Droppable key={stage} droppableId={stage}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps}
                  className={`flex min-h-40 flex-col rounded-xl border p-3 backdrop-blur transition-colors ${
                    snapshot.isDraggingOver
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/70 bg-background/55"
                  }`}
                  role="listitem" aria-label={`${stage} stage`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium capitalize">{stage}</p>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {stageCounts[stage]}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {applications
                      .filter((app) => app.stage === stage)
                      .map((application, idx) => {
                        const candidate = candidates.find((c) => c.id === application.candidateId);
                        return (
                          <Draggable key={application.id} draggableId={application.id} index={idx}>
                            {(provided, snap) => (
                              <div
                                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                className={`w-full rounded-lg px-3 py-2 text-left text-xs shadow-glow-sm transition ${
                                  snap.isDragging
                                    ? "bg-primary text-primary-foreground rotate-2 scale-105"
                                    : "bg-foreground text-background hover:bg-foreground/90"
                                }`}
                              >
                                {candidate?.name}
                                <span className={`block ${snap.isDragging ? "text-primary-foreground/70" : "text-background/65"}`}>
                                  {application.matchScore}% match
                                </span>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
