import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { uploadDirectory } from "./config/upload.js";
import { errorHandler } from "./middlewares/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import materialRoutes from "./routes/material.routes.js";
import studentRoutes from "./routes/student.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();
const port = Number(process.env.PORT ?? 3333);

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(uploadDirectory, { setHeaders: (res, filePath) => res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`) }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/events", eventRoutes);
app.use(errorHandler);

app.listen(port, () => console.log(`API em http://localhost:${port}`));
