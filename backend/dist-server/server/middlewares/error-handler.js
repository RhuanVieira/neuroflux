import { z } from "zod";
import { EmailConfigurationError } from "../services/email.service.js";
export function errorHandler(error, _req, res, _next) {
    if (error instanceof z.ZodError)
        return res.status(400).json({ message: "Dados inválidos.", errors: error.issues });
    if (error instanceof EmailConfigurationError)
        return res.status(503).json({ message: error.message });
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor." });
}
