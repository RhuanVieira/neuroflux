import { EventType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { eventSchema } from "../schemas/event.schema.js";
const author = { select: { id: true, name: true } };
export async function listEvents(req, res, next) { try {
    const type = req.query.type;
    const where = type && type !== "ALL" ? { type: z.nativeEnum(EventType).parse(type) } : {};
    return res.json(await prisma.event.findMany({ where, include: { author }, orderBy: { startsAt: "asc" } }));
}
catch (error) {
    return next(error);
} }
export async function createEvent(req, res, next) { try {
    return res.status(201).json(await prisma.event.create({ data: { ...eventSchema.parse(req.body), authorId: req.user.id }, include: { author } }));
}
catch (error) {
    return next(error);
} }
export async function updateEvent(req, res, next) { try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    if (!await prisma.event.findUnique({ where: { id } }))
        return res.status(404).json({ message: "Evento não encontrado." });
    return res.json(await prisma.event.update({ where: { id }, data: eventSchema.partial().parse(req.body), include: { author } }));
}
catch (error) {
    return next(error);
} }
export async function deleteEvent(req, res, next) { try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    if (!await prisma.event.findUnique({ where: { id } }))
        return res.status(404).json({ message: "Evento não encontrado." });
    await prisma.event.delete({ where: { id } });
    return res.status(204).send();
}
catch (error) {
    return next(error);
} }
