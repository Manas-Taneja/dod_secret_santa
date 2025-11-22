// Modify DATABASE_URL to disable prepared statements BEFORE any imports
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  if (url.includes("pooler.supabase.com")) {
    const urlObj = new URL(url);
    urlObj.searchParams.set("pgbouncer", "true");
    process.env.DATABASE_URL = urlObj.toString();
  } else if (!url.includes("prepared_statements")) {
    const separator = url.includes("?") ? "&" : "?";
    process.env.DATABASE_URL = `${url}${separator}prepared_statements=false`;
  }
}

import { execSync } from "child_process";

try {
  console.log("📤 Pushing schema to database...");
  execSync("npx prisma db push --skip-generate", { 
    stdio: "inherit",
    env: process.env 
  });
  console.log("✅ Schema pushed successfully!");
} catch (error) {
  console.error("❌ Failed to push schema:", error);
  process.exit(1);
}

