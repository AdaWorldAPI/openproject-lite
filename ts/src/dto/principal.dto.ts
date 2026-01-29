// RUST: Principal DTO — discriminated union of User and Group
// RUST: See lib/api/v3/principals/principal_representer.rb

// Principal is a discriminated union type for Users and Groups
// In OpenProject Rails, this uses STI (Single Table Inheritance)
// In TypeScript, we use discriminated unions

export interface UserPrincipalDTO {
  readonly _type: "User";
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatarUrl?: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface GroupPrincipalDTO {
  readonly _type: "Group";
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type PrincipalDTO = UserPrincipalDTO | GroupPrincipalDTO;

// Filter options for principals
export interface ListPrincipalsOptions {
  readonly offset?: number;
  readonly limit?: number;
  readonly type?: "User" | "Group" | "all";
  readonly search?: string;
}
