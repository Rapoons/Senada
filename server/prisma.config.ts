import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
    // Database bayangan untuk prisma migrate dev (pengguna aplikasi tidak boleh membuat database baru).
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
