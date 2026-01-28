/**
 * Status DTOs - Work package statuses (New, In Progress, Closed, etc.)
 *
 * OpenProject HAL format:
 * - _type: "Status"
 * - Properties: id, name, color, position, isClosed, isDefault, isReadonly, defaultDoneRatio, excludedFromTotals
 * - Links: self (with title)
 */

// RUST: pub struct StatusDTO { ... }
export interface StatusDTO {
  readonly id: string;
  readonly name: string;
  readonly color: string | null;
  readonly position: number;
  readonly isClosed: boolean;
  readonly isDefault: boolean;
  readonly isReadonly: boolean;
  readonly defaultDoneRatio: number | null;
  readonly excludedFromTotals: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct CreateStatusDTO { ... }
export interface CreateStatusDTO {
  readonly name: string;
  readonly color?: string;
  readonly position?: number;
  readonly isClosed?: boolean;
  readonly isDefault?: boolean;
  readonly isReadonly?: boolean;
  readonly defaultDoneRatio?: number;
  readonly excludedFromTotals?: boolean;
}

// RUST: pub struct UpdateStatusDTO { ... }
export interface UpdateStatusDTO {
  readonly name?: string;
  readonly color?: string;
  readonly position?: number;
  readonly isClosed?: boolean;
  readonly isDefault?: boolean;
  readonly isReadonly?: boolean;
  readonly defaultDoneRatio?: number;
  readonly excludedFromTotals?: boolean;
}
