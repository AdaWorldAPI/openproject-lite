// HAL+JSON response parsing utilities
// Translates OpenProject-style HAL responses to frontend types

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHal = Record<string, any>;

/**
 * Extract elements from a HAL Collection response.
 * HAL: { _type: "Collection", _embedded: { elements: [...] } }
 * Returns: the elements array
 */
export function halElements<T>(data: AnyHal): T[] {
  if (data._embedded?.elements) {
    return data._embedded.elements;
  }
  // Fallback for non-HAL responses
  return [];
}

/**
 * Extract the raw text from a HAL Formattable property.
 * HAL: { format: "markdown", raw: "text", html: "<p>text</p>" }
 * Returns: the raw string, or null
 */
export function halText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'raw' in (value as AnyHal)) {
    return (value as AnyHal).raw ?? null;
  }
  return null;
}

/**
 * Extract the error message from a HAL Error response.
 * HAL: { _type: "Error", errorIdentifier: "urn:...", message: "..." }
 * Falls back to legacy format: { error: "..." }
 */
export function halErrorMessage(data: AnyHal): string {
  if (data._type === 'Error' && data.message) {
    return data.message;
  }
  return data.error ?? data.message ?? 'Unknown error';
}

/**
 * Get unread count from HAL notification collection.
 * HAL: { ..., _meta: { unreadCount: N } }
 * Falls back to legacy: { unreadCount: N }
 */
export function halUnreadCount(data: AnyHal): number {
  return data._meta?.unreadCount ?? data.unreadCount ?? 0;
}

/**
 * Check if a response is a HAL resource (has _type).
 */
export function isHalResource(data: unknown): data is AnyHal {
  return typeof data === 'object' && data !== null && '_type' in (data as AnyHal);
}

/**
 * Get meta value from HAL resource.
 * HAL: { ..., _meta: { role: "owner" } }
 */
export function halMeta<T = string>(data: AnyHal, key: string): T | undefined {
  return data._meta?.[key];
}

/**
 * Extract embedded resource(s) from a HAL resource.
 */
export function halEmbedded<T>(data: AnyHal, key: string): T | undefined {
  return data._embedded?.[key];
}
