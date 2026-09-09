import { Router } from "express";
import { login, me, register, resendVerificationCode, verifyEmail } from "../controllers/auth.controller.js";
import { completeGoogleLogin, startGoogleLogin } from "../controllers/google-auth.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-code", resendVerificationCode);
router.post("/login", login);
router.get("/google", startGoogleLogin);
router.get("/google/callback", completeGoogleLogin);
router.get("/me", authenticate, me);
export default router;
