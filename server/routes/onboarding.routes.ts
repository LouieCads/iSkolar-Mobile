import express from "express";
import { selectRole, getProfileStatus, setupStudentProfile, setupSponsorProfile } from "../controllers/onboarding.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Role selection 
router.post("/select-role", authenticateToken, selectRole);

// Get profile status 
router.post("/profile-status", authenticateToken, getProfileStatus);

// Profile setup 
router.post("/setup-student-profile", authenticateToken, setupStudentProfile);
router.post("/setup-sponsor-profile", authenticateToken, setupSponsorProfile);


export default router;
