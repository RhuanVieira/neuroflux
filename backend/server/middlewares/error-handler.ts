import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { EmailConfigurationError } from "../services/email.service.js";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof z.ZodError) return res.status(400).json({ message: "Dados inválidos.", errors: error.issues });
  if (error instanceof EmailConfigurationError) return res.status(503).json({ message: error.message });
  console.error(error);
  const detail = process.env.NODE_ENV === "production" ? undefined : error instanceof Error ? error.message : undefined;
  return res.status(500).json({ message: detail ? `Erro interno do servidor: ${detail}` : "Erro interno do servidor." });
}
