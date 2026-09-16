import { AuthUser, UserRole } from "@/types";
import { Role, User } from "@prisma/client";

export type UserWithRoles = User & { roles: Role[] };

function mapRoleNames(roles: Role[]): UserRole[] {
    return roles
        .map(role => role.name)
        .filter((name): name is UserRole => 
            Object.values(UserRole).includes(name as UserRole)
    );
}

export function toAuthUser(user: UserWithRoles): AuthUser {
    return {
        id: user.id,
        username: user.name,
        email: user.email,
        roles: mapRoleNames(user.roles),
    };
}

export function toPublicUser(user: UserWithRoles) {
    return {
        id: user.id,
        username: user.name,
        email: user.email,
        roles: mapRoleNames(user.roles),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}