import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextFunction, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { studentSchema } from "../schemas/auth.schema.js";
import type { AuthRequest } from "../types/auth.js";
import { publicUser } from "../utils/public-user.js";

function pagination(query: AuthRequest["query"]) {
  const page = z.coerce.number().int().min(1).catch(1).parse(query.page);
  const limit = z.coerce.number().int().min(1).max(50).catch(15).parse(query.limit);
  return { page, limit, skip: (page - 1) * limit };
}

async function paginatedUsers(role: Role, req: AuthRequest) {
  const { page, limit, skip } = pagination(req.query);
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where: { role }, select: publicUser, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.user.count({ where: { role } }),
  ]);
  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function listAdmins(req: AuthRequest, res: Response, next: NextFunction) {
  try { return res.json(await paginatedUsers(Role.ADMIN, req)); }
  catch (error) { return next(error); }
}
export async function createAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = studentSchema.parse(req.body);
    if (await prisma.user.findUnique({ where: { email: input.email } })) return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    return res.status(201).json(await prisma.user.create({ data: { name: input.name, email: input.email, role: Role.ADMIN, passwordHash: await bcrypt.hash(input.password, 12) }, select: publicUser }));
  } catch (error) { return next(error); }
}
export async function updateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== Role.ADMIN) return res.status(404).json({ message: "Administrador não encontrado." });
    const { password, ...data } = studentSchema.partial().parse(req.body);
    return res.json(await prisma.user.update({ where: { id }, data: { ...data, passwordHash: password ? await bcrypt.hash(password, 12) : undefined }, select: publicUser }));
  } catch (error) { return next(error); }
}
export async function deleteAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    if (id === req.user!.id) return res.status(400).json({ message: "Você não pode remover a própria conta." });
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== Role.ADMIN) return res.status(404).json({ message: "Administrador não encontrado." });
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) { return next(error); }
}

export async function listStudents(req: AuthRequest, res: Response, next: NextFunction) {
  try { return res.json(await paginatedUsers(Role.STUDENT, req)); }
  catch (error) { return next(error); }
}

export async function updateStudent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== Role.STUDENT) return res.status(404).json({ message: "Aluno não encontrado." });
    const { password, ...data } = studentSchema.partial().parse(req.body);
    return res.json(await prisma.user.update({ where: { id }, data: { ...data, passwordHash: password ? await bcrypt.hash(password, 12) : undefined }, select: publicUser }));
  } catch (error) { return next(error); }
}

export async function deleteStudent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== Role.STUDENT) return res.status(404).json({ message: "Aluno não encontrado." });
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) { return next(error); }
}
