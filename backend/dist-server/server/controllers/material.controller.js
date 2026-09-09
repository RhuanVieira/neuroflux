import { MaterialStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { materialSchema } from "../schemas/material.schema.js";
const author = { select: { id: true, name: true } };
export async function listMaterials(req, res, next) {
    try {
        const showAll = req.user.role !== Role.STUDENT && req.query.all === "true";
        return res.json(await prisma.material.findMany({ where: showAll ? {} : { status: MaterialStatus.PUBLISHED }, include: { author }, orderBy: { updatedAt: "desc" } }));
    }
    catch (error) {
        return next(error);
    }
}
export async function getMaterial(req, res, next) {
    try {
        const id = z.coerce.number().int().positive().parse(req.params.id);
        const material = await prisma.material.findUnique({ where: { id }, include: { author } });
        if (!material || (req.user.role === Role.STUDENT && material.status !== MaterialStatus.PUBLISHED))
            return res.status(404).json({ message: "Material não encontrado." });
        return res.json(material);
    }
    catch (error) {
        return next(error);
    }
}
export async function createMaterial(req, res, next) {
    try {
        return res.status(201).json(await prisma.material.create({ data: { ...materialSchema.parse(req.body), authorId: req.user.id } }));
    }
    catch (error) {
        return next(error);
    }
}
export function uploadMaterial(req, res) {
    if (!req.file)
        return res.status(400).json({ message: "Envie um arquivo no campo 'file'." });
    return res.status(201).json({ fileUrl: `/uploads/${req.file.filename}`, originalName: req.file.originalname });
}
export async function updateMaterial(req, res, next) {
    try {
        const id = z.coerce.number().int().positive().parse(req.params.id);
        const material = await prisma.material.findUnique({ where: { id } });
        if (!material)
            return res.status(404).json({ message: "Material não encontrado." });
        if (req.user.role === Role.ADMIN && material.authorId !== req.user.id)
            return res.status(403).json({ message: "Você só pode editar seus próprios materiais." });
        return res.json(await prisma.material.update({ where: { id }, data: materialSchema.partial().parse(req.body) }));
    }
    catch (error) {
        return next(error);
    }
}
export async function deleteMaterial(req, res, next) {
    try {
        const id = z.coerce.number().int().positive().parse(req.params.id);
        const material = await prisma.material.findUnique({ where: { id } });
        if (!material)
            return res.status(404).json({ message: "Material não encontrado." });
        if (req.user.role === Role.ADMIN && material.authorId !== req.user.id)
            return res.status(403).json({ message: "Você só pode remover seus próprios materiais." });
        await prisma.material.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
}
