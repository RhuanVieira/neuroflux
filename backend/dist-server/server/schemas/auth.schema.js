import { z } from "zod";
export const credentialsSchema = z.object({ email: z.string().trim().min(3).max(190), password: z.string().min(8).max(100) });
export const studentSchema = z.object({ email: z.email(), password: z.string().min(8).max(100), name: z.string().trim().min(2).max(120) });
