// RUST: Notification HAL representer — maps NotificationDTO to OpenProject HAL format
// RUST: See app/representers/api/v3/notifications/notification_representer.rb

import type { HalResource } from "../lib/hal";
import { halResource, halCollection } from "../lib/hal";
import type { NotificationDTO, NotificationListDTO } from "../dto";

const API_V3 = "/api/v3";

// RUST: fn represent_notification(n: &NotificationDTO) -> HalResource
export function representNotification(n: NotificationDTO): HalResource {
  const links: Record<string, { href: string; method?: string }> = {};

  if (!n.isRead) {
    links.readIAN = {
      href: `${API_V3}/notifications/${n.id}/read_ian`,
      method: "POST",
    };
  }
  links.unreadIAN = {
    href: `${API_V3}/notifications/${n.id}/unread_ian`,
    method: "POST",
  };

  return halResource(
    "Notification",
    `${API_V3}/notifications/${n.id}`,
    {
      id: n.id,
      reason: n.type,
      subject: n.title,
      body: n.body,
      linkUrl: n.linkUrl,
      readIAN: n.isRead,
      createdAt: n.createdAt,
    },
    links,
  );
}

// RUST: fn represent_notification_collection(data: &NotificationListDTO, self_href: &str) -> Value
export function representNotificationCollection(
  data: NotificationListDTO,
  selfHref: string,
) {
  const elements = data.notifications.map(representNotification);
  const collection = halCollection(selfHref, elements, data.notifications.length);
  return {
    ...collection,
    // OpenProject extension: unread count metadata
    _meta: {
      unreadCount: data.unreadCount,
    },
  };
}
