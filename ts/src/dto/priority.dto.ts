/**
 * Priority DTOs - Work package priorities (Low, Normal, High, Immediate)
 *
 * OpenProject HAL format:
 * - _type: "Priority"
 * - Properties: id, name, color, position, isDefault, isActive
 * - Links: self (with title)
 */

// RUST: pub struct PriorityDTO { ... }
export interface PriorityDTO {
  readonly id: string;
  readonly name: string;
  readonly color: string | null;
  readonly position: number;
  readonly isDefault: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct CreatePriorityDTO { ... }
export interface CreatePriorityDTO {
  readonly name: string;
  readonly color?: string;
  readonly position?: number;
  readonly isDefault?: boolean;
  readonly isActive?: boolean;
}

// RUST: pub struct UpdatePriorityDTO { ... }
export interface UpdatePriorityDTO {
  readonly name?: string;
  readonly color?: string;
  readonly position?: number;
  readonly isDefault?: boolean;
  readonly isActive?: boolean;
}
