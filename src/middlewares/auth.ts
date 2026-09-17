import { NextFunction, Request, Response } from "express";
import { AppError, hasAnyRole, hasRole, UserRole } from "@/types";
import prisma from "@/lib/prisma";
import { toAuthUser } from "@/utils/user.mapper";
import { verifyToken } from "@/utils/jwt";

const userIncludeRoles = { roles: true} as const;

async function loadAuthUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: userIncludeRoles,
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return toAuthUser(user);
}

export async function authenticate(
    req: Request, 
    res: Response, 
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Token de autenticação não informado", 401);
        }

        const token = authHeader.slice('Bearer '.length).trim();
        const payload = verifyToken(token);

        req.user = await loadAuthUser(payload.sub);
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError("Erro ao autenticar usuário", 401));
    }
}

export function authorize(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                next(new AppError("Usuário não autenticado", 401));
            }

            if (roles.length > 0 && !hasAnyRole(req.user, roles)) {
                next(new AppError("Sem permissão para este recurso", 403));
            }
            next();
        } catch (error) {
            next(error);
        } 
    }
}
