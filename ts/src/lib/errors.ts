// RUST: This maps to a Rust enum with variants for each error type
// RUST: #[derive(Debug, Clone)]
// RUST: pub enum ErrorCode {
// RUST:     Validation, NotFound, Forbidden, Unauthorized,
// RUST:     Conflict, Internal,
// RUST: }

export type ErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "INTERNAL";

// RUST: pub struct AppError { pub code: ErrorCode, pub message: String }
export interface AppError {
  readonly code: ErrorCode;
  readonly message: string;
}

// RUST: impl AppError { pub fn validation(message: &str) -> Self }
export function validationError(message: string): AppError {
  return { code: "VALIDATION", message };
}

// RUST: impl AppError { pub fn not_found(message: &str) -> Self }
export function notFoundError(message: string): AppError {
  return { code: "NOT_FOUND", message };
}

// RUST: impl AppError { pub fn forbidden(message: &str) -> Self }
export function forbiddenError(message: string): AppError {
  return { code: "FORBIDDEN", message };
}

// RUST: impl AppError { pub fn unauthorized(message: &str) -> Self }
export function unauthorizedError(message: string): AppError {
  return { code: "UNAUTHORIZED", message };
}

// RUST: impl AppError { pub fn conflict(message: &str) -> Self }
export function conflictError(message: string): AppError {
  return { code: "CONFLICT", message };
}

// RUST: impl AppError { pub fn internal(message: &str) -> Self }
export function internalError(message: string): AppError {
  return { code: "INTERNAL", message };
}

// RUST: impl AppError { pub fn status_code(&self) -> u16 }
export function errorToStatusCode(error: AppError): number {
  switch (error.code) {
    case "VALIDATION":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "INTERNAL":
      return 500;
  }
}
