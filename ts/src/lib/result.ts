// RUST: This maps directly to Rust's Result<T, E> and Option<T>

// RUST: enum Result<T, E> { Ok(T), Err(E) }
export type Result<T, E> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

// RUST: fn ok<T, E>(data: T) -> Result<T, E>
export function ok<T, E>(data: T): Result<T, E> {
  return { ok: true, data };
}

// RUST: fn err<T, E>(error: E) -> Result<T, E>
export function err<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}

// RUST: impl<T, E> Result<T, E> { fn map<U>(self, f: fn(T) -> U) -> Result<U, E> }
export function mapResult<T, U, E>(
  result: Result<T, E>,
  f: (data: T) => U
): Result<U, E> {
  if (result.ok) {
    return ok(f(result.data));
  }
  return result;
}

// RUST: impl<T, E> Result<T, E> { fn and_then<U>(self, f: fn(T) -> Result<U, E>) -> Result<U, E> }
export async function andThen<T, U, E>(
  result: Result<T, E>,
  f: (data: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> {
  if (result.ok) {
    return f(result.data);
  }
  return result;
}

// RUST: impl<T, E> Result<T, E> { fn unwrap_or(self, default: T) -> T }
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.ok) {
    return result.data;
  }
  return defaultValue;
}
