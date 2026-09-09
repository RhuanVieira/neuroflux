import { MaterialStatus } from "@prisma/client";
import { z } from "zod";

export const materialSchema = z.object({
  title: z.string().trim().min(3).max(180), description: z.string().trim().min(3), subject: z.string().trim().min(2).max(100),
  grade: z.coerce.number().int().min(1).max(3).nullable().optional(), content: z.string().nullable().optional(),
  fileUrl: z.string().max(500).nullable().optional(), status: z.nativeEnum(MaterialStatus).optional(),
});
