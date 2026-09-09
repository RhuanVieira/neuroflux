import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const uploadDirectory = path.resolve(currentDir, "../../uploads");
const storage = multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 80) || "anexo";
        callback(null, `${Date.now()}-${baseName}${extension}`);
    },
});
export const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });
