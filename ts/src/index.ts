import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { serveStatic } from "hono/bun";
import { sessionMiddleware } from "./middleware/auth";
import { isMailConfigured } from "./services/mail";
import { migrate } from "./db/migrate";
import { seedAdmin, seedReferenceData } from "./db/seed";

// Routes
import authRoutes from "./routes/auth";
import projectsRoutes from "./routes/projects";
import tasksRoutes from "./routes/tasks";
import notificationsRoutes from "./routes/notifications";
import { typesRouter, statusesRouter, prioritiesRouter } from "./routes/reference-data";
import {
  activitiesRouter,
  watchersRouter,
  relationsRouter,
  standaloneRelationsRouter,
  standaloneActivitiesRouter,
} from "./routes/work-package-extended";
import { usersRouter } from "./routes/users";
import { rolesRouter } from "./routes/roles";
import { versionsRouter } from "./routes/versions";

// ============================================
// MIGRATE & SEED ON STARTUP
// ============================================

async function init() {
  try {
    await migrate();
    await seedAdmin();
    await seedReferenceData();
  } catch (err) {
    console.error("[init] Startup error:", err);
  }
}

init();

// ============================================
// APP SETUP
// ============================================

const app = new Hono();

// Global middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "/api/*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    credentials: true,
  })
);

// ============================================
// API ROUTES (under /api prefix)
// ============================================

// Health check
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mail: isMailConfigured() ? "configured" : "not configured",
  });
});

// Also keep /health for Railway healthcheck
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mail: isMailConfigured() ? "configured" : "not configured",
  });
});

// API routes with session middleware
const api = new Hono();
api.use("*", sessionMiddleware);
api.route("/auth", authRoutes);
api.route("/projects", projectsRoutes);
api.route("/tasks", tasksRoutes);
api.route("/notifications", notificationsRoutes);

app.route("/api", api);

// OpenProject API v3 routes (for parity)
// Reference data endpoints don't require auth (read-only)
const v3 = new Hono();
v3.route("/types", typesRouter);
v3.route("/statuses", statusesRouter);
v3.route("/priorities", prioritiesRouter);

// Work package extended endpoints (require auth for mutations)
// These are nested under work_packages/:workPackageId
const v3WorkPackages = new Hono();
v3WorkPackages.use("*", sessionMiddleware);
v3WorkPackages.route("/:workPackageId/activities", activitiesRouter);
v3WorkPackages.route("/:workPackageId/watchers", watchersRouter);
v3WorkPackages.route("/:workPackageId/relations", relationsRouter);
v3.route("/work_packages", v3WorkPackages);

// Standalone relation and activity endpoints
v3.route("/relations", standaloneRelationsRouter);
v3.route("/activities", standaloneActivitiesRouter);

// Users endpoints (require auth for mutations)
const v3Users = new Hono();
v3Users.use("*", sessionMiddleware);
v3Users.route("/", usersRouter);
v3.route("/users", v3Users);

// Roles endpoints (read-only, no auth required)
v3.route("/roles", rolesRouter);

// Versions endpoints (require auth for mutations)
const v3Versions = new Hono();
v3Versions.use("*", sessionMiddleware);
v3Versions.route("/", versionsRouter);
v3.route("/versions", v3Versions);

app.route("/api/v3", v3);

// ============================================
// STATIC FILES (Frontend SPA)
// ============================================

// Serve static assets from /public
app.use("/assets/*", serveStatic({ root: "./public" }));

// Serve other static files (favicon, etc.)
app.use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));
app.use("/favicon.svg", serveStatic({ path: "./public/favicon.svg" }));

// SPA fallback: serve index.html for all non-API routes
app.get("*", serveStatic({ path: "./public/index.html" }));

// ============================================
// ERROR HANDLERS
// ============================================

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      _type: "Error",
      errorIdentifier: "urn:openproject-org:api:v3:errors:InternalServerError",
      message: process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
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
║         OpenProject-Lite                       ║
╠═══════════════════════════════════════════════╣
║  Server:     http://localhost:${port.toString().padEnd(5)}          ║
║  API:        http://localhost:${port}/api          ║
║  Health:     http://localhost:${port}/health       ║
║  Frontend:   http://localhost:${port}/            ║
║  Mail:       ${(isMailConfigured() ? "✓ Configured" : "✗ Not configured").padEnd(20)}       ║
╚═══════════════════════════════════════════════╝
`);

export default {
  port,
  fetch: app.fetch,
};
