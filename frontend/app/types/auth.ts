export enum UserRole {
  THREE_D_DESIGNER = "3d designer",
  ARCHITECT = "architect",
  INTERIOR_DESIGNER = "interior designer",
  OTHER = "other",
}

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};
