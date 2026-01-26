import { Hono } from "hono";
import { db, notifications } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const notificationsRouter = new Hono();

notificationsRouter.use("*", requireAuth);

// GET /notifications - List user's notifications
notificationsRouter.get("/", async (c) => {
  const user = c.get("user")!;
  const unreadOnly = c.req.query("unread") === "true";

  const where = unreadOnly
    ? and(eq(notifications.userId, user.id), eq(notifications.isRead, false))
    : eq(notifications.userId, user.id);

  const userNotifications = await db.query.notifications.findMany({
    where,
    orderBy: desc(notifications.createdAt),
    limit: 50,
  });

  const unreadCount = await db.query.notifications.findMany({
    where: and(
      eq(notifications.userId, user.id),
      eq(notifications.isRead, false)
    ),
  });

  return c.json({
    notifications: userNotifications,
    unreadCount: unreadCount.length,
  });
});

// PATCH /notifications/:id/read - Mark as read
notificationsRouter.patch("/:id/read", async (c) => {
  const user = c.get("user")!;
  const notificationId = c.req.param("id");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, user.id)
      )
    );

  return c.json({ message: "Marked as read" });
});

// POST /notifications/read-all - Mark all as read
notificationsRouter.post("/read-all", async (c) => {
  const user = c.get("user")!;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.isRead, false))
    );

  return c.json({ message: "All marked as read" });
});

export default notificationsRouter;
