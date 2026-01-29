import { z } from "zod";

// RUST: pub struct SessionUserDTO { pub id: Uuid, pub email: String, pub name: String, pub is_admin: bool }
export interface SessionUserDTO {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly isAdmin: boolean;
}

// RUST: pub struct UserDTO { pub id: Uuid, pub email: String, pub name: String, pub avatar_url: Option<String>, pub is_active: bool, pub created_at: NaiveDateTime, pub updated_at: NaiveDateTime }
export interface UserDTO {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// RUST: pub struct UserSummaryDTO { pub id: Uuid, pub name: String, pub email: String, pub avatar_url: Option<String> }
export interface UserSummaryDTO {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatarUrl?: string | null;
}

// RUST: pub struct CreateUserDTO { pub email: String, pub password: String, pub name: String }
export interface CreateUserDTO {
  readonly email: string;
  readonly password: string;
  readonly name: string;
}

// RUST: pub struct AuthResultDTO { pub user: SessionUserDTO, pub session_id: String }
export interface AuthResultDTO {
  readonly user: SessionUserDTO;
  readonly sessionId: string;
}

// Zod schemas for input validation
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
