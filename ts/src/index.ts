import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { sessionMiddleware } from "./middleware/auth";
import { isMailConfigured } from "./services/mail";

// Routes
import authRoutes from "./routes/auth";
import projectsRoutes from "./routes/projects";
import tasksRoutes from "./routes/tasks";
import notificationsRoutes from "./routes/notifications";

// ============================================
// APP SETUP
// ============================================

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    credentials: true,
  })
);
app.use("*", sessionMiddleware);

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mail: isMailConfigured() ? "configured" : "not configured",
  });
});

// API routes
app.route("/auth", authRoutes);
app.route("/projects", projectsRoutes);
app.route("/tasks", tasksRoutes);
app.route("/notifications", notificationsRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
    500
  );
});

// ============================================
// START SERVER
// ============================================

const port = parseInt(process.env.PORT ?? "3000", 10);

console.log(`
╔═══════════════════════════════════════════════╗
║         OpenProject-Lite (TypeScript)         ║
╠═══════════════════════════════════════════════╣
║  Server:     http://localhost:${port.toString().padEnd(5)}          ║
║  Health:     http://localhost:${port}/health       ║
║  Mail:       ${(isMailConfigured() ? "✓ Configured" : "✗ Not configured").padEnd(20)}       ║
╚═══════════════════════════════════════════════╝
`);

export default {
  port,
  fetch: app.fetch,
};
