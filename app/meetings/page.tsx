import { APP_NAME } from "@/lib/constants";

export default function MeetingsPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)]">
        Meetings
      </h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Meeting management — coming in Module 5.
      </p>
    </main>
  );
}
