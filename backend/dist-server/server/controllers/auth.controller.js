import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { tokenFor } from "../middlewares/auth.js";
import { credentialsSchema, studentSchema } from "../schemas/auth.schema.js";
import { sendVerificationCode } from "../services/email.service.js";
import { publicUser } from "../utils/public-user.js";
const verificationSchema = z.object({ email: z.email(), code: z.string().regex(/^\d{6}$/) });
const emailSchema = z.object({ email: z.email() });
const hashCode = (code) => crypto.createHash("sha256").update(code).digest("hex");
async function issueCode(userId, email) { const code = crypto.randomInt(100000, 1000000).toString(); await prisma.emailVerificationCode.deleteMany({ where: { userId, usedAt: null } }); await prisma.emailVerificationCode.create({ data: { userId, codeHash: hashCode(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) } }); await sendVerificationCode(email, code); }
export async function register(req, res, next) { try {
    const input = studentSchema.parse(req.body);
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && (existing.emailVerifiedAt || existing.role !== Role.STUDENT))
        return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    const user = existing ? await prisma.user.update({ where: { id: existing.id }, data: { name: input.name, passwordHash: await bcrypt.hash(input.password, 12) } }) : await prisma.user.create({ data: { name: input.name, email, passwordHash: await bcrypt.hash(input.password, 12) } });
    await issueCode(user.id, email);
    return res.status(201).json({ verificationRequired: true, email });
}
catch (error) {
    return next(error);
} }
export async function verifyEmail(req, res, next) { try {
    const { email, code } = verificationSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user)
        return res.status(400).json({ message: "Código inválido ou expirado." });
    const item = await prisma.emailVerificationCode.findFirst({ where: { userId: user.id, codeHash: hashCode(code), usedAt: null, expiresAt: { gt: new Date() }, }, orderBy: { createdAt: "desc" } });
    if (!item)
        return res.status(400).json({ message: "Código inválido ou expirado." });
    const verified = await prisma.$transaction(async (transaction) => { await transaction.emailVerificationCode.update({ where: { id: item.id }, data: { usedAt: new Date() } }); return transaction.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() }, select: publicUser }); });
    return res.json({ user: verified, token: tokenFor(verified) });
}
catch (error) {
    return next(error);
} }
export async function resendVerificationCode(req, res, next) { try {
    const { email } = emailSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || user.emailVerifiedAt)
        return res.status(400).json({ message: "Não foi possível reenviar o código para este e-mail." });
    await issueCode(user.id, user.email);
    return res.status(204).send();
}
catch (error) {
    return next(error);
} }
export async function login(req, res, next) { try {
    const input = credentialsSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || user.passwordHash === "GOOGLE_EXTERNAL_ACCOUNT" || !(await bcrypt.compare(input.password, user.passwordHash)))
        return res.status(401).json({ message: "E-mail ou senha inválidos." });
    if (user.role === Role.STUDENT && !user.emailVerifiedAt)
        return res.status(403).json({ message: "Confirme seu e-mail antes de entrar." });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser, token: tokenFor(safeUser) });
}
catch (error) {
    return next(error);
} }
export async function me(req, res, next) { try {
    return res.json(await prisma.user.findUnique({ where: { id: req.user.id }, select: publicUser }));
}
catch (error) {
    return next(error);
} }
