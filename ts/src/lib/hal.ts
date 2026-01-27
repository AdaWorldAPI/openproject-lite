// RUST: Core HAL+JSON types matching OpenProject API v3 response format
// RUST: These types map directly to serde-based Rust structs with #[serde(rename = "_type")]

import type { AppError, ErrorCode } from "./errors";

// ── Types ──────────────────────────────────────────────────────────────

// RUST: pub struct HalLink { pub href: String, pub title: Option<String>, pub method: Option<String>, pub templated: Option<bool> }
export interface HalLink {
  readonly href: string;
  readonly title?: string;
  readonly method?: string;
  readonly templated?: boolean;
}

// RUST: pub type HalLinks = HashMap<String, HalLink>
export type HalLinks = Record<string, HalLink>;

// RUST: pub struct HalResource { pub _type: String, pub _links: HalLinks, pub _embedded: Option<HashMap<String, serde_json::Value>>, ... }
export interface HalResource {
  readonly _type: string;
  readonly _links: HalLinks;
  readonly _embedded?: Record<string, unknown>;
  readonly [key: string]: unknown;
}

// RUST: pub struct HalCollection extends HalResource
export interface HalCollection {
  readonly _type: "Collection";
  readonly total: number;
  readonly count: number;
  readonly pageSize: number;
  readonly offset: number;
  readonly _links: HalLinks;
  readonly _embedded: {
    readonly elements: readonly HalResource[];
  };
}

// RUST: pub struct HalError { pub _type: &'static str, pub error_identifier: String, pub message: String }
export interface HalError {
  readonly _type: "Error";
  readonly errorIdentifier: string;
  readonly message: string;
}

// RUST: pub struct Formattable { pub format: String, pub raw: String, pub html: String }
export interface Formattable {
  readonly format: string;
  readonly raw: string;
  readonly html: string;
}

// ── Builders ──────────────────────────────────────────────────────────

// RUST: fn hal_resource(type_name: &str, self_href: &str, props: Value, links: HalLinks, embedded: Option<Value>) -> HalResource
export function halResource(
  typeName: string,
  selfHref: string,
  properties: Record<string, unknown>,
  links?: HalLinks,
  embedded?: Record<string, unknown>,
): HalResource {
  const result: Record<string, unknown> = {
    _type: typeName,
    _links: {
      self: { href: selfHref },
      ...links,
    },
    ...properties,
  };
  if (embedded && Object.keys(embedded).length > 0) {
    result._embedded = embedded;
  }
  return result as HalResource;
}

// RUST: fn hal_collection(self_href: &str, elements: Vec<HalResource>, total: usize, page_size: usize, offset: usize) -> HalCollection
export function halCollection(
  selfHref: string,
  elements: readonly HalResource[],
  total: number,
  pageSize?: number,
  offset?: number,
): HalCollection {
  const ps = pageSize ?? total;
  const off = offset ?? 1;
  return {
    _type: "Collection",
    total,
    count: elements.length,
    pageSize: ps,
    offset: off,
    _links: {
      self: { href: selfHref },
    },
    _embedded: {
      elements,
    },
  };
}

// RUST: fn formattable(text: Option<&str>) -> Option<Formattable>
export function formattable(text: string | null | undefined): Formattable | null {
  if (text == null || text === "") return null;
  return {
    format: "markdown",
    raw: text,
    html: `<p>${escapeHtml(text)}</p>`,
  };
}

// RUST: fn escape_html(s: &str) -> String
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Error Mapping ──────────────────────────────────────────────────────

// RUST: const ERROR_IDENTIFIERS: phf::Map<ErrorCode, &str>
const ERROR_IDENTIFIER_MAP: Record<ErrorCode, string> = {
  VALIDATION: "PropertyConstraintViolation",
  NOT_FOUND: "NotFound",
  FORBIDDEN: "MissingPermission",
  UNAUTHORIZED: "Unauthenticated",
  CONFLICT: "UpdateConflict",
  INTERNAL: "InternalServerError",
};

// RUST: fn hal_error(error: &AppError) -> HalError
export function halError(error: AppError): HalError {
  return {
    _type: "Error",
    errorIdentifier: `urn:openproject-org:api:v3:errors:${ERROR_IDENTIFIER_MAP[error.code]}`,
    message: error.message,
  };
}

// RUST: fn hal_validation_error(message: &str) -> HalError
export function halValidationError(message: string): HalError {
  return {
    _type: "Error",
    errorIdentifier: "urn:openproject-org:api:v3:errors:PropertyConstraintViolation",
    message,
  };
}
