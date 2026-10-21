import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
// Throttles login-failure alert emails (convex/alerts.ts).
app.use(rateLimiter);

export default app;
