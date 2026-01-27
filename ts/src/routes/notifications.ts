import { Hono } from "hono";
import { errorToStatusCode } from "../lib/errors";
import { notificationService } from "../container";
import { requireAuth } from "../middleware/auth";

const notificationsRouter = new Hono();

notificationsRouter.use("*", requireAuth);

// GET /notifications - List user's notifications
notificationsRouter.get("/", async (c) => {
  const user = c.get("user")!;
  const unreadOnly = c.req.query("unread") === "true";

  const result = await notificationService.list(user, unreadOnly);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 500
    );
  }

  return c.json(result.data);
});

// PATCH /notifications/:id/read - Mark as read
notificationsRouter.patch("/:id/read", async (c) => {
  const user = c.get("user")!;
  const notificationId = c.req.param("id");

  const result = await notificationService.markAsRead(notificationId, user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 500
    );
  }

  return c.json({ message: "Marked as read" });
});

// POST /notifications/read-all - Mark all as read
notificationsRouter.post("/read-all", async (c) => {
  const user = c.get("user")!;

  const result = await notificationService.markAllAsRead(user);

  if (!result.ok) {
    return c.json(
      { error: result.error.message },
      errorToStatusCode(result.error) as 500
    );
  }

  return c.json({ message: "All marked as read" });
});

export default notificationsRouter;
