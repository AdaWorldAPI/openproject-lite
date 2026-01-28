/**
 * Type DTOs - Work package types (Task, Bug, Feature, Epic, etc.)
 *
 * OpenProject HAL format:
 * - _type: "Type"
 * - Properties: id, name, color, position, isDefault, isMilestone, createdAt, updatedAt
 * - Links: self (with title)
 */

// RUST: pub struct TypeDTO { ... }
export interface TypeDTO {
  readonly id: string;
  readonly name: string;
  readonly color: string | null;
  readonly position: number;
  readonly isDefault: boolean;
  readonly isMilestone: boolean;
  readonly isInRoadmap: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct CreateTypeDTO { ... }
export interface CreateTypeDTO {
  readonly name: string;
  readonly color?: string;
  readonly position?: number;
  readonly isDefault?: boolean;
  readonly isMilestone?: boolean;
  readonly isInRoadmap?: boolean;
}

// RUST: pub struct UpdateTypeDTO { ... }
export interface UpdateTypeDTO {
  readonly name?: string;
  readonly color?: string;
  readonly position?: number;
  readonly isDefault?: boolean;
  readonly isMilestone?: boolean;
  readonly isInRoadmap?: boolean;
}
