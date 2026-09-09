import type { Role } from "@prisma/client";
import type { Request } from "express";

export type AuthUser = { id: number; role: Role; email: string };
export type AuthRequest = Request & { user?: AuthUser };
