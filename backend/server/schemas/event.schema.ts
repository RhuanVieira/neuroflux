import { EventType } from "@prisma/client";
import { z } from "zod";

const nullableText = (max: number) => z.string().trim().max(max).optional().nullable().transform(value => value || null);
export const eventSchema = z.object({
  title: z.string().trim().min(3).max(180), description: z.string().trim().min(3), type: z.nativeEnum(EventType),
  startsAt: z.coerce.date(), endsAt: z.coerce.date().optional().nullable(), location: nullableText(180),
  link: z.string().trim().url().max(500).optional().nullable().or(z.literal("")).transform(value => value || null),
}).refine(data => !data.endsAt || data.endsAt >= data.startsAt, { message: "A data final deve ser posterior à data inicial.", path: ["endsAt"] });
