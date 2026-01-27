import { Hono } from "hono";
import { errorToStatusCode } from "../lib/errors";
import { halError } from "../lib/hal";
import { notificationService } from "../container";
import { requireAuth } from "../middleware/auth";
import { representNotificationCollection } from "../hal";

const notificationsRouter = new Hono();

notificationsRouter.use("*", requireAuth);

// GET /notifications - List user's notifications
// RUST: fn list(actor: &SessionUserDTO, unread_only: bool) -> Result<HalCollection, HalError>
notificationsRouter.get("/", async (c) => {
  const user = c.get("user")!;
  const unreadOnly = c.req.query("unread") === "true";

  const result = await notificationService.list(user, unreadOnly);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 500,
    );
  }

  return c.json(
    representNotificationCollection(result.data, "/api/v3/notifications"),
  );
});

// PATCH /notifications/:id/read - Mark as read
// RUST: fn mark_as_read(id: Uuid, actor: &SessionUserDTO) -> Result<(), HalError>
notificationsRouter.patch("/:id/read", async (c) => {
  const user = c.get("user")!;
  const notificationId = c.req.param("id");

  const result = await notificationService.markAsRead(notificationId, user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 500,
    );
  }

  return c.body(null, 204);
});

// POST /notifications/read-all - Mark all as read
// RUST: fn mark_all_as_read(actor: &SessionUserDTO) -> Result<(), HalError>
notificationsRouter.post("/read-all", async (c) => {
  const user = c.get("user")!;

  const result = await notificationService.markAllAsRead(user);

  if (!result.ok) {
    return c.json(
      halError(result.error),
      errorToStatusCode(result.error) as 500,
    );
  }

  return c.body(null, 204);
});

export default notificationsRouter;
