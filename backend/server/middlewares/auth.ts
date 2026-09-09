import { Role } from "@prisma/client";
import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, AuthUser } from "../types/auth.js";

const jwtSecret = process.env.JWT_SECRET ?? "";
if (!jwtSecret) throw new Error("JWT_SECRET não foi configurado. Copie .env.example para .env.");
export function tokenFor(user: AuthUser) { return jwt.sign(user, jwtSecret, { expiresIn: "8h" }); }
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Faça login para continuar." });
  try { req.user = jwt.verify(token, jwtSecret) as unknown as AuthUser; return next(); }
  catch { return res.status(401).json({ message: "Sessão inválida ou expirada." }); }
}
export function allow(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: "Você não tem permissão para esta ação." });
    return next();
  };
}
