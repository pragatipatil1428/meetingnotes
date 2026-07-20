"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Sparkles, Loader2, FileText, ListChecks, Gavel, Mail, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

interface AiPanelProps {
  meetingId: string;
  notes: string;
  onMeetingUpdated?: () => void;
}

type AnalysisType = "summary" | "action_items" | "key_decisions" | "follow_up_email" | "extract_tasks";

export function AiPanel({ meetingId, notes, onMeetingUpdated }: AiPanelProps) {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [result, setResult] = useState<string>("");
  const [editableResult, setEditableResult] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (type: AnalysisType) => {
      const data = await api<{ type: string; result: string; tasksCreated?: number }>(
        "/api/ai/analyze",
        {
          method: "POST",
          body: JSON.stringify({ meetingId, type, notes }),
        }
      );
      return { ...data, analysisType: type };
    },
    onSuccess: (res) => {
      if (res.result) {
        const displayResult =
          res.tasksCreated && res.analysisType === "extract_tasks"
            ? `${res.result}\n\n✅ ${res.tasksCreated} task(s) created successfully.`
            : res.result;
        setResult(displayResult);
        setEditableResult(displayResult);
        setIsEditing(false);
      }
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
      if (res.analysisType === "extract_tasks") {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      if (onMeetingUpdated) onMeetingUpdated();
    },
    onError: (err: Error) => {
      setResult(`Error: ${err.message}`);
      setEditableResult(`Error: ${err.message}`);
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({
      content,
      type,
    }: {
      content: string;
      type: AnalysisType;
    }) => {
      // Build payload based on analysis type
      const payload: Record<string, unknown> = {};

      if (type === "summary") {
        payload.summary = content;
      } else if (type === "action_items") {
        payload.actionItems = content
          .split("\n")
          .filter((item) => item.trim().length > 0)
          .map((item) => item.replace(/^[•\-*\s]+/, "").trim());
      } else if (type === "key_decisions") {
        payload.keyDecisions = content
          .split("\n")
          .filter((item) => item.trim().length > 0)
          .map((item) => item.replace(/^[•\-*\s]+/, "").trim());
      } else if (type === "follow_up_email") {
        payload.notes = content;
      }

      return api(`/api/meetings/${meetingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
      if (onMeetingUpdated) onMeetingUpdated();
      setIsEditing(false);
    },
    onError: (err: Error) => {
      setResult(`Failed to save: ${err.message}`);
    },
  });

  const handleAnalyze = (type: AnalysisType) => {
    setActiveAnalysis(type);
    setResult("");
    setEditableResult("");
    setIsEditing(false);
    analyzeMutation.mutate(type);
  };

  const handleSave = () => {
    if (!activeAnalysis) return;
    const content = isEditing ? editableResult : result;
    saveMutation.mutate({ content, type: activeAnalysis });
  };

  // Get the save button label based on analysis type
  const getSaveLabel = (type: AnalysisType): string => {
    switch (type) {
      case "summary":
        return "Save as Summary";
      case "action_items":
        return "Save as Action Items";
      case "key_decisions":
        return "Save as Key Decisions";
      case "follow_up_email":
        return "Save to Notes";
      default:
        return "Save";
    }
  };

  const actions = [
    {
      type: "summary" as AnalysisType,
      icon: FileText,
      label: "Generate Summary",
      description: "Create a concise summary of the meeting notes",
    },
    {
      type: "action_items" as AnalysisType,
      icon: ListChecks,
      label: "Extract Action Items",
      description: "Identify tasks and action points from the discussion",
    },
    {
      type: "key_decisions" as AnalysisType,
      icon: Gavel,
      label: "Key Decisions",
      description: "Highlight important decisions made during the meeting",
    },
    {
      type: "follow_up_email" as AnalysisType,
      icon: Mail,
      label: "Generate Follow-up Email",
      description: "Create a professional meeting follow-up email",
    },
    {
      type: "extract_tasks" as AnalysisType,
      icon: CheckSquare,
      label: "Extract Tasks",
      description: "Identify tasks from notes and create them automatically",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-[var(--color-brand-500)]" />
        <h3 className="font-display text-base font-bold text-[var(--color-text-primary)]">
          AI Assistant
        </h3>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.type}
            onClick={() => handleAnalyze(action.type)}
            disabled={analyzeMutation.isPending && activeAnalysis === action.type}
            className={`w-full rounded-lg border p-3 text-left transition-all hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)]/20 ${
              activeAnalysis === action.type
                ? "border-[var(--color-brand-300)] bg-[var(--color-brand-50)] dark:border-[var(--color-brand-800)] dark:bg-[var(--color-brand-900)]/20"
                : "border-[var(--color-border-light)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <action.icon className={`h-4 w-4 text-[var(--color-brand-500)]`} />
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {action.label}
              </span>
              {analyzeMutation.isPending && activeAnalysis === action.type && (
                <Loader2 className="ml-auto h-4 w-4 animate-spin text-[var(--color-brand-500)]" />
              )}
            </div>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Result */}
      {result && activeAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-4 dark:border-[var(--color-brand-800)] dark:bg-[var(--color-brand-900)]/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-brand-500)]" />
              {activeAnalysis === "summary"
                ? "Summary"
                : activeAnalysis === "action_items"
                ? "Action Items"
                : activeAnalysis === "key_decisions"
                ? "Key Decisions"
                : activeAnalysis === "follow_up_email"
                ? "Follow-up Email"
                : "Extracted Tasks"}
            </div>
            {/* Edit / Save buttons */}
            {activeAnalysis !== "extract_tasks" && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="rounded-md px-2 py-1 text-[10px] font-medium text-[var(--color-brand-600)] hover:bg-[var(--color-brand-100)] dark:text-[var(--color-brand-400)] dark:hover:bg-[var(--color-brand-900)]/30 transition-colors"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="rounded-md bg-[var(--color-brand-600)] px-2.5 py-1 text-[10px] font-medium text-white hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
                >
                  {saveMutation.isPending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    getSaveLabel(activeAnalysis)
                  )}
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editableResult}
              onChange={(e) => setEditableResult(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)] resize-none"
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm text-[var(--color-text-primary)] leading-relaxed">
              {result}
            </div>
          )}
        </motion.div>
      )}

      {analyzeMutation.isPending && !result && (
        <div className="mt-4 flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-brand-400)]" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-brand-500)]" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-brand-600)]" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">Analyzing notes...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
