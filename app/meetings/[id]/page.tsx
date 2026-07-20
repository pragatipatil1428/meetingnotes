"use client";

import { use, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout/shell";
import { MeetingDetail } from "@/components/meetings/meeting-detail";
import { SkeletonCard } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { api } from "@/lib/api/client";
import type { Meeting } from "@/lib/types";

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: meeting,
    isLoading,
    error,
  } = useQuery<Meeting>({
    queryKey: ["meeting", id],
    queryFn: () => api(`/api/meetings/${id}`),
    enabled: !!id,
  });

  const handleBack = useCallback(() => {
    router.push("/meetings");
  }, [router]);

  const handleDelete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["meetings"] });
    router.push("/meetings");
  }, [queryClient, router]);

  if (isLoading) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <SkeletonCard />
        </div>
      </Shell>
    );
  }

  if (error || !meeting) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
          >
            <p className="text-sm text-red-600 dark:text-red-400">
              {error instanceof Error
                ? error.message
                : "Meeting not found"}
            </p>
            <button
              onClick={() => router.push("/meetings")}
              className="mt-4 rounded-lg bg-[var(--color-brand-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-700)]"
            >
              Back to meetings
            </button>
          </motion.div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MeetingDetail
            meeting={meeting}
            onBack={handleBack}
            onDelete={handleDelete}
          />
        </motion.div>
      </div>
    </Shell>
  );
}
