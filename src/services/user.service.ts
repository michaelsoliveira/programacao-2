import { z } from "zod";
import prisma from '@/lib/prisma';
import { Prisma } from "@prisma/client";
import { hashPassword } from "@/utils/password";

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
    limit?: number;
    where?: Partial<User>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Promise<any> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit || 0;
    const where = params.where ?
    {
        OR: Object.entries(params.where).map(([key, value]) => ({
            [key]: { contains: value, mode: Prisma.QueryMode.insensitive },
        })),
    }
    : {};
    const orderBy = params.orderBy
      ? Object.entries(params.orderBy).map(([key, value]) => ({
          [key]: value === 'asc' ? 'asc' as const : 'desc' as const,
        }))
      : { createdAt: 'desc' as const };
    const users = await prisma.user.findMany({
        skip,
        take: limit || 10,
        where,
        orderBy,
    });

    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return usersWithoutPasswords;
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
      const userParsed = userSchema.safeParse(userData);
      if (!userParsed.success) {
        throw userParsed.error;
      }
      const { name, email, password } = userParsed.data;
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new Error("Email already exists");
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword as User;
  }

  public async createUserWithHashedPassword(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const userParsed = userSchema
        const newUser = await prisma.user.create({
        data: {
            ...userData,
            password: await hashPassword(userData.password),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        });
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword as User;
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