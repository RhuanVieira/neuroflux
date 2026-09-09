import { Role } from "@prisma/client";
import { Router } from "express";
import { deleteStudent, listStudents, updateStudent } from "../controllers/user.controller.js";
import { allow, authenticate } from "../middlewares/auth.js";

const router = Router();
router.use(authenticate, allow(Role.ADMIN, Role.MASTER));
router.get("/", listStudents);
router.route("/:id").patch(updateStudent).delete(deleteStudent);
export default router;
