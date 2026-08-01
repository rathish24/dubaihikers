import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.interaction.test.tsx", "tests/**/*.client.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
  },
});
