export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export const USER_ROLE_VALUES = Object.values(UserRole) as [
    UserRole.ADMIN,
    ...UserRole[]
];

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function hasRole(
    user: Pick<AuthUser, 'roles'> | undefined, 
    role: UserRole
): boolean {
  return Boolean(user?.roles?.includes(role));
}

export function hasAnyRole(
    user: Pick<AuthUser, 'roles'> | undefined, 
    roles: UserRole[]
): boolean {
  if (!user?.roles?.length) return false;
  if (roles.length === 0) return true;
  return roles.some(role => user.roles.includes(role));
}