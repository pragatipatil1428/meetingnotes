import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    // prisma generate doesn't connect to the database, it only needs a
    // syntactically valid URL. The fallback keeps CI/Vercel installs
    // (where .env isn't committed and env vars may not be set yet) working.
    // A real DATABASE_URL is still required at runtime and for migrate/seed.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
