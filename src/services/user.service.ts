import { z } from "zod";
import prisma from '@/lib/prisma';
import { Prisma } from "@prisma/client";

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;

export class UserService {
  public async getAllUsers(params: {
    page?: number;
    take?: number;
    where?: Partial<User>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<User[]> {
    const { page = 1, take = 10 } = params;
    const skip = (page - 1) * take;
    const where = params.where ?
    {
        OR: Object.entries(params.where).map(([key, value]) => ({
            [key]: { contains: value, mode: Prisma.QueryMode.insensitive },
        })),
    }
    : {};
    const orderBy = params.orderBy ? Object.entries(params.orderBy).map(([key, value]) => ({
        [key]: {
            [value]: value === 'asc' ? 'asc' : 'desc',
        },
    })) : {
        createdAt: 'desc' as const,
    };
    const users = await prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
    });
    return users;
  }

  public async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

    public async createUser(
        userData: Omit<User, "id" | "createdAt" | "updatedAt">
    ): Promise<User> {
        const newUser = await prisma.user.create({
        data: {
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        });
        return newUser;
  }

  public async updateUser(
        id: string, 
        userData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
    ): Promise<User | null> {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        updatedAt: new Date(),
      },
    });
    return updatedUser;
  }

  public async deleteUser(id: string): Promise<boolean> {
    await prisma.user.delete({
      where: { id },
    });
    return true;
  }
}  