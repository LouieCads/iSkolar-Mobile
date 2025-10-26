import express from "express";
import { getProfile, uploadProfilePicture, deleteProfilePicture, upload } from "../controllers/profile.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Get user profile
router.get("/profile", authenticateToken, getProfile);

// Upload profile picture
router.post("/profile/picture", authenticateToken, upload.single('profilePicture'), uploadProfilePicture);

// Delete profile picture
router.delete("/profile/picture", authenticateToken, deleteProfilePicture);

export default router;
