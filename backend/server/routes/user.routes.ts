import { Role } from "@prisma/client";
import { Router } from "express";
import { createAdmin, deleteAdmin, listAdmins, updateAdmin } from "../controllers/user.controller.js";
import { allow, authenticate } from "../middlewares/auth.js";

const router = Router();
router.use(authenticate, allow(Role.MASTER));
router.route("/").get(listAdmins).post(createAdmin);
router.route("/:id").patch(updateAdmin).delete(deleteAdmin);
export default router;
