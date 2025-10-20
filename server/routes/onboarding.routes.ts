import express from "express";
import { selectRole, getProfileStatus } from "../controllers/onboarding.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Role selection endpoint
router.post("/select-role", authenticateToken, selectRole);

// Get profile status endpoint
router.post("/profile-status", authenticateToken, getProfileStatus);

export default router;
