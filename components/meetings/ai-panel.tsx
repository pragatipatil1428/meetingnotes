"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, FileText, ListChecks, Gavel, Mail, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

interface AiPanelProps {
  meetingId: string;
  notes: string;
}

type AnalysisType = "summary" | "action_items" | "key_decisions" | "follow_up_email" | "extract_tasks";

export function AiPanel({ meetingId, notes }: AiPanelProps) {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [result, setResult] = useState<string>("");
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
        // If tasks were created, append the count to the result message
        if (res.tasksCreated && res.analysisType === "extract_tasks") {
          setResult(`${res.result}\n\n✅ ${res.tasksCreated} task(s) created successfully.`);
        } else {
          setResult(res.result);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      if (res.analysisType === "extract_tasks") {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    },
    onError: (err: Error) => {
      setResult(`Error: ${err.message}`);
    },
  });

  const handleAnalyze = (type: AnalysisType) => {
    setActiveAnalysis(type);
    setResult("");
    analyzeMutation.mutate(type);
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
            className="w-full rounded-lg border border-[var(--color-border-light)] p-3 text-left transition-all hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)] dark:hover:bg-[var(--color-brand-900)]/20"
          >
            <div className="flex items-center gap-2">
              <action.icon className="h-4 w-4 text-[var(--color-brand-500)]" />
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
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-[var(--color-brand-100)] bg-[var(--color-brand-50)] p-4 dark:border-[var(--color-brand-800)] dark:bg-[var(--color-brand-900)]/20"
        >
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-[var(--color-brand-700)] dark:text-[var(--color-brand-200)]">
            <Sparkles className="h-3.5 w-3.5" />
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
          <div className="whitespace-pre-wrap text-sm text-[var(--color-text-primary)] leading-relaxed">
            {result}
          </div>
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
