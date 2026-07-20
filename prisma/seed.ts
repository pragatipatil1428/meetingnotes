import { PrismaClient, Priority, TaskStatus, MeetingStatus } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  /* ── Clean existing data ─────────────────────────── */
  await prisma.task.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  /* ── Create users ────────────────────────────────── */
  const passwordHash = await bcrypt.hash("password123", 12);

  const alex = await prisma.user.create({
    data: {
      email: "alex@acme.com",
      name: "Alex Morgan",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: "sarah@acme.com",
      name: "Sarah Chen",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const james = await prisma.user.create({
    data: {
      email: "james@acme.com",
      name: "James Wilson",
      passwordHash,
    },
  });

  const lisa = await prisma.user.create({
    data: {
      email: "lisa@acme.com",
      name: "Lisa Park",
      passwordHash,
      emailVerified: new Date(),
    },
  });

  console.log("  ✓ Users created");

  /* ── Create meetings ─────────────────────────────── */
  const meeting1 = await prisma.meeting.create({
    data: {
      title: "Weekly Product Sync",
      notes: `## Agenda
1. Review Q2 metrics
2. Sprint planning
3. Resource allocation

## Discussion
- Q2 revenue up 23% YoY
- Customer churn down to 4.2%
- Need 2 more engineers for Q3

## Decisions
- Hire 2 senior engineers
- Launch beta by Aug 15
- Increase marketing budget by 15%`,
      summary: "Q2 review shows strong growth. Team decided to hire 2 senior engineers and launch beta by Aug 15.",
      keyDecisions: ["Hire 2 senior engineers", "Launch beta by Aug 15", "Increase marketing budget by 15%"],
      actionItems: ["Alex: Post job descriptions", "Sarah: Finalize beta timeline", "James: Prepare marketing budget"],
      meetingAt: new Date("2026-07-20T10:00:00"),
      status: MeetingStatus.COMPLETED,
      tags: ["product", "weekly", "planning"],
      ownerId: alex.id,
    },
  });

  const meeting2 = await prisma.meeting.create({
    data: {
      title: "Customer Insights Review",
      notes: `## Key Findings
- NPS score improved to 72
- Top request: dark mode
- Mobile usage up 40%

## Action Items
- Design dark mode prototype
- User testing sessions`,
      summary: "Customer satisfaction is trending positively. Dark mode is the #1 requested feature.",
      keyDecisions: ["Prioritize dark mode development", "Schedule user testing for Aug"],
      actionItems: ["Lisa: Design dark mode mockups", "Sarah: Recruit user testing participants"],
      meetingAt: new Date("2026-07-20T13:30:00"),
      status: MeetingStatus.SCHEDULED,
      tags: ["research", "customers", "product"],
      ownerId: sarah.id,
    },
  });

  const meeting3 = await prisma.meeting.create({
    data: {
      title: "Campaign Planning",
      notes: `## Q3 Campaign Strategy
- Target: Enterprise segment
- Channels: LinkedIn, Twitter, Tech blogs
- Budget: $50k
- Timeline: Aug - Oct`,
      summary: "Q3 enterprise campaign planned with $50k budget across LinkedIn, Twitter, and tech blogs.",
      keyDecisions: ["Enterprise campaign budget of $50k", "Launch date: Aug 1"],
      actionItems: ["James: Create ad creatives", "Lisa: Draft blog posts"],
      meetingAt: new Date("2026-07-20T15:30:00"),
      status: MeetingStatus.SCHEDULED,
      tags: ["marketing", "campaign", "q3"],
      ownerId: james.id,
    },
  });

  console.log("  ✓ Meetings created");

  /* ── Create participants ─────────────────────────── */
  await prisma.participant.createMany({
    data: [
      { email: "alex@acme.com", name: "Alex Morgan", meetingId: meeting1.id },
      { email: "sarah@acme.com", name: "Sarah Chen", meetingId: meeting1.id },
      { email: "james@acme.com", name: "James Wilson", meetingId: meeting1.id },
      { email: "lisa@acme.com", name: "Lisa Park", meetingId: meeting1.id },
      { email: "sarah@acme.com", name: "Sarah Chen", meetingId: meeting2.id },
      { email: "lisa@acme.com", name: "Lisa Park", meetingId: meeting2.id },
      { email: "james@acme.com", name: "James Wilson", meetingId: meeting3.id },
      { email: "lisa@acme.com", name: "Lisa Park", meetingId: meeting3.id },
    ],
  });

  console.log("  ✓ Participants created");

  /* ── Create tasks ────────────────────────────────── */
  await prisma.task.createMany({
    data: [
      {
        title: "Draft launch brief",
        description: "Create a comprehensive launch brief for the Q3 product release.",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        position: 0,
        dueDate: new Date("2026-07-25"),
        labels: ["product", "launch"],
        assigneeId: alex.id,
        meetingId: meeting1.id,
      },
      {
        title: "Review customer feedback",
        description: "Analyze recent customer survey results and compile key insights.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        position: 0,
        dueDate: new Date("2026-07-22"),
        labels: ["research", "customers"],
        assigneeId: sarah.id,
        meetingId: meeting2.id,
      },
      {
        title: "Share meeting recap",
        description: "Send meeting notes and action items to all participants.",
        status: TaskStatus.DONE,
        priority: Priority.LOW,
        position: 0,
        dueDate: new Date("2026-07-19"),
        labels: ["admin"],
        assigneeId: alex.id,
        meetingId: meeting1.id,
      },
      {
        title: "Design dark mode prototype",
        description: "Create Figma mockups for dark mode UI.",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        position: 1,
        dueDate: new Date("2026-07-28"),
        labels: ["design", "feature"],
        assigneeId: lisa.id,
        meetingId: meeting2.id,
      },
      {
        title: "Prepare Q3 marketing budget",
        description: "Detailed breakdown of Q3 marketing spend across channels.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        position: 1,
        dueDate: new Date("2026-07-23"),
        labels: ["marketing", "budget"],
        assigneeId: james.id,
        meetingId: meeting3.id,
      },
    ],
  });

  console.log("  ✓ Tasks created");
  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
