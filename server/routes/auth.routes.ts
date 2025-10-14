import { Router } from "express";
import { register, login, sendOTP, verifyOTP, resetPassword } from "../controllers/auth.controller";

const router = Router();

// Registration & Login
router.post("/register", register);
router.post("/login", login);

// Forgot Password 
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
