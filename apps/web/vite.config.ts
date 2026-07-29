import vinext from "vinext";
import { defineConfig, loadEnv } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async ({ mode }) => {
  const workspaceEnv = loadEnv(mode, "../..", "");
  const workerServerEnv = Object.fromEntries(
    Object.entries(workspaceEnv).filter(([name]) =>
      name.startsWith("SUPABASE_")
      || name.startsWith("RESEND_")
      || name === "REGISTRATION_NOTIFICATION_EMAIL"),
  );
  for (const [name, value] of Object.entries(workerServerEnv)) {
    process.env[name] ??= value;
  }

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  const workerBindingConfig = mode === "development"
    ? { ...localBindingConfig, vars: workerServerEnv }
    : localBindingConfig;

  return {
    // The workspace owns one ignored root .env for server-side Supabase access.
    // Without this, Vite only loads apps/web/.env* and API routes cannot see
    // SUPABASE_SECRET_KEY.
    envDir: "../..",
    // Vinext's Cloudflare dev runner cannot execute a workspace package as an
    // external file: module. Transform notification source through Vite so raw
    // email templates and the package entry are included in the worker graph.
    ssr: {
      noExternal: ["@dubaihikers/notifications"],
    },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: workerBindingConfig,
      }),
    ],
  };
});
