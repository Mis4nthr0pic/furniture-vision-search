import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    env: {
      MONGODB_URI: "mongodb://localhost:27017/furniture-search-test",
    },
  },
});
