import jwt from 'jsonwebtoken';

import { AuthUser, UserRole } from '../types/index';

export type JwtPayload = {
    sub: string;
    email: string;
    roles: UserRole[];
};

export function signToken(
    user: Pick<AuthUser, 'id' | 'email' | 'roles'>
): string {
    const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles,
    };

    const secretKey = process.env.JWT_SECRET || 'default_secret_key';
    const options = {
        expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,
    };

    return jwt.sign(payload, secretKey, options);
}

export function verifyToken(token: string): JwtPayload {
    const secretKey = process.env.JWT_SECRET || 'default_secret_key';
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    if (
        typeof decoded === 'string' 
        || !decoded 
        || typeof decoded !== 'object'
    ) {
        throw new Error('Invalid token');
    }

    const payload = decoded as unknown as JwtPayload & { role?: string };
    if (!payload.sub || !payload.email) {
        throw new Error('Invalid token payload');
    }

    const roles: UserRole[] = Array.isArray(payload.roles)
        ? payload.roles
        : payload.role && 
            Object.values(UserRole).includes(payload.role as UserRole)
            ? [payload.role as UserRole]
            : []

    return {
        sub: payload.sub,
        email: payload.email,
        roles
    };
}
