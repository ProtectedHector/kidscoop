/// <reference types="vite/client" />
export const modules = import.meta.glob(["./**/*.ts", "./**/*.js", "!./**/*.test.ts", "!./**/*.d.ts"]);

export const WRITE_TOKEN = "test-write-token";
export const ISSUER = "https://clerk.kidzcoop.test";

process.env.KIDZCOOP_CONVEX_WRITE_TOKEN = WRITE_TOKEN;
process.env.CLERK_JWT_ISSUER_DOMAIN = ISSUER;
