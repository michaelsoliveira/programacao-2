import { NextFunction, Request, Response } from "express";
import { AppError, hasRole, UserRole } from "@/types";
import prisma from "@/lib/prisma";

const userIncludeRoles = { roles: true} as const;

async function loadAuthUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: userIncludeRoles,
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user;
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!hasRole(req.user, role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}
